import React, { useState, useEffect } from 'react'
import Header from './components/Header/Header'
import TopBanner from './components/Banner/Banner'
import Home from './components/Home/Home'
import Footer from './components/Footer/Footer'
import Account from './pages/Account'
import Category from './pages/Category'
import Admin from './pages/Admin'
import SearchModal from './components/Search/SearchModal'
import MenuModal from './components/Menu/MenuModal'
import { CartProvider } from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import CartPage from './pages/Cart'
import CaptivePortal from './pages/Captive'

export default function App() {
  const [path, setPath] = useState(typeof window !== 'undefined' ? window.location.pathname : '/')
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // extrae slug para /categoria/:slug
  const isCategory = path.startsWith('/categoria/')
  const isPortal = path === '/portal' || path.startsWith('/portal/')
  const categorySlug = isCategory ? path.replace('/categoria/', '') : null
  return (
    <ProductProvider>
      <CartProvider>
        <div className="app">
          {!isPortal && (
            <>
              <TopBanner />
              <Header onOpenSearch={() => setSearchOpen(true)} onOpenMenu={() => setMenuOpen(true)} />
            </>
          )}
          {path === '/admin' ? (
            <Admin />
          ) : path === '/cuenta' ? (
            <Account />
          ) : path === '/carrito' ? (
            <CartPage />
          ) : isPortal ? (
            <CaptivePortal />
          ) : isCategory ? (
            <Category slug={categorySlug} />
          ) : (
            <Home />
          )}
          {!isPortal && <Footer />}

          {!isPortal && searchOpen && (
            <React.Suspense fallback={null}>
              <SearchModal onClose={() => setSearchOpen(false)} />
            </React.Suspense>
          )}

          {!isPortal && menuOpen && (
            <React.Suspense fallback={null}>
              <MenuModal onClose={() => setMenuOpen(false)} />
            </React.Suspense>
          )}
        </div>
      </CartProvider>
    </ProductProvider>
  )
}
