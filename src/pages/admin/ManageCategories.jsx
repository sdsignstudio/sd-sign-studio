import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadToCloudinary } from '../../lib/cloudinary'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', background: '#fff', color: '#111' }

function ImageUploadBox({ value, onChange, label = 'Category Image', size = 80 }) {
  const ref = useRef()
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)

  const handle = async (file) => {
    if (!file || !file.type.startsWith('image/')) return toast.error('Please select an image file')
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      onChange(url)
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Preview */}
        <div style={{ width: size, height: size, borderRadius: '10px', border: '2px dashed #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
          {uploading ? (
            <div style={{ width: '22px', height: '22px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : value ? (
            <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
          ) : (
            <Icon name="photo" size={24} />
          )}
        </div>

        {/* Upload area */}
        <div
          onClick={() => !uploading && ref.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]) }}
          style={{ flex: 1, border: `2px dashed ${drag ? '#E8000D' : '#e5e7eb'}`, borderRadius: '10px', padding: '16px', cursor: uploading ? 'not-allowed' : 'pointer', textAlign: 'center', background: drag ? '#fff1f2' : '#fafafa', transition: 'all 0.15s' }}
        >
          <div style={{ color: '#9ca3af', marginBottom: '6px' }}><Icon name="upload" size={18} /></div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 2px' }}>
            {uploading ? 'Uploading…' : 'Click or drag to upload'}
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>PNG, JPG, SVG, WebP</p>
          <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />
        </div>

        {value && (
          <button type="button" onClick={() => onChange('')} style={{ background: '#fff1f2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', flexShrink: 0 }} title="Remove image">
            <Icon name="trash" size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [productCounts, setProductCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newIconUrl, setNewIconUrl] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editIconUrl, setEditIconUrl] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      setCategories(cats || [])
      const { data: prods } = await supabase.from('products').select('category')
      const counts = {}
      prods?.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1 })
      setProductCounts(counts)
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async e => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return toast.error('Category already exists')
    setAddLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, icon_url: newIconUrl || null }])
        .select().single()
      if (error) throw error
      toast.success('Category added')
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      setNewIconUrl('')
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setAddLoading(false)
    }
  }

  const startEdit = (cat) => {
    setEditId(cat.id)
    setEditName(cat.name)
    setEditIconUrl(cat.icon_url || '')
  }

  const handleEdit = async () => {
    const name = editName.trim()
    if (!name) return
    setEditSaving(true)
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name, icon_url: editIconUrl || null })
        .eq('id', editId)
      if (error) throw error
      toast.success('Category updated')
      setCategories(prev => prev.map(c => c.id === editId ? { ...c, name, icon_url: editIconUrl || null } : c).sort((a, b) => a.name.localeCompare(b.name)))
      setEditId(null)
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    const count = productCounts[name] || 0
    const msg = count > 0
      ? `"${name}" has ${count} product(s). Deleting it won't remove the products. Continue?`
      : `Delete category "${name}"?`
    if (!window.confirm(msg)) return
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      toast.success('Category deleted')
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch {
      toast.error('Failed to delete category')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Categories</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Organise your products into categories with images</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Add Form ── */}
        <div style={{ ...card, padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
            Add New Category
          </h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Category Name *</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Audi"
                style={inputStyle}
                required
              />
            </div>

            <ImageUploadBox
              label="Category Image / Icon"
              value={newIconUrl}
              onChange={setNewIconUrl}
              size={72}
            />

            <button
              type="submit"
              disabled={addLoading || !newName.trim()}
              className="btn-red"
              style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', opacity: addLoading ? 0.7 : 1 }}
            >
              <Icon name="plus" size={14} />
              {addLoading ? 'Adding…' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* ── Category List ── */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>All Categories ({categories.length})</h3>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              Loading…
            </div>
          ) : categories.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
              <Icon name="categories" size={36} />
              <p style={{ marginTop: '10px', fontWeight: 600 }}>No categories yet</p>
            </div>
          ) : (
            <div>
              {categories.map((cat, i) => (
                <div key={cat.id} style={{ borderBottom: i < categories.length - 1 ? '1px solid #f3f4f6' : 'none' }}>

                  {/* Edit mode */}
                  {editId === cat.id ? (
                    <div style={{ padding: '16px 20px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ ...inputStyle, fontSize: '13px', padding: '8px 12px' }}
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditId(null) }}
                      />
                      <ImageUploadBox
                        label="Image / Icon"
                        value={editIconUrl}
                        onChange={setEditIconUrl}
                        size={60}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={handleEdit}
                          disabled={editSaving}
                          className="btn-red"
                          style={{ padding: '7px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', opacity: editSaving ? 0.7 : 1 }}
                        >
                          <Icon name="save" size={12} /> {editSaving ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditId(null)} style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 20px', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      {/* Image */}
                      <div style={{ width: '44px', height: '44px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        {cat.icon_url ? (
                          <img src={cat.icon_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                        ) : (
                          <span style={{ fontSize: '18px', fontWeight: 800, color: '#E8000D' }}>{cat.name.charAt(0)}</span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{cat.name}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '10px' }}>
                            {productCounts[cat.name] || 0} product{productCounts[cat.name] !== 1 ? 's' : ''}
                          </span>
                          {!cat.icon_url && (
                            <span style={{ fontSize: '10px', color: '#f59e0b', background: '#fffbeb', padding: '1px 6px', borderRadius: '6px', fontWeight: 600 }}>No image</span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          onClick={() => startEdit(cat)}
                          style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Icon name="edit" size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          style={{ background: '#fff1f2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
