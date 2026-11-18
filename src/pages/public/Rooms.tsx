import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Ico } from '@/components/Icon'
import { Modal } from '@/components/ui'
import { useDb } from '@/store/db'
import { useFlow } from '@/store/flow'
import { TYPE_LIST, IN_ROOM, type TypeInfo } from '@/data/catalog'
import { addDays, fmt, todayKey } from '@/lib/utils'
import { useLang } from '@/store/ui'

export default function Rooms() {
  const db = useDb()
  const nav = useNavigate()
  const { flow, patch } = useFlow()
  const { t } = useLang()
  const [filter, setFilter] = useState('all')
  const [asc, setAsc] = useState(true)
  const [detail, setDetail] = useState<TypeInfo | null>(null)
  const [ci, setCi] = useState(flow.checkIn), [co, setCo] = useState(flow.checkOut), [guests, setGuests] = useState(flow.adults + flow.children)
  const list = useMemo(() => TYPE_LIST.filter(x => db.typeConfig[x.name]?.visible !== false && !db.typeConfig[x.name]?.hidden)
    .filter(x => filter === 'all' || (filter === 'lake' ? x.view === 'Hướng hồ' : filter === 'family' ? x.guests >= 4 : x.tags.includes('Bồn tắm')))
    .sort((a, b) => (db.typeConfig[a.name].price - db.typeConfig[b.name].price) * (asc ? 1 : -1)), [db, filter, asc])
  const chips: [string, string][] = [['all', `Tất cả (${TYPE_LIST.length})`], ['lake', 'Hướng hồ'], ['family', 'Cho gia đình'], ['tub', 'Có bồn tắm']]
  const search = (e: React.FormEvent) => { e.preventDefault(); const adults = Math.max(1, guests - flow.children); patch({ checkIn: ci, checkOut: co, adults, roomNo: null, holdUntil: null }); nav('/dat-phong') }
  return (
    <>
      <section className="hero">
        <div className="eyebrow eyebrow-g" style={{ letterSpacing: '.16em' }}>Lưu trú tại The Nestro</div>
        <h1>{t('Phòng & Suite', 'Rooms & Suites')}</h1>
        <p>4 hạng phòng với nội thất gỗ ấm, ánh sáng dịu và tầm nhìn ra hồ hoặc phố. Chọn hạng phòng, rồi chọn đúng căn bạn muốn trên sơ đồ tầng.</p>
      </section>
      <form className="card search-bar" onSubmit={search}>
        <div><label htmlFor="q1">Nhận phòng</label><input id="q1" type="date" className="in" min={todayKey()} value={ci} onChange={e => { setCi(e.target.value); if (co <= e.target.value) setCo(addDays(e.target.value, 1)) }} required /></div>
        <div><label htmlFor="q2">Trả phòng</label><input id="q2" type="date" className="in" min={addDays(ci, 1)} value={co} onChange={e => setCo(e.target.value)} required /></div>
        <div><label htmlFor="q3">Khách</label><select id="q3" className="in" value={guests} onChange={e => setGuests(Number(e.target.value))}>{[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} khách</option>)}</select></div>
        <button className="btn btn-p" style={{ minWidth: 220 }}>{t('Kiểm tra phòng trống', 'Check availability')}</button>
      </form>
      <div className="page" style={{ gap: 20, paddingTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{chips.map(([k, l]) => <button key={k} className={'chip' + (filter === k ? ' chip-on' : '')} onClick={() => setFilter(k)}>{l}</button>)}</div>
          <button className="chip" onClick={() => setAsc(a => !a)}>Sắp xếp: Giá {asc ? 'thấp → cao' : 'cao → thấp'}</button>
        </div>
        <div className="grid g2" style={{ gap: 24 }}>
          {list.map(r => (
            <article key={r.name} className="card room-card">
              <div className="photo"><Ico n="bed" size={34} sw={1.3} />Ảnh phòng {r.name}{r.badge && <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 999, background: '#C8955C', color: '#2A1D14' }}>{r.badge}</span>}</div>
              <div style={{ flex: 1, padding: 22, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
                <div><h2 style={{ fontSize: 20, fontWeight: 600 }}>{r.name}</h2><p className="muted" style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5 }}>{r.desc}</p></div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--ink2)', flexWrap: 'wrap' }}><span>{r.size}</span><span>Tối đa {r.guests} khách</span><span>{r.bed}</span></div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{r.tags.map(x => <span key={x} className="tag">{x}</span>)}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #F0E8DC', gap: 8, flexWrap: 'wrap' }}>
                  <div><div className="k" style={{ fontSize: 12 }}>Giá từ</div><strong style={{ fontSize: 20, color: '#3B2416' }}>{fmt(db.typeConfig[r.name].price)} ₫</strong><span className="muted" style={{ fontSize: 13 }}> /đêm</span></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-q btn-sm" onClick={() => setDetail(r)}>Chi tiết</button>
                    <Link to={`/dat-phong?loai=${r.name}`} className="btn btn-p btn-sm">Chọn trên sơ đồ</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail ? `${detail.name} · ${detail.size}` : ''} wide>
        {detail && (
          <>
            <div className="photo" style={{ height: 200, borderRadius: 12, marginBottom: 16 }}><Ico n="bed" size={34} sw={1.3} />Ảnh phòng {detail.name}</div>
            <p className="muted" style={{ lineHeight: 1.6 }}>{detail.desc}</p>
            <div className="grid g3" style={{ margin: '16px 0', gap: 12 }}><div><div className="k">Giường</div><div className="v">{detail.bed}</div></div><div><div className="k">Tối đa</div><div className="v">{detail.guests} khách</div></div><div><div className="k">Giá cuối tuần</div><div className="v">{fmt(db.typeConfig[detail.name].weekend)} ₫</div></div></div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Tiện nghi</div>
            <div className="grid g3" style={{ gap: 8, fontSize: 14 }}>{[...detail.tags, ...IN_ROOM.slice(0, 6)].map(x => <span key={x} style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Ico n="check" size={16} sw={2.4} style={{ color: '#2F7D4F' }} />{x}</span>)}</div>
            <Link to={`/dat-phong?loai=${detail.name}`} className="btn btn-p btn-block" style={{ marginTop: 20 }}>Chọn {detail.name} trên sơ đồ</Link>
          </>
        )}
      </Modal>
    </>
  )
}
