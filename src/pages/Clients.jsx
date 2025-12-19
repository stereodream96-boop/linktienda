import React, { useState, useEffect } from 'react'

const API_BASE = 'https://www.linktienda.com/api'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [creating, setCreating] = useState({ name: '', slug: '', logo: '' })
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [clientProducts, setClientProducts] = useState([])
  const [activeClient, setActiveClient] = useState(null)

  useEffect(() => { loadClients() }, [])

  const loadClients = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/clients.php`, { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/admin/clients.php`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creating) })
      const data = await res.json()
      if (data.ok) { setCreating({ name: '', slug: '', logo: '' }); loadClients() }
      else alert('Error al crear cliente')
    } catch (e) { alert('Error de conexión') }
  }

  const handleUpload = async (file, target, setTarget) => {
    if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('image', file)
    try {
      const res = await fetch(`${API_BASE}/upload.php`, { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (data.ok) setTarget(prev => ({ ...prev, [target]: data.path }))
      else alert('Error al subir')
    } catch (e) { alert('Error de conexión') }
    finally { setUploading(false) }
  }

  const handleEdit = (c) => setEditing({ ...c })

  const viewProducts = async (c) => {
    setActiveClient(c)
    try {
      const res = await fetch(`${API_BASE}/admin/client_products.php?client_id=${c.id}`, { credentials: 'include' })
      if (!res.ok) return alert('Error al cargar productos del cliente')
      const data = await res.json()
      setClientProducts(Array.isArray(data) ? data : [])
    } catch (e) { alert('Error de conexión') }
  }

  const deleteClientProduct = async (pid) => {
    if (!confirm('Eliminar producto de la tabla del cliente?')) return
    try {
      const res = await fetch(`${API_BASE}/admin/client_products.php?client_id=${activeClient.id}&id=${pid}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (data.ok) {
        setClientProducts(clientProducts.filter(p => p.id !== pid))
      } else alert('Error al eliminar')
    } catch (e) { alert('Error de conexión') }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/admin/clients.php`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
      const data = await res.json()
      if (data.ok) { setEditing(null); loadClients() } else alert('Error al actualizar')
    } catch (e) { alert('Error de conexión') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminar cliente y su tabla de productos?')) return
    try {
      await fetch(`${API_BASE}/admin/clients.php?id=${id}`, { method: 'DELETE', credentials: 'include' })
      loadClients()
    } catch (e) { alert('Error al eliminar') }
  }

  return (
    <main className="container" style={{ maxWidth: 900, margin: '40px auto' }}>
      <h2>Gestión de Clientes</h2>

      <section style={{ border: '1px solid #ddd', padding: 12, marginBottom: 16 }}>
        <h3>Crear cliente</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Nombre" value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} required />
          <input placeholder="Slug" value={creating.slug} onChange={(e) => setCreating({ ...creating, slug: e.target.value })} required />
          <div>
            <label>Logo: </label>
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files[0], 'logo', (v) => setCreating(v))} />
            {uploading && <span> Subiendo...</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Crear</button>
          </div>
        </form>
      </section>

      <section>
        <h3>Clientes existentes</h3>
        {clients.length === 0 && <div>No hay clientes.</div>}
        {clients.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {c.logo && <img src={c.logo} alt={c.name} style={{ height: 40 }} />}
              <div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 12 }}>{c.slug}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleEdit(c)}>Editar</button>
              <button onClick={() => viewProducts(c)}>Ver productos</button>
              <button onClick={() => handleDelete(c.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </section>

      {editing && (
        <form onSubmit={handleUpdate} style={{ border: '1px solid #ddd', padding: 12, marginTop: 12 }}>
          <h4>Editar cliente</h4>
          <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
          <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} required />
          <div>
            <label>Logo: </label>
            <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files[0], 'logo', (v) => setEditing(v))} />
            {uploading && <span> Subiendo...</span>}
            {editing.logo && <div><small>{editing.logo}</small></div>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        </form>
      )}
      {activeClient && (
        <section style={{ marginTop: 16 }}>
          <h3>Productos de {activeClient.name}</h3>
          {clientProducts.length === 0 && <div>No hay productos en la tabla del cliente.</div>}
          {clientProducts.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12 }}>{p.slug} — {p.category} — ${p.price}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => deleteClientProduct(p.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
