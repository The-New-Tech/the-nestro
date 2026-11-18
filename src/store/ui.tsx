import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

/* ---- Toast ---- */
interface ToastItem { id: number; msg: string; kind?: 'err'; action?: { label: string; run: () => void } }
const ToastCtx = createContext<(msg: string, opts?: Partial<Omit<ToastItem, 'id' | 'msg'>> & { ms?: number }) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

/* ---- Ngôn ngữ (VI mặc định; EN hiện áp dụng cho phần khung: menu, bước, nút chính) ---- */
type Lang = 'vi' | 'en'
const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (vi: string, en?: string) => string }>({ lang: 'vi', setLang() {}, t: v => v })
export const useLang = () => useContext(LangCtx)

export function UIProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)
  const push = useCallback((msg: string, o: Partial<Omit<ToastItem, 'id' | 'msg'>> & { ms?: number } = {}) => {
    const id = ++idRef.current
    setItems(a => [...a, { id, msg, kind: o.kind, action: o.action }])
    setTimeout(() => setItems(a => a.filter(x => x.id !== id)), o.ms ?? (o.action ? 15000 : 3200))
  }, [])
  const [lang, setLangS] = useState<Lang>(() => { try { return (localStorage.getItem('nestro.lang') as Lang) || 'vi' } catch { return 'vi' } })
  const setLang = useCallback((l: Lang) => { setLangS(l); try { localStorage.setItem('nestro.lang', l) } catch { /* */ } document.documentElement.lang = l }, [])
  const t = useCallback((vi: string, en?: string) => (lang === 'en' && en ? en : vi), [lang])
  const lv = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return (
    <LangCtx.Provider value={lv}>
      <ToastCtx.Provider value={push}>
        {children}
        <div className="toast-host" role="status" aria-live="polite">
          {items.map(i => (
            <div key={i.id} className={'toast' + (i.kind === 'err' ? ' toast-err' : '')}>
              <span>{i.msg}</span>
              {i.action && <button onClick={() => { i.action!.run(); setItems(a => a.filter(x => x.id !== i.id)) }}>{i.action.label}</button>}
            </div>
          ))}
        </div>
      </ToastCtx.Provider>
    </LangCtx.Provider>
  )
}

/* ---- PWA: cài đặt, offline, cập nhật ---- */
interface BIPEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
export function useInstall() {
  const [ev, setEv] = useState<BIPEvent | null>(null)
  const [installed, setInstalled] = useState(() => typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches)
  useEffect(() => {
    const on = (e: Event) => { e.preventDefault(); setEv(e as BIPEvent) }
    const done = () => { setInstalled(true); setEv(null) }
    window.addEventListener('beforeinstallprompt', on); window.addEventListener('appinstalled', done)
    return () => { window.removeEventListener('beforeinstallprompt', on); window.removeEventListener('appinstalled', done) }
  }, [])
  const ios = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent) && !installed
  return { canInstall: !!ev && !installed, ios, installed, install: async () => { if (!ev) return; await ev.prompt(); await ev.userChoice; setEv(null) } }
}
export function useOnline() {
  const [on, setOn] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine)
  useEffect(() => {
    const a = () => setOn(true), b = () => setOn(false)
    window.addEventListener('online', a); window.addEventListener('offline', b)
    return () => { window.removeEventListener('online', a); window.removeEventListener('offline', b) }
  }, [])
  return on
}
export function useCountdown(target: number | null) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { if (!target) return; setNow(Date.now()); const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i) }, [target])
  return target ? Math.max(0, Math.ceil((target - now) / 1000)) : 0
}
export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
