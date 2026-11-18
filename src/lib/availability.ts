import { addDays, hash01, todayKey } from './utils'
import { isHeldByOthers, findRoom, ROOMS } from '@/data/catalog'
import { isClosed } from './pricing'
import type { Db } from '@/store/types'

/** Một đêm (date) của phòng đã có người đặt chưa. Dữ liệu thật = db.bookings; thêm nhiễu giả lập để sơ đồ sinh động khi chưa có backend. */
export function isNightBooked(db: Db, roomNo: string, date: string, ignoreCode?: string) {
  if (db.bookings.some(b => b.roomNo === roomNo && b.status !== 'cancel' && b.code !== ignoreCode && b.checkIn <= date && date < b.checkOut)) return true
  if (date < todayKey()) return false
  return hash01(roomNo + date) < 0.1
}

export type RoomState = 'free' | 'booked' | 'held' | 'locked'
export function roomState(db: Db, roomNo: string, checkIn: string, checkOut: string, ignoreCode?: string): RoomState {
  if (db.roomOverrides[roomNo]?.locked) return 'locked'
  const type = db.roomOverrides[roomNo]?.type ?? findRoom(roomNo)?.type
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) {
    if (isNightBooked(db, roomNo, d, ignoreCode)) return 'booked'
    if (type && isClosed(db, type, d)) return 'locked'
  }
  return isHeldByOthers(roomNo) ? 'held' : 'free'
}

export function nightStatus(db: Db, roomNo: string, date: string, ignoreCode?: string): 'free' | 'sold' | 'past' {
  if (date < todayKey()) return 'past'
  const type = db.roomOverrides[roomNo]?.type ?? findRoom(roomNo)?.type
  if (isNightBooked(db, roomNo, date, ignoreCode) || (type && isClosed(db, type, date)) || db.roomOverrides[roomNo]?.locked) return 'sold'
  return 'free'
}

export const countFreeToday = (db: Db) => {
  const t = todayKey()
  return ROOMS.filter(r => !isNightBooked(db, r.no, t) && !db.roomOverrides[r.no]?.locked).length
}
