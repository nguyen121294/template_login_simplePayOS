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
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
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
