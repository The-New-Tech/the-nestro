import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { FlowShell, useRoomInfo } from '@/components/Summary'
import { CopyBtn, Field } from '@/components/ui'
import { Ico } from '@/components/Icon'
import { useFlow } from '@/store/flow'
import { useDb } from '@/store/db'
import { useToast, useCountdown, mmss } from '@/store/ui'
import { createBooking, createPaymentQr } from '@/api'
import { genCode, fmt, fmtDM, addDays, asset } from '@/lib/utils'
import { QR_MINUTES } from '@/data/catalog'
import { validatePromo } from '@/lib/pricing'
import { luhn, vExp } from '@/lib/validate'
import { findRoom } from '@/data/catalog'
import { roomState } from '@/lib/availability'

const WALLETS = [
  { k: 'VietQR', mono: 'QR', sub: 'Mọi app ngân hàng', dark: true },
  { k: 'MoMo', mono: 'MM', sub: 'Quét bằng MoMo' },
  { k: 'ZaloPay', mono: 'ZP', sub: 'Quét bằng ZaloPay' }
] as const

export default function Step4Payment() {
  const { flow, patch, quote: q, nights, holdLeft, pickRoom } = useFlow()
  const db = useDb()
  const nav = useNavigate()
  const toast = useToast()
  const room = useRoomInfo()
  const code = flow.pendingCode ?? ''
  const [qr, setQr] = useState<{ payload: string; expiresAt: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [promoIn, setPromoIn] = useState('')
  const [promoErr, setPromoErr] = useState('')
  const [card, setCard] = useState({ no: '', name: '', exp: '', cvv: '' })
  const [ct, setCt] = useState<Record<string, boolean>>({})
  const left = useCountdown(qr?.expiresAt ?? null)
  const started = useRef(false)

  useEffect(() => { if (!flow.pendingCode) patch({ pendingCode: genCode() }) }, [flow.pendingCode, patch])
  const amount = q ? (flow.deposit ? Math.round(q.total * .3) : q.total) : 0
  const makeQr = useCallback(async () => {
    if (!code || !amount) return
    const r = await createPaymentQr(code, amount, flow.wallet)
    setQr({ payload: r.payload, expiresAt: r.expiresAt })
  }, [code, amount, flow.wallet])
  useEffect(() => { if (flow.tab === 'qr') makeQr() }, [flow.tab, flow.wallet, amount, code]) // eslint-disable-line
  useEffect(() => { started.current = true }, [])

  if (!room || nights < 1 || !q) return <Navigate to="/dat-phong" replace />
  if (!flow.name || !flow.email) return <Navigate to="/dat-phong/thong-tin" replace />

  const expired = qr ? left === 0 : false
  const cardErr = {
    no: luhn(card.no) ? '' : 'Số thẻ chưa hợp lệ', name: card.name.trim().length >= 3 ? '' : 'Nhập tên in trên thẻ',
    exp: vExp(card.exp), cvv: /^\d{3,4}$/.test(card.cvv) ? '' : 'CVV gồm 3–4 số'
  }
  const cardOk = !cardErr.no && !cardErr.name && !cardErr.exp && !cardErr.cvv

  const applyPromo = () => {
    const v = validatePromo(db, promoIn, { checkIn: flow.checkIn, checkOut: flow.checkOut, type: room.type, nights })
    if (!v.ok) { setPromoErr(v.reason); return }
    setPromoErr(''); patch({ promo: v.offer.code }); setPromoIn('')
  }
  const pay = async () => {
    if (flow.tab === 'card') { setCt({ no: true, name: true, exp: true, cvv: true }); if (!cardOk) return }
    if (flow.tab === 'qr' && expired) { toast('Mã QR đã hết hạn, hãy tạo mã mới', { kind: 'err' }); return }
    const st = roomState(db, room.no, flow.checkIn, flow.checkOut)
    if (st === 'booked' || st === 'locked') { toast('Phòng vừa được người khác đặt. Vui lòng chọn phòng khác.', { kind: 'err' }); nav('/dat-phong'); return }
    setBusy(true)
    try {
      const b = await createBooking({
        roomNo: room.no, checkIn: flow.checkIn, checkOut: flow.checkOut, checkInTime: flow.checkInTime, checkOutTime: flow.checkOutTime,
        adults: flow.adults, children: flow.children, childAges: flow.childAges,
        guest: { name: flow.name.trim(), phone: flow.phone.replace(/[\s.-]/g, ''), email: flow.email.trim(), idType: flow.idType, idNo: flow.idNo, nationality: flow.nationality, eta: flow.eta },
        requests: flow.requests, note: flow.note, addons: flow.addons, promo: flow.promo || undefined,
        method: flow.tab === 'card' ? 'Thẻ quốc tế' : flow.wallet, depositOnly: flow.deposit
      })
      patch({ doneCode: b.code, pendingCode: null, holdUntil: null })
      nav('/dat-phong/xac-nhan', { replace: true })
    } catch (e) {
      toast((e as Error).message, { kind: 'err' }); setBusy(false)
    }
  }
  const holdExpired = !!flow.holdUntil && holdLeft === 0
  const brand = /^4/.test(card.no) ? 'VISA' : /^(5[1-5]|2[2-7])/.test(card.no) ? 'MASTERCARD' : /^35/.test(card.no) ? 'JCB' : 'CARD'
  const fmtNo = (s: string) => s.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
  const masked = (card.no ? fmtNo(card.no) : '•••• •••• •••• ••••')

  return (
    <FlowShell step={4} title="Thanh toán" lead="Chọn quét mã QR hoặc thanh toán bằng thẻ. Giao dịch được bảo mật chuẩn PCI DSS." backTo="/dat-phong/thong-tin"
      nextLabel={flow.tab === 'card' ? 'Thanh toán ngay' : 'Tôi đã chuyển khoản'} mobileNextLabel={flow.tab === 'card' ? 'Thanh toán ngay' : 'Đã chuyển khoản'}
      nextBusy={busy} nextDisabled={holdExpired} disabledLabel="Hết thời gian giữ phòng" onNext={pay} detail={false}
      footNote={`Hoàn tiền 100% nếu huỷ trước 14:00 ngày ${fmtDM(addDays(flow.checkIn, -2))}`}>
      {holdExpired && (
        <div className="hold" style={{ margin: 0 }} role="alert"><Ico n="clock" /><span style={{ flex: 1 }}>Hết thời gian giữ phòng {room.no}.</span>
          <button className="btn btn-q btn-sm" onClick={() => { if (roomState(db, room.no, flow.checkIn, flow.checkOut) === 'free') pickRoom(room.no); else nav('/dat-phong') }}>Giữ lại phòng</button></div>
      )}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex' }} role="tablist" aria-label="Phương thức thanh toán">
          <button className={'ptab' + (flow.tab === 'qr' ? ' ptab-on' : '')} role="tab" aria-selected={flow.tab === 'qr'} onClick={() => patch({ tab: 'qr' })}><Ico n="qr" size={20} />Quét mã QR</button>
          <button className={'ptab' + (flow.tab === 'card' ? ' ptab-on' : '')} role="tab" aria-selected={flow.tab === 'card'} onClick={() => patch({ tab: 'card' })}><Ico n="card" size={20} /><span>Thẻ ngân hàng<span className="hide-sm"> / Quốc tế</span></span></button>
        </div>

        {flow.tab === 'qr' ? (
          <div className="pay-body">
            <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 10, flex: 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4A3A2E' }}>Ứng dụng thanh toán</div>
              {WALLETS.map(w => (
                <button key={w.k} className={'wal' + (flow.wallet === w.k ? ' wal-on' : '')} aria-pressed={flow.wallet === w.k} onClick={() => patch({ wallet: w.k })}>
                  <span className="mono-b" style={{ background: 'dark' in w ? '#3B2416' : '#F3E6D3', color: 'dark' in w ? '#FAF6EF' : '#3B2416' }}>{w.mono}</span>
                  <span>{w.k === 'VietQR' ? 'VietQR' : w.k === 'MoMo' ? 'Ví MoMo' : 'ZaloPay'}<br /><span className="muted" style={{ fontSize: 12 }}>{w.sub}</span></span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '0 8px', flex: 'none' }}>
              <div style={{ padding: 14, borderRadius: 14, border: '1px solid #E8DFD2', background: '#fff', position: 'relative', opacity: expired ? .25 : 1 }}>
                {qr ? <QRCodeSVG value={qr.payload} size={196} level="H" fgColor="#2A1D14" role="img" aria-label={`Mã QR thanh toán ${fmt(amount)} đồng`} imageSettings={{ src: asset('images/logo-160.png'), width: 40, height: 40, excavate: true }} />
                  : <div style={{ width: 196, height: 196, display: 'grid', placeItems: 'center' }}><span className="spin" style={{ borderColor: '#E8DFD2', borderTopColor: '#3B2416' }} /></div>}
              </div>
              <div className="muted" style={{ fontSize: 13 }}>Số tiền cần thanh toán</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#3B2416', marginTop: -6 }}>{fmt(amount)} ₫</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4A3A2E', maxWidth: 250, textAlign: 'center', lineHeight: 1.5 }}><Ico n="check" size={14} sw={2.2} style={{ color: '#2F7D4F' }} />QR tạo riêng cho đơn {code}, đã điền sẵn số tiền và nội dung</div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '14px 16px', borderRadius: 12, background: expired ? '#FBE9E7' : '#FBEFD5', color: expired ? '#8C1D18' : '#6E470D' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 500 }}><span>{expired ? 'Mã QR đã hết hạn' : 'Mã QR hết hạn sau'}</span><strong style={{ fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>{mmss(left)}</strong></div>
                <div style={{ height: 6, borderRadius: 999, background: 'rgba(183,121,31,.2)', marginTop: 10 }}><div style={{ width: `${Math.min(100, left / (QR_MINUTES * 60) * 100)}%`, height: 6, borderRadius: 999, background: expired ? '#B3261E' : '#B7791F', transition: 'width 1s linear' }} /></div>
              </div>
              <div>
                <div className="kv"><span className="muted">Ngân hàng</span><strong>[TÊN NGÂN HÀNG]</strong></div>
                <div className="kv"><span className="muted">Số tài khoản</span><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong>[SỐ TÀI KHOẢN]</strong><CopyBtn text="[SỐ TÀI KHOẢN]" onDone={() => toast('Đã sao chép số tài khoản')} /></span></div>
                <div className="kv"><span className="muted">Chủ tài khoản</span><strong>[TÊN CÔNG TY]</strong></div>
                <div className="kv"><span className="muted">Nội dung</span><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><strong>NESTRO {code.replace('NST-', '')}</strong><CopyBtn text={`NESTRO ${code.replace('NST-', '')}`} onDone={() => toast('Đã sao chép nội dung chuyển khoản')} /></span></div>
              </div>
              {!expired && <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: '#4A3A2E' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#B7791F', boxShadow: '0 0 0 4px rgba(183,121,31,.18)', flex: 'none' }} />Đang chờ thanh toán… Hệ thống tự xác nhận trong vài giây.</div>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px dashed #D9CCBA', fontSize: 13, color: '#4A3A2E', flexWrap: 'wrap' }}>Mã hết hạn hoặc lỗi hiển thị?<button className="cp" style={{ minHeight: 40, fontWeight: 600 }} onClick={() => { setQr(null); makeQr() }}>Tạo mã QR mới</button></div>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#6B5A4C', lineHeight: 1.7 }}><li>Mở app ngân hàng hoặc ví, chọn Quét QR</li><li>Kiểm tra số tiền và nội dung chuyển khoản</li><li>Xác nhận. Không đóng trang này khi đang chờ</li></ol>
            </div>
          </div>
        ) : (
          <div className="pay-body" style={{ flexDirection: 'column' }}>
            <div className="credit" aria-hidden="true">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ width: 42, height: 30, borderRadius: 6, background: '#C8955C' }} /><span style={{ font: '700 16px var(--font)', letterSpacing: '.08em', color: '#E3BE8D' }}>{brand}</span></div>
              <div style={{ font: '500 20px var(--mono)', letterSpacing: '.12em' }}>{masked}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#E9DCCB' }}>
                <div><div>Chủ thẻ</div><div style={{ fontSize: 14, color: '#FAF6EF', fontWeight: 600, marginTop: 2 }}>{card.name.toUpperCase() || 'HỌ VÀ TÊN'}</div></div>
                <div style={{ textAlign: 'right' }}><div>Hết hạn</div><div style={{ fontSize: 14, color: '#FAF6EF', fontWeight: 600, marginTop: 2 }}>{card.exp || 'MM/YY'}</div></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#6B5A4C', flexWrap: 'wrap' }}>Chấp nhận {['VISA', 'MASTERCARD', 'JCB', 'NAPAS'].map(b => <span key={b} style={{ border: '1px solid #D9CCBA', borderRadius: 6, padding: '2px 8px', fontWeight: 700, fontSize: 10, letterSpacing: '.04em' }}>{b}</span>)}</div>
            <div className="grid g2 grid-sm1" style={{ gap: '16px 20px', width: '100%' }}>
              <Field id="c-no" label="Số thẻ" error={ct.no ? cardErr.no : ''}><input id="c-no" className={'in' + (ct.no && cardErr.no ? ' in-err' : '')} inputMode="numeric" autoComplete="cc-number" placeholder="4532 8812 0456 7781" value={fmtNo(card.no)} onChange={e => setCard({ ...card, no: e.target.value })} onBlur={() => setCt(c => ({ ...c, no: true }))} /></Field>
              <Field id="c-name" label="Tên trên thẻ" error={ct.name ? cardErr.name : ''}><input id="c-name" className={'in' + (ct.name && cardErr.name ? ' in-err' : '')} autoComplete="cc-name" placeholder="NGUYEN VAN A" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} onBlur={() => setCt(c => ({ ...c, name: true }))} /></Field>
              <Field id="c-exp" label="Hết hạn (MM/YY)" error={ct.exp ? cardErr.exp : ''}><input id="c-exp" className={'in' + (ct.exp && cardErr.exp ? ' in-err' : '')} inputMode="numeric" autoComplete="cc-exp" placeholder="08/29" maxLength={5} value={card.exp} onChange={e => { let v = e.target.value.replace(/[^\d/]/g, ''); if (/^\d{3}$/.test(v)) v = v.slice(0, 2) + '/' + v.slice(2); setCard({ ...card, exp: v }) }} onBlur={() => setCt(c => ({ ...c, exp: true }))} /></Field>
              <Field id="c-cvv" label="CVV" error={ct.cvv ? cardErr.cvv : ''} hint="3 số mặt sau thẻ"><input id="c-cvv" className={'in' + (ct.cvv && cardErr.cvv ? ' in-err' : '')} type="password" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} onBlur={() => setCt(c => ({ ...c, cvv: true }))} /></Field>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#6B5A4C' }}><Ico n="lock" size={14} />Bảo mật 3-D Secure · Không lưu số thẻ và CVV trên thiết bị</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 300px', padding: 22 }}>
          <label htmlFor="promo" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Mã khuyến mãi</label>
          {flow.promo && q.promoCode ? (
            <>
              <div style={{ display: 'flex', gap: 8 }}><input id="promo" readOnly value={flow.promo} className="in" style={{ borderColor: '#2F7D4F', fontWeight: 600, letterSpacing: '.06em' }} /><button className="btn btn-q" onClick={() => patch({ promo: '' })}>Gỡ mã</button></div>
              <div className="hint hint-ok"><Ico n="check" size={15} sw={2.4} />{q.promoNote}{q.discount ? `: giảm ${fmt(q.discount)} ₫` : ''}</div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8 }}><input id="promo" className={'in' + (promoErr ? ' in-err' : '')} placeholder="Nhập mã, ví dụ NESTRO10" value={promoIn} onChange={e => { setPromoIn(e.target.value.toUpperCase()); setPromoErr('') }} onKeyDown={e => { if (e.key === 'Enter') applyPromo() }} style={{ fontWeight: 600, letterSpacing: '.06em' }} /><button className="btn btn-q" onClick={applyPromo} disabled={!promoIn.trim()}>Áp dụng</button></div>
              {promoErr && <div className="hint hint-err"><Ico n="alert" size={15} />{promoErr}</div>}
            </>
          )}
        </div>
        <div className="card" style={{ flex: '1 1 300px', padding: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="check" style={{ fontWeight: 500 }}><input type="checkbox" checked={flow.vatInvoice} onChange={e => patch({ vatInvoice: e.target.checked })} />Xuất hoá đơn VAT cho công ty</label>
          {flow.vatInvoice && (
            <div className="grid g2 grid-sm1" style={{ gap: 10, margin: '4px 0 8px' }}>
              <input className="in" aria-label="Tên công ty" placeholder="Tên công ty" value={flow.company} onChange={e => patch({ company: e.target.value })} />
              <input className="in" aria-label="Mã số thuế" inputMode="numeric" placeholder="Mã số thuế" value={flow.taxCode} onChange={e => patch({ taxCode: e.target.value })} />
            </div>
          )}
          <label className="check" style={{ fontWeight: 500 }}><input type="checkbox" checked={flow.deposit} onChange={e => patch({ deposit: e.target.checked })} />Thanh toán trước 30%, phần còn lại khi nhận phòng</label>
        </div>
      </div>
    </FlowShell>
  )
}
