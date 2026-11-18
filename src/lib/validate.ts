export const vName = (s: string) => (s.trim().split(/\s+/).filter(Boolean).length >= 2 && s.trim().length >= 4 ? '' : 'Nhập họ và tên đầy đủ')
export const vPhone = (s: string, cc = '+84') => {
  const d = s.replace(/[\s.-]/g, '')
  if (!/^\d+$/.test(d)) return 'Số điện thoại chỉ gồm chữ số'
  if (cc === '+84') return /^0\d{9}$/.test(d) ? '' : 'Số điện thoại cần đủ 10 chữ số (bắt đầu bằng 0)'
  return d.length >= 7 && d.length <= 13 ? '' : 'Số điện thoại chưa hợp lệ'
}
export const vEmail = (s: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim()) ? '' : 'Email chưa đúng định dạng')
export const vId = (s: string, type: 'CCCD' | 'Hộ chiếu') => {
  const d = s.replace(/\s/g, '')
  return type === 'CCCD' ? (/^\d{12}$/.test(d) ? '' : 'CCCD cần đủ 12 chữ số') : /^[A-Za-z0-9]{6,9}$/.test(d) ? '' : 'Số hộ chiếu gồm 6–9 ký tự'
}
export const luhn = (num: string) => {
  const d = num.replace(/\s/g, '')
  if (!/^\d{13,19}$/.test(d)) return false
  let s = 0, alt = false
  for (let i = d.length - 1; i >= 0; i--) { let n = Number(d[i]); if (alt) { n *= 2; if (n > 9) n -= 9 } s += n; alt = !alt }
  return s % 10 === 0
}
export const vExp = (s: string) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(s)
  if (!m) return 'Nhập MM/YY'
  const mo = Number(m[1]), yr = 2000 + Number(m[2])
  if (mo < 1 || mo > 12) return 'Tháng không hợp lệ'
  const now = new Date()
  return yr > now.getFullYear() || (yr === now.getFullYear() && mo >= now.getMonth() + 1) ? '' : 'Thẻ đã hết hạn'
}
