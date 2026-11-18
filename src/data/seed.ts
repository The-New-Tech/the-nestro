import { addDays, todayKey } from '@/lib/utils'
import { TYPES, type RoomType } from './catalog'
import type { Booking, Db, GuestRecord, Offer, StaffMember, BookingStatus, PayStatus, Channel } from '@/store/types'
import { quote } from '@/lib/pricing'

export const SEED_VERSION = 2

const ALL: RoomType[] = []
export const seedOffers = (): Offer[] => [
  { code: 'NESTRO10', tag: 'Ưu đãi nổi bật', title: 'Giảm 300.000 ₫ cho kỳ nghỉ từ 2 đêm', desc: 'Áp dụng cho mọi hạng phòng, lưu trú từ nay đến 31/12/2026. Nhập mã ở bước thanh toán.', cond: 'Mọi hạng phòng · từ 2 đêm', valid: 'đến 31/12/2026', valueLabel: '−300.000 ₫', kind: 'fixed', value: 300000, minNights: 2, types: ALL, limit: 500, used: 128, on: true, visible: true, validTo: '2026-12-31' },
  { code: 'EARLY15', tag: 'Đặt sớm', title: 'Đặt trước 30 ngày', desc: 'Lên kế hoạch sớm, nhận giá tốt nhất cho mọi hạng phòng.', cond: 'Thanh toán trước 100% · Không hoàn huỷ', valid: 'đến 31/03/2027', valueLabel: '−15%', kind: 'percent', value: 15, minNights: 1, types: ALL, limit: 0, used: 64, on: true, visible: true, validTo: '2027-03-31', advanceDays: 30 },
  { code: 'STAY3PAY2', tag: 'Lưu trú dài', title: 'Đêm thứ 3 miễn phí', desc: 'Ở 3 đêm liên tiếp, chỉ trả tiền 2 đêm. Áp dụng Deluxe trở lên.', cond: 'Deluxe trở lên · T2–T5', valid: 'đến 20/12/2026', valueLabel: 'Ở 3 trả 2', kind: 'freeNight', value: 1, minNights: 3, types: ['Deluxe', 'Family', 'Suite'], limit: 100, used: 21, on: true, visible: true, validTo: '2026-12-20' },
  { code: 'SPAESCAPE', tag: 'Combo', title: 'Nghỉ dưỡng & Spa', desc: '2 đêm Deluxe kèm 2 suất massage 60 phút và bữa tối cho 2 người.', cond: 'Cho 2 khách · Đặt spa trước 24 giờ', valid: 'đến 31/12/2026', valueLabel: '−20%', kind: 'percent', value: 20, minNights: 2, types: ['Deluxe', 'Family', 'Suite'], limit: 150, used: 37, on: true, visible: true, validTo: '2026-12-31' },
  { code: 'FAMILYFUN', tag: 'Gia đình', title: 'Gia đình vui vẻ', desc: 'Bé dưới 12 tuổi miễn phí ăn sáng và Kids Club khi ở phòng Family.', cond: 'Tối đa 2 bé / phòng', valid: 'Quanh năm', valueLabel: 'Bé miễn phí', kind: 'gift', value: 0, minNights: 1, types: ['Family'], limit: 0, used: 52, on: true, visible: true },
  { code: 'TONIGHT20', tag: 'Phút chót', title: 'Đặt trong ngày', desc: 'Giá đặc biệt cho phòng còn trống tối nay, số lượng có hạn.', cond: 'Nhận phòng trong ngày đặt', valid: 'Mỗi ngày từ 16:00', valueLabel: '−20%', kind: 'percent', value: 20, minNights: 1, types: ALL, limit: 0, used: 40, on: true, visible: true, sameDay: true },
  { code: 'LOVENEST', tag: 'Kỷ niệm', title: 'Trăng mật & kỷ niệm', desc: 'Trang trí phòng, bánh kem và rượu vang chào mừng.', cond: 'Từ 2 đêm · Báo trước 48 giờ', valid: 'Quanh năm', valueLabel: 'Quà tặng', kind: 'gift', value: 0, minNights: 2, types: ALL, limit: 0, used: 18, on: true, visible: true },
  { code: 'SUMMER26', tag: 'Hè', title: 'Hè rực rỡ', desc: 'Đã kết thúc.', cond: 'Đã kết thúc', valid: '01/06 – 31/08/2026', valueLabel: '−25%', kind: 'percent', value: 25, minNights: 1, types: ALL, limit: 300, used: 300, on: false, visible: false, validTo: '2026-08-31' }
]

