/* ------------------------------------------------------------------
   The action dock (components/ActionDock.jsx, Spec 1) shows a
   different button on a plan or check result screen: one full-width
   "Send my plan/result on WhatsApp" button carrying that result's own
   message, not the generic per-page one. The result lives several
   components away from the dock (it is
   mounted once in App.jsx, after Footer), so the result screens publish
   their message here while mounted, and the dock reads it — the same
   external-store pattern as currency.js, minus persistence: this is
   per-render state, not a visitor preference.
   ------------------------------------------------------------------ */
let state = null
const listeners = new Set()

export function setResultHandoff(next) {
  state = next
  listeners.forEach((fn) => fn())
}

export function clearResultHandoff() {
  state = null
  listeners.forEach((fn) => fn())
}

export function subscribeResultHandoff(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getResultHandoff() {
  return state
}
