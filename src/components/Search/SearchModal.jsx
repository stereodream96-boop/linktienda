import React, { useEffect, useRef, useState } from 'react'
import './SearchModal.css'

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const popular = [
    'Lona estampada',
    'Algodón 100%',
    'Seda natural',
    'Franela',
    'Gasa transparente',
    'Jacquard',
    'Lino lavado',
    'Microfibra',
    'Denim stretch',
    'Tafetán'
  ]

  const clickPopular = (item, e) => {
    e.preventDefault()
    setQuery(item)
    inputRef.current?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Por ahora mostramos en consola; se puede integrar búsqueda real
    console.log('Buscar:', query)
    onClose()
  }

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
      onTouchStart={onClose}
    >
      <div
        className="search-panel"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button className="search-close" onClick={onClose} aria-label="Cerrar búsqueda">×</button>

        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-input-wrap">
            <span className="search-icon"><HiOutlineSearch /></span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué estás buscando?"
              aria-label="Buscar"
            />
          </div>
        </form>

        <h3 className="popular-title">Búsquedas Populares</h3>
        <ul className="popular-list">
          {popular.map((p) => (
            <li key={p}>
              <a href="#" onClick={(e) => clickPopular(p, e)} className="popular-item">
                {p}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
