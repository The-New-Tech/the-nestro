import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlowShell, useRoomInfo } from '@/components/Summary'
import { Field } from '@/components/ui'
import { useFlow } from '@/store/flow'
import { useToast } from '@/store/ui'
import { ETA_SLOTS, NATIONALITIES, REQUEST_CHIPS } from '@/data/catalog'
import { vEmail, vId, vName, vPhone } from '@/lib/validate'

export default function Step3Guest() {
  const { flow, patch } = useFlow()
  const nav = useNavigate()
  const toast = useToast()
  const room = useRoomInfo()
  const [cc, setCc] = useState('+84')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const touch = (k: string) => setTouched(t => ({ ...t, [k]: true }))
  const err = {
    name: vName(flow.name), phone: vPhone(flow.phone, cc), email: vEmail(flow.email), id: vId(flow.idNo, flow.idType)
  }
  const show = (k: keyof typeof err) => (touched[k] ? err[k] : '')
  const ok = (k: keyof typeof err) => touched[k] && !err[k]
  const valid = !err.name && !err.phone && !err.email && !err.id && flow.agree && !!room
  const bind = (k: keyof typeof err) => ({ onBlur: () => touch(k), 'aria-invalid': !!show(k) || undefined, 'aria-describedby': show(k) ? `f-${k}-e` : undefined })
  const cls = (k: keyof typeof err) => 'in' + (show(k) ? ' in-err' : ok(k) ? ' in-ok' : '')
  const toggleReq = (r: string) => patch({ requests: flow.requests.includes(r) ? flow.requests.filter(x => x !== r) : [...flow.requests, r] })
  return (
    <FlowShell step={3} title="Thông tin người đặt" lead="Xác nhận đặt phòng sẽ được gửi tới email và số điện thoại này." backTo="/dat-phong/ngay"
      nextLabel="Tiếp tục: Thanh toán" disabledLabel="Chưa đủ thông tin" nextDisabled={!valid}
      onNext={() => { setTouched({ name: true, phone: true, email: true, id: true }); if (valid) nav('/dat-phong/thanh-toan') }}
      headRight={<button className="btn btn-q btn-sm" onClick={() => toast('Đăng nhập Nestro Club sẽ khả dụng khi kết nối máy chủ')}>Đăng nhập để điền nhanh</button>}>
      <form className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }} onSubmit={e => e.preventDefault()} noValidate>
        <div className="grid g2" style={{ gap: '20px 24px' }}>
          <Field id="f-name" label="Họ và tên" req error={show('name')} ok={ok('name')}>
            <input id="f-name" className={cls('name')} autoComplete="name" value={flow.name} placeholder="Nhập họ và tên" onChange={e => patch({ name: e.target.value })} {...bind('name')} />
          </Field>
          <Field id="f-phone" label="Số điện thoại" req error={show('phone')} ok={ok('phone')}>
            <div style={{ display: 'flex', gap: 8 }}>
              <select aria-label="Mã quốc gia" className="in" style={{ width: 100 }} value={cc} onChange={e => setCc(e.target.value)}>{['+84', '+82', '+81', '+86', '+1', '+44', '+65'].map(c => <option key={c}>{c}</option>)}</select>
              <input id="f-phone" className={cls('phone')} inputMode="tel" autoComplete="tel-national" placeholder="090 xxx xxxx" value={flow.phone} onChange={e => patch({ phone: e.target.value })} {...bind('phone')} />
            </div>
          </Field>
          <Field id="f-mail" label="Email" req error={show('email')} ok={ok('email')} hint="Dùng để nhận mã đặt phòng và hoá đơn">
            <input id="f-mail" type="email" className={cls('email')} autoComplete="email" placeholder="ban@email.com" value={flow.email} onChange={e => patch({ email: e.target.value })} {...bind('email')} />
          </Field>
          <Field id="f-id" label="Giấy tờ tuỳ thân" req error={show('id')} ok={ok('id')} hint="Xuất trình bản gốc khi nhận phòng">
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', border: '1px solid #D9CCBA', borderRadius: 12, padding: 3, flex: 'none' }}>
                {(['CCCD', 'Hộ chiếu'] as const).map(t => <button key={t} type="button" aria-pressed={flow.idType === t} onClick={() => patch({ idType: t })} style={{ minHeight: 40, padding: '0 12px', border: 0, borderRadius: 9, background: flow.idType === t ? '#3B2416' : 'transparent', color: flow.idType === t ? '#FAF6EF' : '#6B5A4C', font: "600 13px var(--font)" }}>{t}</button>)}
              </div>
              <input id="f-id" className={cls('id')} inputMode={flow.idType === 'CCCD' ? 'numeric' : 'text'} placeholder={flow.idType === 'CCCD' ? '12 chữ số trên CCCD' : 'Số hộ chiếu'} value={flow.idNo} onChange={e => patch({ idNo: e.target.value })} {...bind('id')} />
            </div>
          </Field>
          <Field id="f-nat" label="Quốc tịch" req>
            <select id="f-nat" className="in" value={flow.nationality} onChange={e => patch({ nationality: e.target.value })}>{NATIONALITIES.map(n => <option key={n}>{n}</option>)}</select>
          </Field>
          <Field id="f-eta" label="Giờ đến dự kiến">
            <select id="f-eta" className="in" value={flow.eta} onChange={e => patch({ eta: e.target.value })}>{ETA_SLOTS.map(n => <option key={n}>{n}</option>)}</select>
          </Field>
        </div>
        <div>
          <label className="lbl" htmlFor="f-req">Yêu cầu đặc biệt <span className="muted" style={{ fontWeight: 400 }}>(không bắt buộc)</span></label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {REQUEST_CHIPS.map(r => <button key={r} type="button" aria-pressed={flow.requests.includes(r)} className={'chip chip-soft' + (flow.requests.includes(r) ? ' chip-on' : '')} onClick={() => toggleReq(r)}>{r}</button>)}
          </div>
          <textarea id="f-req" className="in" rows={3} maxLength={300} value={flow.note} onChange={e => patch({ note: e.target.value })} placeholder="Ví dụ: chuyến bay, giờ đến, dị ứng thực phẩm…" />
          <div style={{ textAlign: 'right', fontSize: 12, color: '#6B5A4C', marginTop: 4 }}>{flow.note.length}/300</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 8, borderTop: '1px solid #E8DFD2' }}>
          <label className="check"><input type="checkbox" checked={flow.forOthers} onChange={e => patch({ forOthers: e.target.checked })} />Tôi đặt phòng cho người khác</label>
          <label className="check"><input type="checkbox" checked={flow.agree} onChange={e => patch({ agree: e.target.checked })} /><span>Tôi đồng ý với <a href="#">Điều khoản đặt phòng</a> và <a href="#">Chính sách bảo mật</a></span></label>
        </div>
      </form>
    </FlowShell>
  )
}
