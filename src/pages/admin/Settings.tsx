import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHead } from './AdminLayout'
import { Switch } from '@/components/ui'
import { useDb } from '@/store/db'
import { useToast } from '@/store/ui'

const SECTIONS = ['Thông tin khách sạn', 'Thanh toán & thông báo', 'Chính sách đặt & huỷ', 'Ngôn ngữ & tiền tệ', 'Tên miền & giao diện web']
const GATEWAYS = [
  { k: 'vietqr', mono: 'QR', name: 'VietQR (chuyển khoản)', desc: 'QR động tạo qua API cho từng đơn · [NGÂN HÀNG] · [SỐ TÀI KHOẢN] · webhook tự xác nhận', on: true, cfg: 'Cấu hình' },
  { k: 'momo', mono: 'MM', name: 'Ví MoMo', desc: 'Đã kết nối · Partner code [MÃ ĐỐI TÁC]', on: true, cfg: 'Cấu hình' },
  { k: 'zalo', mono: 'ZP', name: 'ZaloPay', desc: 'Chưa kết nối', on: false, cfg: 'Kết nối' },
  { k: 'card', mono: 'THẺ', name: 'Thẻ Visa / Mastercard / JCB / Napas', desc: 'Qua [CỔNG THANH TOÁN] · bắt buộc 3-D Secure', on: true, cfg: 'Cấu hình' }
]
const EVENTS = [['Đặt phòng thành công', 1, 1, 1], ['Nhắc trước ngày nhận phòng 1 ngày', 1, 1, 0], ['Đổi ngày / huỷ phòng', 1, 1, 0], ['Hoá đơn sau khi trả phòng', 1, 0, 0], ['Báo quản lý khi có đặt phòng mới', 1, 0, 1]] as const
const ROLE_C: Record<string, [string, string]> = { 'Quản trị': ['#2A1D14', '#E3BE8D'], 'Quản lý': ['#3B2416', '#FAF6EF'], 'Lễ tân': ['#F3E6D3', '#6E470D'], 'Doanh thu': ['#E4ECF5', '#1F3F66'], 'Marketing': ['#F3EADC', '#4A3A2E'], 'Buồng phòng': ['#E6F2EA', '#1E5235'] }

