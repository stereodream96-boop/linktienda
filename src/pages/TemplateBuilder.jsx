import React, { useState } from 'react'

const API_BASE = 'https://www.linktienda.com/api'

export default function TemplateBuilder() {
  const [template, setTemplate] = useState({ name: '', slug: '', logo: '', banners: [] })
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(false)

  const handleLogoUpload = async (e) => {
    const f = e.target.files[0]
    if (!f) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', f)
    try {
      const res = await fetch(`${API_BASE}/upload.php`, { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (data.ok) setTemplate({ ...template, logo: data.path })
      else alert(data.error || 'Error al subir logo')
    } catch (e) {
      alert('Error de conexión')
    } finally { setUploading(false) }
  }

  const handleBannerUpload = async (e) => {
    const f = e.target.files[0]
    if (!f) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', f)
    try {
      const res = await fetch(`${API_BASE}/upload.php`, { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (data.ok) setTemplate({ ...template, banners: [...template.banners, data.path] })
      else alert(data.error || 'Error al subir banner')
    } catch (e) { alert('Error de conexión') }
    finally { setUploading(false) }
  }

  const addCategoryRow = () => setCategories([...categories, { name: '', slug: '', image: '' }])

  const handleCatImage = async (file, idx) => {
    if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('image', file)
    try {
      const res = await fetch(`${API_BASE}/upload.php`, { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (data.ok) {
        const c = [...categories]; c[idx].image = data.path; setCategories(c)
      }
    } catch (e) { console.error(e) }
    finally { setUploading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      // crear plantilla
      const res = await fetch(`${API_BASE}/admin/templates.php`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })
      const tdata = await res.json()
      if (!tdata.ok) return alert('Error al crear plantilla')
      const tid = tdata.id

      // crear clients (cada categoría se convierte en un cliente con su propia tabla)
      for (let c of categories) {
        await fetch(`${API_BASE}/admin/clients.php`, {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: c.name, slug: c.slug, logo: c.image, meta: { template_id: tid } })
        })
      }

      alert('Plantilla y categorías creadas')
      setTemplate({ name: '', slug: '', logo: '', banners: [] })
      setCategories([])
    } catch (e) {
      alert('Error de conexión')
    }
  }

  return (
    <main className="container" style={{ maxWidth: 900, margin: '40px auto' }}>
      <h2>Crear plantilla / ruta</h2>
      <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Nombre de la plantilla" value={template.name} onChange={(e) => setTemplate({ ...template, name: e.target.value })} required />
        <input placeholder="Slug (ruta) - ej: telas" value={template.slug} onChange={(e) => setTemplate({ ...template, slug: e.target.value })} required />

        <div>
          <label>Logo: </label>
          <input type="file" accept="image/*" onChange={handleLogoUpload} />
          {uploading && <span> Subiendo...</span>}
          {template.logo && <div><small>{template.logo}</small></div>}
        </div>

        <div>
          <label>Agregar banner: </label>
          <input type="file" accept="image/*" onChange={handleBannerUpload} />
          {template.banners.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {template.banners.map((b, i) => <img key={i} src={b} alt={`banner-${i}`} style={{ height: 60 }} />)}
            </div>
          )}
        </div>

        <hr />
        <h3>Categorías</h3>
        <div>
          <button type="button" onClick={addCategoryRow}>Agregar categoría</button>
        </div>

        {categories.map((c, idx) => (
          <div key={idx} style={{ border: '1px solid #eee', padding: 8, borderRadius: 4 }}>
            <input placeholder="Nombre" value={c.name} onChange={(e) => { const arr = [...categories]; arr[idx].name = e.target.value; setCategories(arr) }} required />
            <input placeholder="Slug" value={c.slug} onChange={(e) => { const arr = [...categories]; arr[idx].slug = e.target.value; setCategories(arr) }} required />
            <div>
              <label>Imagen: </label>
              <input type="file" accept="image/*" onChange={(e) => handleCatImage(e.target.files[0], idx)} />
              {c.image && <div><small>{c.image}</small></div>}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">Crear plantilla</button>
        </div>
      </form>

      <hr />
      <h3>Clientes creados</h3>
      {clients.length === 0 && <div>No hay clientes aún (inicia sesión como admin para verlos).</div>}
      {clients.length > 0 && (
        <div style={{ display: 'grid', gap: 8 }}>
          {clients.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #eee', padding: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {c.logo && <img src={c.logo} alt={c.name} style={{ height: 40 }} />}
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12 }}>{c.slug}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleEditClient(c)}>Editar</button>
                <button onClick={() => handleDeleteClient(c.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingClient && (
        <form onSubmit={handleUpdateClient} style={{ border: '1px solid #ddd', padding: 12, marginTop: 12 }}>
          <h4>Editar cliente</h4>
          <input value={editingClient.name} onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })} required />
          <input value={editingClient.slug} onChange={(e) => setEditingClient({ ...editingClient, slug: e.target.value })} required />
          <div>
            <label>Logo: </label>
            <input type="file" accept="image/*" onChange={(e) => handleClientImage(e.target.files[0])} />
            {uploading && <span> Subiendo...</span>}
            {editingClient.logo && <div><small>{editingClient.logo}</small></div>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => setEditingClient(null)}>Cancelar</button>
          </div>
        </form>
      )}
    </main>
  )
}
