import React, { useEffect } from 'react'
import './MenuModal.css'

export default function MenuModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const items = [
    'Telas por Nombre',
    'Por Usos',
    'Por Color',
    'Hogar & Decoración',
    'Estudio Mayorista',
    'Nuevos ingresos',
    'Ofertas'
  ]

  const onClickItem = (item, e) => {
    e.preventDefault()
    console.log('Menu click:', item)
    onClose()
  }

  return (
    <div
      className="menu-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
      onTouchStart={onClose}
    >
      <div
        className="menu-panel"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button className="menu-close" onClick={onClose} aria-label="Cerrar menú">×</button>
        <h2 className="menu-title">Menú</h2>
        <ul className="menu-list">
          {items.map((it) => (
            <li key={it}>
              <a href="#" className="menu-item" onClick={(e) => onClickItem(it, e)}>
                {it}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
