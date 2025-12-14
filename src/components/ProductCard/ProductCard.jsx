import React from 'react'
import './ProductCard.css'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  return (
    <article className="product-card">
      <div className="product-media">
        <img src={product.image} alt={product.name || product.title} />
      </div>
      <div className="product-body">
        <h3 className="product-title">{product.name || product.title}</h3>
        <p className="product-sub">{product.description || product.subtitle}</p>
        <div className="product-meta">
          <span className="product-price">${parseFloat(product.price).toLocaleString()}</span>
          {product.badge && <span className="product-badge">{product.badge}</span>}
        </div>
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={() => addItem(product)}>Agregar al carrito</button>
        </div>
      </div>
    </article>
  )
}
