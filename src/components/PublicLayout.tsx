import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Ico } from './Icon'
import { useLang, useInstall } from '@/store/ui'
import { HOTLINE } from '@/data/catalog'
import { asset } from '@/lib/utils'
import { PwaPrompt } from './PwaPrompt'
import { useEffect } from 'react'

export function Brand() {
  return <Link to="/phong" className="brand" aria-label="The Nestro – trang chủ"><img src={asset('images/logo-160.png')} alt="" /><span>THE NESTRO</span></Link>
}
export function PublicLayout() {
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const { canInstall, install } = useInstall()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  const nav = [
    ['/phong', t('Phòng & Suite', 'Rooms & Suites')], ['/tien-ich', t('Tiện ích', 'Amenities')],
    ['/uu-dai', t('Ưu đãi', 'Offers')], ['/lien-he', t('Liên hệ', 'Contact')]
  ]
  const inBooking = loc.pathname.startsWith('/dat-phong')
  return (
    <div className="pub">
      <a href="#main" className="sr" style={{ position: 'absolute' }}>Bỏ qua điều hướng</a>
      <header className="pub-head no-print">
        <Brand />
        <nav className="pub-nav" aria-label="Điều hướng chính">
          {nav.map(([to, l]) => <NavLink key={to} to={to}>{l}</NavLink>)}
        </nav>
        <div className="pub-actions">
          <div className="lang hide-sm" role="group" aria-label="Ngôn ngữ">
            <button aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>VI</button>
            <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
          </div>
          <Link to="/tra-cuu" className="btn btn-q btn-sm hide-md" style={{ gap: 8 }}><Ico n="search" />{t('Tra cứu đặt phòng', 'Find booking')}</Link>
          <a href={`tel:${HOTLINE.replace(/\s/g, '')}`} className="icon-btn" aria-label={`Gọi hotline ${HOTLINE}`}><Ico n="phone" /></a>
          {!inBooking && <Link to="/dat-phong" className="btn btn-p btn-sm hide-sm">{t('Đặt phòng', 'Book now')}</Link>}
          <button className="icon-btn burger" aria-label="Mở menu" aria-expanded={open} onClick={() => setOpen(true)} style={{ background: 'transparent' }}><Ico n="menu" size={22} /></button>
        </div>
      </header>
      {open && (
        <>
          <div className="drawer-bg" onClick={() => setOpen(false)} />
          <div className="drawer" role="dialog" aria-label="Menu">
            <button className="icon-btn" aria-label="Đóng menu" onClick={() => setOpen(false)} style={{ alignSelf: 'flex-end', background: 'transparent' }}><Ico n="close" size={22} /></button>
            {nav.map(([to, l]) => <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>{l}</NavLink>)}
            <NavLink to="/tra-cuu" className={({ isActive }) => (isActive ? 'active' : '')}>{t('Tra cứu đặt phòng', 'Find booking')}</NavLink>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/dat-phong" className="btn btn-p btn-block">{t('Đặt phòng', 'Book now')}</Link>
              {canInstall && <button className="btn btn-q btn-block" onClick={install}><Ico n="install" />Cài ứng dụng</button>}
              <div className="lang" style={{ alignSelf: 'flex-start' }}>
                <button aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>VI</button>
                <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
              </div>
            </div>
          </div>
        </>
      )}
      <main id="main" className="pub-main"><Outlet /></main>
      <footer className="pub-foot no-print">
        <div><div style={{ font: '600 15px var(--mono)', letterSpacing: '.3em' }}>THE NESTRO</div><p style={{ fontSize: 14, color: '#E9DCCB', lineHeight: 1.6, marginTop: 12, maxWidth: 340 }}>[ĐỊA CHỈ KHÁCH SẠN]<br />Hotline {HOTLINE} · [EMAIL]</p>
          {canInstall && <button className="btn btn-g btn-sm" style={{ marginTop: 14 }} onClick={install}><Ico n="install" size={16} />Cài ứng dụng</button>}</div>
        <div><h4>Khám phá</h4><Link className="fl" to="/phong">Phòng &amp; Suite</Link><Link className="fl" to="/tien-ich">Tiện ích</Link><Link className="fl" to="/uu-dai">Ưu đãi</Link></div>
        <div><h4>Hỗ trợ</h4><Link className="fl" to="/lien-he">Liên hệ</Link><Link className="fl" to="/lien-he#faq">Chính sách huỷ</Link><Link className="fl" to="/lien-he#faq">Câu hỏi thường gặp</Link><Link className="fl" to="/tra-cuu">Tra cứu đặt phòng</Link></div>
        <div><h4>Theo dõi</h4><a className="fl" href="#">Facebook</a><a className="fl" href="#">Instagram</a><a className="fl" href="#">Zalo OA</a><Link className="fl" to="/admin" style={{ marginTop: 8, opacity: .6 }}>Quản trị</Link></div>
      </footer>
      <PwaPrompt />
    </div>
  )
}
