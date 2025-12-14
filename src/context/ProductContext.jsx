import React, { createContext, useContext, useEffect, useState } from 'react'

const ProductContext = createContext(null)

const API_URL = 'https://www.linktienda.com/api/products.php'

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}?_t=${Date.now()}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err.message)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <ProductContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts debe usarse dentro de ProductProvider')
  return ctx
}
