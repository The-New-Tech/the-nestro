import { useEffect, type ReactNode } from 'react'
import { Ico } from './Icon'

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-bg" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} style={wide ? { width: 'min(760px,100%)' } : undefined}>
        {title && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><h2 style={{ fontSize: 20, fontWeight: 600 }}>{title}</h2><button className="icon-btn" aria-label="Đóng" onClick={onClose} style={{ background: 'transparent' }}><Ico n="close" /></button></div>}
        {children}
      </div>
    </div>
  )
}
export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="sheet-bg" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}><div className="sheet-grip" />{children}</div>
    </div>
  )
}
export const Switch = ({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) => (
  <button type="button" role="switch" aria-checked={on} aria-label={label} className="tg" onClick={() => onChange(!on)} />
)
export const Pill = ({ bg, fg, dot, children }: { bg: string; fg: string; dot?: string; children: ReactNode }) => (
  <span className="pill" style={{ background: bg, color: fg }}>{dot && <i style={{ background: dot }} />}{children}</span>
)
export function Field({ id, label, req, hint, error, ok, children }: { id: string; label: string; req?: boolean; hint?: string; error?: string; ok?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="lbl" htmlFor={id}>{label} {req && <span className="req">*</span>}</label>
      {children}
      {error ? <div id={id + '-e'} className="hint hint-err"><Ico n="alert" size={15} />{error}</div>
        : ok ? <div className="hint hint-ok"><Ico n="check" size={15} sw={2.4} />Hợp lệ</div>
        : hint ? <div className="hint">{hint}</div> : null}
    </div>
  )
}
export function CopyBtn({ text, label = 'Sao chép', onDone, className = 'cp' }: { text: string; label?: string; onDone?: () => void; className?: string }) {
  return <button type="button" className={className} onClick={async () => { try { await navigator.clipboard.writeText(text) } catch { /* */ } onDone?.() }}>{label}</button>
}
export const BOOKING_STATUS: Record<string, { label: string; bg: string; fg: string; dot: string }> = {
  ok: { label: 'Đã xác nhận', bg: '#E6F2EA', fg: '#1E5235', dot: '#2F7D4F' },
  wait: { label: 'Chờ thanh toán', bg: '#FBEFD5', fg: '#6E470D', dot: '#B7791F' },
  in: { label: 'Đang ở', bg: '#E4ECF5', fg: '#1F3F66', dot: '#2C5F99' },
  out: { label: 'Đã trả phòng', bg: '#F3EADC', fg: '#4A3A2E', dot: '#8B5A2B' },
  cancel: { label: 'Đã huỷ', bg: '#ECEAE7', fg: '#5E5852', dot: '#8A847D' }
}
export const PAY_STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  paid: { label: 'Đã trả', bg: '#E6F2EA', fg: '#1E5235' },
  part: { label: 'Cọc 30%', bg: '#F3EADC', fg: '#4A3A2E' },
  none: { label: 'Chưa trả', bg: '#FBE9E7', fg: '#8C1D18' },
  ref: { label: 'Đã hoàn', bg: '#ECEAE7', fg: '#5E5852' }
}
