import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const { Client } = pg
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
    url.searchParams.set('prefix', prefix)
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
    resources.push(...(data.resources || []))
    nextCursor = data.next_cursor || null
  } while (nextCursor)

  return resources
}

async function syncCloudinaryGallery() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing from .env')
  }

  const prefix = process.argv[2] || DEFAULT_PREFIX
  const client = new Client({ connectionString: process.env.DATABASE_URL })

  try {
    const [images, videos] = await Promise.all([
      fetchResources('image', prefix),
      fetchResources('video', prefix),
    ])

    const resources = [
      ...images.map(resource => ({ ...resource, mediaType: 'image' })),
      ...videos.map(resource => ({ ...resource, mediaType: 'video' })),
    ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

    await client.connect()

    let inserted = 0
    for (const [index, resource] of resources.entries()) {
      const mediaUrl = resource.secure_url
      const category = CATEGORY_ROTATION[index % CATEGORY_ROTATION.length]
      const title = titleFromPublicId(resource.public_id)

      const result = await client.query(`
        INSERT INTO gallery (title, category, image, media_url, media_type)
        SELECT $1, $2, $3, $3, $4
        WHERE NOT EXISTS (
          SELECT 1 FROM gallery WHERE media_url = $3 OR image = $3
        );
      `, [title, category, mediaUrl, resource.mediaType])

      inserted += result.rowCount
    }

    await client.query(`NOTIFY pgrst, 'reload schema';`)
    console.log(`Cloudinary prefix: ${prefix}`)
    console.log(`Found ${images.length} images and ${videos.length} videos`)
    console.log(`Inserted ${inserted} new gallery rows`)
    console.log(`Skipped ${resources.length - inserted} existing rows`)
  } finally {
    await client.end()
  }
}

syncCloudinaryGallery().catch(error => {
  console.error('Error syncing Cloudinary gallery:', error)
  process.exit(1)
})
