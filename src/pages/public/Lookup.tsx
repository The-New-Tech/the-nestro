import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Ico } from '@/components/Icon'
import { lookupBooking } from '@/api'
import { markVerified } from '@/lib/ics'
import { useDb } from '@/store/db'
import { useToast } from '@/store/ui'
import { fmtDM, fmtDMY } from '@/lib/utils'
import { vPhone } from '@/lib/validate'

export default function Lookup() {
  const nav = useNavigate()
  const toast = useToast()
  const db = useDb()
  const [tab, setTab] = useState<'code' | 'otp'>('code')
  const [code, setCode] = useState('')
  const [contact, setContact] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [found, setFound] = useState<string[] | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('')
    if (!code.trim() || !contact.trim()) { setErr('Vui lòng nhập mã đặt phòng và email hoặc số điện thoại.'); return }
    setBusy(true)
    const b = await lookupBooking(code, contact)
    setBusy(false)
    if (!b) { setErr('Không tìm thấy đặt phòng. Kiểm tra lại mã hoặc email.'); return }
    markVerified(b.code); nav(`/tra-cuu/${b.code}`)
  }
  const sendOtp = () => {
    const m = vPhone(phone); if (m) { setErr(m); return }
    setErr(''); setOtpSent(true); toast('Mã OTP demo: 123456 (khi có backend sẽ gửi SMS thật)', { ms: 6000 })
  }
  const verifyOtp = () => {
    if (otp !== '123456') { setErr('Mã OTP không đúng'); return }
    const d = phone.replace(/\D/g, '').slice(-9)
    const list = db.bookings.filter(b => b.guest.phone.replace(/\D/g, '').endsWith(d))
    if (!list.length) { setErr('Không có đặt phòng nào với số điện thoại này'); return }
    list.forEach(b => markVerified(b.code)); setErr(''); setFound(list.map(b => b.code))
  }
  return (
    <div style={{ padding: 'clamp(16px,4vw,48px)', display: 'flex', flex: 1 }}>
      <div className="card lookup">
        <section style={{ width: 440, background: '#3B2416', color: '#FAF6EF', padding: '48px 44px', display: 'flex', flexDirection: 'column', gap: 22, flex: 'none' }}>
          <div className="eyebrow eyebrow-g" style={{ letterSpacing: '.16em' }}>Đặt phòng của tôi</div>
          <h1 style={{ fontSize: 34, lineHeight: 1.2, fontWeight: 600 }}>Kiểm tra phòng đã đặt</h1>
          <p style={{ fontSize: 15, color: '#E9DCCB', lineHeight: 1.6 }}>Không cần tài khoản. Chỉ cần mã đặt phòng và email hoặc số điện thoại đã dùng khi đặt.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            {[['list', 'Xem chi tiết phòng, ngày ở và tình trạng thanh toán'], ['calendar', 'Đổi ngày, thêm yêu cầu hoặc huỷ phòng'], ['download', 'Tải xác nhận PDF, hoá đơn và mã QR nhận phòng']].map(([i, t]) => (
              <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 14, color: '#E9DCCB' }}><span style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(200,149,92,.2)', color: '#E3BE8D', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Ico n={i as 'list'} /></span>{t}</div>
            ))}
          </div>
        </section>
        <form style={{ flex: 1, padding: '48px 56px', display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }} onSubmit={submit} noValidate>
          <div className="seg-wrap" role="tablist" aria-label="Cách tra cứu">
            <button type="button" role="tab" aria-selected={tab === 'code'} className={'seg' + (tab === 'code' ? ' seg-on' : '')} onClick={() => { setTab('code'); setErr('') }}>Bằng mã đặt phòng</button>
            <button type="button" role="tab" aria-selected={tab === 'otp'} className={'seg' + (tab === 'otp' ? ' seg-on' : '')} onClick={() => { setTab('otp'); setErr('') }}>Bằng mã OTP qua SĐT</button>
          </div>
          {tab === 'code' ? (
            <>
              <div><label className="lbl" htmlFor="l1">Mã đặt phòng</label><input id="l1" className="in" placeholder="NST-XXXXXX" value={code} onChange={e => setCode(e.target.value)} style={{ fontFamily: 'var(--mono)', letterSpacing: '.08em', textTransform: 'uppercase' }} autoCapitalize="characters" />
                <div className="hint">Gồm 6 ký tự sau "NST-", có trong email hoặc SMS xác nhận</div></div>
              <div><label className="lbl" htmlFor="l2">Email hoặc số điện thoại đặt phòng</label><input id="l2" className="in" value={contact} onChange={e => setContact(e.target.value)} autoComplete="email" /></div>
              <button className="btn btn-p btn-block" style={{ minHeight: 52 }} disabled={busy}>{busy ? <span className="spin" /> : <><Ico n="search" />Tra cứu</>}</button>
              <p className="muted" style={{ fontSize: 13 }}>Dùng thử: <button type="button" style={{ border: 0, background: 'transparent', padding: 0, color: 'var(--copper-d)', textDecoration: 'underline' }} onClick={() => { setCode('NST-8K2Q7M'); setContact('minhanh@gmail.com') }}>NST-8K2Q7M · minhanh@gmail.com</button></p>
            </>
          ) : (
            <>
              <div><label className="lbl" htmlFor="l3">Số điện thoại đặt phòng</label><input id="l3" className="in" inputMode="tel" placeholder="090 xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} disabled={otpSent} /></div>
              {otpSent && <div><label className="lbl" htmlFor="l4">Mã OTP 6 số</label><input id="l4" className="in" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} style={{ letterSpacing: '.4em', fontFamily: 'var(--mono)' }} /></div>}
              <button type="button" className="btn btn-p btn-block" style={{ minHeight: 52 }} onClick={otpSent ? verifyOtp : sendOtp}>{otpSent ? 'Xác nhận OTP' : 'Gửi mã OTP'}</button>
              {found && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{found.map(c => { const b = db.bookings.find(x => x.code === c)!; return <Link key={c} to={`/tra-cuu/${c}`} className="act" style={{ textDecoration: 'none', color: 'inherit' }}><span className="mono" style={{ fontWeight: 600 }}>{c}</span><span className="muted" style={{ marginLeft: 'auto', fontSize: 13 }}>{b.roomType} {b.roomNo} · {fmtDM(b.checkIn)}–{fmtDMY(b.checkOut)}</span></Link> })}</div>}
            </>
          )}
          {err && <div role="alert" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', borderRadius: 12, background: '#FBE9E7', color: '#8C1D18', fontSize: 14 }}><Ico n="alert" />{err}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, paddingTop: 12, borderTop: '1px solid #E8DFD2', gap: 12, flexWrap: 'wrap' }}>
            <a href="#" onClick={e => { e.preventDefault(); toast('Đã gửi lại mã qua email (demo)') }}>Quên mã? Gửi lại qua email</a>
            <a href="#" onClick={e => { e.preventDefault(); toast('Nestro Club sẽ khả dụng khi kết nối máy chủ') }}>Đăng nhập Nestro Club để xem tất cả</a>
          </div>
        </form>
      </div>
    </div>
  )
}
