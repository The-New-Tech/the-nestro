import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { addDays, todayKey } from '@/lib/utils'
import { HOLD_MINUTES, findRoom } from '@/data/catalog'
import { quote, validatePromo } from '@/lib/pricing'
import { useDb } from './db'
import type { Quote } from './types'

export interface Flow {
  floor: number; roomNo: string | null
  checkIn: string; checkOut: string; checkInTime: string; checkOutTime: string
  adults: number; children: number; childAges: number[]
  name: string; phone: string; email: string; idType: 'CCCD' | 'Hộ chiếu'; idNo: string; nationality: string; eta: string
  requests: string[]; note: string; forOthers: boolean; agree: boolean
  promo: string; vatInvoice: boolean; company: string; taxCode: string; deposit: boolean
  tab: 'qr' | 'card'; wallet: 'VietQR' | 'MoMo' | 'ZaloPay'
  addons: string[]
  holdUntil: number | null
  doneCode: string | null
  pendingCode: string | null
}
const KEY = 'nestro.flow.v1'
const init = (): Flow => ({
  floor: 6, roomNo: null,
  checkIn: addDays(todayKey(), 2), checkOut: addDays(todayKey(), 5), checkInTime: '14:00', checkOutTime: '12:00',
  adults: 2, children: 0, childAges: [],
  name: '', phone: '', email: '', idType: 'CCCD', idNo: '', nationality: 'Việt Nam', eta: '14:00 – 15:00',
  requests: [], note: '', forOthers: false, agree: false,
  promo: '', vatInvoice: false, company: '', taxCode: '', deposit: false,
  tab: 'qr', wallet: 'VietQR', addons: [], holdUntil: null, doneCode: null, pendingCode: null
})
function load(): Flow {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const f = { ...init(), ...JSON.parse(raw) } as Flow
      if (f.checkIn < todayKey()) { f.checkIn = addDays(todayKey(), 2); f.checkOut = addDays(todayKey(), 5); f.roomNo = null; f.holdUntil = null }
      return f
    }
  } catch { /* ignore */ }
  return init()
}

interface Ctx {
  flow: Flow; patch: (p: Partial<Flow>) => void; reset: () => void
  quote: Quote | null; promoError: string | null; nights: number
  pickRoom: (no: string) => void; holdLeft: number
}
const FlowCtx = createContext<Ctx>(null!)
export const useFlow = () => useContext(FlowCtx)

export function FlowProvider({ children }: { children: ReactNode }) {
  const [flow, setFlow] = useState<Flow>(load)
  const db = useDb()
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(flow)) } catch { /* ignore */ } }, [flow])
  const patch = useCallback((p: Partial<Flow>) => setFlow(f => ({ ...f, ...p })), [])
  const reset = useCallback(() => setFlow(init()), [])
  const pickRoom = useCallback((no: string) => patch({ roomNo: no, holdUntil: Date.now() + HOLD_MINUTES * 60_000 }), [patch])

  const nights = Math.max(0, Math.round((new Date(flow.checkOut).getTime() - new Date(flow.checkIn).getTime()) / 86400000))
  const [tick, setTick] = useState(Date.now())
  useEffect(() => { if (!flow.holdUntil) return; const i = setInterval(() => setTick(Date.now()), 1000); return () => clearInterval(i) }, [flow.holdUntil])
  const holdLeft = flow.holdUntil ? Math.max(0, Math.floor((flow.holdUntil - tick) / 1000)) : 0

  const { q, promoError } = useMemo(() => {
    if (!flow.roomNo || nights < 1) return { q: null, promoError: null }
    const type = db.roomOverrides[flow.roomNo]?.type ?? findRoom(flow.roomNo)?.type ?? 'Standard'
    let promo = flow.promo
    let err: string | null = null
    if (promo) {
      const v = validatePromo(db, promo, { checkIn: flow.checkIn, checkOut: flow.checkOut, type, nights })
      if (!v.ok) { err = v.reason; promo = '' }
    }
    return { q: quote(db, { roomNo: flow.roomNo, checkIn: flow.checkIn, checkOut: flow.checkOut, checkInTime: flow.checkInTime, checkOutTime: flow.checkOutTime, adults: flow.adults, children: flow.children, addons: flow.addons, promo }), promoError: err }
  }, [db, flow, nights])

  const value = useMemo(() => ({ flow, patch, reset, quote: q, promoError, nights, pickRoom, holdLeft }), [flow, patch, reset, q, promoError, nights, pickRoom, holdLeft])
  return <FlowCtx.Provider value={value}>{children}</FlowCtx.Provider>
}
