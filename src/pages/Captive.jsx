import React, { useState } from 'react'
import pantonBold from '../fonts/Panton-Bold.ttf'
import logoImg from '../../img/logo_APC2.png'

const API_URL = 'https://www.linktienda.com/api/captive.php'
const REDIRECT_URL = 'https://www.instagram.com/apc_lujandecuyo/'

export default function CaptivePortal() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un email válido')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({ ok: false, error: 'Respuesta no JSON' }))
      console.log('Captive submit response:', { status: res.status, data })
      if (!res.ok || !data.ok) {
        setError(data.error || `Error HTTP ${res.status}`)
        return
      }
      setError('')
      window.location.assign(REDIRECT_URL)
    } catch (err) {
      console.error('Captive submit error:', err)
      setError(`Error de conexión: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="captive-bg">
        <style>{`
        @font-face{ font-family: 'PantonBold'; src: url(${pantonBold}) format('truetype'); font-weight:700; font-style:normal; font-display:swap; }
        .captive-bg{ min-height:100vh; display:flex; align-items:center; justify-content:center; background:#ffd600; }
          .captive-card{ width:420px; max-width:92%; background:#fff; border-radius:12px; box-shadow:0 12px 30px rgba(0,0,0,0.18); padding:36px; text-align:center; font-family: 'PantonBold', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
          .captive-logo{ width:140px; height:auto; margin-bottom:18px; }
          .captive-title{ margin:6px 0 8px; font-size:22px; font-weight:700; color:#111; }
          .captive-sub{ margin:0 0 12px; font-size:18px; font-weight:700; color:#111; }
          .captive-hint{ display:block; color:#666; margin-bottom:18px; }
          .captive-input{ padding:12px 14px; font-size:15px; border-radius:8px; border:1px solid #e0e0e0; outline:none; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          .captive-btn{ padding:12px 14px; font-size:16px; border-radius:8px; background:#a61975; color:#fff; border:none; cursor:pointer; font-family:inherit; }
        @media (max-width:480px){
          .captive-card{ padding:20px; margin:18px; }
          .captive-logo{ width:150px; margin: 20px auto 20px auto; }
          .captive-title{ font-size:22px; margin-bottom: 10px; }
          .captive-sub{ font-size:15px; }
          .captive-input{ font-size:14px; padding:10px 12px; }
          .captive-btn{ font-size:15px; padding:10px 12px; }
        }
        @media (min-width:1024px){
          .captive-logo{ width:250px; height:auto; margin: 20px auto 30px auto; }
          .captive-card{ width:520px; }
          .captive-title{ font-size:36px; }
          .captive-sub{ font-size:20px; }
        }
        `}</style>

      <div className="captive-card">
        <img className="captive-logo" src={logoImg} alt="APC" />
        <h1 className="captive-title">Agencia de Promocion Cultural</h1>
        <h2 className="captive-sub">Acceso a Internet Gratis!</h2>
        <span className="captive-hint">Ingresa tu email para Navegar Gratis</span>

        {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="captive-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="captive-btn" type="submit" disabled={submitting}>
            {submitting ? 'Procesando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </main>
  )
}

