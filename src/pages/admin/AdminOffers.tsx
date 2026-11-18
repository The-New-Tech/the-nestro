import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHead } from './AdminLayout'
import { Switch } from '@/components/ui'
import { useDb, db as store } from '@/store/db'
import { useToast } from '@/store/ui'
import { fmt, fmtDMY } from '@/lib/utils'
import type { Offer, OfferKind } from '@/store/types'
import type { RoomType } from '@/data/catalog'

const KINDS: [OfferKind, string][] = [['percent', 'Phần trăm'], ['fixed', 'Số tiền'], ['freeNight', 'Ở X trả Y']]
const rnd = () => Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
export default function AdminOffers() {
  const d = useDb()
  const toast = useToast()
  const [f, setF] = useState({ code: 'TET2027', title: 'Đón Tết sớm, giảm đến 20%', kind: 'percent' as OfferKind, value: '20', cap: '1000000', types: ['Deluxe', 'Family', 'Suite'] as RoomType[], from: '2027-02-01', to: '2027-02-20', minNights: '2', limit: '200', visible: true })
  const [err, setErr] = useState('')
  const used = d.offers.reduce((s, o) => s + o.used, 0)
  const active = d.offers.filter(o => o.on).length
  const create = (activate: boolean) => {
    const code = f.code.trim().toUpperCase()
    if (!/^[A-Z0-9]{4,16}$/.test(code)) { setErr('Mã gồm 4–16 chữ hoa hoặc số'); return }
    if (d.offers.some(o => o.code === code)) { setErr('Mã này đã tồn tại'); return }
    if (!f.title.trim()) { setErr('Nhập tên hiển thị cho khách'); return }
    const v = Number(f.value)
    if (!v) { setErr('Nhập giá trị giảm'); return }
    setErr('')
    const o: Offer = {
      code, tag: 'Mới', title: f.title.trim(), desc: `Áp dụng cho ${f.types.join(', ') || 'mọi hạng phòng'}, lưu trú ${fmtDMY(f.from)} – ${fmtDMY(f.to)}.`,
      cond: `${f.types.join(', ') || 'Mọi hạng phòng'} · từ ${f.minNights} đêm`, valid: `đến ${fmtDMY(f.to)}`,
      valueLabel: f.kind === 'percent' ? `−${v}%` : f.kind === 'fixed' ? `−${fmt(v)} ₫` : `Ở ${v + 1} trả ${v}`,
      kind: f.kind, value: v, cap: Number(f.cap) || undefined, minNights: Number(f.minNights) || 1, types: f.types, limit: Number(f.limit) || 0, used: 0,
      on: activate, visible: f.visible, validFrom: f.from, validTo: f.to
    }
    store.set(x => { x.offers.unshift(o) }); toast(activate ? `Đã kích hoạt mã ${code}` : 'Đã lưu nháp (mã đang tắt)')
  }
  const toggleType = (t: RoomType) => setF(x => ({ ...x, types: x.types.includes(t) ? x.types.filter(y => y !== t) : [...x.types, t] }))
  return (
    <>
      <AdminHead title="Ưu đãi & mã giảm giá"><Link to="/uu-dai" className="btn btn-q">Xem trang Ưu đãi</Link></AdminHead>
      <main className="adm-main">
        <div className="cols c-main-side" style={{ gridTemplateColumns: 'minmax(0,1fr) 400px' }}>
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <div className="kpis" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
              <div className="card kpi"><div className="k">Mã đang chạy</div><div className="big">{active}</div></div>
              <div className="card kpi"><div className="k">Lượt dùng</div><div className="big">{used}</div></div>
              <div className="card kpi"><div className="k">Tổng tiền đã giảm</div><div className="big">[SỐ LIỆU]</div></div>
            </div>
            <div className="card tbl-wrap">
              <table className="tbl"><thead><tr><th>Mã</th><th>Ưu đãi</th><th>Giảm</th><th>Hiệu lực</th><th>Đã dùng</th><th>Bật</th></tr></thead>
                <tbody>{d.offers.map(o => (
                  <tr key={o.code} style={{ background: o.on ? '#fff' : '#FBF8F3' }}>
                    <td><span className="code">{o.code}</span></td>
                    <td><div style={{ fontWeight: 500 }}>{o.title}</div><div className="sub">{o.cond}</div></td>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{o.valueLabel}</td><td style={{ whiteSpace: 'nowrap' }}>{o.valid}</td>
                    <td><div style={{ fontSize: 13 }}>{o.limit ? `${o.used} / ${o.limit} lượt` : `${o.used} lượt · không giới hạn`}</div><div style={{ height: 5, borderRadius: 999, background: '#F3EADC', marginTop: 4, width: 110 }}><div style={{ width: `${o.limit ? Math.min(100, o.used / o.limit * 100) : 0}%`, height: 5, borderRadius: 999, background: '#C8955C' }} /></div></td>
                    <td><Switch on={o.on} label={`Bật mã ${o.code}`} onChange={v => store.set(x => { x.offers.find(y => y.code === o.code)!.on = v })} /></td>
                  </tr>))}</tbody></table>
            </div>
          </section>
          <section className="card pad" style={{ alignSelf: 'start' }}>
            <div className="sec-h"><h2>Tạo mã giảm giá</h2><span className="pill" style={{ background: '#FBEFD5', color: '#6E470D' }}>Bản nháp</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="lbl" htmlFor="o1">Mã</label><div style={{ display: 'flex', gap: 8 }}><input id="o1" className="in" value={f.code} onChange={e => setF({ ...f, code: e.target.value.toUpperCase() })} style={{ fontWeight: 600, letterSpacing: '.06em' }} /><button className="btn btn-q" onClick={() => setF({ ...f, code: rnd() })}>Tạo ngẫu nhiên</button></div></div>
              <div><label className="lbl" htmlFor="o2">Tên hiển thị cho khách</label><input id="o2" className="in" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
              <div><span className="lbl">Kiểu giảm</span><div className="seg-wrap" role="radiogroup" aria-label="Kiểu giảm">{KINDS.map(([k, l]) => <button key={k} className={'seg' + (f.kind === k ? ' seg-on' : '')} role="radio" aria-checked={f.kind === k} onClick={() => setF({ ...f, kind: k })}>{l}</button>)}</div></div>
              <div className="grid g2" style={{ gap: 12 }}><div><label className="lbl" htmlFor="o3">Giá trị {f.kind === 'percent' ? '(%)' : f.kind === 'fixed' ? '(₫)' : '(số đêm trả)'}</label><input id="o3" className="in" inputMode="numeric" value={f.value} onChange={e => setF({ ...f, value: e.target.value.replace(/\D/g, '') })} /></div><div><label className="lbl" htmlFor="o4">Giảm tối đa (₫)</label><input id="o4" className="in" inputMode="numeric" value={f.cap} onChange={e => setF({ ...f, cap: e.target.value.replace(/\D/g, '') })} /></div></div>
              <div><span className="lbl">Áp dụng cho</span><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{(['Standard', 'Deluxe', 'Family', 'Suite'] as RoomType[]).map(t => <button key={t} className={'chip chip-soft' + (f.types.includes(t) ? ' chip-on' : '')} aria-pressed={f.types.includes(t)} onClick={() => toggleType(t)}>{t}</button>)}</div></div>
              <div className="grid g2" style={{ gap: 12 }}><div><label className="lbl" htmlFor="o5">Lưu trú từ</label><input id="o5" type="date" className="in" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} /></div><div><label className="lbl" htmlFor="o6">Đến</label><input id="o6" type="date" className="in" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} /></div><div><label className="lbl" htmlFor="o7">Đêm tối thiểu</label><input id="o7" className="in" inputMode="numeric" value={f.minNights} onChange={e => setF({ ...f, minNights: e.target.value.replace(/\D/g, '') })} /></div><div><label className="lbl" htmlFor="o8">Giới hạn lượt</label><input id="o8" className="in" inputMode="numeric" value={f.limit} onChange={e => setF({ ...f, limit: e.target.value.replace(/\D/g, '') })} /></div></div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>Hiện trên trang Ưu đãi<Switch on={f.visible} label="Hiện trên trang Ưu đãi" onChange={v => setF({ ...f, visible: v })} /></label>
              <div style={{ border: '1.5px dashed #D9CCBA', borderRadius: 12, padding: 16, textAlign: 'center', fontSize: 13, color: '#6B5A4C' }}>Tải ảnh banner (1600×600)</div>
              {err && <div role="alert" className="hint hint-err">{err}</div>}
              <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-q" style={{ flex: 1 }} onClick={() => create(false)}>Lưu nháp</button><button className="btn btn-p" style={{ flex: 1 }} onClick={() => create(true)}>Kích hoạt mã</button></div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
