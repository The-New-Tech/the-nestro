import { hash01 } from '@/lib/utils'

export type RoomType = 'Standard' | 'Deluxe' | 'Family' | 'Suite'
export interface TypeInfo {
  name: RoomType; size: string; guests: number; bed: string; price: number; weekend: number
  desc: string; tags: string[]; badge?: string; view: string; count: number
}
export const TYPES: Record<RoomType, TypeInfo> = {
  Standard: { name: 'Standard', size: '24 m²', guests: 2, bed: 'Giường Queen', price: 1450000, weekend: 1650000, desc: 'Gọn gàng, ấm cúng, phù hợp cặp đôi hoặc công tác ngắn ngày.', tags: ['Hướng phố', 'Bàn làm việc', 'Vòi sen'], view: 'Hướng phố', count: 18 },
  Deluxe: { name: 'Deluxe', size: '32 m²', guests: 3, bed: 'Giường King', price: 1850000, weekend: 2100000, desc: 'Rộng rãi hơn với ban công riêng và bồn tắm nhìn ra hồ.', tags: ['Hướng hồ', 'Ban công', 'Bồn tắm'], badge: 'Được chọn nhiều', view: 'Hướng hồ', count: 24 },
  Family: { name: 'Family', size: '42 m²', guests: 5, bed: '2 giường Queen', price: 2600000, weekend: 2900000, desc: 'Hai giường lớn, góc chơi cho bé, lý tưởng cho gia đình 4–5 người.', tags: ['Cho gia đình', 'Sofa bed', 'Bữa sáng'], view: 'Hướng hồ', count: 10 },
  Suite: { name: 'Suite', size: '54 m²', guests: 4, bed: 'King + sofa', price: 3200000, weekend: 3600000, desc: 'Phòng khách tách biệt, bồn tắm lớn và đặc quyền Executive Lounge.', tags: ['Tầng cao', 'Lounge', 'Bồn tắm'], badge: 'Cao cấp', view: 'Hướng hồ', count: 8 }
}
export const TYPE_LIST = Object.values(TYPES)

export const FLOORS = [2, 3, 4, 5, 6]
export const FEE_RATE = 0.05
export const VAT_RATE = 0.08
export const EARLY_CHECKIN_FEE = 300000
export const LATE_CHECKOUT_FEE = 300000
export const HOLD_MINUTES = 15
export const QR_MINUTES = 10
export const HOTLINE = '1900 XXXX'