type S = [code: string, name: string, phone: string, email: string, room: string, type: RoomType, ci: number, nights: number, ch: Channel, pay: PayStatus, st: BookingStatus, ago: number]
const SB: S[] = [
  ['NST-8K2Q7M', 'Nguyễn Minh Anh', '0901234567', 'minhanh@gmail.com', '502', 'Deluxe', 2, 3, 'Website', 'paid', 'ok', 0],
  ['NST-3H9D1P', 'Trần Quốc Bảo', '0912302210', 'baotran@outlook.com', '601', 'Suite', 0, 3, 'Website', 'paid', 'in', 3],
  ['NST-7Z4L2C', 'Lê Thu Hà', '0987307731', 'thuha@gmail.com', '514', 'Family', 3, 3, 'Điện thoại', 'part', 'ok', 1],
  ['NST-5R8W6N', 'Phạm Gia Huy', '0933101048', 'huypg@yahoo.com', '510', 'Standard', 1, 1, 'Website', 'none', 'wait', 0],
  ['NST-2K6T9V', 'Vũ Ngọc Lan', '0975505582', 'lanvu@gmail.com', '511', 'Deluxe', 4, 3, 'Tại quầy', 'paid', 'ok', 2],
  ['NST-9M1B3F', 'Đỗ Hoàng Nam', '0963303394', 'namdh@gmail.com', '501', 'Standard', -1, 2, 'Website', 'paid', 'in', 5],
  ['NST-4J7E5Q', 'Hoàng Mai Chi', '0946606620', 'chihm@gmail.com', '505', 'Suite', 6, 2, 'Website', 'none', 'wait', 0],
  ['NST-6P2H8S', 'Bùi Đức Thịnh', '0351709017', 'thinhbd@gmail.com', '504', 'Deluxe', 2, 1, 'Website', 'ref', 'cancel', 2],
  ['NST-1C5M4X', 'Ngô Khánh Linh', '0864404412', 'linhnk@gmail.com', '307', 'Standard', 0, 2, 'Đối tác', 'paid', 'ok', 4],
  ['NST-8D3V6B', 'Lương Gia Bảo', '0904118833', 'baolg@gmail.com', '412', 'Standard', 0, 1, 'Website', 'paid', 'in', 1]
]
function mkBooking([code, name, phone, email, room, type, ci, nights, ch, pay, st, ago]: S, db0: Db): Booking {
  const t = todayKey()
  const checkIn = addDays(t, ci), checkOut = addDays(checkIn, nights)
  const q = quote(db0, { roomNo: room, checkIn, checkOut, promo: code === 'NST-8K2Q7M' ? 'NESTRO10' : undefined, adults: 2, children: code === 'NST-8K2Q7M' ? 1 : 0, addons: code === 'NST-8K2Q7M' ? ['latecheckout'] : [] })
  const created = new Date(Date.now() - ago * 86400000 - 3 * 3600000).toISOString()
  return {
    code, createdAt: created, paidAt: pay === 'paid' ? new Date(new Date(created).getTime() + 240000).toISOString() : undefined,
    status: st, pay, channel: ch, method: pay === 'none' ? '—' : 'VietQR',
    roomNo: room, roomType: type, floor: Number(room[0]),
    checkIn, checkOut, checkInTime: '14:00', checkOutTime: code === 'NST-8K2Q7M' ? '14:00' : '12:00',
    adults: 2, children: code === 'NST-8K2Q7M' ? 1 : 0, childAges: code === 'NST-8K2Q7M' ? [6] : [],
    guest: { name, phone, email, idType: 'CCCD', idNo: '079203004518', nationality: 'Việt Nam', eta: '14:00 – 15:00' },
    requests: code === 'NST-8K2Q7M' ? ['Tầng cao, yên tĩnh', 'Đón sân bay'] : [],
    note: code === 'NST-8K2Q7M' ? 'Chuyến bay VN 1234 hạ cánh lúc 12:30, nhờ khách sạn đón giúp.' : '',
    addons: code === 'NST-8K2Q7M' ? ['latecheckout'] : [],
    quote: q, paid: pay === 'paid' ? q.total : pay === 'part' ? Math.round(q.total * 0.3) : 0, confirmedRequest: code === 'NST-8K2Q7M'
  }
}

