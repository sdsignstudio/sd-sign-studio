import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CountryProvider } from './context/CountryContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CountryProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </CountryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
