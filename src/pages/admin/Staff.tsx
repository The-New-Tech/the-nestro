import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AdminHead } from './AdminLayout'
import { Switch } from '@/components/ui'
import { useDb, db as store } from '@/store/db'
import { useToast } from '@/store/ui'
import { initials } from '@/lib/utils'
import { vEmail, vName } from '@/lib/validate'
import { ACTIVITY_LOG, ROLE_NAMES, ROLE_ROWS } from '@/data/seed'
import type { StaffMember } from '@/store/types'

export const ROLE_C: Record<string, [string, string]> = { 'Quản trị': ['#2A1D14', '#E3BE8D'], 'Quản lý': ['#3B2416', '#FAF6EF'], 'Lễ tân': ['#F3E6D3', '#6E470D'], 'Doanh thu': ['#E4ECF5', '#1F3F66'], 'Marketing': ['#F3EADC', '#4A3A2E'], 'Buồng phòng': ['#E6F2EA', '#1E5235'] }
const ST: Record<StaffMember['st'], [string, string, string, string]> = { on: ['Hoạt động', '#E6F2EA', '#1E5235', '#2F7D4F'], shift: ['Đang trong ca', '#E4ECF5', '#1F3F66', '#2C5F99'], invite: ['Chờ nhận lời mời', '#FBEFD5', '#6E470D', '#B7791F'], lock: ['Đã khoá', '#ECEAE7', '#5E5852', '#8A847D'] }
const ROLE_DESC: Record<string, string> = { 'Lễ tân': 'Đặt phòng, check-in/out, khách hàng', 'Buồng phòng': 'Xem sơ đồ, cập nhật trạng thái dọn phòng', 'Doanh thu': 'Giá phòng, ưu đãi, báo cáo' }

