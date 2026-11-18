import { useSyncExternalStore } from 'react'
import { seedDb, SEED_VERSION } from '@/data/seed'
import type { Db } from './types'

const KEY = 'nestro.db.v1'
function load(): Db {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) { const d = JSON.parse(raw) as Db; if (d.v === SEED_VERSION) return d }
  } catch { /* localStorage có thể bị chặn */ }
  return seedDb()
}
let state: Db = load()
const subs = new Set<() => void>()
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* bỏ qua */ } }

export const db = {
  get: () => state,
  set(fn: (d: Db) => Db | void) {
    const next = structuredClone(state)
    state = fn(next) ?? next
    persist(); subs.forEach(s => s())
  },
  reset() { state = seedDb(); persist(); subs.forEach(s => s()) },
  subscribe(cb: () => void) { subs.add(cb); return () => subs.delete(cb) }
}
// đồng bộ giữa các tab
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => { if (e.key === KEY) { state = load(); subs.forEach(s => s()) } })
}
export const useDb = () => useSyncExternalStore(db.subscribe, db.get, db.get)
