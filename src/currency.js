import { useSyncExternalStore } from 'react'

/* ------------------------------------------------------------------
   Which currency the prices show in: 'usd' or 'inr'.

   Default is USD, unless the browser says India (an en-IN / hi-IN style
   language, or an Asia/Kolkata timezone). A visitor who flips the toggle
   keeps their choice (localStorage), and every consumer (the price cards,
   the FAQ, the closing band, the contact form's budget bands) re-renders
   together, because they all read this one store.
   ------------------------------------------------------------------ */
const KEY = 'currency'
const EVENT = 'currencychange'
/* Only used when localStorage refuses the write. */
let memo = null

function detect() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (/^Asia\/(Kolkata|Calcutta)$/.test(tz)) return 'inr'
  } catch {
    /* Intl missing: fall through to the language check. */
  }
  const langs = (typeof navigator !== 'undefined' && (navigator.languages || [navigator.language])) || []
  return langs.some((l) => /-IN$/i.test(l || '')) ? 'inr' : 'usd'
}

function read() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'usd' || saved === 'inr') return saved
  } catch {
    /* Storage blocked (private mode): detection still works. */
  }
  return detect()
}

function subscribe(onChange) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function setCurrency(next) {
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* Not persisted, but still applied for this page view below. */
    memo = next
  }
  window.dispatchEvent(new Event(EVENT))
}

const snapshot = () => memo || read()

export function useCurrency() {
  return useSyncExternalStore(subscribe, snapshot, () => 'usd')
}

/* A price field is either a plain string or { usd, inr }. */
export function inCurrency(value, currency) {
  if (value && typeof value === 'object') return value[currency] ?? value.usd
  return value
}