export const seedStaff = (): StaffMember[] => [
  { ini: 'GĐ', name: 'Giám đốc khách sạn', mail: 'gd@thenestro.vn', role: 'Quản trị', scope: 'Toàn khách sạn', twofa: true, st: 'shift', last: 'Hôm nay 13:40' },
  { ini: 'TL', name: 'Trần Thị Lan', mail: 'lan@thenestro.vn', role: 'Quản lý', scope: 'Toàn khách sạn', twofa: true, st: 'shift', last: 'Hôm nay 07:55' },
  { ini: 'MH', name: 'Lê Minh Hiếu', mail: 'hieu@thenestro.vn', role: 'Lễ tân', scope: 'Ca sáng · Sảnh', twofa: true, st: 'shift', last: 'Hôm nay 06:02' },
  { ini: 'PT', name: 'Phạm Thanh Thảo', mail: 'thao@thenestro.vn', role: 'Lễ tân', scope: 'Ca chiều · Sảnh', twofa: true, st: 'on', last: 'Hôm qua 22:10' },
  { ini: 'VK', name: 'Võ Đăng Khoa', mail: 'khoa@thenestro.vn', role: 'Doanh thu', scope: 'Toàn khách sạn', twofa: true, st: 'on', last: 'Hôm qua 17:15' },
  { ini: 'NA', name: 'Ngô Phương Anh', mail: 'anh@thenestro.vn', role: 'Marketing', scope: 'Ưu đãi, nội dung', twofa: false, st: 'on', last: '16/11 09:30' },
  { ini: 'HB', name: 'Hồ Văn Bình', mail: 'binh@thenestro.vn', role: 'Buồng phòng', scope: 'Tầng 4–6', twofa: true, st: 'shift', last: 'Hôm nay 08:20' },
  { ini: 'ĐN', name: 'Đặng Ngọc Nhi', mail: 'nhi@thenestro.vn', role: 'Lễ tân', scope: 'Thời vụ đến 31/12', twofa: false, st: 'invite', last: 'Chưa đăng nhập' },
  { ini: 'TQ', name: 'Tạ Quang Tùng', mail: 'tung@thenestro.vn', role: 'Lễ tân', scope: '—', twofa: true, st: 'lock', last: '02/11 14:00' }
]

export const seedGuests = (): GuestRecord[] => [
  { ini: 'MA', name: 'Nguyễn Minh Anh', phone: '090 ••• 4567', email: 'minh•••@gmail.com', tier: 'Vàng', stays: 3, nights: 6, last: 2, spend: 15420000, note: 'Kỷ niệm ngày cưới, chuẩn bị bánh và hoa.', prefs: ['Tầng cao', 'Hướng hồ', 'Gối mềm', 'Không hút thuốc'] },
  { ini: 'QB', name: 'Trần Quốc Bảo', phone: '091 ••• 2210', email: 'bao•••@outlook.com', tier: 'Kim cương', stays: 14, nights: 31, last: 0, spend: 68900000, note: 'Khách thân thiết, luôn đặt Suite tầng 6.', prefs: ['Suite', 'Hướng hồ'] },
  { ini: 'TH', name: 'Lê Thu Hà', phone: '098 ••• 7731', email: 'ha•••@gmail.com', tier: 'Bạc', stays: 2, nights: 5, last: 3, spend: 12100000, note: '', prefs: ['Phòng Family', 'Giường phụ'] },
  { ini: 'GH', name: 'Phạm Gia Huy', phone: '093 ••• 1048', email: 'huy•••@yahoo.com', tier: 'Khách lẻ', stays: 1, nights: 1, last: 1, spend: 1640000, note: '', prefs: [] },
  { ini: 'NL', name: 'Vũ Ngọc Lan', phone: '097 ••• 5582', email: 'lan•••@gmail.com', tier: 'Vàng', stays: 5, nights: 11, last: 4, spend: 24300000, note: '', prefs: ['Tầng cao', 'Gối mềm'] },
  { ini: 'HN', name: 'Đỗ Hoàng Nam', phone: '096 ••• 3394', email: 'nam•••@gmail.com', tier: 'Bạc', stays: 2, nights: 3, last: -1, spend: 5900000, note: '', prefs: ['Không hút thuốc'] },
  { ini: 'MC', name: 'Hoàng Mai Chi', phone: '094 ••• 6620', email: 'chi•••@gmail.com', tier: 'Khách lẻ', stays: 1, nights: 2, last: 6, spend: 7250000, note: '', prefs: [] },
  { ini: 'ĐT', name: 'Bùi Đức Thịnh', phone: '035 ••• 9017', email: 'thinh•••@gmail.com', tier: 'Bạc', stays: 3, nights: 4, last: -46, spend: 8800000, note: '', prefs: ['Hướng phố'] },
  { ini: 'KL', name: 'Ngô Khánh Linh', phone: '086 ••• 4412', email: 'linh•••@gmail.com', tier: 'Vàng', stays: 6, nights: 13, last: -51, spend: 29750000, note: '', prefs: ['Tầng cao', 'Hướng hồ'] }
]

