import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const COUNTRIES = {
  IN: {
    code: 'IN',
    label: 'India',
    shortLabel: 'IN',
    flag: '🇮🇳',
    currency: 'INR',
    locale: 'en-IN',
  },
  GB: {
    code: 'GB',
    label: 'United Kingdom',
    shortLabel: 'UK',
    flag: '🇬🇧',
    currency: 'GBP',
    locale: 'en-GB',
  },
}

const STORAGE_KEY = 'sd-sign-studio-country'
const CountryContext = createContext(null)

function detectInitialCountry() {
  if (typeof window === 'undefined') return COUNTRIES.GB

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved && COUNTRIES[saved]) return COUNTRIES[saved]

  const locale = window.navigator.language || ''
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  if (locale.toLowerCase().includes('in') || timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta') {
    return COUNTRIES.IN
  }

  return COUNTRIES.GB
}

export function CountryProvider({ children }) {
  const [countryCode, setCountryCode] = useState(() => detectInitialCountry().code)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, countryCode)
  }, [countryCode])

  const value = useMemo(() => ({
    country: COUNTRIES[countryCode] || COUNTRIES.GB,
    countries: Object.values(COUNTRIES),
    setCountryCode,
  }), [countryCode])

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  const context = useContext(CountryContext)
  if (!context) throw new Error('useCountry must be used inside CountryProvider')
  return context
}

export function getProductPrice(product, countryCode) {
  if (!product) return 0
  const fallback = Number(product.price || 0)
  const price = countryCode === 'IN'
    ? product.price_inr
    : product.price_gbp

  const parsed = Number(price)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function formatCurrency(amount, countryCode) {
  const country = COUNTRIES[countryCode] || COUNTRIES.GB
  const parsed = Number(amount || 0)

  return new Intl.NumberFormat(country.locale, {
    style: 'currency',
    currency: country.currency,
    maximumFractionDigits: parsed % 1 === 0 ? 0 : 2,
  }).format(parsed)
}

export function formatProductPrice(product, countryCode) {
  return formatCurrency(getProductPrice(product, countryCode), countryCode)
}
