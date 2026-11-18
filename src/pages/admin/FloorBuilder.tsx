import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHead } from './AdminLayout'
import { Ico, P } from '@/components/Icon'
import { useDb, db as store } from '@/store/db'
import { useToast } from '@/store/ui'
import { FIXTURES, FLAGGED_ROOMS, FLOORS, MAP, TYPES, roomsOfFloor, type RoomType } from '@/data/catalog'
import { fmt, asset } from '@/lib/utils'
import type { RoomOverride } from '@/store/types'

const X0 = 240, Y0 = 40, W = 2280, H = 1100
const LOOK: Record<string, { bg: string; bd: string }> = {
  Standard: { bg: 'rgba(44,95,153,.18)', bd: '#2C5F99' }, Deluxe: { bg: 'rgba(183,121,31,.22)', bd: '#8B5A2B' },
  Family: { bg: 'rgba(47,125,79,.2)', bd: '#2F7D4F' }, Suite: { bg: 'rgba(107,78,155,.2)', bd: '#6B4E9B' }
}
const FL: Record<string, { bg: string; bd: string }> = {
  corr: { bg: 'rgba(240,231,218,.75)', bd: '0' }, void: { bg: 'rgba(255,255,255,.35)', bd: '1px dashed #9C8C7C' },
  lift: { bg: 'rgba(168,151,127,.45)', bd: '1px solid #8A7A6C' }, stair: { bg: 'rgba(200,149,92,.25)', bd: '1px solid #B08A60' }, store: { bg: 'rgba(232,223,210,.85)', bd: '1px solid #C9BBA7' }
}
const pos = (x1: number, y1: number, x2: number, y2: number) => ({ left: (x1 - X0) / W * 100 + '%', top: (y1 - Y0) / H * 100 + '%', width: (x2 - x1) / W * 100 + '%', height: (y2 - y1) / H * 100 + '%' })
const TOOLS: [string, keyof typeof P][] = [['Chọn', 'cursor'], ['Vẽ phòng', 'rect'], ['Đa giác', 'poly'], ['Hành lang', 'list'], ['Thang máy', 'upload'], ['Thang bộ', 'list'], ['Giếng trời / Kho', 'rect']]
const FLOW = [['Tải bản vẽ', 'mat-bang-tang-6.png'], ['Căn tỉ lệ', '1 ô lưới = 0,5 m'], ['Nhận diện phòng', '42 phòng · 1 cần xem'], ['Gán loại & giá', 'Đang làm'], ['Xuất bản', 'Hiện cho khách']]

