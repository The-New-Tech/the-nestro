import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Ico } from '@/components/Icon'
import { Modal, BOOKING_STATUS } from '@/components/ui'
import { DateRange } from '@/components/DateRange'
import { useDb } from '@/store/db'
import { useToast } from '@/store/ui'
import { cancelBooking, cancelDeadline, updateBooking } from '@/api'
import { verified } from '@/lib/ics'
import { ADDONS } from '@/data/catalog'
import { quote } from '@/lib/pricing'
import { roomState } from '@/lib/availability'
import { dowShort, fmt, fmtDM, fmtDMY, maskEmail, diffDays } from '@/lib/utils'

export default function BookingDetail() {
  const { code = '' } = useParams()
  const db = useDb()
  const nav = useNavigate()
  const toast = useToast()
  const b = db.bookings.find(x => x.code === code)
  const [modal, setModal] = useState<'dates' | 'req' | 'cancel' | null>(null)
  const [dates, setDates] = useState({ ci: b?.checkIn ?? '', co: b?.checkOut ?? '' })
  const [note, setNote] = useState(b?.note ?? '')
  const [busy, setBusy] = useState(false)
  const deadline = useMemo(() => (b ? cancelDeadline(b) : new Date()), [b])
  if (!b || !verified(code)) return <Navigate to="/tra-cuu" replace />
  const st = BOOKING_STATUS[b.status]
  const freeLeft = deadline.getTime() - Date.now()
  const canCancel = b.status === 'ok' || b.status === 'wait'
  const hrs = Math.floor(freeLeft / 3600000), mins = Math.floor((freeLeft % 3600000) / 60000)
  const nightsN = diffDays(b.checkIn, b.checkOut)
  const upcoming = Math.max(0, diffDays(new Date().toISOString().slice(0, 10), b.checkIn))
  const tl = [
    { l: 'Đã đặt', s: fmtDM(b.createdAt.slice(0, 10)), done: true },
    { l: 'Đã thanh toán', s: b.pay === 'none' ? 'Chờ thanh toán' : fmtDM(b.createdAt.slice(0, 10)), done: b.pay !== 'none' },
    { l: 'Nhận phòng', s: `${fmtDM(b.checkIn)} · ${b.checkInTime}`, done: b.status === 'in' || b.status === 'out' },
    { l: 'Trả phòng', s: `${fmtDM(b.checkOut)} · ${b.checkOutTime}`, done: b.status === 'out' }
  ]
  const toggleAddon = async (id: string) => {
    const addons = b.addons.includes(id) ? b.addons.filter(x => x !== id) : [...b.addons, id]
    const lateOn = addons.includes('latecheckout')
    await updateBooking(b.code, x => {
      x.addons = addons; if (lateOn) x.checkOutTime = '14:00'; else if (x.checkOutTime === '14:00') x.checkOutTime = '12:00'
      x.quote = quote(db, { roomNo: x.roomNo, checkIn: x.checkIn, checkOut: x.checkOut, checkInTime: x.checkInTime, checkOutTime: x.checkOutTime, adults: x.adults, children: x.children, addons, promo: x.quote.promoCode })
    })
    toast('Đã cập nhật dịch vụ')
  }
  const saveDates = async () => {
    if (!dates.co) return
    if (roomState(db, b.roomNo, dates.ci, dates.co, b.code) !== 'free') { toast('Phòng không còn trống trong các ngày này', { kind: 'err' }); return }
    setBusy(true)
    await updateBooking(b.code, x => { x.checkIn = dates.ci; x.checkOut = dates.co; x.quote = quote(db, { roomNo: x.roomNo, checkIn: dates.ci, checkOut: dates.co, checkInTime: x.checkInTime, checkOutTime: x.checkOutTime, adults: x.adults, children: x.children, addons: x.addons, promo: x.quote.promoCode }) })
    setBusy(false); setModal(null); toast('Đã đổi ngày lưu trú')
  }
  const remaining = Math.max(0, b.quote.total - b.paid)
  return (
    <div className="page" style={{ gap: 20, paddingTop: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }} className="no-print">
        <Link to="/tra-cuu" style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, fontSize: 14, textDecoration: 'none' }}><Ico n="chevLeft" size={16} sw={2} />Tra cứu đặt phòng khác</Link>
        <span className="muted" style={{ fontSize: 13 }}>Cập nhật lúc {new Date().toTimeString().slice(0, 5)}, {fmtDMY(new Date().toISOString().slice(0, 10))}</span>
      </div>
      <section className="card" style={{ padding: 28, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="pill" style={{ background: st.bg, color: st.fg, fontSize: 13, padding: '6px 12px' }}><i style={{ background: st.dot }} />{st.label}</span>
            <span className="pill" style={{ background: '#F3EADC', color: '#4A3A2E', fontSize: 13, padding: '6px 12px' }}>{b.pay === 'paid' ? 'Đã thanh toán' : b.pay === 'part' ? 'Đã cọc 30%' : b.pay === 'ref' ? 'Đã hoàn tiền' : 'Chưa thanh toán'}</span>
          </div>
          <h1 style={{ margin: '14px 0 4px', fontSize: 30, fontWeight: 600 }}>{b.roomType} · Phòng {b.roomNo}</h1>
          <div style={{ fontSize: 15, color: '#6B5A4C' }}>Mã đặt phòng <strong style={{ fontFamily: 'var(--mono)', letterSpacing: '.08em', color: '#2A1D14' }}>{b.code}</strong> · Đặt ngày {fmtDMY(b.createdAt.slice(0, 10))}</div>
        </div>
        <div className="tl" style={{ flex: '1.3 1 360px' }}>
          {tl.map((t, i) => (
            <div key={t.l}>
              {i < tl.length - 1 && <div style={{ position: 'absolute', top: 15, left: '50%', width: '100%', height: 2, background: t.done && tl[i + 1].done ? '#C8955C' : '#E8DFD2' }} />}
              <div style={{ width: 32, height: 32, borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.done ? '#C8955C' : '#fff', color: t.done ? '#2A1D14' : '#6B5A4C', border: t.done ? 0 : '2px solid #D9CCBA' }}>{t.done && <Ico n="check" size={16} sw={2.5} />}</div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 600 }}>{t.l}</div><div className="muted" style={{ fontSize: 12 }}>{t.s}</div></div>
            </div>
          ))}
        </div>
      </section>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 26 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 18 }}>Thông tin lưu trú</h2>
            <div className="grid g3" style={{ gap: '20px 24px' }}>
              <Kv k="Nhận phòng" v={`${dowShort(b.checkIn)}, ${fmtDMY(b.checkIn)} · ${b.checkInTime}`} /><Kv k="Trả phòng" v={`${dowShort(b.checkOut)}, ${fmtDMY(b.checkOut)} · ${b.checkOutTime}`} /><Kv k="Số đêm" v={`${nightsN} đêm`} />
              <Kv k="Khách" v={`${b.adults} người lớn${b.children ? ` · ${b.children} trẻ em` : ''}`} /><Kv k="Người đặt" v={b.guest.name} /><Kv k="Liên hệ" v={maskEmail(b.guest.email)} />
              <div style={{ gridColumn: '1 / -1' }}><div className="k">Yêu cầu đặc biệt</div><div className="v" style={{ fontWeight: 500 }}>{[...b.requests, b.note].filter(Boolean).join(' · ') || 'Không có'} {b.confirmedRequest && <span style={{ fontSize: 12, fontWeight: 600, color: '#1E5235', background: '#E6F2EA', padding: '3px 8px', borderRadius: 999, marginLeft: 6 }}>Khách sạn đã xác nhận</span>}</div></div>
            </div>
          </div>
          <div className="card no-print" style={{ padding: 26 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Thêm dịch vụ cho chuyến đi</h2>
            <div className="grid g3" style={{ gap: 14 }}>
              {ADDONS.map(a => { const on = b.addons.includes(a.id); return (
                <div key={a.id} className="add" style={on ? { borderColor: '#C8955C', background: '#FBF6EE' } : undefined}>
                  <strong>{a.name}</strong><span className="muted" style={{ fontSize: 13 }}>{a.unit}</span>
                  <button className={'btn btn-sm ' + (on ? 'btn-p' : 'btn-q')} style={{ marginTop: 4 }} disabled={b.status === 'cancel' || b.status === 'out'} onClick={() => toggleAddon(a.id)}>{on ? 'Đã thêm · Bỏ' : 'Thêm'}</button>
                </div>) })}
            </div>
          </div>
          <div className="card" style={{ padding: 26 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Thanh toán</h2>
            <div className="sl"><span>Tiền phòng · {nightsN} đêm</span><span>{fmt(b.quote.roomTotal)} ₫</span></div>
            {(b.quote.early + b.quote.late + b.quote.addons) > 0 && <div className="sl"><span>Dịch vụ thêm</span><span>{fmt(b.quote.early + b.quote.late + b.quote.addons)} ₫</span></div>}
            <div className="sl"><span>Phí dịch vụ 5% + VAT 8%</span><span>{fmt(b.quote.fee + b.quote.vat)} ₫</span></div>
            {b.quote.discount > 0 && <div className="sl" style={{ color: '#2F6B45' }}><span>Mã {b.quote.promoCode}</span><span>−{fmt(b.quote.discount)} ₫</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, marginTop: 6, borderTop: '1px solid #E8DFD2', gap: 12 }}><span style={{ fontWeight: 600 }}>Đã thanh toán{b.method !== '—' ? ` qua ${b.method}` : ''}</span><strong style={{ fontSize: 22, color: '#3B2416' }}>{fmt(b.paid)} ₫</strong></div>
            {remaining > 0 && b.status !== 'cancel' && <div className="sl" style={{ color: '#6E470D', fontWeight: 600 }}><span>Còn lại thanh toán khi nhận phòng</span><span>{fmt(remaining)} ₫</span></div>}
          </div>
        </div>
        <aside style={{ flex: '0 1 380px', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 22, textAlign: 'center' }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>QR nhận phòng</h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>{b.status === 'cancel' ? 'Đặt phòng đã huỷ' : upcoming > 0 ? `Còn ${upcoming} ngày đến ngày nhận phòng` : 'Xuất trình tại quầy lễ tân'}</p>
            <div style={{ display: 'inline-block', padding: 12, borderRadius: 12, border: '1px solid #E8DFD2', opacity: b.status === 'cancel' ? .3 : 1 }}><QRCodeSVG value={`NESTRO-CHECKIN:${b.code}`} size={148} fgColor="#2A1D14" role="img" aria-label={`Mã QR nhận phòng ${b.code}`} /></div>
          </div>
          <div className="card no-print" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Quản lý đặt phòng</h2>
            <button className="act" disabled={!canCancel} onClick={() => { setDates({ ci: b.checkIn, co: b.checkOut }); setModal('dates') }}><span className="aic"><Ico n="calendar" /></span>Đổi ngày lưu trú</button>
            <button className="act" disabled={b.status === 'cancel'} onClick={() => { setNote(b.note); setModal('req') }}><span className="aic"><Ico n="plus" /></span>Thêm hoặc sửa yêu cầu</button>
            <button className="act" onClick={() => window.print()}><span className="aic"><Ico n="download" /></span>Tải xác nhận PDF &amp; hoá đơn</button>
            <button className="act" onClick={() => toast('Đã gửi lại xác nhận qua Email / SMS')}><span className="aic"><Ico n="refresh" /></span>Gửi lại qua Email / SMS</button>
            {canCancel && <>
              <div style={{ marginTop: 6, padding: 12, borderRadius: 10, background: '#FBEFD5', color: '#6E470D', fontSize: 13, lineHeight: 1.5 }}>
                {freeLeft > 0 ? <>Huỷ miễn phí đến <strong>14:00 {fmtDM(deadline.toISOString().slice(0, 10))}</strong>, còn {hrs >= 24 ? `${Math.floor(hrs / 24)} ngày ${hrs % 24} giờ` : `${hrs} giờ ${mins} phút`}. Sau thời điểm này phí huỷ là 1 đêm.</> : <>Đã quá hạn huỷ miễn phí. Phí huỷ là <strong>1 đêm ({fmt(b.quote.nights[0]?.price ?? 0)} ₫)</strong>.</>}
              </div>
              <button className="btn btn-d btn-block" onClick={() => setModal('cancel')}>Huỷ đặt phòng</button></>}
          </div>
        </aside>
      </div>

      <Modal open={modal === 'dates'} onClose={() => setModal(null)} title="Đổi ngày lưu trú" wide>
        <DateRange roomNo={b.roomNo} ignoreCode={b.code} checkIn={dates.ci} checkOut={dates.co} onChange={(ci, co) => setDates({ ci, co })} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}><button className="btn btn-q" onClick={() => setModal(null)}>Đóng</button><button className="btn btn-p" disabled={!dates.co || busy} onClick={saveDates}>{busy ? <span className="spin" /> : 'Lưu ngày mới'}</button></div>
      </Modal>
      <Modal open={modal === 'req'} onClose={() => setModal(null)} title="Yêu cầu đặc biệt">
        <textarea className="in" rows={4} maxLength={300} value={note} onChange={e => setNote(e.target.value)} aria-label="Yêu cầu đặc biệt" />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}><button className="btn btn-q" onClick={() => setModal(null)}>Đóng</button><button className="btn btn-p" onClick={async () => { await updateBooking(b.code, x => { x.note = note; x.confirmedRequest = false }); setModal(null); toast('Đã gửi yêu cầu tới khách sạn') }}>Lưu yêu cầu</button></div>
      </Modal>
      <Modal open={modal === 'cancel'} onClose={() => setModal(null)} title="Huỷ đặt phòng?">
        <p style={{ lineHeight: 1.6 }}>{freeLeft > 0 ? 'Bạn sẽ được hoàn tiền 100% trong 3–5 ngày làm việc.' : `Phí huỷ 1 đêm (${fmt(b.quote.nights[0]?.price ?? 0)} ₫) sẽ được trừ, phần còn lại hoàn về phương thức đã thanh toán.`}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}><button className="btn btn-q" onClick={() => setModal(null)}>Giữ đặt phòng</button><button className="btn btn-d" disabled={busy} onClick={async () => { setBusy(true); await cancelBooking(b.code); setBusy(false); setModal(null); toast('Đã huỷ đặt phòng'); nav(`/tra-cuu/${b.code}`) }}>{busy ? <span className="spin" style={{ borderTopColor: '#B3261E' }} /> : 'Xác nhận huỷ'}</button></div>
      </Modal>
    </div>
  )
}
const Kv = ({ k, v }: { k: string; v: string }) => <div><div className="k">{k}</div><div className="v">{v}</div></div>
