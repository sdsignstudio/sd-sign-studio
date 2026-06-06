import { createClient } from '@supabase/supabase-js'
import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
const { Client } = pg

async function createAdmin() {
  try {
    // 1. Sign up the user
    console.log('Signing up sdsignstudioadmin@gmail.com...')
    const { data, error } = await supabase.auth.signUp({
      email: 'sdsignstudioadmin@gmail.com',
      password: 'SuperSecretPassword123!',
    })

    if (error) {
      if (error.message.includes('User already registered')) {
        console.log('User already registered. Proceeding to assign admin role...')
      } else {
        throw error
      }
    }

    // Try to login to get the user ID if already registered
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'sdsignstudioadmin@gmail.com',
      password: 'SuperSecretPassword123!'
    })

    if (loginError) throw loginError

    const userId = loginData.user.id
    console.log('User ID:', userId)

    // 2. Add to user_roles table as 'admin'
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    await client.connect()

    await client.query(`
      INSERT INTO user_roles (user_id, role)
      VALUES ($1, 'admin')
      ON CONFLICT (user_id) DO UPDATE SET role = 'admin'
    `, [userId])

    console.log('Admin role assigned successfully!')
    console.log('Login Email: sdsignstudioadmin@gmail.com')
    console.log('Login Password: SuperSecretPassword123!')

    await client.end()

  } catch (err) {
    console.error('Error creating admin:', err)
  }
}

createAdmin()
