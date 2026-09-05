# Wedding Survey — React + Vite 💌

Một landing page khảo sát duy nhất để khách mời chọn:

- 🌿 Tham dự lễ cưới tại **Lâm Đồng**
- 🌆 Tham dự báo hỷ tại **Sài Gòn**
- 💗 **Ở đâu cũng được**

Có phần gửi kèm thông tin tùy chọn gồm tên, số người tham dự, lời nhắn; animation bằng Framer Motion, hiệu ứng confetti và gửi dữ liệu vào Google Sheet qua Google Apps Script.

## 1. Chạy project

```bash
npm install
cp .env.example .env
npm run dev
```

Mặc định Vite sẽ mở local dev server, thường là `http://localhost:5173`.

## 2. Kết nối Google Sheet

### Bước 1 — Tạo Sheet

Tạo một Google Sheet mới. URL sẽ có dạng:

```text
https://docs.google.com/spreadsheets/d/GOOGLE_SHEET_ID/edit
```

Copy phần `GOOGLE_SHEET_ID`.

### Bước 2 — Tạo Apps Script

Trong Google Sheet:

1. Chọn **Extensions → Apps Script**.
2. Copy nội dung file `google-apps-script/Code.gs` vào `Code.gs`.
3. Thay:

```js
const SPREADSHEET_ID = 'PUT_YOUR_GOOGLE_SHEET_ID_HERE';
```

bằng Sheet ID của bạn.

### Bước 3 — Deploy Web App

Trong Apps Script:

1. Chọn **Deploy → New deployment**.
2. Type: **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Deploy và cấp quyền.
6. Copy URL kết thúc bằng `/exec`.

### Bước 4 — Cấu hình React

Tạo file `.env` ở root:

```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

Sau đó restart `npm run dev`.

> Frontend dùng `mode: 'no-cors'` để tránh preflight/CORS phức tạp với Apps Script Web App. Vì vậy UI coi request là thành công khi trình duyệt gửi request đi mà không throw network error. Hãy test một lần và kiểm tra dữ liệu trong Google Sheet trước khi public link.

## 3. Dữ liệu được lưu

Sheet `Responses` sẽ tự tạo các cột:

| Cột | Nội dung |
| --- | --- |
| Timestamp | Thời điểm Apps Script nhận dữ liệu |
| Họ và tên | Tên khách |
| Lựa chọn | Nhãn Lâm Đồng / Sài Gòn / linh hoạt |
| Mã lựa chọn | `lam-dong`, `sai-gon`, `either` |
| Số người | Số lượng tham dự |
| Lời nhắn | Ghi chú của khách |
| Submitted At | Timestamp từ browser |

## 4. Build production

```bash
npm run build
npm run preview
```

Có thể deploy thư mục `dist` lên Vercel, Netlify, Cloudflare Pages hoặc GitHub Pages.

## 5. Chỗ nên cá nhân hóa

Trong `src/App.jsx`, bạn có thể đổi:

- Tên/cách xưng hô của cô dâu chú rể.
- Nội dung giới thiệu.
- Tên địa điểm cụ thể ở Lâm Đồng và Sài Gòn.
- Các trường thông tin cần thu thập.

Trong `src/styles.css`, có thể đổi palette bằng các biến CSS ở `:root`.

## Lưu ý riêng tư

Nếu link form được public, đừng yêu cầu các thông tin nhạy cảm không cần thiết. Google Sheet chứa phản hồi của khách mời nên chỉ chia sẻ quyền truy cập Sheet cho người cần dùng.
