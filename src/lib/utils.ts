export const fmt = (n: number) => Math.round(n).toLocaleString('vi-VN')
export const fmtVnd = (n: number) => fmt(n) + ' ₫'
/** 1850000 -> "1,85tr" */
export const fmtShort = (n: number) => (n / 1e6).toFixed(2).replace(/0$/, '').replace(/\.0$/, '').replace('.', ',') + 'tr'

const pad = (n: number) => String(n).padStart(2, '0')
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (k: string, n: number) => { const d = parseKey(k); d.setDate(d.getDate() + n); return dateKey(d) }
export const todayKey = () => dateKey(new Date())
export const diffDays = (a: string, b: string) => Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 86400000)
export const fmtDM = (k: string) => { const d = parseKey(k); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` }
export const fmtDMY = (k: string) => { const d = parseKey(k); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` }
const DOW_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const DOW_LONG = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
export const dowShort = (k: string) => DOW_SHORT[parseKey(k).getDay()]
export const dowLong = (k: string) => DOW_LONG[parseKey(k).getDay()]
/** Đêm thứ Sáu & thứ Bảy tính giá cuối tuần */
export const isWeekendNight = (k: string) => { const g = parseKey(k).getDay(); return g === 5 || g === 6 }
export const fmtTime = (iso: string) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` }
export const monthTitle = (y: number, m: number) => `Tháng ${m + 1}, ${y}`

/** Hash ổn định -> [0,1) để mô phỏng tình trạng phòng khi chưa có backend */
export function hash01(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return ((h >>> 0) % 100000) / 100000
}

export function genCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]
  return 'NST-' + s
}
export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')
export const initials = (name: string) => {
  const p = name.trim().split(/\s+/)
  return ((p[p.length - 2]?.[0] ?? '') + (p[p.length - 1]?.[0] ?? '')).toUpperCase() || name.slice(0, 2).toUpperCase()
}
export const maskEmail = (e: string) => e.replace(/^(.{1,4}).*(@.*)$/, '$1•••$2')
export const maskPhone = (p: string) => { const d = p.replace(/\D/g, ''); return d.length >= 7 ? `${d.slice(0, 3)} ••• ${d.slice(-4)}` : p }

/** Huỷ miễn phí đến 14:00 ngày (nhận phòng − 2 ngày) */
export const freeCancelDate = (checkIn: string) => addDays(checkIn, -2)
export const freeCancelText = (checkIn: string) => `Miễn phí huỷ trước 14:00 ngày ${fmtDM(freeCancelDate(checkIn))}`

/** Đường dẫn tới file trong /public, đúng cả khi deploy ở sub-path (GitHub Pages: /ten-repo/) */
export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, '')
