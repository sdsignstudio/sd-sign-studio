import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

async function setupGalleryTable() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from .env')
  }

  try {
    await client.connect()
    console.log('Connected to PostgreSQL')

    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        image VARCHAR(1000),
        media_url VARCHAR(1000),
        media_type VARCHAR(20) DEFAULT 'image',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('Gallery table ready')

    await client.query(`ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;`)

    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "public_read_gallery" ON gallery FOR SELECT USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "auth_write_gallery" ON gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    await client.query(`NOTIFY pgrst, 'reload schema';`)
    console.log('Gallery RLS policies ready')
    console.log('Supabase schema cache reload requested')
  } finally {
    await client.end()
  }
}

setupGalleryTable().catch(error => {
  console.error('Error setting up gallery table:', error)
  process.exit(1)
})
