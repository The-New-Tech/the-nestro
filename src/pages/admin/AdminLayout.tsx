import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'
import { Ico, P } from '@/components/Icon'
import { useDb } from '@/store/db'
import { asset } from '@/lib/utils'
import '@/styles/admin.css'
import { PwaPrompt } from '@/components/PwaPrompt'

const NAV: { to: string; label: string; icon: keyof typeof P }[] = [
  { to: '/admin', label: 'Tổng quan', icon: 'home' },
  { to: '/admin/dat-phong', label: 'Đặt phòng', icon: 'calendar' },
  { to: '/admin/so-do-tang', label: 'Sơ đồ tầng', icon: 'map' },
  { to: '/admin/phong-gia', label: 'Phòng, ảnh & giá', icon: 'bed' },
  { to: '/admin/uu-dai', label: 'Ưu đãi & mã giảm', icon: 'tag' },
  { to: '/admin/khach-hang', label: 'Khách hàng', icon: 'users' },
  { to: '/admin/bao-cao', label: 'Báo cáo', icon: 'chart' },
  { to: '/admin/nhan-vien', label: 'Nhân viên & quyền', icon: 'staff' },
  { to: '/admin/cai-dat', label: 'Cài đặt', icon: 'gear' }
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const db = useDb()
  const pending = db.bookings.filter(b => b.status === 'wait').length
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  return (
    <div className="adm">
      <aside className={'adm-side' + (open ? ' open' : '')} aria-label="Menu quản trị">
        <Link to="/admin" className="adm-brand"><img src={asset('images/logo-160.png')} alt="" /><div><b>THE NESTRO</b><small>QUẢN TRỊ</small></div></Link>
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/admin'} className={({ isActive }) => 'sn' + (isActive || (n.to === '/admin/nhan-vien' && loc.pathname.startsWith('/admin/vai-tro')) ? ' sn-on' : '')}>
            <Ico n={n.icon} size={20} />{n.label}{n.to === '/admin/dat-phong' && pending > 0 && <span className="badge">{pending}</span>}
          </NavLink>
        ))}
        <Link to="/phong" className="sn" style={{ marginTop: 8 }}><Ico n="eye" size={20} />Xem website</Link>
        <div className="adm-me"><span className="av">GĐ</span><div>Giám đốc khách sạn<small>Toàn quyền</small></div></div>
      </aside>
      {open && <div className="drawer-bg" style={{ zIndex: 120 }} onClick={() => setOpen(false)} />}
      <div className="adm-body">
        <AdminCtx.Provider value={{ openMenu: () => setOpen(true) }}><Outlet /></AdminCtx.Provider>
      </div>
      <PwaPrompt />
    </div>
  )
}

import { createContext, useContext } from 'react'
const AdminCtx = createContext({ openMenu: () => {} })
export function AdminHead({ title, sub, children, left }: { title?: string; sub?: string; children?: ReactNode; left?: ReactNode }) {
  const { openMenu } = useContext(AdminCtx)
  return (
    <header className="adm-head">
      <button className="icon-btn adm-burger" aria-label="Mở menu" onClick={openMenu} style={{ background: 'var(--sand)' }}><Ico n="menu" /></button>
      {title && <div><h1>{title}</h1>{sub && <div className="sub">{sub}</div>}</div>}
      {left}
      <div className="sp" />
      <div className="acts">{children}</div>
    </header>
  )
}
