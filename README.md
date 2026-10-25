# DateSpot — Nền tảng Chia sẻ & Lưu trữ Địa điểm Ăn uống, Hẹn hò

Ứng dụng Full-stack cho phép cá nhân và cộng đồng khám phá, lưu trữ, đánh giá các địa điểm ăn uống/hẹn hò với chế độ **Công khai** hoặc **Riêng tư (Chỉ mình tôi)**, phân quyền **Quản trị viên (Admin)** và tích hợp **chuyển hướng chỉ đường trực tiếp sang Google Maps**.

---

## Tài khoản Quản trị viên (Admin) Mặc định
Hệ thống tự động khởi tạo tài khoản Admin khi chạy server:
- **Email:** `admin@datespot.vn`
- **Mật khẩu:** `admin123`
*(Có thể thay đổi trong file `backend/.env` qua biến `ADMIN_EMAIL` và `ADMIN_PASSWORD`)*

**Quyền hạn của Admin:**
- Truy cập trang **Quản trị (`/admin`)** trên thanh điều hướng.
- Xem danh sách toàn bộ tài khoản người dùng, chỉnh sửa thông tin (Tên, Email, Bio, Phân quyền `user`/`admin`, Đặt lại mật khẩu) hoặc xoá tài khoản.
- Chỉnh sửa hoặc xoá **bất kỳ địa điểm nào** do người khác tạo ra (cả trên trang Khám phá lẫn trong trang Quản trị).

---

## Hướng dẫn Cài đặt & Chạy Ứng dụng ở Local

Nhấp đúp vào file `start-app.bat` hoặc mở 2 cửa sổ Terminal tại `d:\New folder`:

### 1. Chạy Backend (Cổng `5000`)
```bash
cd backend
npm install
npm run dev
```

### 2. Chạy Frontend (Cổng `5173`)
```bash
cd frontend
npm install
npm run dev
```

Sau đó mở trình duyệt truy cập: **http://localhost:5173**

---

## Hướng dẫn Deploy lên Static Hosting (Vercel, Netlify, Cloudflare Pages, Render)

Vì ứng dụng của bạn có **chức năng cộng đồng** (nhiều người dùng đăng ký tài khoản, lưu trữ dữ liệu chung, Admin quản lý người dùng & địa điểm), kiến trúc triển khai chuẩn gồm 2 phần:

1. **Frontend (Deploy dạng Static Site lên Vercel / Netlify / Cloudflare Pages / Render Static):**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish / Output Directory: `dist`
   - Biến môi trường (Environment Variable):
     - `VITE_API_URL` = `https://<ten-mien-backend-cua-ban>/api`
   - **Đã cấu hình sẵn SPA Routing:** Dự án đã có sẵn file `frontend/public/_redirects` và `frontend/vercel.json` để khi người dùng tải lại trang (F5) ở `/login`, `/my-collection`, `/admin` không bị lỗi `404 Not Found`.

2. **Backend + Database (Deploy lên Render Web Service / Railway / Fly.io + MongoDB Atlas):**
   - Root Directory: `backend`
   - Start Command: `npm start`
   - Biến môi trường: `MONGO_URI` (Chuỗi kết nối MongoDB Atlas miễn phí), `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

## Hướng dẫn Deploy lên Static Hosting (Vercel, Netlify, Cloudflare Pages, Render)

Vì ứng dụng của bạn có **chức năng cộng đồng** (nhiều người dùng đăng ký tài khoản, lưu trữ dữ liệu chung, Admin quản lý người dùng & địa điểm), kiến trúc triển khai chuẩn gồm 2 phần:

1. **Frontend (Deploy dạng Static Site lên Vercel / Netlify / Cloudflare Pages / Render Static):**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish / Output Directory: `dist`
   - Biến môi trường (Environment Variable):
     - `VITE_API_URL` = `https://<ten-mien-backend-cua-ban>/api`
   - **Đã cấu hình sẵn SPA Routing:** Dự án đã có sẵn file `frontend/public/_redirects` và `frontend/vercel.json` để khi người dùng tải lại trang (F5) ở `/login`, `/my-collection`, `/admin` không bị lỗi `404 Not Found`.

2. **Backend + Database (Deploy lên Render Web Service / Railway / Fly.io + MongoDB Atlas):**
   - Root Directory: `backend`
   - Start Command: `npm start`
   - Biến môi trường: `MONGO_URI` (Chuỗi kết nối MongoDB Atlas miễn phí), `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

