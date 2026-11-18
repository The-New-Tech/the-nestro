import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHead } from './AdminLayout'
import { useDb, db as store } from '@/store/db'
import { useToast } from '@/store/ui'
import { setBookingStatus } from '@/api'
import { addDays, dowShort, fmtDM, fmtDMY, initials, todayKey, dowLong } from '@/lib/utils'
import { FLOORS } from '@/data/catalog'

const OCC = [78, 81, 93, 96, 74, 62, 58, 66, 72, 88, 92, 70, 55, 52]
export default function Dashboard() {
  const d = useDb()
  const toast = useToast()
  const [range, setRange] = useState(14)
  const [hi, setHi] = useState(2)
  const t = todayKey()
  const arrivals = d.bookings.filter(b => b.checkIn === t && b.status !== 'cancel')
  const newToday = d.bookings.filter(b => b.createdAt.slice(0, 10) === t).length
  const pending = d.bookings.filter(b => b.status === 'wait').length
  const vals = OCC.slice(0, range === 7 ? 7 : 14).concat(range === 30 ? Array.from({ length: 16 }, (_, i) => 55 + ((i * 13) % 40)) : [])
  const hour = new Date().getHours()
  const floors = FLOORS.map((f, i) => { const o = [8, 9, 10, 9, 6][i], c = [2, 1, 2, 2, 1][i], fr = [2, 2, 2, 3, 1][i], tt = o + c + fr; return { f, o, c, fr, tt } })
  return (
    <>
      <AdminHead title={hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'} sub={`${dowLong(t)}, ${fmtDMY(t)} · Số liệu doanh thu/công suất là dữ liệu mẫu`}>
        <Link to="/admin/so-do-tang" className="btn btn-q">Xem sơ đồ phòng</Link>
        <Link to="/dat-phong" className="btn btn-p">+ Tạo đặt phòng</Link>
      </AdminHead>
      <main className="adm-main">
        <div className="kpis">
          <div className="card kpi"><div className="k">Công suất phòng đêm nay</div><div className="big">78%</div><div className="d up">▲ 6 điểm so với tuần trước</div></div>
          <div className="card kpi"><div className="k">Giá phòng trung bình (ADR)</div><div className="big">1,92tr ₫</div><div className="d">30 ngày gần nhất</div></div>
          <div className="card kpi"><div className="k">Doanh thu / phòng (RevPAR)</div><div className="big">1,50tr ₫</div><div className="d">30 ngày gần nhất</div></div>
          <div className="card kpi"><div className="k">Đặt phòng mới hôm nay</div><div className="big">{newToday + 14}</div><div className="d">11 website · 2 điện thoại · 1 tại quầy</div></div>
        </div>
        <div className="cols c-2-1">
          <section className="card pad">
            <div className="sec-h"><div><h2>Công suất phòng {range} đêm tới</h2><small>% phòng đã bán trên 60 phòng · rê chuột để xem chi tiết</small></div>
              <div className="ft-wrap" role="tablist" aria-label="Khoảng thời gian">{[7, 14, 30].map(r => <button key={r} role="tab" aria-selected={range === r} className={'ft' + (range === r ? ' ft-on' : '')} onClick={() => { setRange(r); setHi(0) }}>{r} đêm</button>)}</div></div>
            <div className="bars" style={{ marginBottom: 28 }} role="img" aria-label={`Biểu đồ cột công suất phòng ${range} đêm tới`}>
              {[100, 75, 50, 25, 0].map((g, i) => <div key={g} className="gl" style={{ top: `${i * 25}%`, transform: 'translateY(-50%)' }}><span>{g}{g ? '%' : ''}</span></div>)}
              {vals.map((v, i) => { const day = addDays(t, i); const on = i === hi; return (
                <div key={i} className="bar-col" style={{ background: on ? '#F7F1E7' : 'transparent' }} onMouseEnter={() => setHi(i)} onClick={() => setHi(i)}>
                  <div className="b" style={{ height: `${v}%`, background: on ? '#3B2416' : '#C8955C' }} />
                  <span className="x" style={{ color: on ? '#2A1D14' : '#6B5A4C', fontWeight: on ? 600 : 400, fontSize: range === 30 ? 9 : 11 }}>{range === 30 ? day.slice(8) : fmtDM(day)}</span>
                  {on && <div className="tip"><b>{dowShort(day)}, {fmtDMY(day)}</b><strong>{v}%</strong> · {Math.round(v * .6)}/60 phòng</div>}
                </div>) })}
            </div>
          </section>
          <section className="card pad">
            <div className="sec-h"><h2>Khách đến hôm nay</h2><Link to="/admin/dat-phong" style={{ fontSize: 14 }}>Xem tất cả {arrivals.length}</Link></div>
            {arrivals.length === 0 && <p className="muted" style={{ fontSize: 14 }}>Hôm nay chưa có khách nhận phòng.</p>}
            {arrivals.slice(0, 6).map(b => (
              <div className="li" key={b.code}>
                <span className="av">{initials(b.guest.name)}</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 500 }}>{b.guest.name}</div><div className="muted" style={{ fontSize: 13 }}>{b.roomType} {b.roomNo} · {b.checkInTime}</div></div>
                {b.status === 'in' ? <span className="pill" style={{ background: '#E6F2EA', color: '#1E5235' }}>Đã nhận</span>
                  : <button className="btn btn-q" style={{ minHeight: 36 }} onClick={async () => { await setBookingStatus(b.code, 'in'); toast(`Đã check-in ${b.guest.name}`) }}>Check-in</button>}
              </div>
            ))}
          </section>
        </div>
        <div className="cols c-1-1">
          <section className="card pad">
            <div className="sec-h"><h2>Tình trạng phòng theo tầng</h2></div>
            {floors.map(f => (
              <div className="fbar" key={f.f}>
                <span style={{ width: 52, fontWeight: 500 }}>Tầng {f.f}</span>
                <div className="t"><span style={{ width: `${f.o / f.tt * 100}%`, background: '#3B2416' }} /><span style={{ width: `${f.c / f.tt * 100}%`, background: '#B7791F' }} /><span style={{ width: `${f.fr / f.tt * 100}%`, background: '#2F7D4F' }} /></div>
                <span className="muted" style={{ width: 74, textAlign: 'right' }}>{f.o}/{f.tt} phòng</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12, color: '#4A3A2E', flexWrap: 'wrap' }}>
              {[['#3B2416', 'Có khách'], ['#B7791F', 'Cần dọn'], ['#2F7D4F', 'Trống sạch']].map(([c, l]) => <span key={l} className="lg" style={{ gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: c }} />{l}</span>)}
            </div>
          </section>
          <section className="card pad">
            <div className="sec-h"><h2>Việc cần xử lý</h2></div>
            {[
              [pending ? `${pending} đặt phòng chờ thanh toán sắp hết hạn giữ` : 'Không có đơn chờ thanh toán', '/admin/dat-phong', 'Xem', '#B7791F'],
              ['5 yêu cầu đón sân bay ngày mai', '/admin/dat-phong', 'Xếp xe', '#C8955C'],
              [`Phòng ${Object.keys(d.roomOverrides).filter(k => d.roomOverrides[k].locked).join(', ')} đang bảo trì`, '/admin/so-do-tang', 'Mở sơ đồ', '#B3261E'],
              ['Chưa đặt giá Tết cho tháng 2/2027', '/admin/phong-gia', 'Đặt giá', '#2C5F99']
            ].map(([t2, to, a, c]) => <div className="li" key={t2}><span className="todo" style={{ background: c }} /><span style={{ flex: 1 }}>{t2}</span><Link to={to}>{a}</Link></div>)}
          </section>
        </div>
      </main>
    </>
  )
}
void store
