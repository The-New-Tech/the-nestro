import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Ico } from '@/components/Icon'
import { Stepper } from '@/components/Stepper'
import { CalendarMenu } from '@/components/BookingBits'
import { useFlow } from '@/store/flow'
import { useDb } from '@/store/db'
import { useToast } from '@/store/ui'
import { dowShort, fmt, fmtDMY, fmtDM, addDays, maskEmail, maskPhone, fmtTime } from '@/lib/utils'
import { markVerified } from '@/lib/ics'
import { HOTLINE } from '@/data/catalog'

export default function Step5Done() {
  const { flow, reset } = useFlow()
  const db = useDb()
  const toast = useToast()
  const b = db.bookings.find(x => x.code === flow.doneCode)
  const [ch, setCh] = useState<'email' | 'sms' | 'both'>('both')
  const [cool, setCool] = useState(0)
  useEffect(() => { if (b) markVerified(b.code) }, [b])
  useEffect(() => { if (cool <= 0) return; const i = setTimeout(() => setCool(c => c - 1), 1000); return () => clearTimeout(i) }, [cool])
  if (!b) return <Navigate to="/dat-phong" replace />
  const first = b.guest.name.trim().split(/\s+/).slice(-2).join(' ')
  return (
    <>
      <Stepper cur={6} />
      <div className="flow" style={{ paddingTop: 32 }}>
        <section className="flow-main">
          <div className="card done-hero">
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#C8955C', color: '#2A1D14', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Ico n="check" size={40} sw={2.4} /></div>
            <div style={{ flex: 1 }}>
              <div className="eyebrow eyebrow-g">Thanh toán thành công · {b.paidAt ? fmtTime(b.paidAt) : ''}</div>
              <h1 style={{ margin: '10px 0 6px', fontSize: 30, lineHeight: 1.25, fontWeight: 600 }}>Đặt phòng thành công!</h1>
              <p style={{ fontSize: 15, color: '#E9DCCB' }}>Cảm ơn {first}. Phòng {b.roomNo} đã được giữ cho bạn từ {fmtDMY(b.checkIn).slice(0, 5)} đến {fmtDMY(b.checkOut)}.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: '#E3BE8D' }}>Mã đặt phòng</div>
              <div style={{ font: '600 30px/1.2 var(--mono)', letterSpacing: '.08em', margin: '4px 0 10px' }}>{b.code}</div>
              <button className="btn" style={{ minHeight: 44, background: 'transparent', color: '#FAF6EF', border: '1px solid rgba(250,246,239,.4)', fontSize: 14 }} onClick={async () => { try { await navigator.clipboard.writeText(b.code) } catch { /* */ } toast('Đã sao chép mã đặt phòng') }}><Ico n="copy" size={16} />Sao chép mã</button>
            </div>
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Chi tiết đặt phòng</h2>
            <div className="grid g3" style={{ gap: '22px 24px' }}>
              <Kv k="Phòng" v={`${b.roomType} · ${b.roomNo} · Tầng ${b.floor}`} />
              <Kv k="Nhận phòng" v={`${dowShort(b.checkIn)}, ${fmtDMY(b.checkIn)} · ${b.checkInTime}`} />
              <Kv k="Trả phòng" v={`${dowShort(b.checkOut)}, ${fmtDMY(b.checkOut)} · ${b.checkOutTime}`} />
              <Kv k="Khách" v={`${b.adults} người lớn${b.children ? ` · ${b.children} trẻ em` : ''}`} />
              <Kv k="Người đặt" v={b.guest.name} />
              <Kv k="Liên hệ" v={b.guest.phone} />
              <Kv k="Yêu cầu" v={b.requests.length ? b.requests.join(' · ') : b.note ? 'Có ghi chú' : 'Không có'} />
              <Kv k="Thanh toán" v={`${b.method} · ${b.pay === 'paid' ? 'Đã thanh toán' : 'Đã đặt cọc 30%'}`} />
              <div><div className="k">Tổng đã trả</div><div className="v" style={{ fontSize: 20, color: '#3B2416' }}>{fmt(b.paid)} ₫</div></div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, paddingTop: 22, borderTop: '1px solid #E8DFD2', flexWrap: 'wrap' }} className="no-print">
              <button className="btn btn-p" onClick={() => window.print()}><Ico n="download" />Tải xác nhận PDF</button>
              <CalendarMenu b={b} />
              <Link to={`/tra-cuu/${b.code}`} className="btn btn-q">Quản lý đặt phòng</Link>
              <Link to="/phong" className="btn btn-t" style={{ marginLeft: 'auto' }} onClick={reset}>Về trang chủ</Link>
            </div>
          </div>

          <div className="grid g3">
            <div className="card" style={{ padding: 20 }}><div style={{ fontWeight: 600, marginBottom: 6 }}>Địa chỉ</div><div className="muted" style={{ fontSize: 14 }}>[ĐỊA CHỈ KHÁCH SẠN] · <a href="#">Chỉ đường</a></div></div>
            <div className="card" style={{ padding: 20 }}><div style={{ fontWeight: 600, marginBottom: 6 }}>Chính sách huỷ</div><div className="muted" style={{ fontSize: 14 }}>Hoàn 100% nếu huỷ trước 14:00 ngày {fmtDM(addDays(b.checkIn, -2))}</div></div>
            <div className="card" style={{ padding: 20 }}><div style={{ fontWeight: 600, marginBottom: 6 }}>Cần hỗ trợ?</div><div className="muted" style={{ fontSize: 14 }}>Hotline {HOTLINE} · 24/7</div></div>
          </div>
        </section>
        <aside className="flow-side" style={{ position: 'static', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Mã QR nhận phòng</h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Xuất trình tại quầy lễ tân để nhận phòng nhanh</p>
            <div style={{ display: 'inline-block', padding: 14, borderRadius: 14, border: '1px solid #E8DFD2' }}><QRCodeSVG value={`NESTRO-CHECKIN:${b.code}`} size={168} fgColor="#2A1D14" role="img" aria-label={`Mã QR nhận phòng ${b.code}`} /></div>
            <div style={{ font: '600 15px var(--mono)', letterSpacing: '.1em', marginTop: 10 }}>{b.code}</div>
          </div>
          <div className="card no-print" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Gửi xác nhận</h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>Chọn kênh nhận mã đặt phòng</p>
            <div className="seg-wrap" role="radiogroup" aria-label="Kênh gửi">
              {([['email', 'Email'], ['sms', 'SMS'], ['both', 'Cả hai']] as const).map(([k, l]) => <button key={k} className={'seg' + (ch === k ? ' seg-on' : '')} role="radio" aria-checked={ch === k} onClick={() => setCh(k)}>{l}</button>)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }}>
              {ch !== 'sms' && <Sent icon="mail" a={maskEmail(b.guest.email)} t={b.paidAt ? fmtTime(b.paidAt).slice(0, 5) : ''} />}
              {ch !== 'email' && <Sent icon="chat" a={maskPhone(b.guest.phone)} t={b.paidAt ? fmtTime(b.paidAt).slice(0, 5) : ''} />}
            </div>
            <button className="btn btn-g btn-block" disabled={cool > 0} onClick={() => { setCool(60); toast('Đã gửi lại xác nhận') }}><Ico n="refresh" />{cool > 0 ? `Gửi lại sau ${cool}s` : 'Gửi lại'}</button>
            <p className="muted" style={{ marginTop: 10, fontSize: 12, textAlign: 'center' }}>Chưa nhận được? Kiểm tra hộp thư Spam hoặc gửi lại sau 60 giây</p>
          </div>
        </aside>
      </div>
    </>
  )
}
const Kv = ({ k, v }: { k: string; v: string }) => <div><div className="k">{k}</div><div className="v">{v}</div></div>
const Sent = ({ icon, a, t }: { icon: 'mail' | 'chat'; a: string; t: string }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 14 }}>
    <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#E6F2EA', color: '#1E5235', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Ico n={icon} /></span>
    <div style={{ flex: 1 }}><div style={{ fontWeight: 500 }}>{a}</div><div style={{ fontSize: 12, color: '#2F6B45' }}>Đã gửi lúc {t}</div></div>
  </div>
)