// ---- Sơ đồ tầng: toạ độ theo bản vẽ mặt bằng tầng 6 (px trên bản vẽ gốc) ----
export const MAP = { X0: 300, Y0: 115, W: 2180, H: 980 }
type Raw = [string, number, number, number, number, RoomType]
const S: RoomType = 'Standard', D: RoomType = 'Deluxe', U: RoomType = 'Suite'
const RAW6: Raw[] = [
  ['601', 320, 130, 495, 290, U], ['602', 320, 315, 495, 470, U],
  ['604', 543, 130, 708, 248, D], ['606', 768, 130, 1022, 248, D], ['608', 1022, 130, 1275, 248, D], ['609', 1375, 130, 1575, 248, D],
  ['610', 1578, 130, 1700, 308, S], ['611', 1700, 130, 1828, 308, S], ['612', 1828, 130, 1955, 308, S],
  ['613', 2012, 130, 2140, 308, S], ['614', 2140, 130, 2265, 308, S], ['615', 2265, 130, 2395, 308, S],
  ['603', 543, 315, 708, 432, S], ['605', 768, 315, 935, 432, S], ['607', 935, 315, 1105, 432, S],
  ['623', 1578, 375, 1735, 490, S], ['622', 1792, 375, 1952, 490, S], ['617', 2015, 375, 2175, 490, S], ['616', 2235, 375, 2395, 490, S],
  ['625', 1578, 490, 1735, 608, S], ['624', 1792, 490, 1952, 608, S], ['619', 2015, 490, 2175, 608, S], ['618', 2235, 490, 2395, 608, S],
  ['627', 1578, 608, 1735, 725, S], ['626', 1792, 608, 1952, 725, S], ['621', 2015, 608, 2175, 725, S], ['620', 2235, 608, 2395, 725, S],
  ['630', 385, 495, 708, 695, U], ['629', 768, 495, 935, 635, D], ['628', 935, 495, 1100, 635, D],
  ['631', 435, 700, 708, 808, D], ['633', 500, 812, 708, 925, D], ['635', 575, 928, 708, 1080, D],
  ['632', 768, 700, 945, 825, S], ['634', 768, 825, 945, 950, S], ['636', 768, 950, 945, 1080, S],
  ['637', 1015, 700, 1195, 825, S], ['639', 1015, 825, 1195, 950, S], ['641', 1015, 950, 1195, 1080, S],
  ['638', 1255, 700, 1440, 825, S], ['640', 1255, 825, 1440, 950, S], ['642', 1255, 950, 1440, 1080, S]
]
export type FxKind = 'corr' | 'void' | 'lift' | 'stair' | 'store'
export const FIXTURES: [FxKind, string, number, number, number, number][] = [
  ['corr', 'Hành lang', 498, 130, 543, 495], ['corr', 'Hành lang', 540, 250, 1578, 315], ['corr', 'Hành lang', 1578, 310, 2395, 375],
  ['corr', 'Sảnh thang máy', 1275, 315, 1375, 700], ['corr', '', 1515, 375, 1578, 635], ['corr', 'Hành lang', 708, 635, 1440, 700],
  ['corr', 'Hành lang', 1735, 375, 1792, 725], ['corr', 'Hành lang', 2175, 375, 2235, 725],
  ['corr', 'Hành lang', 708, 700, 768, 1000], ['corr', 'Hành lang', 1195, 700, 1255, 1010],
  ['void', '', 708, 130, 768, 248], ['void', '', 1275, 130, 1375, 248], ['void', '', 1955, 130, 2012, 308],
  ['void', '', 708, 315, 768, 432], ['void', 'Giếng trời', 543, 436, 1210, 492], ['void', '', 708, 495, 768, 600],
  ['void', 'Giếng trời', 1955, 375, 2012, 725], ['void', 'Giếng trời', 945, 700, 1015, 1080],
  ['store', 'Kho', 1105, 315, 1275, 432],
  ['lift', 'TM', 1210, 405, 1275, 472], ['lift', 'TM', 1210, 472, 1275, 540],
  ['lift', 'TM', 1375, 410, 1440, 475], ['lift', 'TM', 1375, 475, 1440, 540], ['lift', 'TM', 1375, 570, 1440, 630],
  ['stair', 'Thang bộ', 1100, 495, 1210, 635], ['stair', 'TB', 1440, 365, 1515, 470], ['stair', 'TB', 1440, 640, 1515, 760], ['stair', 'TB', 2400, 215, 2470, 315]
]

export interface RoomDef { no: string; floor: number; type: RoomType; x1: number; y1: number; x2: number; y2: number }
/** Tầng 6 dùng bản vẽ thật. Tầng 2–5 tạm dùng chung mặt bằng mẫu cho tới khi admin tải bản vẽ riêng. */
export const ROOMS: RoomDef[] = FLOORS.flatMap(fl =>
  RAW6.map(([no, x1, y1, x2, y2, type]) => ({ no: fl * 100 + Number(no.slice(1)) + '', floor: fl, type, x1, y1, x2, y2 }))
)
export const roomsOfFloor = (fl: number) => ROOMS.filter(r => r.floor === fl)
export const findRoom = (no: string) => ROOMS.find(r => r.no === no)
/** phòng "đang giữ" tạm thời (mô phỏng người khác đang thanh toán) */
export const isHeldByOthers = (no: string) => hash01('held' + no) < 0.07
export const FLAGGED_ROOMS = ['630', '530', '430', '330', '230']

