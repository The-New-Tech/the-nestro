# The Nestro – Web đặt phòng (React PWA)

Frontend dựng theo design "The Nestro – Đặt phòng" (Vite + React 19 + TypeScript + React Router). Chưa có backend: dữ liệu chạy bằng **API giả lưu trong localStorage**, thay bằng API thật sau mà không phải sửa giao diện.

## Chạy

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build production + service worker (PWA)
npm run preview    # xem bản build, thử cài app / offline
npm run icons      # sinh lại icon PWA từ assets-src/logo.png
```

PWA chỉ hoạt động ở bản build (`build` + `preview`) và cần HTTPS khi deploy (localhost thì được).

## Các trang

| Khu | Đường dẫn |
| --- | --- |
| Đặt phòng 5 bước | `/dat-phong` → `/ngay` → `/thong-tin` → `/thanh-toan` → `/xac-nhan` |
| Công khai | `/phong`, `/tien-ich`, `/uu-dai`, `/lien-he`, `/tra-cuu`, `/tra-cuu/:code` |
| Quản trị | `/admin` (tổng quan), `dat-phong`, `so-do-tang`, `phong-gia`, `uu-dai`, `khach-hang`, `bao-cao`, `nhan-vien`, `vai-tro`, `cai-dat` |

Thử nhanh tra cứu: mã `NST-8K2Q7M` + email `minhanh@gmail.com`. OTP demo: `123456`.
Admin hiện chưa có đăng nhập (chờ backend).

## Cấu trúc

```
src/
  api/index.ts        ← TẤT CẢ thao tác dữ liệu (tạo QR, tạo/huỷ đơn, tra cứu). Thay bằng fetch('/api/...') khi có backend
  store/db.ts         ← "database" tạm trong localStorage (đơn, ưu đãi, giá, sơ đồ, nhân viên…)
  store/flow.tsx      ← trạng thái luồng đặt phòng (lưu localStorage, giữ phòng 15 phút)
  lib/pricing.ts      ← tính giá: giá theo ngày/cuối tuần, phí 5%, VAT 8%, mã giảm
  lib/availability.ts ← tình trạng phòng theo ngày
  data/catalog.ts     ← loại phòng, toạ độ sơ đồ tầng 6, nội dung trang
  components/         ← FloorMap, DateRange, Summary (FlowShell), Stepper, PublicLayout, PwaPrompt…
  pages/{booking,public,admin}/
```

## Nối backend

Các hàm cần thay trong `src/api/index.ts`: `createPaymentQr` (QR động 10 phút theo đơn), `createBooking` (nên tạo sau webhook thanh toán), `lookupBooking`, `updateBooking`, `cancelBooking`. Tình trạng phòng hiện tính ở `lib/availability.ts` (kèm nhiễu giả lập để sơ đồ sinh động) và dữ liệu admin đọc/ghi qua `store/db.ts`; khi có API thì thay các chỗ này bằng dữ liệu server.
Service worker đã có sẵn rule `NetworkFirst` cho `/api/*` (trừ payments/bookings, không bao giờ cache).

## Còn thiếu / ghi chú

- Ảnh phòng, địa chỉ, ngân hàng, hotline… là placeholder đúng như design (`[ĐỊA CHỈ]`, `1900 XXXX`).
- Tầng 2–5 dùng chung mặt bằng mẫu của tầng 6 cho tới khi có bản vẽ riêng. Công cụ vẽ phòng/đa giác trong trình tạo sơ đồ là giao diện, chưa vẽ được (cần backend lưu).
- Song ngữ: nút VI/EN đã có, hiện mới dịch phần khung (menu, bước, nút chính).
- Số liệu doanh thu/công suất ở Tổng quan và Báo cáo là dữ liệu mẫu.
- Đăng nhập Nestro Club, gửi Email/SMS, tải ảnh, xuất Excel/PDF chuẩn: chờ backend ("Tải PDF" hiện dùng hộp thoại in của trình duyệt).

## Deploy lên GitHub Pages

Đã có sẵn workflow `.github/workflows/deploy.yml`: mỗi lần push lên nhánh `staging` sẽ tự build và deploy.

1. Trên GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions** (làm 1 lần).
2. Push lên `staging`. Xem tiến trình ở tab **Actions**.
3. Site chạy tại `https://<tổ-chức-hoặc-user>.github.io/<tên-repo>/`.

Workflow tự đặt `VITE_BASE=/<tên-repo>/` (repo tên `<user>.github.io` thì dùng `/`), tạo `404.html` để mở thẳng các đường dẫn như `/dat-phong`, và manifest/service worker đã theo đúng đường dẫn con. Muốn thử cục bộ giống bản deploy:

```bash
VITE_BASE=/the-nestro/ npm run build && VITE_BASE=/the-nestro/ npm run preview
# mở http://localhost:4173/the-nestro/
```

Dùng tên miền riêng thì thêm file `public/CNAME` và build với `VITE_BASE=/`.
