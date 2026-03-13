const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection with URL length:', connectionString.length);
console.log('Contains $$:', connectionString.includes('$$'));
console.log('Testing connection with URL:', connectionString.replace(/:([^@]+)@/, ':****@'));

async function testConnection() {
  const sql = postgres(connectionString, { prepare: false });
  try {
    const result = await sql`SELECT 1 as connected`;
    console.log('Successfully connected:', result);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await sql.end();
  }
}

testConnection();
