import React from "react";
import "./Header.css";
import logo from './logo.png'
import { HiShoppingCart, HiUser, HiHome, HiOutlineSearch, HiMenu } from "react-icons/hi";
import { useCart } from '../../context/CartContext'
import { useState } from 'react'
import CartDrawer from '../CartDrawer/CartDrawer'

const Header = ({ onOpenSearch, onOpenMenu }) => {
  // Navegar al home: busca el elemento con clase "home" y hace scroll suave.
  const goHome = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    // Actualiza la URL y notifica a la app
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }

    const el = document.querySelector('.home')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      // fallback: subir al tope
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  // Navegar a la página Cuenta
  const goAccount = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    if (window.location.pathname !== '/cuenta') {
      window.history.pushState({}, '', '/cuenta')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [drawerOpen, setDrawerOpen] = useState(false)
  const goCart = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    setDrawerOpen(true)
  }
  const { totalItems } = useCart()

  return (
    <>
      {/* HEADER DESKTOP */}
      <header className="header-desktop">
        <div className="header-desktop-inner">
          {/* Logo */}
          <div className="header-logo">
            <a href="/" className="logo-link" onClick={goHome} aria-label="Ir al inicio">
              <img src={logo} alt="Telas logo" className="logo-img" />
              <span className="logo-text">Telas Baires</span>
            </a>
          </div>

          {/* Buscador: abre modal al enfocar o clicar */}
          <div className="header-search">
            <span className="search-icon" onClick={() => onOpenSearch?.()} role="button" aria-label="Abrir búsqueda"><HiOutlineSearch /></span>
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              className="search-input"
              onFocus={() => onOpenSearch?.()}
              onClick={() => onOpenSearch?.()}
              readOnly
            />
          </div>

          {/* Menú principal */}
          <nav className="header-nav">
            <button className="nav-item">Telas por Nombre ▾</button>
            <button className="nav-item">Por Usos ▾</button>
            <button className="nav-item">Por Color ▾</button>
            <button className="nav-item">Hogar &amp; Decoración ▾</button>
            <button className="nav-item">Estudio Mayorista</button>
            <button className="nav-item">Nuevos ingresos</button>
            <button className="nav-item nav-item--offers">Ofertas</button>
          </nav>

          {/* Cuenta / Carrito */}
          <div className="header-actions">
            <button className="icon-button" type="button" onClick={goAccount} aria-label="Ir a mi cuenta">
              <span className="icon"><HiUser /></span>
              <span className="icon-label">Cuenta</span>
            </button>
            <button className="icon-button icon-cart" type="button" onClick={goCart} aria-label="Ver carrito">
              <span className="icon"><HiShoppingCart /></span>
              <span className="icon-label">Carrito ({totalItems})</span>
            </button>
            <button className="icon-button icon-menu" type="button" onClick={() => onOpenMenu?.()} aria-label="Abrir menú">
              <span className="icon"><HiMenu /></span>
              <span className="icon-label">Menú</span>
            </button>
          </div>
        </div>
      </header>

      {/* NAV INFERIOR MOBILE */}
      <nav className="bottom-nav-mobile">
        <button className="bottom-nav-item" type="button" onClick={goHome}>
          <span className="bottom-icon"><HiHome /></span>
        </button>
        <button className="bottom-nav-item" type="button" onClick={() => onOpenSearch?.()} aria-label="Abrir búsqueda">
          <span className="bottom-icon"><HiOutlineSearch /></span>
        </button>
        <button className="bottom-nav-item bottom-nav-item--primary" type="button" onClick={goCart}>
          <span className="bottom-icon"><HiShoppingCart /></span>
          <span className="bottom-label">Carrito ({totalItems})</span>
        </button>
        <button className="bottom-nav-item" type="button" onClick={goAccount} aria-label="Ir a mi cuenta">
          <span className="bottom-icon"><HiUser /></span>
        </button>
        <button className="bottom-nav-item" type="button" onClick={() => onOpenMenu?.()} aria-label="Abrir menú">
          <span className="bottom-icon"><HiMenu /></span>
        </button>
      </nav>
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default Header;
