import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Ico, P } from '@/components/Icon'
import { Field } from '@/components/ui'
import { FAQ, HOTLINE } from '@/data/catalog'
import { useToast } from '@/store/ui'
import { vEmail, vName, vPhone } from '@/lib/validate'

export default function Contact() {
  const toast = useToast()
  const loc = useLocation()
  const [open, setOpen] = useState(0)
  const [f, setF] = useState({ name: '', phone: '', email: '', topic: 'Đặt phòng', code: '', msg: '' })
  const [tc, setTc] = useState(false)
  const [sent, setSent] = useState(false)
  useEffect(() => { if (loc.hash === '#faq') document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }) }, [loc.hash])
  const err = { name: vName(f.name), phone: vPhone(f.phone), email: vEmail(f.email), msg: f.msg.trim().length < 10 ? 'Nội dung tối thiểu 10 ký tự' : '' }
  const show = (k: keyof typeof err) => (tc ? err[k] : '')
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setTc(true)
    if (Object.values(err).some(Boolean)) return
    setSent(true); toast('Đã gửi lời nhắn. Chúng tôi sẽ phản hồi trong 2 giờ làm việc.'); setF({ name: '', phone: '', email: '', topic: 'Đặt phòng', code: '', msg: '' }); setTc(false)
  }
  const cards: [keyof typeof P, string, string, string][] = [
    ['phone', 'Hotline 24/7', HOTLINE, `tel:${HOTLINE.replace(/\s/g, '')}`], ['mail', 'Email', '[EMAIL]', '#'], ['chat', 'Chat Zalo / Messenger', 'The Nestro', '#'], ['pin', 'Địa chỉ', '[ĐỊA CHỈ]', '#']
  ]
  const inp = (k: keyof typeof f) => ({ value: f[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value }) })
  return (
    <div className="page" style={{ gap: 24 }}>
      <div><div className="eyebrow" style={{ letterSpacing: '.16em' }}>Chúng tôi luôn sẵn sàng</div><h1 className="page-h1">Liên hệ</h1><p className="page-lead">Lễ tân trực 24/7. Phản hồi email trong vòng 2 giờ làm việc.</p></div>
      <div className="grid g4">
        {cards.map(([i, k, v, href]) => (
          <a key={k} href={href} className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none', color: 'var(--ink)' }}>
            <span className="ic"><Ico n={i} size={22} /></span><span style={{ minWidth: 0 }}><span className="k" style={{ display: 'block' }}>{k}</span><strong style={{ fontSize: 16 }}>{v}</strong></span>
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <form className="card" style={{ flex: '1.2 1 420px', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={submit} noValidate>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Gửi lời nhắn</h2>
          {sent && <div className="hold" style={{ margin: 0, background: '#E6F2EA', color: '#1E5235' }}><Ico n="checkCircle" />Cảm ơn bạn! Lời nhắn đã được gửi.</div>}
          <div className="grid g2" style={{ gap: '16px 20px' }}>
            <Field id="c1" label="Họ và tên *" error={show('name')}><input id="c1" className={'in' + (show('name') ? ' in-err' : '')} placeholder="Nguyễn Văn A" {...inp('name')} /></Field>
            <Field id="c2" label="Số điện thoại *" error={show('phone')}><input id="c2" className={'in' + (show('phone') ? ' in-err' : '')} inputMode="tel" placeholder="090 xxx xxxx" {...inp('phone')} /></Field>
            <Field id="c3" label="Email *" error={show('email')}><input id="c3" type="email" className={'in' + (show('email') ? ' in-err' : '')} placeholder="ban@email.com" {...inp('email')} /></Field>
            <Field id="c4" label="Chủ đề"><select id="c4" className="in" {...inp('topic')}>{['Đặt phòng', 'Thay đổi / huỷ phòng', 'Hoá đơn', 'Tổ chức sự kiện', 'Khác'].map(x => <option key={x}>{x}</option>)}</select></Field>
          </div>
          <Field id="c5" label="Mã đặt phòng (nếu có)"><input id="c5" className="in" placeholder="NST-XXXXXX" {...inp('code')} /></Field>
          <Field id="c6" label="Nội dung *" error={show('msg')}><textarea id="c6" className={'in' + (show('msg') ? ' in-err' : '')} rows={5} placeholder="Bạn cần hỗ trợ điều gì?" {...inp('msg')} /></Field>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}><span className="muted" style={{ fontSize: 13 }}>Chúng tôi chỉ dùng thông tin này để phản hồi bạn.</span><button type="submit" className="btn btn-p">Gửi lời nhắn</button></div>
        </form>
        <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ height: 250, background: '#EFE6D8', position: 'relative' }} role="img" aria-label="Bản đồ vị trí khách sạn">
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#E3D7C5 1px,transparent 1px),linear-gradient(90deg,#E3D7C5 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: 150, height: 22, background: '#fff', opacity: .8 }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 210, width: 18, background: '#fff', opacity: .8 }} />
              <div style={{ position: 'absolute', right: 0, top: 0, width: 150, height: 120, background: '#CFE0E6' }} />
              <div style={{ position: 'absolute', left: 196, top: 96, width: 46, height: 46, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: '#3B2416', border: '3px solid #C8955C' }} />
            </div>
            <div style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}><div><strong>The Nestro</strong><div className="muted" style={{ fontSize: 13, marginTop: 2 }}>[ĐỊA CHỈ KHÁCH SẠN]</div></div><a href="#" className="btn btn-q btn-sm">Chỉ đường</a></div>
          </div>
          <div className="card" style={{ padding: 22 }} id="faq">
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Câu hỏi thường gặp</h2>
            {FAQ.map((x, i) => (
              <div key={x.q}>
                <button className="faq" aria-expanded={open === i} style={{ borderBottom: i === FAQ.length - 1 && open !== i ? 0 : undefined }} onClick={() => setOpen(open === i ? -1 : i)}>{x.q}<span aria-hidden="true">{open === i ? '−' : '+'}</span></button>
                {open === i && <p className="muted" style={{ margin: '10px 0 12px', fontSize: 14, lineHeight: 1.6 }}>{x.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
