import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHead } from './AdminLayout'
import { Ico } from '@/components/Icon'
import { useDb, db as store } from '@/store/db'
import { useToast } from '@/store/ui'
import { seedGuests } from '@/data/seed'
import { addDays, fmt, fmtDMY, todayKey } from '@/lib/utils'

const TIER: Record<string, [string, string]> = { 'Kim cương': ['#2A1D14', '#E3BE8D'], 'Vàng': ['#F3E6D3', '#6E470D'], 'Bạc': ['#ECEAE7', '#4A4540'], 'Khách lẻ': ['#fff', '#6B5A4C'] }
export default function Guests() {
  const d = useDb()
  const toast = useToast()
  const guests = useMemo(() => seedGuests(), [])
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const list = guests.filter(g => (tab === 'all' || (tab === 'club' && g.tier !== 'Khách lẻ') || (tab === 'in' && g.last <= 0 && g.last >= -1) || (tab === 'repeat' && g.stays >= 3)) && (!q || (g.name + g.phone + g.email).toLowerCase().includes(q.toLowerCase())))
  const p = list[sel] ?? list[0]
  const t = todayKey()
  const tabs: [string, string][] = [['all', `Tất cả (${guests.length})`], ['club', 'Nestro Club'], ['in', 'Đang ở'], ['repeat', 'Quay lại ≥ 3 lần']]
  return (
    <>
      <AdminHead title="Khách hàng">
        <label style={{ position: 'relative' }}><Ico n="search" style={{ position: 'absolute', left: 12, top: 13, color: '#6B5A4C' }} /><input className="in" aria-label="Tìm khách" placeholder="Tìm tên, SĐT, email, CCCD…" value={q} onChange={e => { setQ(e.target.value); setSel(0) }} style={{ height: 44, paddingLeft: 38, width: 280 }} /></label>
        <button className="btn btn-q" onClick={() => toast('Xuất danh sách (CSV) sẽ có khi kết nối máy chủ')}>Xuất danh sách</button>
        <button className="btn btn-p" onClick={() => toast('Đã đưa email ưu đãi vào hàng đợi (demo)')}>Gửi email ưu đãi</button>
      </AdminHead>
      <main className="adm-main">
        <div className="cols" style={{ gridTemplateColumns: 'minmax(0,1fr) 380px' }}>
          <section className="card" style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}><div className="ft-wrap" role="tablist" aria-label="Lọc khách">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={'ft' + (tab === k ? ' ft-on' : '')} onClick={() => { setTab(k); setSel(0) }}>{l}</button>)}</div><span className="muted" style={{ fontSize: 13 }}>Sắp xếp: Lần ở gần nhất</span></div>
            <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Khách</th><th>Hạng</th><th>Số lần ở</th><th>Lần gần nhất</th><th style={{ textAlign: 'right' }}>Tổng chi</th></tr></thead>
              <tbody>{list.map((g, i) => (
                <tr key={g.name} className={'row-click' + (g === p ? ' row-sel' : '')} onClick={() => setSel(i)}>
                  <td><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span className="av">{g.ini}</span><div><div style={{ fontWeight: 500 }}>{g.name}</div><div className="sub">{g.phone}</div></div></div></td>
                  <td><span className="pill" style={{ background: TIER[g.tier][0], color: TIER[g.tier][1], border: g.tier === 'Khách lẻ' ? '1px solid #D9CCBA' : 0 }}>{g.tier}</span></td>
                  <td>{g.stays}</td><td>{fmtDMY(addDays(t, g.last))}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(g.spend)} ₫</td></tr>))}
                {!list.length && <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 36 }}>Không tìm thấy khách.</td></tr>}</tbody></table></div>
          </section>
          {p && (
            <section className="card pad" style={{ alignSelf: 'start' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}><span className="av" style={{ width: 56, height: 56, fontSize: 18 }}>{p.ini}</span><div><h2 style={{ fontSize: 20, fontWeight: 600 }}>{p.name}</h2><span className="pill" style={{ background: TIER[p.tier][0], color: TIER[p.tier][1], marginTop: 4, border: p.tier === 'Khách lẻ' ? '1px solid #D9CCBA' : 0 }}>Nestro Club · {p.tier}</span></div></div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 10, textAlign: 'center', marginBottom: 16 }}>{[[p.stays, 'lần ở'], [p.nights, 'đêm'], [(p.spend / 1e6).toFixed(1).replace('.', ',') + 'tr', 'tổng chi']].map(([v, l]) => <div key={l as string} style={{ padding: 12, borderRadius: 10, background: '#FBF6EE' }}><div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div><div className="muted" style={{ fontSize: 12 }}>{l}</div></div>)}</div>
              {[['Điện thoại', p.phone], ['Email', p.email], ['Quốc tịch', 'Việt Nam']].map(([k, v]) => <div key={k} className="sl"><span className="muted">{k}</span><span>{v}</span></div>)}
              <div style={{ margin: '14px 0' }}><div className="k" style={{ marginBottom: 6 }}>Sở thích đã ghi nhận</div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{p.prefs.length ? p.prefs.map(x => <span key={x} className="tag">{x}</span>) : <span className="muted" style={{ fontSize: 13 }}>Chưa có</span>}</div></div>
              <div><div className="k" style={{ marginBottom: 6 }}>Lịch sử lưu trú</div>
                {d.bookings.filter(b => b.guest.name === p.name).map(b => <div key={b.code} className="sl"><span>{fmtDMY(b.checkIn).slice(0, 5)}–{fmtDMY(b.checkOut)} · {b.roomType} {b.roomNo}</span><span className="muted">{b.checkIn > t ? 'Sắp đến' : b.status === 'in' ? 'Đang ở' : 'Hoàn tất'}</span></div>)}
                {!d.bookings.some(b => b.guest.name === p.name) && <span className="muted" style={{ fontSize: 13 }}>Chưa có đơn nào trong hệ thống mẫu.</span>}</div>
              <div style={{ margin: '14px 0' }}><label className="lbl" htmlFor="note">Ghi chú nội bộ</label><textarea id="note" className="in" rows={3} value={d.guestNotes[p.name] ?? p.note} onChange={e => store.set(x => { x.guestNotes[p.name] = e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-q" style={{ flex: 1 }} onClick={() => toast(`Đã gửi ưu đãi riêng cho ${p.name} (demo)`)}>Gửi ưu đãi riêng</button><Link to="/dat-phong" className="btn btn-p" style={{ flex: 1 }}>Tạo đặt phòng</Link></div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
