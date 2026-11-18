import type { Booking } from '@/store/types'
const compact = (k: string, t: string) => k.replace(/-/g, '') + 'T' + t.replace(':', '') + '00'
export function icsOf(b: Booking) {
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The Nestro//VI', 'BEGIN:VEVENT',
    `UID:${b.code}@thenestro`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${compact(b.checkIn, b.checkInTime)}`, `DTEND:${compact(b.checkOut, b.checkOutTime)}`,
    `SUMMARY:Lưu trú The Nestro · ${b.roomType} ${b.roomNo}`, `DESCRIPTION:Mã đặt phòng ${b.code}`, 'LOCATION:The Nestro', 'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n')
}
export function downloadIcs(b: Booking) {
  const url = URL.createObjectURL(new Blob([icsOf(b)], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = `${b.code}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export const googleCal = (b: Booking) =>
  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Lưu trú The Nestro · ${b.roomType} ${b.roomNo}`)}&dates=${compact(b.checkIn, b.checkInTime)}/${compact(b.checkOut, b.checkOutTime)}&details=${encodeURIComponent('Mã đặt phòng ' + b.code)}`
const KEY = 'nestro.verified'
export const verified = (code: string) => { try { return (JSON.parse(sessionStorage.getItem(KEY) || '[]') as string[]).includes(code) } catch { return false } }
export const markVerified = (code: string) => { try { const a = JSON.parse(sessionStorage.getItem(KEY) || '[]') as string[]; if (!a.includes(code)) sessionStorage.setItem(KEY, JSON.stringify([...a, code])) } catch { /* */ } }
