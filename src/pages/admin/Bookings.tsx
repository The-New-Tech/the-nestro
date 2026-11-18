import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AdminHead } from './AdminLayout'
import { Ico } from '@/components/Icon'
import { Modal, BOOKING_STATUS, PAY_STATUS } from '@/components/ui'
import { useDb } from '@/store/db'
import { useToast } from '@/store/ui'
import { cancelBooking, setBookingStatus, updateBooking } from '@/api'
import { markVerified } from '@/lib/ics'
import { fmt, fmtDM, fmtDMY, todayKey, maskPhone, dowShort } from '@/lib/utils'
import type { Booking } from '@/store/types'

const TABS: [string, string][] = [['all', 'Tất cả'], ['wait', 'Chờ thanh toán'], ['ok', 'Đã xác nhận'], ['in', 'Đang ở'], ['cancel', 'Đã huỷ']]
const PER = 8
export default function Bookings() {
  const db = useDb()
  const toast = useToast()
  const nav = useNavigate()
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [ch, setCh] = useState('all')
  const [floor, setFloor] = useState('all')
  const [page, setPage] = useState(1)
  const [sel, setSel] = useState<string[]>([])
  const [view, setView] = useState<string | null>(null)
  const t = todayKey()
  const counts = (k: string) => db.bookings.filter(b => k === 'all' || b.status === k).length
  const rows = useMemo(() => db.bookings.filter(b =>
    (tab === 'all' || b.status === tab) && (ch === 'all' || b.channel === ch) && (floor === 'all' || String(b.floor) === floor) &&
    (!q || (b.code + b.guest.name + b.guest.phone + b.roomNo).toLowerCase().includes(q.toLowerCase()))
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [db, tab, ch, floor, q])
  const pages = Math.max(1, Math.ceil(rows.length / PER))
  const cur = Math.min(page, pages)
  const slice = rows.slice((cur - 1) * PER, cur * PER)
  const b = db.bookings.find(x => x.code === view)
  const revenue = db.bookings.filter(x => x.status !== 'cancel').reduce((s, x) => s + x.paid, 0)
  const inHouse = db.bookings.filter(x => x.status === 'in').length
  const act = async (fn: () => Promise<void>, msg: string) => { await fn(); toast(msg) }
  return (
    <>
      <AdminHead title="Đặt phòng" sub={`${db.bookings.length} đơn`}>
        <label style={{ position: 'relative' }}><Ico n="search" style={{ position: 'absolute', left: 12, top: 13, color: '#6B5A4C' }} /><input className="in" aria-label="Tìm đơn" placeholder="Tìm mã, tên, SĐT, phòng…" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} style={{ height: 44, paddingLeft: 38, width: 260 }} /></label>
        <Link to="/dat-phong" className="btn btn-p">+ Tạo đặt phòng</Link>
      </AdminHead>
      <main className="adm-main">
        <div className="kpis">
          <div className="card kpi"><div className="k">Công suất phòng hôm nay</div><div className="big">78%</div><div style={{ height: 6, borderRadius: 999, background: '#F3EADC', marginTop: 8 }}><div style={{ width: '78%', height: 6, borderRadius: 999, background: '#C8955C' }} /></div><div className="d">47 / 60 phòng có khách</div></div>
          <div className="card kpi"><div className="k">Nhận phòng hôm nay</div><div className="big">{db.bookings.filter(x => x.checkIn === t && x.status !== 'cancel').length}</div><div className="d">{db.bookings.filter(x => x.checkIn === t && x.status === 'in').length} đã nhận</div></div>
          <div className="card kpi"><div className="k">Đang lưu trú</div><div className="big">{inHouse}</div><div className="d">{db.bookings.filter(x => x.checkOut === t && x.status !== 'cancel').length} trả phòng hôm nay</div></div>
          <div className="card kpi"><div className="k">Đã thu (tất cả đơn)</div><div className="big">{fmt(revenue / 1e6)}tr ₫</div><div className="d">Tổng thanh toán đã nhận</div></div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '14px 16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="ft-wrap" role="tablist" aria-label="Lọc trạng thái">{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={'ft' + (tab === k ? ' ft-on' : '')} onClick={() => { setTab(k); setPage(1) }}>{l} ({counts(k)})</button>)}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select className="sel-chip" aria-label="Kênh" value={ch} onChange={e => { setCh(e.target.value); setPage(1) }} style={{ minHeight: 40 }}><option value="all">Kênh: Tất cả</option>{['Website', 'Điện thoại', 'Tại quầy', 'Đối tác'].map(x => <option key={x}>{x}</option>)}</select>
              <select className="sel-chip" aria-label="Tầng" value={floor} onChange={e => { setFloor(e.target.value); setPage(1) }} style={{ minHeight: 40 }}><option value="all">Tầng: Tất cả</option>{[2, 3, 4, 5, 6].map(x => <option key={x} value={x}>Tầng {x}</option>)}</select>
            </div>
          </div>
          {sel.length > 0 && <div style={{ padding: '8px 16px', background: '#FBF6EE', fontSize: 13, display: 'flex', gap: 12, alignItems: 'center' }}>Đã chọn {sel.length} đơn <button className="btn btn-q" style={{ minHeight: 34 }} onClick={() => { toast(`Đã gửi nhắc ${sel.length} khách`); setSel([]) }}>Gửi nhắc thanh toán</button><button className="btn btn-t" style={{ minHeight: 34 }} onClick={() => setSel([])}>Bỏ chọn</button></div>}
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th><input type="checkbox" aria-label="Chọn tất cả" checked={slice.length > 0 && slice.every(r => sel.includes(r.code))} onChange={e => setSel(e.target.checked ? [...new Set([...sel, ...slice.map(r => r.code)])] : sel.filter(c => !slice.some(r => r.code === c)))} /></th><th>Mã</th><th>Khách</th><th>Phòng</th><th>Nhận – Trả</th><th>Kênh</th><th>Thanh toán</th><th>Trạng thái</th><th style={{ textAlign: 'right' }}>Tổng</th><th /></tr></thead>
              <tbody>
                {slice.map((r, i) => { const s = BOOKING_STATUS[r.status], p = PAY_STATUS[r.pay]; return (
                  <tr key={r.code} className={(i === 0 && page === 1 ? 'row-sel ' : '') + 'row-click'} onClick={() => setView(r.code)}>
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" aria-label={`Chọn ${r.code}`} checked={sel.includes(r.code)} onChange={e => setSel(e.target.checked ? [...sel, r.code] : sel.filter(c => c !== r.code))} /></td>
                    <td><span className="mono" style={{ fontWeight: 600, fontSize: 13, letterSpacing: '.04em' }}>{r.code}</span></td>
                    <td><div style={{ fontWeight: 500 }}>{r.guest.name}</div><div className="sub">{maskPhone(r.guest.phone)}</div></td>
                    <td>{r.roomType} {r.roomNo}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDM(r.checkIn)} – {fmtDM(r.checkOut)}</td>
                    <td>{r.channel}</td>
                    <td><span className="pill" style={{ background: p.bg, color: p.fg }}>{p.label}</span></td>
                    <td><span className="pill" style={{ background: s.bg, color: s.fg }}><i style={{ background: s.dot }} />{s.label}</span></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600 }}>{fmt(r.quote.total)} ₫</td>
                    <td style={{ whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}><button className="ib" aria-label={`Xem ${r.code}`} onClick={() => setView(r.code)}><Ico n="eye" size={16} /></button></td>
                  </tr>) })}
                {slice.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40 }} className="muted">Không có đơn phù hợp bộ lọc.</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', fontSize: 13, flexWrap: 'wrap', gap: 8 }}>
            <span className="muted">Hiển thị {rows.length ? (cur - 1) * PER + 1 : 0}–{Math.min(cur * PER, rows.length)} trong {rows.length} đặt phòng</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="ib" aria-label="Trang trước" disabled={cur === 1} onClick={() => setPage(cur - 1)}>‹</button>
              {Array.from({ length: pages }, (_, i) => <button key={i} className="ib" aria-current={cur === i + 1 ? 'page' : undefined} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
              <button className="ib" aria-label="Trang sau" disabled={cur === pages} onClick={() => setPage(cur + 1)}>›</button>
            </div>
          </div>
        </div>
      </main>
      <Modal open={!!b} onClose={() => setView(null)} title={b ? `Đơn ${b.code}` : ''} wide>
        {b && <Detail b={b} onClose={() => setView(null)} act={act} openPublic={() => { markVerified(b.code); nav(`/tra-cuu/${b.code}`) }} />}
      </Modal>
    </>
  )
}
function Detail({ b, act, openPublic, onClose }: { b: Booking; act: (fn: () => Promise<void>, msg: string) => Promise<void>; openPublic: () => void; onClose: () => void }) {
  const s = BOOKING_STATUS[b.status]
  const t = todayKey()
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}><span className="pill" style={{ background: s.bg, color: s.fg }}><i style={{ background: s.dot }} />{s.label}</span><span className="pill" style={{ background: PAY_STATUS[b.pay].bg, color: PAY_STATUS[b.pay].fg }}>{PAY_STATUS[b.pay].label}</span><span className="pill" style={{ background: '#F3EADC', color: '#4A3A2E' }}>{b.channel}</span></div>
      <div className="grid g2" style={{ gap: '16px 24px' }}>
        <div><div className="k">Khách</div><div className="v">{b.guest.name}</div><div className="muted" style={{ fontSize: 13 }}>{b.guest.phone} · {b.guest.email}</div></div>
        <div><div className="k">Phòng</div><div className="v">{b.roomType} {b.roomNo} · Tầng {b.floor}</div></div>
        <div><div className="k">Nhận phòng</div><div className="v">{dowShort(b.checkIn)}, {fmtDMY(b.checkIn)} · {b.checkInTime}</div></div>
        <div><div className="k">Trả phòng</div><div className="v">{dowShort(b.checkOut)}, {fmtDMY(b.checkOut)} · {b.checkOutTime}</div></div>
        <div><div className="k">Khách</div><div className="v">{b.adults} người lớn{b.children ? ` · ${b.children} trẻ em` : ''}</div></div>
        <div><div className="k">Giấy tờ</div><div className="v">{b.guest.idType} {b.guest.idNo.slice(0, 3)}•••{b.guest.idNo.slice(-2)} · {b.guest.nationality}</div></div>
        <div style={{ gridColumn: '1/-1' }}><div className="k">Yêu cầu</div><div className="v" style={{ fontWeight: 500 }}>{[...b.requests, b.note].filter(Boolean).join(' · ') || 'Không có'}</div></div>
        <div><div className="k">Tổng tiền</div><div className="v" style={{ fontSize: 20, color: '#3B2416' }}>{fmt(b.quote.total)} ₫</div></div>
        <div><div className="k">Đã thu</div><div className="v">{fmt(b.paid)} ₫</div></div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 18, borderTop: '1px solid #E8DFD2', flexWrap: 'wrap' }}>
        {b.status === 'wait' && <button className="btn btn-p" onClick={() => act(() => updateBooking(b.code, x => { x.status = 'ok'; x.pay = 'paid'; x.paid = x.quote.total; x.method = 'Tại quầy' }), 'Đã ghi nhận thanh toán').then(onClose)}>Ghi nhận đã thanh toán</button>}
        {b.status === 'ok' && <button className="btn btn-p" onClick={() => act(() => setBookingStatus(b.code, 'in'), 'Đã check-in').then(onClose)}>Check-in{b.checkIn > t ? ' sớm' : ''}</button>}
        {b.status === 'in' && <button className="btn btn-p" onClick={() => act(() => setBookingStatus(b.code, 'out'), 'Đã trả phòng').then(onClose)}>Check-out</button>}
        <button className="btn btn-q" onClick={openPublic}>Xem như khách</button>
        {(b.status === 'ok' || b.status === 'wait') && <button className="btn btn-d" onClick={() => act(() => cancelBooking(b.code), 'Đã huỷ đơn').then(onClose)}>Huỷ đơn</button>}
      </div>
    </div>
  )
}
