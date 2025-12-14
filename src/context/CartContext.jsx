import React, { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch (e) {
      // ignore
    }
  }, [items])

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.product.id === product.id)
      if (exists) {
        return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { product, qty }]
    })
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const updateQty = (productId, qty) => {
    setItems((prev) => prev.map((i) => i.product.id === productId ? { ...i, qty: Math.max(1, qty) } : i))
  }

  const clear = () => setItems([])

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const totalPrice = items.reduce((s, i) => s + (i.product.price * i.qty), 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export default CartContext
