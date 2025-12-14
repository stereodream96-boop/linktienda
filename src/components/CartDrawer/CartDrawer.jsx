import React, { useEffect, useState } from 'react'
import './CartDrawer.css'
import { useCart } from '../../context/CartContext'
import { HiX } from 'react-icons/hi'

export default function CartDrawer({ open, onClose }) {
  const { items, updateQty, removeItem, totalItems, totalPrice } = useCart()
  const [visible, setVisible] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      setClosing(false)
    } else if (visible) {
      // start closing animation, then unmount
      setClosing(true)
      const t = setTimeout(() => {
        setClosing(false)
        setVisible(false)
      }, 260) // match CSS transition duration
      return () => clearTimeout(t)
    }
  }, [open])

  if (!visible) return null

  return (
    <div className={`cart-drawer-overlay ${closing ? 'closing' : 'open'}`} onMouseDown={onClose} onTouchStart={onClose}>
      <aside className={`cart-drawer ${closing ? 'closing' : 'open'}`} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
        <header className="cart-drawer-header">
          <h3>Presupuesto rápido</h3>
          <button className="cart-drawer-close" onClick={onClose} aria-label="Cerrar"><HiX /></button>
        </header>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <p>El carrito está vacío.</p>
          ) : (
            <ul className="cart-list">
              {items.map((it) => (
                <li key={it.product.id} className="cart-item">
                  <img src={it.product.image} alt={it.product.title} />
                  <div className="cart-item-meta">
                    <div className="cart-item-title">{it.product.title}</div>
                    <div className="cart-item-controls">
                      <input type="number" min="1" value={it.qty} onChange={(e) => updateQty(it.product.id, parseInt(e.target.value || '1'))} />
                      <button className="link" onClick={() => removeItem(it.product.id)}>Eliminar</button>
                    </div>
                  </div>
                  <div className="cart-item-sub">${(it.product.price * it.qty).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="cart-drawer-footer">
          <div className="cart-summary">Items: {totalItems} — <strong>${totalPrice.toLocaleString()}</strong></div>
          <div className="cart-actions">
            <a href="/carrito" className="btn btn-outline">Ver presupuesto completo</a>
          </div>
        </footer>
      </aside>
    </div>
  )
}
