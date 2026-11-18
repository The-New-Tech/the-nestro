import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useToast, useInstall, useOnline } from '@/store/ui'
import { Ico } from './Icon'
import { asset } from '@/lib/utils'
import { useState } from 'react'

/** Toast "Có phiên bản mới", "Sẵn sàng dùng offline", banner cài đặt app, và thanh báo mất mạng */
export function PwaPrompt() {
  const toast = useToast()
  const online = useOnline()
  const { canInstall, ios, install } = useInstall()
  const [hidden, setHidden] = useState(() => { try { return sessionStorage.getItem('nestro.install.hide') === '1' } catch { return false } })
  const { needRefresh: [needRefresh], offlineReady: [offlineReady], updateServiceWorker } = useRegisterSW()
  useEffect(() => { if (offlineReady) toast('Ứng dụng đã sẵn sàng dùng khi mất mạng') }, [offlineReady, toast])
  useEffect(() => { if (needRefresh) toast('Có phiên bản mới của The Nestro', { action: { label: 'Cập nhật', run: () => updateServiceWorker(true) } }) }, [needRefresh, toast, updateServiceWorker])
  const hide = () => { setHidden(true); try { sessionStorage.setItem('nestro.install.hide', '1') } catch { /* */ } }
  return (
    <>
      {!online && <div className="offline-bar" role="alert" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300 }}>Bạn đang ngoại tuyến. Một số chức năng (thanh toán, tra cứu) cần kết nối mạng.</div>}
      {(canInstall || ios) && !hidden && (
        <div className="pwa-banner no-print" role="dialog" aria-label="Cài đặt ứng dụng">
          <img src={asset('icons/icon-96.png')} alt="" width={44} height={44} style={{ borderRadius: 10 }} />
          <div style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.4 }}>
            <strong style={{ fontSize: 14 }}>Cài The Nestro lên màn hình chính</strong>
            <div className="muted">{ios ? 'Bấm Chia sẻ rồi chọn "Thêm vào MH chính".' : 'Mở nhanh, dùng được khi mất mạng.'}</div>
          </div>
          {!ios && <button className="btn btn-p btn-sm" onClick={install}><Ico n="install" size={16} />Cài</button>}
          <button className="icon-btn" aria-label="Để sau" onClick={hide} style={{ background: 'transparent' }}><Ico n="close" size={18} /></button>
        </div>
      )}
    </>
  )
}
