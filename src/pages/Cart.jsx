import React, { useState } from 'react'
import { useCart } from '../context/CartContext'

const API_URL = 'https://www.linktienda.com/api/orders.php'

export default function CartPage() {
  const { items, updateQty, removeItem, totalItems, totalPrice, clear } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleFinalize = async () => {
    const name = prompt('Nombre del cliente:')
    if (!name) return

    const email = prompt('Email (opcional):') || ''

    setSubmitting(true)
    setMessage('')

    try {
      // Mapear items al formato esperado por la API
      const orderItems = items.map((it) => ({
        product_id: it.product.id,
        quantity: it.qty,
        price: parseFloat(it.product.price),
      }))

      const payload = {
        customer: { name, email },
        items: orderItems,
        total: totalPrice,
      }

      // Crear blob sin BOM
      const jsonString = JSON.stringify(payload)
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonString,
      })

      const result = await response.json()

      if (result.ok) {
        setMessage(`✓ Presupuesto #${result.order_id} creado. Te contactaremos pronto.`)
        clear()
      } else {
        setMessage(`✗ Error: ${result.error || 'No se pudo crear el presupuesto'}`)
      }
    } catch (err) {
      console.error('Error al enviar presupuesto:', err)
      setMessage(`✗ Error de conexión: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="home">
      <section className="product-section container">
        <h2>Presupuesto / Carrito ({totalItems})</h2>
        {items.length === 0 ? (
          <p>No hay productos en el carrito.</p>
        ) : (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Producto</th>
                  <th style={{ padding: '8px' }}>Precio</th>
                  <th style={{ padding: '8px' }}>Cantidad</th>
                  <th style={{ padding: '8px' }}>Subtotal</th>
                  <th style={{ padding: '8px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.product.id}>
                    <td style={{ padding: '8px' }}>{it.product.name || it.product.title}</td>
                    <td style={{ padding: '8px' }}>${parseFloat(it.product.price).toLocaleString()}</td>
                    <td style={{ padding: '8px' }}>
                      <input type="number" min="1" value={it.qty} onChange={(e) => updateQty(it.product.id, parseInt(e.target.value || '1'))} style={{ width: 64 }} />
                    </td>
                    <td style={{ padding: '8px' }}>${(parseFloat(it.product.price) * it.qty).toLocaleString()}</td>
                    <td style={{ padding: '8px' }}>
                      <button onClick={() => removeItem(it.product.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Total: ${totalPrice.toLocaleString()}</strong>
              <div>
                <button onClick={() => clear()} style={{ marginRight: 8 }}>Vaciar</button>
                <button onClick={handleFinalize} disabled={submitting}>{submitting ? 'Enviando...' : 'Finalizar presupuesto'}</button>
              </div>
            </div>

            {message && <p style={{ marginTop: 16, padding: '8px', backgroundColor: message.includes('✓') ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>{message}</p>}
          </div>
        )}
      </section>
    </main>
  )
}
