import { useState } from 'react'
import { Ico } from './Icon'
import { downloadIcs, googleCal } from '@/lib/ics'
import type { Booking } from '@/store/types'

export function CalendarMenu({ b }: { b: Booking }) {
  const [open, setOpen] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button className="btn btn-q" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}><Ico n="calPlus" />Thêm vào lịch<Ico n="chevDown" size={14} /></button>
      {open && (
        <div role="menu" className="card" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 20, padding: 6, minWidth: 220 }} onMouseLeave={() => setOpen(false)}>
          <a role="menuitem" className="act" style={{ textDecoration: 'none', color: 'inherit' }} href={googleCal(b)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Google Calendar</a>
          <button role="menuitem" className="act" onClick={() => { downloadIcs(b); setOpen(false) }}>Apple / Outlook (.ics)</button>
        </div>
      )}
    </span>
  )
}
