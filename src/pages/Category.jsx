import React from 'react'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard/ProductCard'

function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
}

export default function Category({ slug }) {
  const { products, loading, error } = useProducts()

  if (loading) return <section className="product-section container"><p>Cargando productos...</p></section>
  if (error) return <section className="product-section container"><p>Error: {error}</p></section>

  // Si no hay slug, mostramos todos
  if (!slug) {
    return (
      <section className="product-section container">
        <h2>Categoría</h2>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    )
  }

  const filtered = products.filter((p) => slugify(p.name || p.title).includes(slug))

  return (
    <section className="product-section container">
      <h2>Resultados para "{slug.replace(/-/g, ' ')}"</h2>
      {filtered.length === 0 ? (
        <p>No se encontraron productos para esta categoría.</p>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
