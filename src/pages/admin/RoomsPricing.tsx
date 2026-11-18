import { useMemo, useState } from 'react'
import { AdminHead } from './AdminLayout'
import { Ico } from '@/components/Icon'
import { Pill } from '@/components/ui'
import { useDb, db as store } from '@/store/db'
import { useToast } from '@/store/ui'
import { TYPE_LIST, TYPES, IN_ROOM, type RoomType } from '@/data/catalog'
import { fmt, fmtShort, dateKey, isWeekendNight, monthTitle, todayKey } from '@/lib/utils'
import type { Db } from '@/store/types'

const num = (s: string) => Number(s.replace(/\D/g, '')) || 0
export default function RoomsPricing() {
  const d = useDb()
  const toast = useToast()
  const [type, setType] = useState<RoomType>('Deluxe')
  const [tab, setTab] = useState('Ảnh & giá')
  const [draft, setDraft] = useState<Pick<Db, 'typeConfig' | 'dayPrices'>>(() => structuredClone({ typeConfig: d.typeConfig, dayPrices: d.dayPrices }))
  const base = new Date()
  const [mv, setMv] = useState(base.getFullYear() * 12 + base.getMonth())
  const [days, setDays] = useState<string[]>([])
  const [dayPrice, setDayPrice] = useState('')
  const cfg = draft.typeConfig[type]
  const changed = useMemo(() => {
    let n = 0
    ;(Object.keys(draft.typeConfig) as RoomType[]).forEach(t => { (Object.keys(draft.typeConfig[t]) as (keyof typeof cfg)[]).forEach(k => { if (draft.typeConfig[t][k] !== d.typeConfig[t][k]) n++ }); const a = draft.dayPrices[t], b = d.dayPrices[t]; if (JSON.stringify(a) !== JSON.stringify(b)) n += Math.max(1, Object.keys(a).filter(k => a[k] !== b[k]).length) })
    return n
  }, [draft, d])
  const setCfg = (p: Partial<typeof cfg>) => setDraft(x => ({ ...x, typeConfig: { ...x.typeConfig, [type]: { ...x.typeConfig[type], ...p } } }))
  const y = Math.floor(mv / 12), m = mv % 12
  const offset = (new Date(y, m, 1).getDay() + 6) % 7
  const dim = new Date(y, m + 1, 0).getDate()
  const dp = draft.dayPrices[type]
  const applyDays = (v: number | 'closed' | null) => setDraft(x => { const n = { ...x.dayPrices[type] }; days.forEach(k => { if (v === null) delete n[k]; else n[k] = v }); return { ...x, dayPrices: { ...x.dayPrices, [type]: n } } })
  const toggleDay = (k: string, shift: boolean) => setDays(s => (shift && s.length ? (() => { const a = [...s, k].sort(); const [f, l] = [a[0], a[a.length - 1]]; const out: string[] = []; for (let c = new Date(f + 'T00:00:00'); dateKey(c) <= l; c.setDate(c.getDate() + 1)) out.push(dateKey(c)); return out })() : s.includes(k) ? s.filter(x => x !== k) : [...s, k]))
  const save = () => { store.set(x => { x.typeConfig = structuredClone(draft.typeConfig); x.dayPrices = structuredClone(draft.dayPrices) }); toast('Đã lưu và cập nhật website') }
  const photos = ['Ảnh 1', 'Ảnh 2', 'Ảnh 3', 'Ảnh 4']
  return (
    <>
      <AdminHead title="Phòng, ảnh & giá">
        {changed > 0 && <span className="pill" style={{ background: '#FBEFD5', color: '#6E470D' }}>{changed} thay đổi chưa lưu</span>}
        <button className="btn btn-q" disabled={!changed} onClick={() => { setDraft(structuredClone({ typeConfig: d.typeConfig, dayPrices: d.dayPrices })); setDays([]) }}>Huỷ thay đổi</button>
        <button className="btn btn-p" disabled={!changed} onClick={save}>Lưu &amp; cập nhật web</button>
      </AdminHead>
      <main className="adm-main">
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <section style={{ width: 280, flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Loại phòng</strong><button className="btn btn-q" onClick={() => toast('Thêm loại phòng mới cần máy chủ')}>+ Thêm</button></div>
            {TYPE_LIST.map(t => (
              <button key={t.name} className={'rt' + (type === t.name ? ' on' : '')} onClick={() => { setType(t.name); setDays([]) }}>
                <span className="th" /><span style={{ flex: 1 }}><strong style={{ display: 'block' }}>{t.name}</strong><span className="muted" style={{ fontSize: 13 }}>{t.count} phòng · từ {fmtShort(draft.typeConfig[t.name].price)}</span></span>
                {!draft.typeConfig[t.name].visible && <Pill bg="#ECEAE7" fg="#5E5852">Ẩn</Pill>}
              </button>
            ))}
          </section>
          <section className="card" style={{ flex: '1 1 520px', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', padding: '0 20px', gap: 12, flexWrap: 'wrap' }}>
              <div className="tabs-line" role="tablist" aria-label="Thiết lập loại phòng" style={{ borderBottom: 0 }}>{['Thông tin', 'Ảnh & giá', 'Tiện nghi', 'Chính sách'].map(t => <button key={t} role="tab" aria-selected={tab === t} className={'tab' + (tab === t ? ' tab-on' : '')} onClick={() => setTab(t)}>{t}</button>)}</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>Hiển thị trên web <button type="button" role="switch" aria-checked={cfg.visible} aria-label="Hiển thị trên web" className="tg" onClick={() => setCfg({ visible: !cfg.visible })} /></label>
            </div>
            {tab === 'Ảnh & giá' && (
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <div className="sec-h" style={{ marginBottom: 12 }}><h2 style={{ fontSize: 16 }}>Ảnh phòng {type} <span className="muted" style={{ fontWeight: 400 }}>· {photos.length + 1}/12 ảnh · kéo để sắp xếp</span></h2><span className="muted" style={{ fontSize: 13 }}>Khuyên dùng ngang 3:2, tối thiểu 1600px</span></div>
                  <div className="grid g3" style={{ gap: 12 }}>
                    {photos.map((p, i) => <div key={p} className="ph">{p}{i === 0 && <span className="cover">Ảnh bìa</span>}</div>)}
                    <div className="ph" style={{ background: '#7A5A44' }}>phong-tam.jpg<span style={{ width: '70%', height: 4, background: 'rgba(255,255,255,.3)', borderRadius: 2 }}><span style={{ display: 'block', width: '64%', height: 4, background: '#C8955C', borderRadius: 2 }} /></span>Đang tải 64%</div>
                    <button className="ph add-ph" onClick={() => toast('Tải ảnh lên cần máy chủ lưu trữ')}><Ico n="upload" size={22} />Tải ảnh lên<span className="muted">hoặc kéo thả</span></button>
                  </div>
                </div>
                <div className="grid g4" style={{ gap: 14 }}>
                  <div><label className="lbl" htmlFor="p1">Giá ngày thường (T2–T5, CN)</label><input id="p1" className="in" inputMode="numeric" value={fmt(cfg.price) + ' ₫'} onChange={e => setCfg({ price: num(e.target.value) })} /></div>
                  <div><label className="lbl" htmlFor="p2">Giá cuối tuần (T6, T7)</label><input id="p2" className="in" inputMode="numeric" value={fmt(cfg.weekend) + ' ₫'} onChange={e => setCfg({ weekend: num(e.target.value) })} /></div>
                  <div><label className="lbl" htmlFor="p3">Phụ thu thêm người</label><input id="p3" className="in" inputMode="numeric" value={fmt(cfg.extraPerson) + ' ₫'} onChange={e => setCfg({ extraPerson: num(e.target.value) })} /></div>
                  <div><label className="lbl" htmlFor="p4">Số đêm tối thiểu</label><input id="p4" className="in" inputMode="numeric" value={cfg.minNights} onChange={e => setCfg({ minNights: Math.max(1, num(e.target.value)) })} /></div>
                </div>
                <div>
                  <div className="sec-h"><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><button className="btn btn-q" aria-label="Tháng trước" onClick={() => setMv(v => v - 1)}>‹</button><strong>{monthTitle(y, m)}</strong><button className="btn btn-q" aria-label="Tháng sau" onClick={() => setMv(v => v + 1)}>›</button></div>
                    <div className="legend" style={{ fontSize: 12, gap: 14 }}><span className="lg"><span className="sw" style={{ background: '#FBEFD5', border: '1px solid #B7791F' }} />Giá riêng</span><span className="lg"><span className="sw hatch" style={{ background: '#ECEAE7' }} />Đóng bán</span><span className="muted">Shift + bấm để chọn khoảng</span></div></div>
                  <div className="pcal" style={{ marginBottom: 6 }}>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(x => <span key={x} className="muted" style={{ fontSize: 12, textAlign: 'center' }}>{x}</span>)}</div>
                  <div className="pcal">
                    {Array.from({ length: offset }, (_, i) => <span key={'o' + i} />)}
                    {Array.from({ length: dim }, (_, i) => { const k = dateKey(new Date(y, m, i + 1)); const v = dp[k]; const wk = isWeekendNight(k); const p = typeof v === 'number' ? v : wk ? cfg.weekend : cfg.price; const isSel = days.includes(k); const past = k < todayKey(); return (
                      <button key={k} disabled={past} className={v === 'closed' ? 'hatch' : ''} onClick={e => toggleDay(k, e.shiftKey)} style={{ background: v === 'closed' ? '#ECEAE7' : typeof v === 'number' ? '#FBEFD5' : '#fff', border: isSel ? '2px solid #3B2416' : '1px solid #E8DFD2', opacity: past ? .45 : 1, cursor: past ? 'not-allowed' : 'pointer' }} aria-pressed={isSel}>
                        <span className="d">{i + 1}</span><span className="p" style={{ color: v === 'closed' ? '#5E5852' : wk ? '#8B5A2B' : '#4A3A2E' }}>{v === 'closed' ? 'Đóng' : fmtShort(p)}</span>
                      </button>) })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, padding: '12px 14px', borderRadius: 12, background: '#FBF6EE', flexWrap: 'wrap' }}>
                    <strong>{days.length ? `Đã chọn ${days.length} ngày` : 'Chọn ngày để đặt giá riêng hoặc đóng bán'}</strong>
                    {days.length > 0 && <>
                      <input className="in" aria-label="Giá cho ngày đã chọn" placeholder="Giá (₫)" inputMode="numeric" value={dayPrice} onChange={e => setDayPrice(e.target.value.replace(/\D/g, ''))} style={{ width: 150, height: 40 }} />
                      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
                        <button className="btn btn-q" onClick={() => { applyDays('closed'); setDays([]) }}>Đóng bán</button>
                        <button className="btn btn-q" onClick={() => { applyDays(null); setDays([]) }}>Về giá gốc</button>
                        <button className="btn btn-g" disabled={!dayPrice} onClick={() => { applyDays(Number(dayPrice)); setDays([]); setDayPrice('') }}>Đặt giá cho ngày đã chọn</button>
                      </div></>}
                  </div>
                </div>
              </div>
            )}
            {tab === 'Thông tin' && <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid g2" style={{ gap: 14 }}><div><label className="lbl">Tên loại phòng</label><input className="in" readOnly value={type} /></div><div><label className="lbl">Diện tích</label><input className="in" readOnly value={TYPES[type].size} /></div><div><label className="lbl">Giường</label><input className="in" readOnly value={TYPES[type].bed} /></div><div><label className="lbl">Số khách tối đa</label><input className="in" readOnly value={TYPES[type].guests} /></div></div>
              <div><label className="lbl">Mô tả</label><textarea className="in" rows={3} readOnly value={TYPES[type].desc} /></div>
              <p className="muted" style={{ fontSize: 13 }}>Chỉnh sửa nội dung mô tả sẽ khả dụng khi có máy chủ lưu trữ.</p></div>}
            {tab === 'Tiện nghi' && <div style={{ padding: 24 }}><div className="grid g3" style={{ gap: 12, fontSize: 14 }}>{[...TYPES[type].tags, ...IN_ROOM].map(x => <label key={x} className="check"><input type="checkbox" defaultChecked />{x}</label>)}</div></div>}
            {tab === 'Chính sách' && <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>{[['Huỷ miễn phí đến', '14:00, 2 ngày trước nhận phòng'], ['Phí huỷ muộn', '1 đêm đầu tiên'], ['Nhận phòng sớm 12:00', '300.000 ₫'], ['Trả phòng muộn 14:00', '300.000 ₫'], ['Trẻ em dưới 6 tuổi', 'Miễn phí']].map(([k, v]) => <div key={k} className="row-s" style={{ justifyContent: 'space-between' }}><span className="muted">{k}</span><strong>{v}</strong></div>)}</div>}
          </section>
        </div>
      </main>
    </>
  )
}
