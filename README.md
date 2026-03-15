# Next.js SaaS Template - PayOS & Supabase

Đây là một template SaaS mạnh mẽ được xây dựng bằng Next.js, tích hợp sẵn hệ thống xác thực Supabase, ORM Drizzle cho database PostgreSQL và cổng thanh toán PayOS.

## Table of Contents
- [Tính năng chính](#tính-năng-chính)
- [Hướng dẫn cài đặt Local](#hướng-dẫn-cài-đặt-local)
- [Triển khai Production](#triển-khai-production)
- [Cấu hình PayOS Webhook](#cấu-hình-payos-webhook)
- [Quản trị (Admin Panel)](#quản-trị-admin-panel)

---

## Tính năng chính
- **Xác thực người dùng**: Đăng ký/Đăng nhập qua Supabase Auth.
- **Quản lý đăng ký (SaaS)**: Phân quyền các gói Free/Pro.
- **Thanh toán trực tuyến**: Tích hợp PayOS để thanh toán nhanh chóng.
- **Trang Admin**: Quản lý người dùng, trạng thái tài khoản (Active/Locked) và lịch sử đăng ký.
- **Database**: Sử dụng Drizzle ORM giúp quản lý schema và migrate dữ liệu dễ dàng.

---

## Hướng dẫn cài đặt Local

### 1. Clone dự án và cài đặt dependencies
```bash
git clone <your-repo-url>
cd template_login_simplePayOS
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env.local` từ mẫu `.env.example`:
```bash
cp .env.example .env.local
```
Cập nhật các thông tin sau:
- **Supabase**: URL, Anon Key và Service Role Key từ bảng điều khiển dự án Supabase.
- **Database**: Link kết nối Postgres (có thể dùng chung database của Supabase).
- **PayOS**: Client ID, API Key và Checksum Key từ Dashboard PayOS.
- **Admin**: Thiết lập `ADMIN_USERNAME` và `ADMIN_PASSWORD` để truy cập trang quản trị.

### 3. Đồng bộ Database Schema
Sử dụng Drizzle để cập nhật cấu trúc bảng vào database của bạn:
```bash
npm run drizzle-kit push
```

### 4. Chạy server phát triển
```bash
npm run dev
```
Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để kiểm tra.

---

## Triển khai Production

Dự án này được tối ưu hóa để chạy tốt nhất trên **Vercel**.

### 1. Tạo dự án trên Vercel
- Kết nối kho lưu trữ GitHub/GitLab của bạn với Vercel.
- Trong phần **Environment Variables**, hãy thêm tất cả các biến đã cấu hình trong `.env.local`.
- Quan trọng: Đảm bảo `NEXT_PUBLIC_APP_URL` trỏ đến domain chính thức của bạn (ví dụ: `https://your-app.vercel.app`).

### 2. Cấu hình Supabase Auth
- Trong Dashboard Supabase -> Authentication -> URL Configuration.
- Thêm URL của Vercel vào **Site URL** và **Redirect URLs**.

---

## Cấu hình PayOS Webhook

Để hệ thống tự động cập nhật trạng thái gói cước (Upgrade lên Pro) ngay sau khi khách hàng thanh toán xong, bạn **bắt buộc** phải cấu hình Webhook:

1. Vào Dashboard PayOS -> Chọn dự án của bạn -> Cấu hình Webhook.
2. Nhập URL Webhook theo định dạng: `https://your-domain.com/api/webhook`
3. Lưu và kiểm tra kết nối.

> [!NOTE]
> Khi chạy local, bạn có thể dùng các công cụ như `ngrok` để tạo tunnel cho webhook nếu muốn test flow thanh toán hoàn chỉnh từ PayOS về máy cục bộ.

---

## Quản trị (Admin Panel)

Hệ thống cung cấp một trang Admin tối giản để quản lý người dùng:
- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Tài khoản**: Sử dụng thông tin đã cấu hình trong `ADMIN_USERNAME` và `ADMIN_PASSWORD`.

Tại đây bạn có thể:
- Xem danh sách người dùng.
- Khóa (Lock) hoặc Mở khóa (Active) tài khoản.
- Điều chỉnh thời hạn hoặc gói cước người dùng thủ công.

---

© 2024 Template SaaS PayOS.
