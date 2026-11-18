import { useMemo, useState } from 'react'
import { Ico } from './Icon'
import { useDb } from '@/store/db'
import { nightStatus } from '@/lib/availability'
import { nightPrice } from '@/lib/pricing'
import { addDays, dateKey, diffDays, fmtShort, isWeekendNight, monthTitle, todayKey } from '@/lib/utils'
import { findRoom, type RoomType } from '@/data/catalog'
import { useMedia } from '@/lib/useMedia'

function Month({ y, m, ...p }: { y: number; m: number } & Omit<Props, 'onChange'> & { click: (k: string) => void; type: RoomType }) {
  const db = useDb()
  const first = new Date(y, m, 1)
  const offset = (first.getDay() + 6) % 7 // T2 = 0
  const days = new Date(y, m + 1, 0).getDate()
  const cells: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => dateKey(new Date(y, m, i + 1)))]
  return (
    <div>
      <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{monthTitle(y, m)}</div>
      <div className="cal-grid cal-dow">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <span key={d}>{d}</span>)}</div>
      <div className="cal-grid">
        {cells.map((k, i) => {
          if (!k) return <div key={i} />
          const st = p.roomNo ? nightStatus(db, p.roomNo, k, p.ignoreCode) : (k < todayKey() ? 'past' : 'free')
          const wk = isWeekendNight(k)
          const price = nightPrice(db, p.type, k, p.roomNo ?? undefined)
          const start = k === p.checkIn, end = k === p.checkOut
          const inR = !!p.checkIn && !!p.checkOut && k > p.checkIn && k < p.checkOut
          const canEnd = !!p.checkIn && !p.checkOut && k > p.checkIn && st !== 'past' && rangeFree(p.roomNo, p.checkIn, k, db, p.ignoreCode)
          const disabled = st === 'past' || (st === 'sold' && !canEnd)
          let bg = 'transparent', fg = '#2A1D14', pc = wk ? '#8B5A2B' : '#6B5A4C', rad = '8px', label = fmtShort(price).replace(',00', '')
          if (st === 'past') { fg = '#8A7E72'; label = '' }
          if (st === 'sold') { bg = '#ECEAE7'; fg = '#6B645D'; pc = '#6B645D'; label = 'Hết' }
          if (inR) { bg = '#F3E6D3'; rad = '0' }
          if (start || end) { bg = '#3B2416'; fg = '#FAF6EF'; pc = '#E3BE8D'; rad = start && p.checkOut ? '10px 0 0 10px' : end ? '0 10px 10px 0' : '10px'; label = start ? 'Nhận' : 'Trả' }
          return (
            <button key={k} type="button" className={'cal-cell' + (st === 'sold' && !start && !end ? ' hatch' : '')} disabled={disabled}
              style={{ background: bg, color: fg, borderRadius: rad, opacity: st === 'past' ? .55 : 1 }}
              onClick={() => p.click(k)} aria-label={`${Number(k.slice(8))}/${m + 1}, ${st === 'sold' ? 'hết phòng' : st === 'past' ? 'đã qua' : price.toLocaleString('vi-VN') + ' đồng'}${start ? ', ngày nhận phòng' : end ? ', ngày trả phòng' : ''}`}>
              <span className="d" style={{ fontWeight: start || end ? 700 : 500, textDecoration: st === 'sold' && !start && !end ? 'line-through' : 'none' }}>{Number(k.slice(8))}</span>
              <span className="p" style={{ color: pc }}>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
function rangeFree(roomNo: string | null, a: string, b: string, db: ReturnType<typeof useDb>, ignore?: string) {
  if (!roomNo) return true
  for (let d = a; d < b; d = addDays(d, 1)) if (nightStatus(db, roomNo, d, ignore) !== 'free') return false
  return true
}

interface Props { roomNo: string | null; checkIn: string; checkOut: string; ignoreCode?: string }
export function DateRange(p: Props & { onChange: (ci: string, co: string) => void }) {
  const db = useDb()
  const two = useMedia('(min-width:900px)')
  const base = useMemo(() => { const d = new Date(p.checkIn || todayKey() + 'T00:00:00'); return { y: d.getFullYear(), m: d.getMonth() } }, []) // eslint-disable-line
  const [view, setView] = useState(() => { const d = new Date(p.checkIn + 'T00:00:00'); return d.getFullYear() * 12 + d.getMonth() })
  const nowIdx = new Date().getFullYear() * 12 + new Date().getMonth()
  const type: RoomType = p.roomNo ? (db.roomOverrides[p.roomNo]?.type ?? findRoom(p.roomNo)?.type ?? 'Standard') : 'Standard'
  void base
  const click = (k: string) => {
    if (!p.checkIn || p.checkOut || k <= p.checkIn) { p.onChange(k, ''); return }
    if (rangeFree(p.roomNo, p.checkIn, k, db, p.ignoreCode)) p.onChange(p.checkIn, k)
    else p.onChange(k, '')
  }
  const months = [view, ...(two ? [view + 1] : [])]
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 16px', borderRadius: 12, border: p.checkOut ? '1px solid #D9CCBA' : '2px solid #3B2416', minWidth: 160 }}><div className="k" style={{ fontSize: 12 }}>Nhận phòng</div><div style={{ fontWeight: 600, marginTop: 2 }}>{p.checkIn ? lbl(p.checkIn) : 'Chọn ngày'}</div></div>
          <div style={{ padding: '10px 16px', borderRadius: 12, border: p.checkOut ? '2px solid #3B2416' : '1px solid #D9CCBA', minWidth: 160 }}><div className="k" style={{ fontSize: 12 }}>Trả phòng</div><div style={{ fontWeight: 600, marginTop: 2 }}>{p.checkOut ? lbl(p.checkOut) : 'Chọn ngày'}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="cnt" aria-label="Tháng trước" disabled={view <= nowIdx} onClick={() => setView(v => v - 1)}><Ico n="chevLeft" /></button>
          <button type="button" className="cnt" aria-label="Tháng sau" onClick={() => setView(v => v + 1)}><Ico n="chevRight" /></button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: two ? 'repeat(2,minmax(0,1fr))' : '1fr', gap: 40 }}>
        {months.map(v => <Month key={v} y={Math.floor(v / 12)} m={v % 12} {...p} click={click} type={type} />)}
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 12, color: '#4A3A2E', flexWrap: 'wrap' }}>
        <span className="lg" style={{ gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: '#3B2416' }} />Ngày nhận / trả</span>
        <span className="lg" style={{ gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: '#F3E6D3' }} />Khoảng lưu trú</span>
        <span className="lg" style={{ gap: 6 }}><span className="hatch" style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: '#ECEAE7' }} />Hết phòng</span>
        <span className="lg" style={{ gap: 6 }}><b style={{ color: '#8B5A2B' }}>2,1tr</b>Giá cuối tuần</span>
      </div>
    </div>
  )
}
const DL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
const lbl = (k: string) => { const d = new Date(k + 'T00:00:00'); return `${DL[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` }
export { diffDays }
