import React, { useEffect, useState } from 'react'
import './Banner.css'

export default function TopBanner() {
  const messages = [
    'ENVÍO GRATIS en compras de más de $100.000',
    '5% de descuento en efectivo'
  ]

  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState(null)
  const animationMs = 2000

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((cur) => {
        setPrev(cur)
        const next = (cur + 1) % messages.length
        // limpiamos prev después de la animación
        setTimeout(() => setPrev(null), animationMs)
        return next
      })
    }, 5000)

    return () => clearInterval(id)
  }, [])

  return (
    <div className="top-banner" role="status" aria-live="polite">
      <div className="banner-inner">
        {prev !== null && (
          <span key={prev} className="banner-message slide-out-left">
            {messages[prev]}
          </span>
        )}

        <span key={index} className={`banner-message ${prev !== null ? 'slide-in-right' : ''}`}>
          {messages[index]}
        </span>
      </div>
    </div>
  )
}
