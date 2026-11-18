import { useState } from 'react'
import { AdminHead } from './AdminLayout'
import { useToast } from '@/store/ui'

const VALS = [78, 72, 66, 70, 95, 124, 118, 74, 69, 64, 72, 98, 128, 121, 80, 71, 62, 68, 103, 132, 126, 88, 76, 70, 74, 99, 122, 115, 62, 55]
const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
export default function Reports() {
  const toast = useToast()
  const [hi, setHi] = useState(20)
  const N = VALS.length, max = 150
  const pts = VALS.map((v, i) => `${((i + .5) / N * 100).toFixed(2)},${(100 - v / max * 100).toFixed(2)}`)
  const byType: [string, number][] = [['Deluxe', 1.12], ['Standard', .74], ['Suite', .48], ['Family', .37]]
  const bySrc: [string, number][] = [['Website', 62], ['Điện thoại', 18], ['Tại quầy', 11], ['Đối tác', 9]]
  const m = 11, y = new Date().getFullYear()
  return (
    <>
      <AdminHead title="Báo cáo">
        <span className="pill" style={{ background: '#FBEFD5', color: '#6E470D' }}>Dữ liệu mẫu</span>
        <button className="btn btn-q">Tháng {m}/{y} ▾</button><button className="btn btn-q">So với: tháng 10 ▾</button>
        <button className="btn btn-q" onClick={() => toast('Xuất Excel sẽ có khi kết nối máy chủ')}>Xuất Excel</button><button className="btn btn-p" onClick={() => window.print()}>Tải PDF</button>
      </AdminHead>
      <main className="adm-main">
        <div className="kpis">
          {[['Doanh thu phòng', '2,71 tỷ ₫', '▲ 12% so với tháng 10', 'up'], ['Công suất trung bình', '74%', '▲ 4 điểm', 'up'], ['ADR', '1,92tr ₫', 'Không đổi', ''], ['Tỉ lệ huỷ', '5,5%', '▲ 0,8 điểm', 'down']].map(([k, v, dd, c]) => <div key={k} className="card kpi"><div className="k">{k}</div><div className="big">{v}</div><div className={'d ' + c}>{dd}</div></div>)}
        </div>
        <section className="card pad">
          <div className="sec-h"><h2>Doanh thu phòng theo ngày</h2><span className="muted" style={{ fontSize: 13 }}>triệu ₫ · rê chuột để xem từng ngày</span></div>
          <div style={{ position: 'relative', height: 240, paddingLeft: 44, marginBottom: 28 }}>
            {[150, 100, 50, 0].map((g, i) => <div key={g} className="gl" style={{ position: 'absolute', left: 0, right: 0, top: `${i * 33.33}%`, transform: 'translateY(-50%)', display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: '#6B5A4C' }}><span style={{ width: 36, textAlign: 'right' }}>{g}</span><span style={{ flex: 1, height: 1, background: '#E8DFD2' }} /></div>)}
            <div style={{ position: 'absolute', left: 44, right: 0, top: 0, bottom: 0 }}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true"><polyline points={`${pts[0].split(',')[0]},100 ${pts.join(' ')} ${pts[N - 1].split(',')[0]},100`} fill="rgba(200,149,92,.18)" stroke="none" /><polyline points={pts.join(' ')} fill="none" stroke="#8B5A2B" strokeWidth="1.8" vectorEffect="non-scaling-stroke" /></svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                {VALS.map((v, i) => (
                  <div key={i} style={{ flex: 1, position: 'relative' }} onMouseEnter={() => setHi(i)} onClick={() => setHi(i)}>
                    {i === hi && <>
                      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#3B2416', opacity: .35 }} />
                      <div style={{ position: 'absolute', left: '50%', top: `${100 - v / max * 100}%`, width: 12, height: 12, borderRadius: '50%', background: '#3B2416', border: '3px solid #fff', transform: 'translate(-50%,-50%)' }} />
                      <div className="tip" style={{ bottom: 'auto', top: `calc(${100 - v / max * 100}% - 64px)`, left: i > 24 ? 'auto' : '50%', right: i > 24 ? 0 : 'auto', transform: i > 24 ? 'none' : i < 4 ? 'translateX(0)' : 'translateX(-50%)' }}><b>{DOW[new Date(y, m - 1, i + 1).getDay()]}, {i + 1}/{m}/{y}</b><strong>{v} triệu ₫</strong> · {Math.min(98, Math.round(v / 1.4))}% công suất</div></>}
                  </div>))}
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: -22, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B5A4C' }}>{['1/11', '8/11', '15/11', '22/11', '30/11'].map(x => <span key={x}>{x}</span>)}</div>
            </div>
          </div>
        </section>
        <div className="cols" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
          <section className="card pad"><div className="sec-h"><h2>Doanh thu theo hạng phòng</h2></div>{byType.map(([n, v]) => <div key={n} className="hb"><span>{n}</span><div className="t"><div style={{ width: `${v / 1.12 * 100}%` }} /></div><span>{String(v).replace('.', ',')} tỷ</span></div>)}</section>
          <section className="card pad"><div className="sec-h"><h2>Nguồn đặt phòng</h2></div>{bySrc.map(([n, v]) => <div key={n} className="hb"><span>{n}</span><div className="t"><div style={{ width: `${v / 62 * 100}%` }} /></div><span>{v}%</span></div>)}</section>
          <section className="card tbl-wrap"><table className="tbl" style={{ minWidth: 0 }}><thead><tr><th>Hạng</th><th>Công suất</th><th>ADR</th><th>RevPAR</th></tr></thead><tbody>{[['Standard', '81%', '1,52tr', '1,23tr'], ['Deluxe', '76%', '1,96tr', '1,49tr'], ['Family', '64%', '2,71tr', '1,73tr'], ['Suite', '58%', '3,38tr', '1,96tr']].map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={i ? { fontWeight: 500 } : undefined}>{c}</td>)}</tr>)}</tbody></table></section>
        </div>
      </main>
    </>
  )
}
