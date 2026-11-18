import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Ico } from './Icon'
import { Sheet } from './ui'
import { useFlow } from '@/store/flow'
import { useDb } from '@/store/db'
import { findRoom, TYPES } from '@/data/catalog'
import { fmt, fmtDM, fmtDMY, freeCancelText } from '@/lib/utils'
import { mmss } from '@/store/ui'
import { Stepper } from './Stepper'

export function useRoomInfo() {
  const { flow } = useFlow()
  const db = useDb()
  if (!flow.roomNo) return null
  const r = findRoom(flow.roomNo)
  if (!r) return null
  const type = db.roomOverrides[r.no]?.type ?? r.type
  const info = TYPES[type]
  return { no: r.no, floor: r.floor, type, info, area: db.roomOverrides[r.no]?.area ?? info.size }
}

function SummaryBody({ detail, step, dark }: { detail?: boolean; step: number; dark?: boolean }) {
  const { flow, quote: q, nights, holdLeft } = useFlow()
  const room = useRoomInfo()
  if (!room || !q) return <p className="muted" style={{ fontSize: 14, padding: '12px 0' }}>Chưa chọn phòng. Chọn một phòng trống trên sơ đồ để xem giá.</p>
  const guests = `${flow.adults} người lớn${flow.children ? ` · ${flow.children} trẻ em` : ''}`
  return (
    <>
      <div style={{ display: 'flex', gap: 14, margin: '18px 0', alignItems: 'center' }}>
        <div className="photo" style={{ width: 72, height: 72, borderRadius: 10, flex: 'none' }}><Ico n="bed" size={26} sw={1.4} /></div>
        <div><div style={{ fontWeight: 600 }}>{room.type} · Phòng {room.no}</div><div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Tầng {room.floor} · {room.info.view} · {room.area}</div></div>
      </div>
      <div className="sum-rows">
        <div><span>Ngày</span><span>{fmtDM(flow.checkIn)} – {fmtDMY(flow.checkOut)} · {nights} đêm</span></div>
        {step < 4 && <div><span>Giờ</span><span>Nhận {flow.checkInTime} · Trả {flow.checkOutTime}</span></div>}
        <div><span>Khách</span><span>{step === 4 && flow.name ? `${flow.name} · ${flow.adults + flow.children} khách` : guests}</span></div>
      </div>
      <div style={{ padding: '12px 0' }}>
        {detail ? q.nights.map(n => <div className="sl" key={n.date}><span>{n.label}</span><span>{fmt(n.price)} ₫</span></div>)
          : <div className="sl"><span>Tiền phòng · {nights} đêm</span><span>{fmt(q.roomTotal)} ₫</span></div>}
        {q.early > 0 && <div className="sl"><span>Nhận phòng sớm 12:00</span><span>{fmt(q.early)} ₫</span></div>}
        {q.late > 0 && <div className="sl"><span>Trả phòng muộn 14:00</span><span>{fmt(q.late)} ₫</span></div>}
        {q.addons > 0 && <div className="sl"><span>Dịch vụ thêm</span><span>{fmt(q.addons)} ₫</span></div>}
        <div className="sl"><span>Phí dịch vụ 5%</span><span>{fmt(q.fee)} ₫</span></div>
        <div className="sl"><span>VAT 8%</span><span>{fmt(q.vat)} ₫</span></div>
        {q.discount > 0 && <div className="sl" style={{ color: '#2F6B45', fontWeight: 500 }}><span>Mã {q.promoCode}</span><span>−{fmt(q.discount)} ₫</span></div>}
      </div>
      <div className="total-row"><strong>{step === 4 ? 'Cần thanh toán' : 'Tổng cộng'}</strong><strong>{fmt(flow.deposit && step === 4 ? Math.round(q.total * .3) : q.total)} ₫</strong></div>
      {step < 4 && holdLeft > 0 && <div className="hold"><Ico n="clock" /><span>Phòng được giữ cho bạn trong <strong>{mmss(holdLeft)}</strong></span></div>}
    </>
  )
}

interface ShellProps {
  step: number; eyebrow?: string; title: string; lead?: string; headRight?: ReactNode; children: ReactNode
  nextLabel: string; onNext?: () => void; nextDisabled?: boolean; nextBusy?: boolean; backTo?: string; detail?: boolean
  footNote?: string; disabledLabel?: string; mobileNextLabel?: string
}
/** Khung chung cho bước 1–4: thanh tiến trình, nội dung bên trái, tóm tắt đặt phòng bên phải (desktop) / thanh đáy + bottom sheet (mobile) */
export function FlowShell(p: ShellProps) {
  const { quote: q, flow } = useFlow()
  const [sheet, setSheet] = useState(false)
  const total = q ? (flow.deposit && p.step === 4 ? Math.round(q.total * .3) : q.total) : 0
  const label = p.nextDisabled && p.disabledLabel ? p.disabledLabel : p.nextLabel
  return (
    <>
      <Stepper cur={p.step} />
      <div className="flow">
        <section className="flow-main">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="eyebrow">Bước {p.step}/5</div>
              <h1 className="flow-h1">{p.title}</h1>
              {p.lead && <p className="muted" style={{ fontSize: 15 }}>{p.lead}</p>}
            </div>
            {p.headRight}
          </div>
          {p.children}
        </section>
        <aside className="flow-side">
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ fontSize: 18, fontWeight: 600 }}>Đặt phòng của bạn</h2></div>
            <SummaryBody detail={p.detail} step={p.step} />
            <button className={'btn btn-p btn-block' + (p.nextDisabled ? ' is-off' : '')} style={{ minHeight: 52 }} onClick={p.onNext} disabled={p.nextDisabled || p.nextBusy}>
              {p.nextBusy ? <span className="spin" /> : p.step === 4 && !p.nextDisabled && <Ico n="lock" />}
              {label}{!p.nextDisabled && p.step < 4 && <Ico n="arrowRight" />}
            </button>
            {p.backTo && <Link to={p.backTo} className="btn btn-t btn-block" style={{ marginTop: 6 }}>Quay lại</Link>}
            <p className="muted" style={{ marginTop: 10, fontSize: 12, textAlign: 'center' }}>{p.footNote ?? `${freeCancelText(flow.checkIn)} · Chưa trừ tiền ở bước này`}</p>
          </div>
        </aside>
      </div>
      <div className="m-bar no-print">
        <button style={{ border: 0, background: 'transparent', textAlign: 'left', minHeight: 44, padding: 0 }} onClick={() => setSheet(true)} aria-label="Xem chi tiết giá">
          <div className="muted" style={{ fontSize: 12 }}>{p.step === 4 ? 'Cần thanh toán' : 'Tổng'} · Chi tiết ▴</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--espresso)' }}>{q ? fmt(total) + ' ₫' : '—'}</div>
        </button>
        <button className={'btn btn-p' + (p.nextDisabled ? ' is-off' : '')} style={{ minHeight: 52, flex: '0 1 200px' }} onClick={p.onNext} disabled={p.nextDisabled || p.nextBusy}>
          {p.nextBusy ? <span className="spin" /> : (p.mobileNextLabel ?? (p.step === 4 ? 'Thanh toán' : 'Tiếp tục'))}
        </button>
      </div>
      <Sheet open={sheet} onClose={() => setSheet(false)} title="Chi tiết đặt phòng">
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Đặt phòng của bạn</h2>
        <SummaryBody detail step={p.step} />
        <button className="btn btn-q btn-block" onClick={() => setSheet(false)}>Đóng</button>
      </Sheet>
    </>
  )
}
