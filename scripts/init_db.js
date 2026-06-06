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

async function initDB() {
  try {
    await client.connect()
    console.log('Connected to PostgreSQL')

    // 1. Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `)
    console.log('Categories table ready')

    // 2. Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) REFERENCES categories(name) ON UPDATE CASCADE ON DELETE SET NULL,
        short_description TEXT,
        full_description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        badge VARCHAR(50),
        primary_image VARCHAR(1000) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('Products table ready')

    // 3. Create product_images table
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        image_url VARCHAR(1000) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('Product images table ready')

    // 4. Create user_roles table (linking to auth.users which is handled by Supabase)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID PRIMARY KEY,
        role VARCHAR(50) NOT NULL DEFAULT 'customer'
      );
    `)
    console.log('User roles table ready')

    // Populate default categories
    const categories = [
      'Led mirrors', 'Home Decor Items', 'Decorative Mirrors', 'Glass Designs'
    ]
    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING
      `, [cat])
    }
    console.log('Default categories inserted')

    // Enable RLS and setup basic policies to allow anyone to read products, but only admins to write
    // First, products
    await client.query(`ALTER TABLE products ENABLE ROW LEVEL SECURITY;`)
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Allow authenticated full access on products" ON products FOR ALL USING (auth.role() = 'authenticated');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // product_images
    await client.query(`ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;`)
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Allow public read access on product_images" ON product_images FOR SELECT USING (true);
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Allow authenticated full access on product_images" ON product_images FOR ALL USING (auth.role() = 'authenticated');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    console.log('RLS policies setup')
    console.log('Database initialization complete!')

  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    await client.end()
  }
}

initDB()