export default function Settings() {
  const d = useDb()
  const toast = useToast()
  const [sec, setSec] = useState(SECTIONS[1])
  const [gw, setGw] = useState(Object.fromEntries(GATEWAYS.map(g => [g.k, g.on])))
  const [ev, setEv] = useState(EVENTS.map(e => [e[1], e[2], e[3]].map(Boolean)))
  const [f, setF] = useState({ hold: '15 phút', qr: '10 phút', deposit: '30% tổng tiền', sms: 'THE NESTRO', api: '[API ENDPOINT] · khoá API đã lưu', hook: '[WEBHOOK URL]' })
  const [dirty, setDirty] = useState(0)
  const mark = () => setDirty(n => n + 1)
  return (
    <>
      <AdminHead title="Cài đặt">
        {dirty > 0 && <span className="pill" style={{ background: '#FBEFD5', color: '#6E470D' }}>{dirty} thay đổi chưa lưu</span>}
        <button className="btn btn-q" disabled={!dirty} onClick={() => { setDirty(0); toast('Đã huỷ thay đổi') }}>Huỷ</button>
        <button className="btn btn-p" disabled={!dirty} onClick={() => { setDirty(0); toast('Đã lưu cài đặt (lưu cục bộ, chờ kết nối máy chủ)') }}>Lưu cài đặt</button>
      </AdminHead>
      <main className="adm-main">
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <nav className="sub-nav" aria-label="Mục cài đặt">
            {SECTIONS.map(s => <a key={s} className={sec === s ? 'on' : ''} aria-current={sec === s ? 'page' : undefined} onClick={() => setSec(s)} tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') setSec(s) }} role="button">{s}</a>)}
            <Link to="/admin/nhan-vien">Nhân viên &amp; phân quyền</Link>
          </nav>
          <div style={{ flex: '1 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {sec === SECTIONS[1] ? (
              <>
                <section className="card pad"><div className="sec-h"><h2>Cổng thanh toán</h2><span className="muted" style={{ fontSize: 13 }}>Khách thấy các phương thức đang bật ở bước 4</span></div>
                  {GATEWAYS.map(g => <div key={g.k} className="row-s"><span className="mono-b">{g.mono}</span><div style={{ flex: 1, minWidth: 0 }}><strong>{g.name}</strong><div className="muted" style={{ fontSize: 13 }}>{g.desc}</div></div><button className="btn btn-q" onClick={() => toast('Cấu hình cổng thanh toán cần máy chủ')}>{g.cfg}</button><Switch on={gw[g.k]} label={`Bật ${g.name}`} onChange={v => { setGw({ ...gw, [g.k]: v }); mark() }} /></div>)}
                </section>
                <section className="card pad"><div className="sec-h"><h2>Giữ phòng &amp; hạn thanh toán</h2></div>
                  <div className="grid g2" style={{ gap: 16 }}>
                    {([['hold', 'Giữ phòng khi khách chọn'], ['qr', 'Mã QR hết hạn sau'], ['deposit', 'Cho phép đặt cọc'], ['sms', 'Tên người gửi SMS'], ['api', 'API tạo mã QR'], ['hook', 'Webhook nhận kết quả thanh toán']] as const).map(([k, l], i) => <div key={k}><label className="lbl" htmlFor={'s' + i}>{l}</label><input id={'s' + i} className="in" value={f[k]} onChange={e => { setF({ ...f, [k]: e.target.value }); mark() }} />{k === 'hook' && <div className="hint">Nhận tín hiệu lần cuối 13:52 hôm nay</div>}</div>)}
                  </div></section>
                <section className="card"><div className="tbl-wrap"><table className="tbl"><thead><tr><th>Gửi thông báo khi</th><th>Email</th><th>SMS</th><th>Zalo</th></tr></thead><tbody>{EVENTS.map((e, i) => <tr key={e[0]}><td>{e[0]}</td>{['Email', 'SMS', 'Zalo'].map((c, j) => <td key={c}><input type="checkbox" style={{ width: 20, height: 20, accentColor: '#3B2416' }} checked={ev[i][j]} aria-label={`${e[0]} qua ${c}`} onChange={x => { setEv(ev.map((r, a) => (a === i ? r.map((v, b) => (b === j ? x.target.checked : v)) : r))); mark() }} /></td>)}</tr>)}</tbody></table></div>
                  <div style={{ padding: 16 }}><button className="btn btn-q" onClick={() => toast('Trình sửa mẫu Email/SMS sẽ có khi kết nối máy chủ')}>Sửa mẫu Email/SMS</button></div></section>
                <section className="card pad"><div className="sec-h"><h2>Nhân viên &amp; phân quyền</h2><Link to="/admin/nhan-vien" className="btn btn-q">+ Mời nhân viên</Link></div>
                  <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Nhân viên</th><th>Vai trò</th><th>Đăng nhập gần nhất</th></tr></thead><tbody>{d.staff.slice(0, 4).map(s => <tr key={s.mail}><td>{s.name}</td><td><span className="pill" style={{ background: ROLE_C[s.role][0], color: ROLE_C[s.role][1] }}>{s.role}</span></td><td>{s.last}</td></tr>)}</tbody></table></div></section>
              </>
            ) : (
              <section className="card pad"><div className="sec-h"><h2>{sec}</h2></div>
                <div className="grid g2" style={{ gap: 16 }}>
                  {({ [SECTIONS[0]]: [['Tên khách sạn', 'The Nestro'], ['Hotline', '1900 XXXX'], ['Email', '[EMAIL]'], ['Địa chỉ', '[ĐỊA CHỈ KHÁCH SẠN]']], [SECTIONS[2]]: [['Huỷ miễn phí trước', '2 ngày, 14:00'], ['Phí huỷ muộn', '1 đêm'], ['Giờ nhận phòng tiêu chuẩn', '14:00'], ['Giờ trả phòng tiêu chuẩn', '12:00']], [SECTIONS[3]]: [['Ngôn ngữ mặc định', 'Tiếng Việt'], ['Ngôn ngữ phụ', 'English'], ['Tiền tệ', 'VND (₫)'], ['Múi giờ', 'GMT+7']], [SECTIONS[4]]: [['Tên miền', '[TÊN MIỀN]'], ['Màu chủ đạo', '#3B2416'], ['Màu nhấn', '#C8955C'], ['Logo', 'logo-160.png']] } as Record<string, string[][]>)[sec].map(([k, v], i) => <div key={k}><label className="lbl" htmlFor={'g' + i}>{k}</label><input id={'g' + i} className="in" defaultValue={v} onChange={mark} /></div>)}
                </div></section>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