function StaffTabs() {
  const { staff } = useDb()
  return (
    <nav className="tabs-line" aria-label="Nhân viên và quyền" style={{ borderBottom: 0 }}>
      <NavLink to="/admin/nhan-vien" className={({ isActive }) => 'tab' + (isActive ? ' tab-on' : '')}>Nhân viên ({staff.length})</NavLink>
      <NavLink to="/admin/vai-tro" className={({ isActive }) => 'tab' + (isActive ? ' tab-on' : '')}>Vai trò &amp; phân quyền</NavLink>
    </nav>
  )
}
export function Staff() {
  const d = useDb()
  const toast = useToast()
  const [f, setF] = useState({ name: '', contact: '', role: 'Lễ tân', scope: 'Tất cả tầng', twofa: true, temp: false })
  const [touched, setTouched] = useState(false)
  const err = { name: vName(f.name), contact: vEmail(f.contact) && !/^0\d{9}$/.test(f.contact.replace(/\s/g, '')) ? 'Nhập email hoặc số điện thoại hợp lệ' : '' }
  const invite = () => {
    setTouched(true); if (err.name || err.contact) return
    const m: StaffMember = { ini: initials(f.name), name: f.name.trim(), mail: f.contact.trim(), role: f.role, scope: f.temp ? 'Thời vụ' : f.scope, twofa: f.twofa, st: 'invite', last: 'Chưa đăng nhập' }
    store.set(x => { x.staff.push(m) }); toast(`Đã gửi lời mời tới ${f.contact}`); setF({ ...f, name: '', contact: '' }); setTouched(false)
  }
  const kp = [['Đang hoạt động', d.staff.filter(s => s.st === 'on' || s.st === 'shift').length], ['Đang trong ca', d.staff.filter(s => s.st === 'shift').length], ['Chờ nhận lời mời', d.staff.filter(s => s.st === 'invite').length], ['Chưa bật 2 lớp bảo mật', d.staff.filter(s => !s.twofa).length]]
  return (
    <>
      <AdminHead left={<StaffTabs />}><button className="btn btn-q" onClick={() => toast('Xuất danh sách sẽ có khi kết nối máy chủ')}>Xuất danh sách</button></AdminHead>
      <main className="adm-main">
        <div className="cols" style={{ gridTemplateColumns: 'minmax(0,1fr) 380px' }}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <div className="kpis">{kp.map(([k, v]) => <div key={k as string} className="card kpi"><div className="k">{k}</div><div className="big">{v}</div></div>)}</div>
            <div className="card tbl-wrap"><table className="tbl" style={{ minWidth: 820 }}><thead><tr><th>Nhân viên</th><th>Vai trò</th><th>Phạm vi</th><th>Bảo mật 2 lớp</th><th>Trạng thái</th><th>Đăng nhập gần nhất</th><th /></tr></thead>
              <tbody>{d.staff.map(s => { const r = ROLE_C[s.role], st = ST[s.st]; return (
                <tr key={s.mail}><td><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span className="av">{s.ini}</span><div><div style={{ fontWeight: 500 }}>{s.name}</div><div className="sub">{s.mail}</div></div></div></td>
                  <td><span className="pill" style={{ background: r[0], color: r[1] }}>{s.role}</span></td><td>{s.scope}</td>
                  <td style={{ color: s.twofa ? '#1E5235' : '#8C1D18', fontWeight: 500 }}>{s.twofa ? 'Đã bật' : 'Chưa bật'}</td>
                  <td><span className="pill" style={{ background: st[1], color: st[2] }}><i style={{ background: st[3] }} />{st[0]}</span></td><td>{s.last}</td>
                  <td><Link to="/admin/vai-tro" className="btn btn-q" style={{ minHeight: 36 }}>Sửa quyền</Link></td></tr>) })}</tbody></table></div>
          </section>
          <section className="card pad" style={{ alignSelf: 'start' }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Mời nhân viên mới</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="lbl" htmlFor="m1">Họ và tên</label><input id="m1" className={'in' + (touched && err.name ? ' in-err' : '')} placeholder="Nguyễn Văn A" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />{touched && err.name && <div className="hint hint-err">{err.name}</div>}</div>
              <div><label className="lbl" htmlFor="m2">Email hoặc số điện thoại</label><input id="m2" className={'in' + (touched && err.contact ? ' in-err' : '')} placeholder="Nhận lời mời đăng nhập" value={f.contact} onChange={e => setF({ ...f, contact: e.target.value })} />{touched && err.contact && <div className="hint hint-err">{err.contact}</div>}</div>
              <div><span className="lbl">Vai trò</span><div role="radiogroup" aria-label="Vai trò" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Lễ tân', 'Buồng phòng', 'Doanh thu'].map(r => <div key={r} role="radio" aria-checked={f.role === r} tabIndex={0} className={'rc' + (f.role === r ? ' on' : '')} onClick={() => setF({ ...f, role: r })} onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setF({ ...f, role: r }) } }}><span className="rd" /><div><strong>{r}</strong><div className="muted" style={{ fontSize: 13 }}>{ROLE_DESC[r]}</div></div></div>)}
                <Link to="/admin/vai-tro" style={{ fontSize: 14 }}>Xem {ROLE_NAMES.length} vai trò và quyền chi tiết →</Link></div></div>
              <div><label className="lbl" htmlFor="m3">Phạm vi làm việc</label><select id="m3" className="in" value={f.scope} onChange={e => setF({ ...f, scope: e.target.value })}>{['Tất cả tầng', 'Tầng 2–3', 'Tầng 4–6', 'Sảnh lễ tân'].map(x => <option key={x}>{x}</option>)}</select></div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>Bắt buộc bảo mật 2 lớp<Switch on={f.twofa} label="Bảo mật 2 lớp" onChange={v => setF({ ...f, twofa: v })} /></label>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>Quyền tạm thời (thời vụ)<Switch on={f.temp} label="Quyền tạm thời" onChange={v => setF({ ...f, temp: v })} /></label>
              <button className="btn btn-p" onClick={invite}>Gửi lời mời</button>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

const LV: [string, string, string, string][] = [['—', '#F6F3EF', '#6B5A4C', 'Không có quyền'], ['Xem', '#E4ECF5', '#1F3F66', 'Xem'], ['Sửa', '#F3E6D3', '#6E470D', 'Sửa'], ['Toàn quyền', '#3B2416', '#FAF6EF', 'Toàn quyền']]
export function Roles() {
  const d = useDb()
  const toast = useToast()
  const [m, setM] = useState<Record<string, number>>(d.roles)
  const counts = ROLE_NAMES.map(r => d.staff.filter(s => s.role === r).length)
  let changed = 0
  const rows = ROLE_ROWS.map(([name, sub, vals], ri) => ({ name, sub, same: ri > 0 && ROLE_ROWS[ri - 1][0] === name, cells: vals.map((v0, ci) => { const key = `${ri}-${ci}`; const v = key in m ? m[key] : v0; if (v !== v0) changed++; return { key, v, diff: v !== v0, locked: ci === 0 } }) }))
  const [sec, setSec] = useState([true, true, false, true])
  return (
    <>
      <AdminHead left={<StaffTabs />}><button className="btn btn-q" onClick={() => toast('Tạo vai trò mới cần máy chủ')}>+ Tạo vai trò mới</button></AdminHead>
      <main className="adm-main">
        <div className="cols" style={{ gridTemplateColumns: 'minmax(0,1fr) 380px' }}>
          <section className="card pad" style={{ minWidth: 0 }}>
            <div className="sec-h"><div><h2>Bảng quyền theo vai trò</h2><small>Bấm vào một ô để đổi mức quyền. Thay đổi áp dụng cho mọi nhân viên thuộc vai trò đó sau khi lưu.</small></div>{changed > 0 && <span className="pill" style={{ background: '#FBEFD5', color: '#6E470D' }}>{changed} thay đổi chưa lưu</span>}</div>
            <div className="legend" style={{ marginBottom: 12, fontSize: 12 }}>{LV.map(l => <span key={l[0]} className="lg"><span className="sw" style={{ background: l[1], border: '1px solid #D9CCBA' }} />{l[3]}</span>)}</div>
            <div className="tbl-wrap"><table className="tbl" style={{ minWidth: 760 }}>
              <thead><tr><th>Chức năng</th>{ROLE_NAMES.map((r, i) => <th key={r} style={{ textAlign: 'center' }}><span style={{ display: 'block', color: '#2A1D14', fontSize: 13 }}>{r}</span><span style={{ fontWeight: 400 }}>{counts[i]} người</span></th>)}</tr></thead>
              <tbody>{rows.map((row, ri) => <tr key={ri}><td><div style={{ fontWeight: row.same ? 400 : 600, color: row.same ? '#6B5A4C' : '#2A1D14' }}>{row.same ? '' : row.name}</div><div className="sub">{row.sub}</div></td>
                {row.cells.map((c, ci) => { const L = LV[c.v]; return <td key={ci} style={{ padding: 6 }}><button type="button" className="cell" disabled={c.locked} style={{ background: L[1], color: L[2], boxShadow: c.diff ? '0 0 0 2px #fff, 0 0 0 4px #C8955C' : 'none', cursor: c.locked ? 'not-allowed' : 'pointer' }} aria-label={`${ROLE_NAMES[ci]}, ${row.name} – ${row.sub}: ${L[3]}${c.locked ? ' (khoá)' : '. Bấm để đổi mức'}`} onClick={() => setM({ ...m, [c.key]: (c.v + 1) % 4 })}>{c.locked ? '🔒 Toàn quyền' : L[0]}</button></td> })}</tr>)}</tbody></table></div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}><span className="muted" style={{ fontSize: 13, flex: 1, minWidth: 220 }}>Vai trò Quản trị luôn có toàn quyền và không sửa được, để tránh khoá nhầm cả hệ thống.</span><button className="btn btn-q" onClick={() => setM(d.roles)}>Huỷ thay đổi</button><button className="btn btn-p" disabled={!changed} onClick={() => { store.set(x => { x.roles = m }); toast('Đã lưu phân quyền') }}>Lưu thay đổi</button></div>
          </section>
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section className="card pad"><h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Quy tắc bảo mật</h2>
              {['Bắt buộc bảo mật 2 lớp với vai trò có quyền hoàn tiền', 'Hoàn tiền trên 2.000.000 ₫ cần Quản lý duyệt', 'Che bớt SĐT và email khách với vai trò không có quyền xem đầy đủ', 'Tự đăng xuất sau 30 phút không thao tác'].map((t, i) => <label key={t} className="row-s" style={{ justifyContent: 'space-between', fontSize: 14, gap: 12 }}>{t}<Switch on={sec[i]} label={t} onChange={v => setSec(sec.map((x, j) => (j === i ? v : x)))} /></label>)}</section>
            <section className="card pad" id="log"><div className="sec-h"><h2>Nhật ký hoạt động</h2></div>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>{ACTIVITY_LOG.map(([c, who, what, when], i) => <li key={i} style={{ display: 'flex', gap: 12, fontSize: 14 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: c, marginTop: 6, flex: 'none' }} /><div><strong>{who}</strong> {what}<div className="muted" style={{ fontSize: 12 }}>{when}</div></div></li>)}</ol></section>
          </aside>
        </div>
      </main>
    </>
  )
}
