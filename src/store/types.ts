import type { RoomType } from '@/data/catalog'

export type BookingStatus = 'wait' | 'ok' | 'in' | 'out' | 'cancel'
export type PayStatus = 'paid' | 'part' | 'none' | 'ref'
export type Channel = 'Website' | 'Điện thoại' | 'Tại quầy' | 'Đối tác'

export interface GuestInfo {
  name: string; phone: string; email: string
  idType: 'CCCD' | 'Hộ chiếu'; idNo: string; nationality: string; eta: string
}
export interface PriceLine { label: string; amount: number; kind?: 'room' | 'extra' | 'fee' | 'vat' | 'discount' }
export interface Quote {
  nights: { date: string; label: string; price: number; weekend: boolean }[]
  roomTotal: number; early: number; late: number; addons: number
  base: number; fee: number; vat: number; discount: number; total: number
  promoCode?: string; promoNote?: string
}
export interface Booking {
  code: string; createdAt: string; paidAt?: string
  status: BookingStatus; pay: PayStatus; channel: Channel; method: string
  roomNo: string; roomType: RoomType; floor: number
  checkIn: string; checkOut: string; checkInTime: string; checkOutTime: string
  adults: number; children: number; childAges: number[]
  guest: GuestInfo; requests: string[]; note: string
  addons: string[]
  quote: Quote; paid: number
  confirmedRequest?: boolean
}
export type OfferKind = 'percent' | 'fixed' | 'freeNight' | 'gift'
export interface Offer {
  code: string; tag: string; title: string; desc: string; cond: string; valid: string
  valueLabel: string; kind: OfferKind; value: number; cap?: number
  minNights: number; types: RoomType[]; limit: number; used: number; on: boolean; visible: boolean
  validFrom?: string; validTo?: string; advanceDays?: number; sameDay?: boolean
}
export interface StaffMember {
  ini: string; name: string; mail: string; role: string; scope: string
  twofa: boolean; st: 'on' | 'shift' | 'invite' | 'lock'; last: string
}
export interface TypeConfig { price: number; weekend: number; extraPerson: number; minNights: number; visible: boolean; hidden?: boolean }
export interface RoomOverride { type?: RoomType; locked?: boolean; price?: number; area?: string; shape?: 'rect' | 'poly' }
export interface GuestRecord {
  ini: string; name: string; phone: string; email: string; tier: 'Kim cương' | 'Vàng' | 'Bạc' | 'Khách lẻ'
  stays: number; nights: number; last: number; spend: number; note: string; prefs: string[]
}
export interface Db {
  v: number
  bookings: Booking[]
  offers: Offer[]
  roomOverrides: Record<string, RoomOverride>
  typeConfig: Record<RoomType, TypeConfig>
  /** giá riêng theo ngày: số = giá, 'closed' = đóng bán */
  dayPrices: Record<RoomType, Record<string, number | 'closed'>>
  staff: StaffMember[]
  roles: Record<string, number>
  guestNotes: Record<string, string>
}
