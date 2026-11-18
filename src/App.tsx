import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/PublicLayout'
import { FlowProvider } from '@/store/flow'
import { UIProvider } from '@/store/ui'
import Step1Map from '@/pages/booking/Step1Map'
import Step2Dates from '@/pages/booking/Step2Dates'
import Step3Guest from '@/pages/booking/Step3Guest'
import Step4Payment from '@/pages/booking/Step4Payment'
import Step5Done from '@/pages/booking/Step5Done'
import Rooms from '@/pages/public/Rooms'
import Amenities from '@/pages/public/Amenities'
import Offers from '@/pages/public/Offers'
import Contact from '@/pages/public/Contact'
import Lookup from '@/pages/public/Lookup'
import BookingDetail from '@/pages/public/BookingDetail'

// Khu quản trị tách chunk riêng để khách không phải tải
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const Bookings = lazy(() => import('@/pages/admin/Bookings'))
const FloorBuilder = lazy(() => import('@/pages/admin/FloorBuilder'))
const RoomsPricing = lazy(() => import('@/pages/admin/RoomsPricing'))
const AdminOffers = lazy(() => import('@/pages/admin/AdminOffers'))
const Guests = lazy(() => import('@/pages/admin/Guests'))
const Reports = lazy(() => import('@/pages/admin/Reports'))
const Settings = lazy(() => import('@/pages/admin/Settings'))
const Staff = lazy(() => import('@/pages/admin/Staff').then(m => ({ default: m.Staff })))
const Roles = lazy(() => import('@/pages/admin/Staff').then(m => ({ default: m.Roles })))

const Loading = () => <div style={{ display: 'grid', placeItems: 'center', minHeight: '50vh' }}><span className="spin" style={{ borderColor: '#E8DFD2', borderTopColor: '#3B2416', width: 28, height: 28 }} /></div>

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <UIProvider>
        <FlowProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<Navigate to="/phong" replace />} />
                <Route path="phong" element={<Rooms />} />
                <Route path="tien-ich" element={<Amenities />} />
                <Route path="uu-dai" element={<Offers />} />
                <Route path="lien-he" element={<Contact />} />
                <Route path="dat-phong" element={<Step1Map />} />
                <Route path="dat-phong/ngay" element={<Step2Dates />} />
                <Route path="dat-phong/thong-tin" element={<Step3Guest />} />
                <Route path="dat-phong/thanh-toan" element={<Step4Payment />} />
                <Route path="dat-phong/xac-nhan" element={<Step5Done />} />
                <Route path="tra-cuu" element={<Lookup />} />
                <Route path="tra-cuu/:code" element={<BookingDetail />} />
              </Route>
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dat-phong" element={<Bookings />} />
                <Route path="so-do-tang" element={<FloorBuilder />} />
                <Route path="phong-gia" element={<RoomsPricing />} />
                <Route path="uu-dai" element={<AdminOffers />} />
                <Route path="khach-hang" element={<Guests />} />
                <Route path="bao-cao" element={<Reports />} />
                <Route path="nhan-vien" element={<Staff />} />
                <Route path="vai-tro" element={<Roles />} />
                <Route path="cai-dat" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/phong" replace />} />
            </Routes>
          </Suspense>
        </FlowProvider>
      </UIProvider>
    </BrowserRouter>
  )
}
