import React, { useEffect, useState } from 'react'
import './Hero.css'
import heroImg from './hero.png'
import hero1Img from './hero1.png'
import hero2Img from './hero2.jpg'

export default function Hero() {
  const slides = [
    {
      id: 1,
      image: heroImg,
      h1: 'Telas Premium',
      h2: 'Descubre nuestra colección exclusiva de telas de alta calidad'
    },
    {
      id: 2,
      image: hero1Img,
      h1: 'Ofertas Especiales',
      h2: 'Aprovecha nuestros descuentos en telas seleccionadas'
    },
    {
      id: 3,
      image: hero2Img,
      h1: 'Nuevas Colecciones',
      h2: 'Llega lo último en diseños y colores para tus proyectos'
    }
  ]

  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState(null)
  const animationMs = 800

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((cur) => {
        setPrev(cur)
        const next = (cur + 1) % slides.length
        setTimeout(() => setPrev(null), animationMs)
        return next
      })
    }, 5000)

    return () => clearInterval(id)
  }, [slides.length])

  return (
    <div className="hero">
      <div className="hero-inner">
        {prev !== null && (
          <div
            key={`prev-${prev}`}
            className="hero-slide slide-out-left-fade"
            style={{ backgroundImage: `url(${slides[prev].image})` }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <h1>{slides[prev].h1}</h1>
              <h2>{slides[prev].h2}</h2>
            </div>
          </div>
        )}

        <div
          key={`current-${index}`}
          className={`hero-slide ${prev !== null ? 'slide-in-right-fade' : ''}`}
          style={{ backgroundImage: `url(${slides[index].image})` }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>{slides[index].h1}</h1>
            <h2>{slides[index].h2}</h2>
          </div>
        </div>
      </div>
    </div>
  )
}
