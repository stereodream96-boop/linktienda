import React, { useState, useEffect } from 'react'

const API_BASE = 'https://www.linktienda.com/api'

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', image: '', category: '', stock: 0 })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth.php`, { credentials: 'include' })
      if (res.ok) {
        setLoggedIn(true)
        loadProducts()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (data.ok) {
        setLoggedIn(true)
        loadProducts()
      } else {
        setError(data.error || 'Error de login')
      }
    } catch (e) {
      setError('Error de conexión')
    }
  }

  const handleLogout = async () => {
    await fetch(`${API_BASE}/auth.php`, { method: 'DELETE', credentials: 'include' })
    setLoggedIn(false)
    setProducts([])
  }

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/products.php`, { credentials: 'include' })
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    const payload = editing ? { ...form, id: editing } : form

    try {
      const res = await fetch(`${API_BASE}/admin/products.php`, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.ok) {
        loadProducts()
        setForm({ name: '', slug: '', description: '', price: '', image: '', category: '', stock: 0 })
        setEditing(null)
      }
    } catch (e) {
      alert('Error al guardar')
    }
  }

  const handleEdit = (product) => {
    setEditing(product.id)
    setForm(product)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar producto?')) return
    try {
      await fetch(`${API_BASE}/admin/products.php?id=${id}`, { method: 'DELETE', credentials: 'include' })
      loadProducts()
    } catch (e) {
      alert('Error al eliminar')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${API_BASE}/upload.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()
      if (data.ok) {
        setForm({ ...form, image: data.path })
      } else {
        alert(data.error || 'Error al subir')
      }
    } catch (e) {
      alert('Error de conexión')
    } finally {
      setUploading(false)
    }
  }

  if (!loggedIn) {
    return (
      <main className="home">
        <section className="product-section container" style={{ maxWidth: 400, margin: '80px auto' }}>
          <h2>Admin - Login</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Ingresar</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="home">
      <section className="product-section container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Admin - Productos</h2>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>

        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: 16, marginBottom: 24, borderRadius: 4 }}>
          <h3>{editing ? 'Editar Producto' : 'Agregar Producto'}</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <input type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="text" placeholder="Slug (ej: tela-estampada)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <input type="number" step="0.01" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input type="text" placeholder="Categoría (ej: Linos)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            
            <div>
              <label>Imagen: </label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <span> Subiendo...</span>}
              {form.image && <div><small>Ruta: {form.image}</small></div>}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit">{editing ? 'Actualizar' : 'Crear'}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', price: '', image: '', category: '', stock: 0 }) }}>Cancelar</button>}
            </div>
          </div>
        </form>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #ddd' }}>ID</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #ddd' }}>Nombre</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #ddd' }}>Precio</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #ddd' }}>Stock</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #ddd' }}>Categoría</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '2px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: 8 }}>{p.id}</td>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8 }}>${parseFloat(p.price).toFixed(2)}</td>
                <td style={{ padding: 8 }}>{p.stock}</td>
                <td style={{ padding: 8 }}>{p.category}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleEdit(p)} style={{ marginRight: 4 }}>Editar</button>
                  <button onClick={() => handleDelete(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}

