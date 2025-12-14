import React from 'react'
import { useProducts } from '../../context/ProductContext'
import Hero from '../Hero/Hero'
import Button from '../Button/Button'
import Categories from '../Categories/Categories'
import ProductCard from '../ProductCard/ProductCard'

export default function Home() {
  const { products, loading, error } = useProducts()

  return (
    <main className="home">
      <Hero />
      <div className="container">
        {/* Reemplazado: sección de categorías */}
        <Categories />
      </div>

      <section className="product-section container">
        <h2>Productos Destacados</h2>
        {loading ? (
          <p>Cargando productos...</p>
        ) : error ? (
          <p>Error al cargar productos: {error}</p>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
