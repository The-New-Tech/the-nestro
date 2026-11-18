import { useMemo } from 'react'
import { FIXTURES, MAP, roomsOfFloor, TYPES, type RoomType } from '@/data/catalog'
import { useDb } from '@/store/db'
import { roomState, type RoomState } from '@/lib/availability'
import { nightPrice } from '@/lib/pricing'
import { useMedia } from '@/lib/useMedia'

export const ROOM_LOOK: Record<RoomState | 'sel', { bg: string; bd: string; fg: string; label: string; hatch?: boolean }> = {
  free: { bg: '#E6F2EA', bd: '1.5px solid #2F7D4F', fg: '#1E5235', label: 'Trống' },
  booked: { bg: '#ECEAE7', bd: '1.5px solid #B9B2A9', fg: '#5E5852', label: 'Đã đặt', hatch: true },
  locked: { bg: '#ECEAE7', bd: '1.5px solid #B9B2A9', fg: '#5E5852', label: 'Tạm khoá', hatch: true },
  held: { bg: '#FBEFD5', bd: '1.5px solid #B7791F', fg: '#6E470D', label: 'Đang giữ' },
  sel: { bg: '#3B2416', bd: '3px solid #C8955C', fg: '#FAF6EF', label: 'Đã chọn' }
}
export interface MapFilter { type: RoomType | 'all'; onlyFree: boolean; price: 'all' | 'lt' | 'mid' | 'gt' }

export function usePlacement() {
  const mobile = useMedia('(max-width:760px)')
  const { X0, Y0, W, H } = MAP
  return {
    mobile, aspect: mobile ? `${H} / ${W}` : `${W} / ${H}`,
    pos: (x1: number, y1: number, x2: number, y2: number) => mobile
      ? { l: (y1 - Y0) / H * 100, t: (x1 - X0) / W * 100, w: (y2 - y1) / H * 100, h: (x2 - x1) / W * 100 }
      : { l: (x1 - X0) / W * 100, t: (y1 - Y0) / H * 100, w: (x2 - x1) / W * 100, h: (y2 - y1) / H * 100 }
  }
}

export function Fixtures({ pos, mobile }: { pos: ReturnType<typeof usePlacement>['pos']; mobile: boolean }) {
  return (
    <>
      {FIXTURES.map(([k, label, x1, y1, x2, y2], i) => {
        const p = pos(x1, y1, x2, y2)
        const vt = label.length > 3 && (mobile ? (x2 - x1) > (y2 - y1) * 1.2 && false : (y2 - y1) > (x2 - x1) * 1.2)
        return (
          <div key={i} className={'fx fx-' + k} style={{ left: p.l + '%', top: p.t + '%', width: p.w + '%', height: p.h + '%' }}>
            {label && <span className={'tg2' + (vt ? ' vt' : '')}>{label}</span>}
          </div>
        )
      })}
    </>
  )
}

export function FloorMap({ floor, checkIn, checkOut, selected, onPick, filter }: { floor: number; checkIn: string; checkOut: string; selected: string | null; onPick: (no: string) => void; filter: MapFilter }) {
  const db = useDb()
  const { pos, aspect, mobile } = usePlacement()
  const rooms = useMemo(() => roomsOfFloor(floor).map(r => {
    const type = db.roomOverrides[r.no]?.type ?? r.type
    const st = roomState(db, r.no, checkIn, checkOut)
    const price = nightPrice(db, type, checkIn, r.no)
    return { ...r, type, st, price }
  }), [db, floor, checkIn, checkOut])
  const match = (r: (typeof rooms)[number]) =>
    (filter.type === 'all' || r.type === filter.type) && (!filter.onlyFree || r.st === 'free') &&
    (filter.price === 'all' || (filter.price === 'lt' ? r.price < 1_500_000 : filter.price === 'mid' ? r.price >= 1_500_000 && r.price < 2_500_000 : r.price >= 2_500_000))
  return (
    <div className="map-box" style={{ aspectRatio: aspect }}>
      <Fixtures pos={pos} mobile={mobile} />
      {rooms.map(r => {
        const isSel = r.no === selected
        const L = ROOM_LOOK[isSel ? 'sel' : r.st]
        const p = pos(r.x1, r.y1, r.x2, r.y2)
        const dim = !match(r)
        const pad = mobile ? 1 : 1.5
        return (
          <button key={r.no} className={'rm' + (L.hatch && !isSel ? ' hatch' : '')}
            style={{ left: `calc(${p.l}% + ${pad}px)`, top: `calc(${p.t}% + ${pad}px)`, width: `calc(${p.w}% - ${pad * 2}px)`, height: `calc(${p.h}% - ${pad * 2}px)`, backgroundColor: L.bg, border: L.bd, color: L.fg, opacity: dim ? .3 : 1 }}
            onClick={() => { if (r.st === 'free' && !dim) onPick(r.no) }}
            aria-label={`Phòng ${r.no}, ${r.type}, ${L.label}`} aria-pressed={isSel} aria-disabled={r.st !== 'free' || dim}>
            {r.no}
          </button>
        )
      })}
    </div>
  )
}

export function MapLegend() {
  return (
    <div className="legend" style={{ paddingTop: 16 }}>
      <span className="lg"><span className="sw" style={{ background: '#E6F2EA', border: '1.5px solid #2F7D4F' }} />Trống</span>
      <span className="lg"><span className="sw hatch" style={{ backgroundColor: '#ECEAE7', border: '1.5px solid #B9B2A9' }} />Đã đặt</span>
      <span className="lg"><span className="sw" style={{ background: '#FBEFD5', border: '1.5px solid #B7791F' }} />Đang được giữ</span>
      <span className="lg"><span className="sw" style={{ background: '#3B2416', border: '3px solid #C8955C' }} />Bạn đang chọn</span>
      <span style={{ width: 1, height: 18, background: '#E8DFD2' }} />
      <span className="lg"><span className="sw fx-lift" />TM · Thang máy</span>
      <span className="lg"><span className="sw fx-stair" />TB · Thang bộ</span>
      <span className="lg"><span className="sw fx-void" />Giếng trời</span>
      <span className="lg"><span className="sw fx-corr" />Hành lang</span>
    </div>
  )
}
export { TYPES }
