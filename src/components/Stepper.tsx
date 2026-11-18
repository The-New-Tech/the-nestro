import { Ico } from './Icon'
import { useLang } from '@/store/ui'

const L: [string, string][] = [['Chọn phòng', 'Room'], ['Ngày & khách', 'Dates'], ['Thông tin', 'Details'], ['Thanh toán', 'Payment'], ['Xác nhận', 'Done']]
export function Stepper({ cur }: { cur: number }) {
  const { t } = useLang()
  return (
    <>
      <div className="stepper no-print" role="list" aria-label="Các bước đặt phòng">
        {L.map(([vi, en], i) => {
          const n = i + 1, done = n < cur, now = n === cur
          return (
            <div className="st" key={n} role="listitem" aria-current={now ? 'step' : undefined}>
              <div className="dot" style={{ background: done ? '#C8955C' : now ? '#3B2416' : '#fff', color: done ? '#2A1D14' : now ? '#FAF6EF' : '#6B5A4C', border: done || now ? 0 : '1.5px solid #D9CCBA' }}>
                {done ? <Ico n="check" size={16} sw={2.5} /> : n}
              </div>
              <span className="lb" style={{ fontWeight: now ? 600 : 500, color: now || done ? '#2A1D14' : '#6B5A4C' }}>{t(vi, en)}</span>
              {n < 5 && <div className="ln" style={{ background: done ? '#C8955C' : '#E8DFD2' }} />}
            </div>
          )
        })}
      </div>
      <div className="m-progress no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <strong>{t('Bước', 'Step')} {Math.min(cur, 5)}/5 · {t(L[Math.min(cur, 5) - 1][0], L[Math.min(cur, 5) - 1][1])}</strong>
          {cur < 5 && <span className="muted">{t('Tiếp', 'Next')}: {t(L[cur][0], L[cur][1])}</span>}
        </div>
        <div className="bars">{L.map((_, i) => <span key={i} style={{ background: i + 1 < cur ? '#C8955C' : i + 1 === cur ? '#3B2416' : undefined }} />)}</div>
      </div>
    </>
  )
}
