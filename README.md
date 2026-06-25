# ☕ Hệ thống Quản lý Quán Cà Phê

Hệ thống quản lý quán cà phê hoàn chỉnh với kiến trúc **Express MVC (Backend)** + **Vanilla JS SPA (Frontend)**.

---

## 📁 Cấu trúc thư mục

```
BanCaPhe/
├── BE/                         # Backend (Express + SQLite)
│   ├── src/
│   │   ├── config/             # db.js, cloudinary.js, payos.js
│   │   ├── controllers/        # authController, productController...
│   │   ├── middlewares/        # authenticate, authorize, upload
│   │   ├── routes/             # auth, products, orders...
│   │   ├── utils/              # response.js, helpers.js
│   │   └── jobs/               # dailySnapshot.js (cron 22:00)
│   ├── database/               # cafe.db (SQLite, tự tạo)
│   ├── app.js                  # Express app
│   ├── index.js                # Entry point
│   ├── seed.js                 # Seed dữ liệu mẫu
│   ├── .env                    # Cấu hình môi trường
│   └── package.json
└── FE/                         # Frontend (SPA Vanilla JS)
    ├── index.html              # Shell duy nhất
    └── assets/
        ├── css/                # main, sidebar, pos, dashboard
        └── js/
            ├── app.js          # Entry point
            ├── router.js       # Hash router
            ├── api.js          # Fetch wrapper
            ├── components/     # toast, modal, loader, sidebar
            └── views/          # login, dashboard, pos, products...
```

---

## 🚀 Hướng dẫn cài đặt & Chạy

### Bước 1: Cài Dependencies

```bash
cd BE
npm install
```

### Bước 2: Cấu hình môi trường

Mở file `BE/.env` và điền các thông tin:

```env
PORT=3000
JWT_SECRET=your_super_secret_key
DB_PATH=./database/cafe.db

# Cloudinary (để tải ảnh sản phẩm)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# PayOS (để thanh toán QR)
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
```

### Bước 3: Seed dữ liệu mẫu

```bash
cd BE
npm run seed
```

Lệnh này tạo:
- 👤 Admin: `admin` / `admin123`
- 👤 Nhân viên: `staff` / `staff123`
- 📂 3 danh mục (Cà Phê, Trà & Sữa, Bánh & Ăn Vặt)
- 📦 10 sản phẩm mẫu

### Bước 4: Chạy Server

```bash
cd BE
npm run dev
```

Mở trình duyệt và truy cập: **http://localhost:3000**

---

## 🔑 Tính năng

| Tính năng | Admin | Staff |
|-----------|-------|-------|
| Dashboard doanh thu | ✅ | ❌ |
| POS bán hàng | ✅ | ✅ |
| Thanh toán tiền mặt / QR | ✅ | ✅ |
| Khách hàng thân thiết (−10%) | ✅ | ✅ |
| Xem hóa đơn | ✅ Tất cả | ✅ Ca mình |
| In hóa đơn | ✅ | ✅ |
| Quản lý sản phẩm | ✅ | ❌ |
| Quản lý khách hàng | ✅ | ❌ |
| Hủy đơn hàng | ✅ | ❌ |

---

## 🛠️ API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /api/auth/login | Đăng nhập |
| GET | /api/categories | Danh sách danh mục |
| GET | /api/products | Danh sách sản phẩm |
| POST | /api/orders | Tạo đơn hàng mới |
| POST | /api/orders/:id/pay-cash | Thanh toán tiền mặt |
| POST | /api/orders/:id/pay-qr | Tạo link QR PayOS |
| GET | /api/dashboard/today | Thống kê hôm nay |
| GET | /api/invoices | Danh sách hóa đơn |

---

## 📝 Ghi chú

- **Cloudinary**: Nếu chưa có API key, ảnh sản phẩm sẽ hiển thị icon mặc định ☕
- **PayOS**: Nếu chưa có API key, nút thanh toán QR sẽ không tạo được link
- **Cron Job**: Chạy lúc 22:00 hàng ngày để tổng hợp doanh thu
- **Database**: SQLite tự tạo file `database/cafe.db` khi khởi động lần đầu
