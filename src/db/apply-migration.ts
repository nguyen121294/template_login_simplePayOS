import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(connectionString, { prepare: false });

  try {
    // Specifically create the plans table since others already exist
    console.log('Creating plans table...');
    await sql.unsafe(`
      -- Bổ sung các cột mới nếu chưa có
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
      
      -- Tạo bảng plans nếu chưa có
      CREATE TABLE IF NOT EXISTS plans (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "price" double precision NOT NULL,
        "days" integer NOT NULL,
        "description" text,
        "features" text[],
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      -- Tạo Logic: Hàm đồng bộ tự động Auth.users sang public.profiles
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER SET search_path = public
      AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, first_name, last_name)
        VALUES (
          new.id::text,
          new.email,
          new.raw_user_meta_data ->> 'firstName',
          new.raw_user_meta_data ->> 'lastName'
        )
        ON CONFLICT (id) DO NOTHING;
        RETURN new;
      END;
      $$;

      -- Tạo Logic: Bắn Trigger khi có tài khoản mới được tạo
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
