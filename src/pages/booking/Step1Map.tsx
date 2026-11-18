import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlowShell, useRoomInfo } from '@/components/Summary'
import { FloorMap, MapLegend, type MapFilter } from '@/components/FloorMap'
import { Ico } from '@/components/Icon'
import { useFlow } from '@/store/flow'
import { useDb } from '@/store/db'
import { FLOORS, roomsOfFloor } from '@/data/catalog'
import { roomState } from '@/lib/availability'
import { nightPrice } from '@/lib/pricing'
import { fmt, fmtDM } from '@/lib/utils'
import { useLang } from '@/store/ui'

export default function Step1Map() {
  const { flow, patch, pickRoom, nights } = useFlow()
  const db = useDb()
  const nav = useNavigate()
  const { t } = useLang()
  const room = useRoomInfo()
  const [filter, setFilter] = useState<MapFilter>({ type: 'all', onlyFree: false, price: 'all' })
  const free = useMemo(() => roomsOfFloor(flow.floor).filter(r => roomState(db, r.no, flow.checkIn, flow.checkOut) === 'free').length, [db, flow.floor, flow.checkIn, flow.checkOut])
  const total = roomsOfFloor(flow.floor).length
  const chips: [MapFilter['type'], string][] = [['all', 'Tất cả'], ['Standard', 'Standard'], ['Deluxe', 'Deluxe'], ['Suite', 'Suite']]
  return (
    <FlowShell step={1} title={t('Chọn phòng trên sơ đồ tầng', 'Choose your room on the floor plan')} lead="Chạm vào phòng còn trống để chọn. Màu thể hiện tình trạng theo ngày bạn chọn."
      nextLabel="Tiếp tục: Ngày & giờ" mobileNextLabel="Tiếp tục" disabledLabel="Chọn một phòng để tiếp tục" nextDisabled={!room} onNext={() => nav('/dat-phong/ngay')}
      headRight={<button className="btn btn-q btn-sm" onClick={() => nav('/dat-phong/ngay')}><Ico n="calendar" />{fmtDM(flow.checkIn)} – {fmtDM(flow.checkOut)} · {flow.adults} NL{flow.children ? `, ${flow.children} TE` : ''} · Đổi</button>}>
      <div className="card map-card">
        <div className="map-top">
          <div className="tabs-line" role="tablist" aria-label="Chọn tầng" style={{ borderBottom: 0 }}>
            {FLOORS.map(f => <button key={f} role="tab" aria-selected={flow.floor === f} className={'tab' + (flow.floor === f ? ' tab-on' : '')} onClick={() => patch({ floor: f })}>Tầng {f}</button>)}
          </div>
          <span style={{ fontSize: 13, color: '#2F6B45', fontWeight: 600 }}>{free}/{total} phòng trống</span>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '16px 0 4px', overflowX: 'auto' }}>
          {chips.map(([k, l]) => <button key={k} className={'chip' + (filter.type === k ? ' chip-on' : '')} onClick={() => setFilter(f => ({ ...f, type: k }))}>{l}</button>)}
          <span style={{ width: 1, background: '#E8DFD2', margin: '0 4px' }} />
          <button className={'chip' + (filter.onlyFree ? ' chip-on' : '')} aria-pressed={filter.onlyFree} onClick={() => setFilter(f => ({ ...f, onlyFree: !f.onlyFree }))}>Chỉ phòng trống</button>
          <select className="sel-chip" aria-label="Lọc theo giá" value={filter.price} onChange={e => setFilter(f => ({ ...f, price: e.target.value as MapFilter['price'] }))}>
            <option value="all">Giá: mọi mức</option><option value="lt">Dưới 1,5tr</option><option value="mid">1,5tr – 2,5tr</option><option value="gt">Trên 2,5tr</option>
          </select>
        </div>
        <div className="map-stage">
          <FloorMap floor={flow.floor} checkIn={flow.checkIn} checkOut={flow.checkOut} selected={flow.roomNo} onPick={pickRoom} filter={filter} />
        </div>
        {room && (
          <div className="room-pick" style={{ marginTop: 14, flexWrap: 'wrap' }}>
            <div className="photo" style={{ width: 56, height: 56, borderRadius: 10 }}><Ico n="bed" size={24} sw={1.4} /></div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <strong style={{ fontSize: 16 }}>{room.type} · Phòng {room.no}</strong>
              <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 13, color: 'var(--ink2)', flexWrap: 'wrap' }}><span>{room.area}</span><span>Tối đa {room.info.guests} khách</span><span>{room.info.bed}</span></div>
            </div>
            <span><strong style={{ fontSize: 18 }}>{fmt(nightPrice(db, room.type, flow.checkIn, room.no))} ₫</strong><span className="muted" style={{ fontSize: 13 }}> /đêm</span></span>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '6px 10px', borderRadius: 999, background: '#3B2416', color: '#FAF6EF' }}>Đã chọn</span>
          </div>
        )}
        <MapLegend />
      </div>
      {nights < 1 && <div className="hold">Hãy chọn ngày nhận và trả phòng ở bước kế tiếp.</div>}
    </FlowShell>
  )
}
