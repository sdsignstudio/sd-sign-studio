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

async function setupMultiCountryPricing() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from .env')
  }

  try {
    await client.connect()
    console.log('Connected to PostgreSQL')

    await client.query(`
      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS price_inr DECIMAL(12, 2),
        ADD COLUMN IF NOT EXISTS price_gbp DECIMAL(10, 2);
    `)
    console.log('Pricing columns ready')

    await client.query(`
      UPDATE products
      SET
        price_gbp = COALESCE(price_gbp, price),
        price_inr = COALESCE(price_inr, price)
      WHERE price_gbp IS NULL OR price_inr IS NULL;
    `)
    console.log('Existing products backfilled')

    await client.query(`NOTIFY pgrst, 'reload schema';`)
    console.log('Supabase schema cache reload requested')
  } finally {
    await client.end()
  }
}

setupMultiCountryPricing().catch(error => {
  console.error('Error setting up multi-country pricing:', error)
  process.exit(1)
})
