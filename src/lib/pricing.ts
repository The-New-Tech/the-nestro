import { TYPES, EARLY_CHECKIN_FEE, LATE_CHECKOUT_FEE, FEE_RATE, VAT_RATE, ADDONS, findRoom, type RoomType } from '@/data/catalog'
import { addDays, diffDays, dowShort, fmtDM, isWeekendNight, parseKey, todayKey } from './utils'
import type { Db, Offer, Quote } from '@/store/types'

export function nightPrice(db: Db, type: RoomType, date: string, roomNo?: string) {
  const day = db.dayPrices[type]?.[date]
  if (typeof day === 'number') return day
  const cfg = db.typeConfig[type]
  const ov = roomNo ? db.roomOverrides[roomNo]?.price : undefined
  if (ov) return ov
  return isWeekendNight(date) ? cfg.weekend : cfg.price
}
export const isClosed = (db: Db, type: RoomType, date: string) => db.dayPrices[type]?.[date] === 'closed'

export interface QuoteInput {
  roomNo: string; checkIn: string; checkOut: string
  checkInTime?: string; checkOutTime?: string
  adults?: number; children?: number
  addons?: string[]; promo?: string
}

export function validatePromo(db: Db, code: string, inp: { checkIn: string; checkOut: string; type: RoomType; nights: number }): { ok: true; offer: Offer } | { ok: false; reason: string } {
  const offer = db.offers.find(o => o.code.toUpperCase() === code.trim().toUpperCase())
  if (!offer) return { ok: false, reason: 'Mã không tồn tại' }
  if (!offer.on) return { ok: false, reason: 'Mã đã tạm dừng hoặc hết hiệu lực' }
  if (offer.limit && offer.used >= offer.limit) return { ok: false, reason: 'Mã đã hết lượt sử dụng' }
  if (offer.validTo && inp.checkOut > addDays(offer.validTo, 1)) return { ok: false, reason: 'Ngày lưu trú nằm ngoài thời gian áp dụng' }
  if (offer.validFrom && inp.checkIn < offer.validFrom) return { ok: false, reason: 'Ngày lưu trú nằm ngoài thời gian áp dụng' }
  if (inp.nights < offer.minNights) return { ok: false, reason: `Chỉ áp dụng cho đơn từ ${offer.minNights} đêm` }
  if (offer.types.length && !offer.types.includes(inp.type)) return { ok: false, reason: `Chỉ áp dụng cho ${offer.types.join(', ')}` }
  if (offer.advanceDays && diffDays(todayKey(), inp.checkIn) < offer.advanceDays) return { ok: false, reason: `Cần đặt trước ${offer.advanceDays} ngày` }
  if (offer.sameDay && inp.checkIn !== todayKey()) return { ok: false, reason: 'Chỉ áp dụng khi nhận phòng trong ngày' }
  return { ok: true, offer }
}

export function quote(db: Db, inp: QuoteInput): Quote {
  const room = findRoom(inp.roomNo)
  const type = db.roomOverrides[inp.roomNo]?.type ?? room?.type ?? 'Standard'
  const n = Math.max(0, diffDays(inp.checkIn, inp.checkOut))
  const nights = Array.from({ length: n }, (_, i) => {
    const date = addDays(inp.checkIn, i)
    const weekend = isWeekendNight(date)
    return { date, weekend, price: nightPrice(db, type, date, inp.roomNo), label: `${dowShort(date)} ${fmtDM(date)}${weekend ? ' · cuối tuần' : ''}` }
  })
  const roomTotal = nights.reduce((s, x) => s + x.price, 0)
  const early = inp.checkInTime === '12:00' ? EARLY_CHECKIN_FEE : 0
  const late = inp.checkOutTime === '14:00' ? LATE_CHECKOUT_FEE : 0
  const guests = (inp.adults ?? 2) + (inp.children ?? 0)
  const addons = (inp.addons ?? []).reduce((s, id) => {
    const a = ADDONS.find(x => x.id === id)
    if (!a) return s
    if (id === 'latecheckout') return s + (late ? 0 : a.price)
    return s + a.price * (a.perPerson ? (id === 'breakfast' ? guests * n : guests) : 1)
  }, 0)
  const base = roomTotal + early + late + addons
  const fee = Math.round(base * FEE_RATE)
  const vat = Math.round((base + fee) * VAT_RATE)
  let discount = 0
  let promoNote: string | undefined
  let promoCode: string | undefined
  if (inp.promo) {
    const v = validatePromo(db, inp.promo, { checkIn: inp.checkIn, checkOut: inp.checkOut, type, nights: n })
    if (v.ok) {
      const o = v.offer
      promoCode = o.code
      if (o.kind === 'percent') discount = Math.min(Math.round(roomTotal * o.value / 100), o.cap || Infinity)
      else if (o.kind === 'fixed') discount = Math.min(o.value, roomTotal)
      else if (o.kind === 'freeNight') discount = nights.length ? Math.min(...nights.map(x => x.price)) : 0
      promoNote = o.kind === 'gift' ? o.title : `Đã áp dụng: ${o.title}`
    }
  }
  return { nights, roomTotal, early, late, addons, base, fee, vat, discount, total: base + fee + vat - discount, promoCode, promoNote }
}

export const monthRange = (k: string) => { const d = parseKey(k); return { y: d.getFullYear(), m: d.getMonth() } }
