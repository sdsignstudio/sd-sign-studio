import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let rawSupabase = null
const isConfigured = supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey

if (isConfigured) {
  try {
    rawSupabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (e) {
    console.warn("Supabase client failed to initialize, using mock fallback:", e)
  }
}

// Helper to access simulated db tables in localStorage
const getMockData = (table) => {
  try {
    const stored = localStorage.getItem(`mock_${table}`)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error("Error reading localStorage:", e)
  }
  
  // Return empty list or defaults
  if (table === 'services') {
    return [
      { id: '1', title: '3D Lettering Signs' },
      { id: '2', title: 'Shop Front Signs' },
      { id: '3', title: 'Illuminated & Neon Signs' },
      { id: '4', title: 'Projecting Signs & Lightboxes' },
      { id: '5', title: 'Vehicle Graphics & Wrapping' },
      { id: '6', title: 'Window Graphics' },
      { id: '7', title: 'Shop Awnings' },
      { id: '8', title: 'Banner & Logo Printing' },
      { id: '9', title: 'Custom Workwear' },
      { id: '10', title: 'Flyers & Brochures' },
      { id: '11', title: 'Exhibition Stands & Flags' },
      { id: '12', title: 'Menu Displays' },
      { id: '13', title: 'Safety & Interior Signs' },
      { id: '14', title: 'Food Truck/Trailer Wraps' },
      { id: '15', title: 'Heras Fence Banners' },
    ]
  }
  if (table === 'gallery') {
    return [
      { id: 1, title: 'Commercial Van Wrap', category: 'Vehicle Graphics & Wrapping', image: '/images/client-images/van_wrapping.jpg' },
      { id: 2, title: 'Printed Promotional Banner', category: 'Banner & Logo Printing', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg' },
      { id: 3, title: 'Storefront Signage', category: 'Shop Front Signs', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg' },
      { id: 4, title: 'Retail Window Decals', category: 'Window Graphics', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg' },
      { id: 5, title: 'Company Car Graphics', category: 'Vehicle Graphics & Wrapping', image: '/images/client-images/car2.jpg' },
      { id: 6, title: 'Printed Mesh Fence Cover', category: 'Heras Fence Banners', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg' },
      { id: 7, title: 'Fleet Branding Van Wrap', category: 'Vehicle Graphics & Wrapping', image: '/images/client-images/van_wrapping_2.webp' },
    ]
  }
  if (table === 'testimonials') {
    return [
      { id: 1, name: "David Miller", company: "Miller Motors", rating: 5, text: "Excellent vehicle wrap! SD Sign Studio transformed our van fleet and the design looks incredibly premium. Highly recommend them." },
      { id: 2, name: "Sarah Higgins", company: "Higgins Cafe", rating: 5, text: "The neon illuminated sign they installed for our Glasgow storefront is an absolute showstopper. Very quick service!" },
      { id: 3, name: "Marc Thompson", company: "Apex Gym", rating: 5, text: "Superb quality materials and extremely fast turnaround. The custom wall branding and exterior 3D lettering are perfect." }
    ]
  }
  return []
}

const saveMockData = (table, data) => {
  try {
    localStorage.setItem(`mock_${table}`, JSON.stringify(data))
  } catch (e) {
    console.error("Error writing localStorage:", e)
  }
}

class MockQueryBuilder {
  constructor(table) {
    this.table = table
    this.filters = []
    this.ordering = null
    this.limitCount = null
  }

  select(fields) {
    return this
  }

  eq(col, val) {
    this.filters.push({ col, val })
    return this
  }

  order(col, options = {}) {
    this.ordering = { col, ascending: options.ascending ?? true }
    return this
  }

  limit(count) {
    this.limitCount = count
    return this
  }

  single() {
    if (this.table === 'user_roles') {
      return Promise.resolve({ data: { role: 'admin', user_id: 'mock-admin-id' }, error: null })
    }
    return this.then(res => {
      return { data: res.data ? res.data[0] : null, error: res.error }
    })
  }

  async insert(rows) {
    try {
      const current = getMockData(this.table)
      const newRows = Array.isArray(rows) 
        ? rows.map(r => ({ id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), ...r })) 
        : [{ id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), ...rows }]
      
      const updated = [...newRows, ...current]
      saveMockData(this.table, updated)
      return { data: newRows, error: null }
    } catch (e) {
      return { data: null, error: e }
    }
  }

  // Promise then-able compatibility
  then(onfulfilled, onrejected) {
    const data = getMockData(this.table)
    let filtered = [...data]

    for (const filter of this.filters) {
      filtered = filtered.filter(item => item[filter.col] === filter.val)
    }

    if (this.ordering) {
      const { col, ascending } = this.ordering
      filtered.sort((a, b) => {
        if (a[col] < b[col]) return ascending ? -1 : 1
        if (a[col] > b[col]) return ascending ? 1 : -1
        return 0
      })
    }

    if (this.limitCount !== null) {
      filtered = filtered.slice(0, this.limitCount)
    }

    const result = { data: filtered, error: null, count: filtered.length }
    return Promise.resolve(result).then(onfulfilled, onrejected)
  }
}

let loggedInUser = null
try {
  const storedUser = localStorage.getItem('mock_user')
  if (storedUser) loggedInUser = JSON.parse(storedUser)
} catch (e) {
  console.error(e)
}

const authListeners = new Set()

const triggerAuthChange = (event, session) => {
  authListeners.forEach(listener => {
    try {
      listener(event, session)
    } catch (err) {
      console.error(err)
    }
  })
}

const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: loggedInUser ? { user: loggedInUser } : null }, error: null }),
    onAuthStateChange: (callback) => {
      authListeners.add(callback)
      const session = loggedInUser ? { user: loggedInUser } : null
      // Trigger initially so context registers it
      setTimeout(() => callback('SIGNED_IN', session), 0)
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback)
            }
          }
        }
      }
    },
    signOut: async () => {
      loggedInUser = null
      try {
        localStorage.removeItem('mock_user')
      } catch (e) {}
      triggerAuthChange('SIGNED_OUT', null)
      return { error: null }
    },
    signInWithPassword: async ({ email }) => {
      loggedInUser = { id: 'mock-admin-id', email: email || 'admin@sdsignstudio.co.uk', role: 'admin' }
      try {
        localStorage.setItem('mock_user', JSON.stringify(loggedInUser))
      } catch (e) {}
      triggerAuthChange('SIGNED_IN', { user: loggedInUser })
      return { data: { user: loggedInUser }, error: null }
    },
    signUp: async ({ email }) => {
      loggedInUser = { id: 'mock-admin-id', email: email || 'admin@sdsignstudio.co.uk', role: 'admin' }
      try {
        localStorage.setItem('mock_user', JSON.stringify(loggedInUser))
      } catch (e) {}
      triggerAuthChange('SIGNED_IN', { user: loggedInUser })
      return { data: { user: loggedInUser }, error: null }
    },
  },
  from: (table) => new MockQueryBuilder(table)
}

export const supabase = rawSupabase || mockSupabase