// ---- Nội dung trang công khai ----
export const AMENITIES = [
  { name: 'Nestro Spa', cat: 'Thư giãn', desc: 'Massage đá nóng, xông hơi và liệu trình thảo mộc Việt.', hours: '09:00 – 22:00', where: 'Tầng 3', icon: 'M12 21c-4-2-7-5-7-9 3 0 5 1 7 3 2-2 4-3 7-3 0 4-3 7-7 9zM12 15V9M9 6a3 3 0 0 1 6 0c0 2-3 3-3 3s-3-1-3-3z' },
  { name: 'Nhà hàng Mộc', cat: 'Ẩm thực', desc: 'Buffet sáng và thực đơn Việt đương đại buổi tối.', hours: '06:00 – 22:30', where: 'Tầng 1', icon: 'M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 0-3 2-3 5s1 4 3 4v9' },
  { name: 'Phòng gym', cat: 'Thư giãn', desc: 'Máy tập hiện đại, có huấn luyện viên theo giờ.', hours: '24/7', where: 'Tầng 3', icon: 'M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12' },
  { name: 'Rooftop Bar', cat: 'Ẩm thực', desc: 'Cocktail đặc trưng và nhạc acoustic cuối tuần.', hours: '17:00 – 00:00', where: 'Tầng thượng', icon: 'M5 4h14l-7 8zM12 12v8M8 20h8' },
  { name: 'Kids Club', cat: 'Gia đình', desc: 'Khu vui chơi an toàn có người trông cho bé 3–10 tuổi.', hours: '08:00 – 20:00', where: 'Tầng 2', icon: 'M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 22v-5l-2-4 4-3h8l4 3-2 4v5M9 22v-6M15 22v-6' },
  { name: 'Phòng họp', cat: 'Công tác', desc: 'Sức chứa 10–80 khách, máy chiếu và hỗ trợ kỹ thuật.', hours: 'Đặt trước', where: 'Tầng 2', icon: 'M3 5h18v11H3zM8 21h8M12 16v5' },
  { name: 'Đưa đón sân bay', cat: 'Công tác', desc: 'Xe 4–7 chỗ đón tận cửa, đặt kèm khi đặt phòng.', hours: '24/7', where: 'Có phí', icon: 'M5 17h14M6 17V11l2-5h8l2 5v6M6 11h12M8 17v2M16 17v2' },
  { name: 'Thư viện & cà phê', cat: 'Thư giãn', desc: 'Góc đọc yên tĩnh, cà phê phin và trà miễn phí.', hours: '07:00 – 21:00', where: 'Sảnh', icon: 'M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z' }
]
export const IN_ROOM = ['Wi-Fi tốc độ cao', 'Smart TV 55 inch', 'Máy pha cà phê', 'Két an toàn', 'Minibar', 'Áo choàng & dép', 'Bộ amenities hữu cơ', 'Rèm chắn sáng', 'Đưa đón sân bay (phí)']
export const FAQ = [
  { q: 'Tôi có thể nhận phòng sớm không?', a: 'Có, từ 12:00 với phụ thu 300.000 ₫, tuỳ tình trạng phòng. Chọn giờ nhận sớm ngay khi đặt.' },
  { q: 'Huỷ phòng có mất phí không?', a: 'Huỷ miễn phí trước 14:00, 2 ngày trước ngày nhận phòng. Sau thời điểm này phí huỷ là 1 đêm.' },
  { q: 'Khách sạn có đưa đón sân bay?', a: 'Có. Xe 4–7 chỗ đón tận cửa 24/7, chọn "Đón sân bay" ở bước thông tin khách khi đặt phòng.' },
  { q: 'Có xuất hoá đơn VAT không?', a: 'Có. Tích chọn "Xuất hoá đơn VAT cho công ty" ở bước thanh toán và điền mã số thuế.' }
]
export const ADDONS = [
  { id: 'breakfast', name: 'Bữa sáng buffet', unit: '250.000 ₫ / người / ngày', price: 250000, perPerson: true },
  { id: 'massage', name: 'Massage 60 phút', unit: '690.000 ₫ / người', price: 690000, perPerson: true },
  { id: 'latecheckout', name: 'Trả phòng muộn 14:00', unit: '300.000 ₫', price: 300000, perPerson: false }
]
export const REQUEST_CHIPS = ['Tầng cao, yên tĩnh', 'Thêm giường phụ', 'Đón sân bay', 'Trang trí kỷ niệm', 'Không hút thuốc']
export const CHECKIN_SLOTS = [{ t: '12:00', fee: EARLY_CHECKIN_FEE }, { t: '14:00', std: true }, { t: '15:00' }, { t: '16:00' }]
export const CHECKOUT_SLOTS = [{ t: '10:00' }, { t: '11:00' }, { t: '12:00', std: true }, { t: '14:00', fee: LATE_CHECKOUT_FEE }]
export const ETA_SLOTS = ['Trước 12:00', '12:00 – 14:00', '14:00 – 15:00', '15:00 – 18:00', '18:00 – 22:00', 'Sau 22:00']
export const NATIONALITIES = ['Việt Nam', 'Hàn Quốc', 'Nhật Bản', 'Trung Quốc', 'Mỹ', 'Anh', 'Pháp', 'Đức', 'Úc', 'Singapore', 'Thái Lan', 'Khác']
