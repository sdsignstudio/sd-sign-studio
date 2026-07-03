import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const DEFAULT_PREFIX = 'sd-sign-studio/gallery'
const CATEGORY_ROTATION = [
  '3D Lettering Signs',
  'Shop Front Signs',
  'Illuminated & Neon Signs',
  'Projecting Signs & Lightboxes',
  'Vehicle Graphics & Wrapping',
  'Window Graphics',
  'Shop Awnings',
  'Banner & Logo Printing',
  'Custom Workwear',
  'Flyers & Brochures',
  'Exhibition Stands & Flags',
  'Menu Displays',
  'Safety & Interior Signs',
  'Food Truck/Trailer Wraps',
  'Heras Fence Banners',
]

function readCloudinaryConfig() {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error('CLOUDINARY_URL is missing from .env')
  }

  const parsed = new URL(process.env.CLOUDINARY_URL)
  return {
    cloudName: parsed.hostname,
    apiKey: parsed.username,
    apiSecret: parsed.password,
  }
}

function titleFromPublicId(publicId) {
  const filename = publicId.split('/').pop() || publicId
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchResources(resourceType, prefix) {
  const { cloudName, apiKey, apiSecret } = readCloudinaryConfig()
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const resources = []
  let nextCursor = null

  do {
    const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/${resourceType}/upload`)
    url.searchParams.set('max_results', '500')
    if (nextCursor) url.searchParams.set('next_cursor', nextCursor)

    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Cloudinary ${resourceType} list failed: ${response.status} ${body}`)
    }

    const data = await response.json()
    resources.push(...(data.resources || []).filter(resource =>
      resource.public_id?.startsWith(prefix) ||
      resource.asset_folder?.startsWith(prefix)
    ))
    nextCursor = data.next_cursor || null
  } while (nextCursor)

  return resources
}

async function syncCloudinaryGallery() {
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from .env')
  }
  if (!process.env.VITE_ADMIN_EMAIL || !process.env.VITE_ADMIN_PASSWORD) {
    throw new Error('VITE_ADMIN_EMAIL or VITE_ADMIN_PASSWORD is missing from .env')
  }

  const prefix = process.argv[2] || DEFAULT_PREFIX
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.VITE_ADMIN_EMAIL,
    password: process.env.VITE_ADMIN_PASSWORD,
  })
  if (authError) throw authError

  const [images, videos] = await Promise.all([
    fetchResources('image', prefix),
    fetchResources('video', prefix),
  ])

  const resources = [
    ...images.map(resource => ({ ...resource, mediaType: 'image' })),
    ...videos.map(resource => ({ ...resource, mediaType: 'video' })),
  ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

  const { data: existingRows, error: existingError } = await supabase
    .from('gallery')
    .select('image, media_url')
  if (existingError) throw existingError

  const existingUrls = new Set((existingRows || []).flatMap(row => [row.image, row.media_url]).filter(Boolean))
  const rows = resources
    .filter(resource => !existingUrls.has(resource.secure_url))
    .map((resource, index) => ({
      title: titleFromPublicId(resource.public_id),
      category: CATEGORY_ROTATION[index % CATEGORY_ROTATION.length],
      image: resource.secure_url,
      media_url: resource.secure_url,
      media_type: resource.mediaType,
    }))

  let inserted = 0
  if (rows.length > 0) {
    const { data, error } = await supabase
      .from('gallery')
      .insert(rows)
      .select('id')
    if (error) throw error
    inserted = data?.length || 0
  }

  console.log(`Cloudinary prefix: ${prefix}`)
  console.log(`Found ${images.length} images and ${videos.length} videos`)
  console.log(`Inserted ${inserted} new gallery rows`)
  console.log(`Skipped ${resources.length - inserted} existing rows`)
}

syncCloudinaryGallery().catch(error => {
  console.error('Error syncing Cloudinary gallery:', error)
  process.exit(1)
})
