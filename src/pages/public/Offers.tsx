import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDb } from '@/store/db'
import { useFlow } from '@/store/flow'
import { useToast } from '@/store/ui'
import { diffDays, todayKey } from '@/lib/utils'

export default function Offers() {
  const db = useDb()
  const toast = useToast()
  const nav = useNavigate()
  const { patch } = useFlow()
  const [tag, setTag] = useState('Tất cả')
  const live = db.offers.filter(o => o.on && o.visible)
  const hero = live.find(o => o.code === 'NESTRO10') ?? live[0]
  const tags = ['Tất cả', 'Đặt sớm', 'Lưu trú dài', 'Gia đình', 'Combo']
  const list = live.filter(o => tag === 'Tất cả' || o.tag === tag)
  const copy = async (c: string) => { try { await navigator.clipboard.writeText(c) } catch { /* */ } toast(`Đã sao chép mã ${c}`) }
  const use = (c: string) => { patch({ promo: c }); nav('/dat-phong') }
  const left = hero?.validTo ? Math.max(0, diffDays(todayKey(), hero.validTo)) : null
  return (
    <div className="page">
      {hero && (
        <section style={{ display: 'flex', borderRadius: 16, overflow: 'hidden', background: '#3B2416', color: '#FAF6EF', boxShadow: '0 18px 40px rgba(59,36,22,.18)', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 380px', padding: 'clamp(24px,4vw,44px) clamp(20px,4vw,48px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="eyebrow eyebrow-g" style={{ letterSpacing: '.16em' }}>Ưu đãi nổi bật{left !== null ? ` · Còn ${left} ngày` : ''}</div>
            <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', lineHeight: 1.15, fontWeight: 600 }}>{hero.title}</h1>
            <p style={{ fontSize: 16, color: '#E9DCCB', lineHeight: 1.6, maxWidth: 560 }}>{hero.desc}</p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ font: '600 20px var(--mono)', letterSpacing: '.12em', padding: '12px 18px', borderRadius: 10, border: '1.5px dashed #C8955C', color: '#E3BE8D' }}>{hero.code}</span>
              <button className="btn" style={{ background: 'transparent', color: '#FAF6EF', border: '1px solid rgba(250,246,239,.4)' }} onClick={() => copy(hero.code)}>Sao chép mã</button>
              <button className="btn btn-g" onClick={() => use(hero.code)}>Đặt phòng ngay</button>
            </div>
          </div>
          <div className="photo hide-md" style={{ width: 420, background: '#5A3824', fontSize: 14 }}>Ảnh chiến dịch ưu đãi</div>
        </section>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 24, fontWeight: 600 }}>Tất cả ưu đãi</h2>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', maxWidth: '100%' }} role="tablist" aria-label="Lọc ưu đãi">{tags.map(t => <button key={t} role="tab" aria-selected={tag === t} className={'chip' + (tag === t ? ' chip-on' : '')} onClick={() => setTag(t)}>{t}</button>)}</div>
      </div>
      <div className="grid g3">
        {list.map(o => (
          <article key={o.code} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className="tag" style={{ fontWeight: 600 }}>{o.tag}</span><strong style={{ fontSize: 22, color: '#8B5A2B' }}>{o.valueLabel}</strong></div>
            <div><h3 style={{ fontSize: 18, fontWeight: 600 }}>{o.title}</h3><p className="muted" style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5 }}>{o.desc}</p></div>
            <div style={{ fontSize: 13, color: '#4A3A2E', display: 'flex', flexDirection: 'column', gap: 4 }}><span>{o.cond}</span><span className="muted">{o.valid}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #F0E8DC', gap: 8 }}>
              <button className="code" style={{ background: 'transparent', cursor: 'pointer' }} onClick={() => copy(o.code)} aria-label={`Sao chép mã ${o.code}`}>{o.code}</button>
              <button className="btn btn-q btn-sm" onClick={() => use(o.code)}>Đặt với ưu đãi</button>
            </div>
          </article>
        ))}
      </div>
      <section className="card" style={{ padding: 28, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1.1 1 260px' }}>
          <div className="eyebrow" style={{ letterSpacing: '.16em' }}>Nestro Club</div>
          <h2 style={{ margin: '10px 0 6px', fontSize: 24, fontWeight: 600 }}>Thành viên được giá tốt hơn</h2>
          <p className="muted" style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>Đăng ký miễn phí, tích điểm mỗi đêm lưu trú và nhận ưu đãi riêng qua email.</p>
          <button className="btn btn-p" onClick={() => toast('Đăng ký Nestro Club sẽ khả dụng khi kết nối máy chủ')}>Đăng ký miễn phí</button>
        </div>
        <div className="grid g3" style={{ flex: '2 1 380px', gap: 14 }}>
          {[['Bạc', 'Khi đăng ký', 'Giảm 5% giá phòng\nWi-Fi ưu tiên', 'n'], ['Vàng', 'Từ 5 đêm / năm', 'Giảm 10% giá phòng\nTrả phòng muộn 14:00', 'g'], ['Kim cương', 'Từ 15 đêm / năm', 'Giảm 15% + nâng hạng\nExecutive Lounge', 'd']].map(([n, s, b, k]) => (
            <div key={n} style={{ padding: 18, borderRadius: 12, border: k === 'g' ? '1.5px solid #C8955C' : k === 'd' ? 0 : '1px solid #E8DFD2', background: k === 'g' ? '#FBF6EE' : k === 'd' ? '#3B2416' : '#fff', color: k === 'd' ? '#FAF6EF' : undefined }}>
              <strong>{n}</strong><div style={{ fontSize: 12, color: k === 'd' ? '#E3BE8D' : '#6B5A4C', margin: '2px 0 10px' }}>{s}</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: k === 'd' ? '#E9DCCB' : '#4A3A2E', whiteSpace: 'pre-line' }}>{b}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
