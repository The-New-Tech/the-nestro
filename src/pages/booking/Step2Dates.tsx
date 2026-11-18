import { useNavigate, Link } from 'react-router-dom'
import { FlowShell, useRoomInfo } from '@/components/Summary'
import { DateRange } from '@/components/DateRange'
import { Ico } from '@/components/Icon'
import { useFlow } from '@/store/flow'
import { useDb } from '@/store/db'
import { CHECKIN_SLOTS, CHECKOUT_SLOTS } from '@/data/catalog'
import { roomState } from '@/lib/availability'
import { fmt } from '@/lib/utils'

export default function Step2Dates() {
  const { flow, patch, nights } = useFlow()
  const db = useDb()
  const nav = useNavigate()
  const room = useRoomInfo()
  const state = room && nights > 0 ? roomState(db, room.no, flow.checkIn, flow.checkOut) : null
  const avail = state === 'free' || state === 'held'
  const max = room?.info.guests ?? 2
  const guests = flow.adults + flow.children
  const setChildren = (n: number) => patch({ children: n, childAges: Array.from({ length: n }, (_, i) => flow.childAges[i] ?? 6) })
  const ok = !!room && nights > 0 && avail && guests <= max
  return (
    <FlowShell step={2} title="Chọn ngày, giờ và số khách" lead="Giá mỗi đêm hiển thị dưới từng ngày. Ngày hết phòng không thể chọn." detail
      nextLabel="Tiếp tục: Thông tin khách" disabledLabel={!room ? 'Chọn phòng trước' : nights < 1 ? 'Chọn ngày trả phòng' : !avail ? 'Phòng không còn trống' : 'Vượt số khách tối đa'}
      nextDisabled={!ok} onNext={() => nav('/dat-phong/thong-tin')} backTo="/dat-phong"
      headRight={room ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, fontSize: 14, fontWeight: 500, background: !avail && nights > 0 ? '#FBE9E7' : '#E6F2EA', color: !avail && nights > 0 ? '#8C1D18' : '#1E5235' }}>
          <Ico n={!avail && nights > 0 ? 'alert' : 'checkCircle'} />
          {nights < 1 ? `Phòng ${room.no} · chọn ngày trả phòng` : avail ? `Phòng ${room.no} còn trống cả ${nights} đêm` : `Phòng ${room.no} không còn trống trong các ngày này`} · <Link to="/dat-phong" style={{ color: 'inherit' }}>Đổi phòng</Link>
        </div>
      ) : <div className="hold" style={{ margin: 0 }}><Ico n="alert" />Chưa chọn phòng · <Link to="/dat-phong">Chọn phòng trên sơ đồ</Link></div>}>
      <div className="card" style={{ padding: 24 }}>
        <DateRange roomNo={flow.roomNo} checkIn={flow.checkIn} checkOut={flow.checkOut} onChange={(ci, co) => patch({ checkIn: ci, checkOut: co })} />
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1.5 1 320px', padding: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Giờ nhận phòng</h2>
          <div className="grid g4 grid-sm2" style={{ gap: 8, margin: '10px 0 18px' }}>
            {CHECKIN_SLOTS.map(s => (
              <button key={s.t} className={'slot' + (flow.checkInTime === s.t ? ' slot-on' : '')} aria-pressed={flow.checkInTime === s.t} onClick={() => patch({ checkInTime: s.t })}>
                {s.t}{s.fee ? <small>+{fmt(s.fee)}</small> : s.std ? <small>Tiêu chuẩn</small> : null}
              </button>
            ))}
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Giờ trả phòng</h2>
          <div className="grid g4 grid-sm2" style={{ gap: 8, marginTop: 10 }}>
            {CHECKOUT_SLOTS.map(s => (
              <button key={s.t} className={'slot' + (flow.checkOutTime === s.t ? ' slot-on' : '')} aria-pressed={flow.checkOutTime === s.t} onClick={() => patch({ checkOutTime: s.t })}>
                {s.t}{s.fee ? <small>+{fmt(s.fee)}</small> : s.std ? <small>Tiêu chuẩn</small> : null}
              </button>
            ))}
          </div>
        </div>
        <div className="card" style={{ flex: '1 1 280px', padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Số khách</h2>
          <Counter label="Người lớn" sub="Từ 12 tuổi" v={flow.adults} min={1} max={Math.max(1, max - flow.children)} onChange={v => patch({ adults: v })} />
          <Counter label="Trẻ em" sub="Dưới 12 tuổi" v={flow.children} min={0} max={Math.min(4, max - flow.adults)} onChange={setChildren} />
          {flow.childAges.slice(0, flow.children).map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderRadius: 10, background: '#F7F1E7', fontSize: 13, gap: 8 }}>
              <label htmlFor={`age${i}`}>Tuổi bé {i + 1}</label>
              <select id={`age${i}`} className="in" style={{ width: 120, height: 40 }} value={a} onChange={e => patch({ childAges: flow.childAges.map((x, j) => (j === i ? Number(e.target.value) : x)) })}>
                {Array.from({ length: 12 }, (_, n) => <option key={n} value={n}>{n} tuổi</option>)}
              </select>
            </div>
          ))}
          <div className="muted" style={{ fontSize: 12 }}>{room ? `Phòng ${room.no} tối đa ${max} khách` : 'Chọn phòng để biết số khách tối đa'} · Bé dưới 6 tuổi ở miễn phí</div>
        </div>
      </div>
    </FlowShell>
  )
}
function Counter({ label, sub, v, min, max, onChange }: { label: string; sub: string; v: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div><div style={{ fontWeight: 500 }}>{label}</div><div className="muted" style={{ fontSize: 12 }}>{sub}</div></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button className="cnt" aria-label={`Giảm ${label.toLowerCase()}`} disabled={v <= min} onClick={() => onChange(v - 1)}>−</button>
        <strong style={{ width: 16, textAlign: 'center' }} aria-live="polite">{v}</strong>
        <button className="cnt" aria-label={`Tăng ${label.toLowerCase()}`} disabled={v >= max} onClick={() => onChange(v + 1)}>+</button>
      </div>
    </div>
  )
}