export const ROLE_NAMES = ['Quản trị', 'Quản lý', 'Lễ tân', 'Doanh thu', 'Marketing', 'Buồng phòng']
export const ROLE_ROWS: [string, string, number[]][] = [
  ['Tổng quan', 'Số liệu trong ngày', [3, 3, 1, 1, 1, 1]],
  ['Đặt phòng', 'Xem và tìm đơn', [3, 3, 2, 1, 0, 1]],
  ['Đặt phòng', 'Tạo, sửa đơn, check-in/out', [3, 3, 2, 0, 0, 0]],
  ['Đặt phòng', 'Huỷ đơn và hoàn tiền', [3, 3, 2, 0, 0, 0]],
  ['Sơ đồ tầng', 'Dựng và sửa sơ đồ', [3, 2, 0, 0, 0, 0]],
  ['Sơ đồ tầng', 'Trạng thái dọn phòng', [3, 3, 2, 0, 0, 2]],
  ['Phòng, ảnh & giá', 'Ảnh, mô tả, giá theo mùa', [3, 2, 1, 3, 1, 0]],
  ['Ưu đãi & mã giảm', 'Tạo và bật tắt mã', [3, 2, 1, 2, 2, 0]],
  ['Khách hàng', 'Hồ sơ, ghi chú, lịch sử', [3, 3, 2, 1, 1, 0]],
  ['Khách hàng', 'Xem SĐT, email đầy đủ', [3, 3, 1, 0, 0, 0]],
  ['Báo cáo', 'Doanh thu, công suất', [3, 3, 0, 3, 1, 0]],
  ['Cài đặt & thanh toán', 'API mã QR, webhook, hoá đơn', [3, 1, 0, 0, 0, 0]],
  ['Nhân viên & phân quyền', 'Mời, khoá, đổi vai trò', [3, 1, 0, 0, 0, 0]]
]
export const ACTIVITY_LOG: [string, string, string, string][] = [
  ['#B3261E', 'Lê Minh Hiếu (Lễ tân)', 'huỷ đơn NST-6P2H8S, hoàn 1.850.000 ₫', 'Hôm nay 10:20'],
  ['#C8955C', 'Trần Thị Lan (Quản lý)', 'duyệt hoàn tiền cho đơn NST-6P2H8S', 'Hôm nay 10:24'],
  ['#2C5F99', 'Võ Đăng Khoa (Doanh thu)', 'đổi giá Deluxe cuối tuần 1,85tr → 1,95tr', 'Hôm nay 09:05'],
  ['#2F7D4F', 'Hồ Văn Bình (Buồng phòng)', 'đánh dấu 5 phòng tầng 4 đã dọn xong', 'Hôm nay 08:47'],
  ['#3B2416', 'Giám đốc khách sạn', 'gửi lời mời Đặng Ngọc Nhi, vai trò Lễ tân thời vụ', 'Hôm qua 16:30'],
  ['#C8955C', 'Ngô Phương Anh (Marketing)', 'tạo mã NESTRO10, hiệu lực đến 31/12', 'Hôm qua 14:12'],
  ['#B7791F', 'Hệ thống', 'chặn đăng nhập sai mật khẩu 5 lần, tài khoản tung@thenestro.vn', '02/11 14:05'],
  ['#3B2416', 'Giám đốc khách sạn', 'khoá tài khoản Tạ Quang Tùng', '02/11 14:10']
]

export function seedDb(): Db {
  const typeConfig = Object.fromEntries(Object.values(TYPES).map(t => [t.name, { price: t.price, weekend: t.weekend, extraPerson: 350000, minNights: 1, visible: true }])) as Db['typeConfig']
  const base: Db = {
    v: SEED_VERSION, bookings: [], offers: seedOffers(), roomOverrides: {
      // gán loại cho các phòng có đơn mẫu (tầng 2–5 dùng chung mặt bằng mẫu nên cần chỉ định loại)
      '502': { type: 'Deluxe' }, '501': { type: 'Standard' }, '504': { type: 'Deluxe' }, '505': { type: 'Suite' }, '510': { type: 'Standard' },
      '511': { type: 'Deluxe' }, '514': { type: 'Family' }, '307': { type: 'Standard' }, '412': { type: 'Standard' },
      '506': { locked: true }, '513': { locked: true }
    },
    typeConfig, dayPrices: { Standard: {}, Deluxe: {}, Family: {}, Suite: {} }, staff: seedStaff(),
    roles: {}, guestNotes: {}
  }
  base.bookings = SB.map(s => mkBooking(s, base))
  return base
}
