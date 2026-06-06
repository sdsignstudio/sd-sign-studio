import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ])
      setProducts(prods || [])
      setCategories(cats || [])
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This action cannot be undone.')) return
    setDeleteId(id)
    try {
      await supabase.from('product_images').delete().eq('product_id', id)
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      toast.success('Product deleted')
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleteId(null)
    }
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory
    return matchSearch && matchCat
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Products</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{products.length} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-red" style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="plus" size={15} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div style={{ ...card, padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
            <Icon name="search" size={15} />
          </span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 14px 9px 36px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', color: '#111' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>Category:</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--font)', outline: 'none', color: '#111', background: '#fff', cursor: 'pointer' }}
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        {(search || selectedCategory !== 'all') && (
          <button onClick={() => { setSearch(''); setSelectedCategory('all') }} style={{ fontSize: '13px', fontWeight: 600, color: '#E8000D', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Results info */}
      {(search || selectedCategory !== 'all') && (
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
          Showing <strong style={{ color: '#111827' }}>{filtered.length}</strong> of {products.length} products
        </p>
      )}

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600 }}>Loading products...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['Image', 'Product Name', 'Category', 'Price', 'Badge', 'Actions'].map((h, i) => (
                    <th key={h} style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: i === 5 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                      <div style={{ color: '#9ca3af' }}>
                        <Icon name="products" size={40} />
                        <p style={{ fontSize: '15px', fontWeight: 600, marginTop: '12px' }}>No products found</p>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Try adjusting your search or filters</p>
                        <Link to="/admin/products/new" className="btn-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', padding: '10px 20px', fontSize: '13px' }}>
                          <Icon name="plus" size={14} /> Add Product
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '12px 20px' }}>
                      <img
                        src={product.primary_image || 'https://placehold.co/48x48/f3f4f6/9ca3af?text=No+img'}
                        alt={product.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                      />
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{product.name}</span>
                      {product.short_description && (
                        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.short_description}</p>
                      )}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#E8000D', background: '#fff1f2', padding: '3px 10px', borderRadius: '20px' }}>
                        {product.category || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '15px', fontWeight: 800, color: '#111827', whiteSpace: 'nowrap' }}>
                      £{Number(product.price || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      {product.badge ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827', background: '#fef9c3', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fde047' }}>
                          {product.badge}
                        </span>
                      ) : <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}
                        >
                          <Icon name="edit" size={13} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteId === product.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff1f2', color: '#dc2626', border: 'none', padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', opacity: deleteId === product.id ? 0.6 : 1 }}
                        >
                          <Icon name="trash" size={13} /> {deleteId === product.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
