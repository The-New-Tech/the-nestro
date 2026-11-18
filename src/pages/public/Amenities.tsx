import { useState } from 'react'
import { Ico, Icon } from '@/components/Icon'
import { AMENITIES, IN_ROOM } from '@/data/catalog'

export default function Amenities() {
  const [cat, setCat] = useState('Tất cả')
  const cats = ['Tất cả', 'Thư giãn', 'Ẩm thực', 'Gia đình', 'Công tác']
  const items = AMENITIES.filter(a => cat === 'Tất cả' || a.cat === cat)
  return (
    <div className="page" style={{ gap: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow" style={{ letterSpacing: '.16em' }}>Trải nghiệm tại The Nestro</div>
          <h1 className="page-h1">Tiện ích</h1>
          <p className="page-lead">Thư giãn, ăn ngon, làm việc hay vui chơi cùng gia đình: mọi thứ bạn cần đều trong cùng một toà nhà.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', maxWidth: '100%' }} role="tablist" aria-label="Nhóm tiện ích">
          {cats.map(c => <button key={c} role="tab" aria-selected={cat === c} className={'chip' + (cat === c ? ' chip-on' : '')} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      </div>
      <div className="grid g4">
        {cat === 'Tất cả' && (
          <article className="card" style={{ gridColumn: 'span 2', gridRow: 'span 2', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="photo" style={{ flex: 1, minHeight: 260, flexDirection: 'row', fontSize: 14 }}><Ico n="bed" size={34} sw={1.3} />Ảnh hồ bơi sân thượng</div>
            <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
              <div><span style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 999, background: '#C8955C', color: '#2A1D14' }}>Nổi bật</span>
                <h2 style={{ margin: '12px 0 6px', fontSize: 24, fontWeight: 600 }}>Hồ bơi vô cực sân thượng</h2>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>Ngắm hoàng hôn trên hồ, có khu riêng cho trẻ em và quầy đồ uống cạnh hồ.</p></div>
              <div style={{ textAlign: 'right', fontSize: 13, color: '#4A3A2E' }}><div><strong>06:00 – 22:00</strong></div><div className="muted" style={{ marginTop: 4 }}>Tầng thượng · Miễn phí</div></div>
            </div>
          </article>
        )}
        {items.map(a => (
          <article key={a.name} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="ic"><Icon d={a.icon} size={24} sw={1.6} /></div>
            <div><h2 style={{ fontSize: 17, fontWeight: 600 }}>{a.name}</h2><p className="muted" style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5 }}>{a.desc}</p></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #F0E8DC', gap: 8 }}><strong>{a.hours}</strong><span className="muted">{a.where}</span></div>
          </article>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1.4 1 340px', padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Trong mỗi phòng</h2>
          <div className="grid g3" style={{ gap: '12px 20px', fontSize: 14, color: '#4A3A2E' }}>{IN_ROOM.map(t => <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Ico n="check" size={16} sw={2.4} style={{ color: '#2F7D4F' }} />{t}</span>)}</div>
        </div>
        <div className="card" style={{ flex: '1 1 280px', padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Quy định chung</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            {[['Nhận / trả phòng', '14:00 / 12:00'], ['Đỗ xe', 'Hầm B1 · miễn phí'], ['Thú cưng', 'Không áp dụng'], ['Hút thuốc', 'Khu vực riêng tầng 1']].map(([k, v]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span className="muted">{k}</span><strong>{v}</strong></div>)}
          </div>
        </div>
      </div>
    </div>
  )
}
