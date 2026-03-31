-- ==========================================
-- SUPABASE AUTH SETUP SCRIPT CHO TEMPLATE
-- ==========================================
-- Hướng dẫn: 
-- Sau khi chạy lệnh `npm run db:push` để tạo các bảng (workspaces, profiles, plans,...)
-- Khách hàng cần Dán toàn bộ đoạn code dưới đây vào Supabase SQL Editor và chạy 1 LẦN DUY NHẤT.

-- 1. Xóa hàm và trigger cũ (Tránh lỗi do chạy lại nhiều lần)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Khởi tạo Hàm Copy User
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, "first_name", "last_name", "subscription_status")
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName',
    'inactive' -- Mặc định chưa mang thẻ VIP
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Gắn Trigger vào hệ thống Auth của Supabase
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 4. (Tùy chọn) Bơm Dữ liệu Lõi (Seed Data)
-- Khởi tạo Gói Free vĩnh viễn không bị xóa
-- ==========================================
INSERT INTO public.plans (id, name, price, days, description, "max_workspaces") 
VALUES ('free', 'Gói Mặc Định (Free)', 0, 0, 'Gói trải nghiệm cơ bản của hệ thống', 1) 
ON CONFLICT (id) DO UPDATE SET "max_workspaces" = EXCLUDED."max_workspaces";
