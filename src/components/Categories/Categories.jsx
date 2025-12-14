import React from 'react'
import './Categories.css'
import products from '../../data/products'

export default function Categories() {
  // Usamos las primeras 7 entradas como categorías visuales
  const cats = products.slice(0, 7)

  const handleClick = (name, e) => {
    e.preventDefault()
    // Navegación mínima: actualizar URL y notificar app
    const slug = `/categoria/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`
    window.history.pushState({}, '', slug)
    window.dispatchEvent(new PopStateEvent('popstate'))
    console.log('Ir a categoría:', name)
  }

  return (
    <section className="categories-section container">
      <h2 className="categories-title">Explorá nuestras telas por categoría</h2>
      <div className="categories-grid">
        {cats.map((c, idx) => (
          <button
            key={c.id}
            className="category-item"
            onClick={(e) => handleClick(c.title, e)}
            aria-label={`Ver categoría ${c.title}`}
          >
            <div className="category-media">
              <img src={c.image} alt={c.title} />
            </div>
            <div className="category-label">{c.title}</div>
          </button>
        ))}
      </div>
    </section>
  )
}