export default function FloorBuilder() {
  const d = useDb()
  const toast = useToast()
  const [floor, setFloor] = useState(6)
  const [draft, setDraft] = useState<Record<string, RoomOverride>>(() => structuredClone(d.roomOverrides))
  const [hist, setHist] = useState<Record<string, RoomOverride>[]>([])
  const [sel, setSel] = useState<string[]>(['630'])
  const [bg, setBg] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [tool, setTool] = useState('Chọn')
  const rooms = useMemo(() => roomsOfFloor(floor), [floor])
  const eff = (no: string) => ({ ...rooms.find(r => r.no === no)!, ...draft[no], type: (draft[no]?.type ?? rooms.find(r => r.no === no)!.type) as RoomType })
  const dirty = JSON.stringify(draft) !== JSON.stringify(d.roomOverrides)
  const cnt: Record<string, number> = {}
  rooms.forEach(r => { const t = draft[r.no]?.type ?? r.type; cnt[t] = (cnt[t] ?? 0) + 1 })
  const edit = (nos: string[], patch: Partial<RoomOverride>) => { setHist(h => [...h, structuredClone(draft)]); setDraft(dr => { const n = { ...dr }; nos.forEach(no => { n[no] = { ...n[no], ...patch } }); return n }) }
  const primary = sel[0]
  const r = primary && rooms.some(x => x.no === primary) ? eff(primary) : null
  const flagged = (no: string) => FLAGGED_ROOMS.includes(no)
  const pick = (no: string, e: React.MouseEvent) => setSel(s => (e.shiftKey ? (s.includes(no) ? s.filter(x => x !== no) : [...s, no]) : [no]))
  return (
    <>
      <AdminHead title="Sơ đồ tầng"
        left={<div className="ft-wrap" role="tablist" aria-label="Chọn tầng">{FLOORS.map(f => <button key={f} role="tab" aria-selected={floor === f} className={'ft' + (floor === f ? ' ft-on' : '')} onClick={() => { setFloor(f); setSel([]) }}>Tầng {f}</button>)}</div>}>
        <button className="btn btn-q" onClick={() => toast('Thêm tầng mới cần máy chủ để lưu bản vẽ')}>+ Thêm tầng</button>
        <span className="muted" style={{ fontSize: 13 }}>{dirty ? 'Có thay đổi chưa xuất bản' : 'Đã xuất bản'}</span>
        <button className="btn btn-q" aria-label="Hoàn tác" disabled={!hist.length} onClick={() => { setDraft(hist[hist.length - 1]); setHist(h => h.slice(0, -1)) }}><Ico n="undo" /></button>
        <Link to="/dat-phong" className="btn btn-q">Xem như khách</Link>
        <button className="btn btn-p" disabled={!dirty} onClick={() => { store.set(x => { x.roomOverrides = structuredClone(draft) }); setHist([]); toast('Đã xuất bản sơ đồ cho khách') }}>Xuất bản sơ đồ</button>
      </AdminHead>
      <main className="adm-main">
        <div className="cols c-main-side">
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <div className="card fb-flow">
              {FLOW.map(([l, s], i) => { const n = i + 1, done = n < 4, now = n === 4; return (
                <div className="st" key={l}><span className="n" style={{ background: done ? '#2F7D4F' : now ? '#3B2416' : '#fff', color: done || now ? '#FAF6EF' : '#6B5A4C', border: done || now ? 0 : '1.5px solid #D9CCBA' }}>{done ? <Ico n="check" size={14} sw={2.5} /> : n}</span><div><div style={{ fontSize: 13, fontWeight: now ? 700 : 500 }}>{l}</div><div className="muted" style={{ fontSize: 12 }}>{s}</div></div></div>) })}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: '#E4ECF5', color: '#1F3F66', fontSize: 14, flexWrap: 'wrap' }}>
              <Ico n="checkCircle" /><span style={{ flex: 1, minWidth: 220 }}>Đã nhận diện <strong>{rooms.length} số phòng</strong> trên bản vẽ và tự dựng khung theo tường. <strong>1 phòng cần kiểm tra</strong> ({FLAGGED_ROOMS[FLOORS.indexOf(floor)]}, hình chữ L).</span>
              <button className="btn btn-q" onClick={() => toast('Nhận diện bản vẽ bằng AI sẽ chạy trên máy chủ')}>Nhận diện lại</button>
            </div>
            <div className="card">
              <div style={{ display: 'flex', gap: 8, padding: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                {TOOLS.map(([l, i]) => <button key={l} className="tool" aria-pressed={tool === l} onClick={() => { setTool(l); if (l !== 'Chọn') toast('Công cụ vẽ sẽ hoạt động khi có máy chủ lưu sơ đồ. Hiện bạn có thể gán loại, giá, trạng thái.') }}><Ico n={i} size={16} />{l}</button>)}
                <span style={{ width: 1, height: 24, background: '#E8DFD2' }} />
                <button className="tool" aria-pressed={bg} onClick={() => setBg(!bg)}>Bản vẽ nền {bg ? '40%' : 'tắt'}</button>
                <span style={{ width: 1, height: 24, background: '#E8DFD2' }} />
                <button className="btn btn-q" aria-label="Thu nhỏ" style={{ minHeight: 36 }} onClick={() => setZoom(z => Math.max(.6, +(z - .2).toFixed(1)))}>−</button><strong style={{ minWidth: 44, textAlign: 'center' }}>{Math.round(zoom * 100)}%</strong><button className="btn btn-q" aria-label="Phóng to" style={{ minHeight: 36 }} onClick={() => setZoom(z => Math.min(2.4, +(z + .2).toFixed(1)))}>+</button>
              </div>
              <div className="fb-canvas" style={{ maxHeight: 620 }}>
                <div style={{ position: 'relative', width: `${zoom * 100}%`, aspectRatio: `${W} / ${H}` }}>
                  <img src={asset('images/floorplan.webp')} alt="Bản vẽ mặt bằng làm nền" draggable={false} style={{ position: 'absolute', left: -X0 / W * 100 + '%', top: -Y0 / H * 100 + '%', width: 2575 / W * 100 + '%', height: 1215 / H * 100 + '%', opacity: bg ? .4 : 0, maxWidth: 'none', pointerEvents: 'none' }} />
                  {FIXTURES.map(([k, label, x1, y1, x2, y2], i) => <div key={i} className="fx" style={{ ...pos(x1, y1, x2, y2), background: FL[k].bg, border: FL[k].bd }}>{label && <span className="tg2">{label}</span>}</div>)}
                  {rooms.map(rm => { const e = eff(rm.no); const isSel = sel.includes(rm.no); const L = LOOK[e.type]; const locked = draft[rm.no]?.locked; return (
                    <button key={rm.no} className="fb-rm" style={{ ...pos(rm.x1, rm.y1, rm.x2, rm.y2), background: locked ? 'rgba(90,90,90,.28)' : L.bg, borderColor: isSel ? '#C8955C' : flagged(rm.no) ? '#B3261E' : L.bd, borderWidth: isSel ? 2.5 : 1.5, borderStyle: flagged(rm.no) && !isSel ? 'dashed' : 'solid', zIndex: isSel ? 3 : 1 }}
                      onClick={e2 => pick(rm.no, e2)} aria-label={`Phòng ${rm.no}, ${e.type}${locked ? ', tạm khoá' : ''}`} aria-pressed={isSel}>
                      {isSel && <>{['-4px,-4px', 'calc(100% - 4px),-4px', '-4px,calc(100% - 4px)', 'calc(100% - 4px),calc(100% - 4px)'].map(p => { const [l, t] = p.split(','); return <span key={p} className="h" style={{ left: l, top: t }} /> })}</>}
                      {rm.no}
                    </button>) })}
                </div>
              </div>
              <div className="legend" style={{ padding: '12px 16px', fontSize: 12 }}>
                {(['Standard', 'Deluxe', 'Suite'] as RoomType[]).map(t => <span key={t} className="lg"><span className="sw" style={{ background: LOOK[t].bg, border: `1.5px solid ${LOOK[t].bd}` }} />{t} · {cnt[t] ?? 0}</span>)}
                <span className="lg"><span className="sw" style={{ border: '2px dashed #B3261E' }} />Cần kiểm tra</span>
                <span className="lg"><span className="sw" style={{ background: 'rgba(90,90,90,.28)' }} />Tạm khoá / bảo trì</span>
                <span className="muted">Shift + bấm để chọn nhiều phòng và gán loại cùng lúc</span>
              </div>
            </div>
          </section>
          <section className="card pad" style={{ alignSelf: 'start', position: 'sticky', top: 92 }}>
            {sel.length > 1 ? (
              <>
                <div className="sec-h"><h2>{sel.length} phòng đã chọn</h2><span className="muted">Tầng {floor}</span></div>
                <label className="lbl" htmlFor="mt">Gán loại phòng cho tất cả</label>
                <select id="mt" className="in" defaultValue="" onChange={e => { edit(sel, { type: e.target.value as RoomType }); e.target.value = '' }}><option value="" disabled>Chọn loại…</option>{(['Standard', 'Deluxe', 'Suite'] as RoomType[]).map(t => <option key={t}>{t}</option>)}</select>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}><button className="btn btn-q" onClick={() => edit(sel, { locked: true })}>Tạm khoá</button><button className="btn btn-q" onClick={() => edit(sel, { locked: false })}>Mở bán</button></div>
              </>
            ) : r ? (
              <>
                <div className="sec-h"><h2>Phòng {r.no}</h2><span className="muted">Tầng {floor}</span></div>
                {flagged(r.no) && <div style={{ padding: 12, borderRadius: 10, background: '#FBE9E7', color: '#8C1D18', fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>Phòng hình chữ L, đang tạm vẽ khung chữ nhật. Dùng công cụ <strong>Đa giác</strong> để vẽ đúng hình.</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="grid g2" style={{ gap: 12 }}>
                    <div><label className="lbl" htmlFor="i1">Số phòng</label><input id="i1" className="in" value={r.no} readOnly /></div>
                    <div><label className="lbl" htmlFor="i2">Diện tích</label><input id="i2" className="in" value={draft[r.no]?.area ?? TYPES[r.type].size} onChange={e => edit([r.no], { area: e.target.value })} /></div>
                  </div>
                  <div><label className="lbl" htmlFor="i3">Loại phòng</label>
                    <select id="i3" className="in" value={r.type} onChange={e => edit([r.no], { type: e.target.value as RoomType })}>{(['Standard', 'Deluxe', 'Family', 'Suite'] as RoomType[]).map(t => <option key={t}>{t}</option>)}</select>
                    <div className="hint">Ảnh, tiện nghi lấy theo loại phòng · <Link to="/admin/phong-gia">Sửa loại phòng</Link></div></div>
                  <div><label className="lbl" htmlFor="i4">Giá riêng cho phòng này</label>
                    <input id="i4" className="in" inputMode="numeric" placeholder="Để trống = theo loại phòng" value={draft[r.no]?.price ? fmt(draft[r.no]!.price!) : ''} onChange={e => { const n = Number(e.target.value.replace(/\D/g, '')); edit([r.no], { price: n || undefined }) }} />
                    <div className="hint">Giá gốc loại phòng: {fmt(d.typeConfig[r.type].price)} ₫</div></div>
                  <div><span className="lbl">Hình dạng</span><div className="seg-wrap" role="radiogroup" aria-label="Hình dạng">{([['rect', 'Chữ nhật'], ['poly', 'Đa giác']] as const).map(([k, l]) => <button key={k} className={'seg' + ((draft[r.no]?.shape ?? 'rect') === k ? ' seg-on' : '')} role="radio" aria-checked={(draft[r.no]?.shape ?? 'rect') === k} onClick={() => edit([r.no], { shape: k })}>{l}</button>)}</div></div>
                  <div><span className="lbl">Trạng thái bán</span><div className="seg-wrap" role="radiogroup" aria-label="Trạng thái bán">{([[false, 'Đang bán'], [true, 'Tạm khoá']] as const).map(([k, l]) => <button key={l} className={'seg' + (!!draft[r.no]?.locked === k ? ' seg-on' : '')} role="radio" aria-checked={!!draft[r.no]?.locked === k} onClick={() => edit([r.no], { locked: k })}>{l}</button>)}</div></div>
                  <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-q" onClick={() => toast('Nhân bản phòng cần máy chủ')}>Nhân bản phòng</button><button className="btn btn-t" style={{ color: '#B3261E' }} onClick={() => toast('Xoá phòng khỏi sơ đồ cần máy chủ')}>Xoá khỏi sơ đồ</button></div>
                </div>
              </>
            ) : <p className="muted" style={{ fontSize: 14 }}>Chọn một phòng trên sơ đồ để chỉnh sửa. Giữ Shift để chọn nhiều phòng.</p>}
          </section>
        </div>
      </main>
    </>
  )
}
void MAP
