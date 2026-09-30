/* Board coordinates for the flow canvas (760x440), shared by the canvas
   and the stacked phone/tablet list. */

export const W = 760
export const H = 440
export const NH = 64 // node height

export const NODES = {
  wa: { x: 96, y: 160, w: 180, label: 'WhatsApp', sub: 'patients', input: true },
  web: { x: 96, y: 280, w: 180, label: 'Website chat', sub: 'visitors', input: true },
  desk: { x: 345, y: 220, w: 170, label: 'AI front desk', sub: 'Demo Physio Clinic' },
  cal: { x: 630, y: 52, w: 236, label: 'Calendar', sub: 'appointments' },
  sheet: { x: 630, y: 136, w: 236, label: 'Sheets', sub: 'bookings log' },
  gmail: { x: 630, y: 220, w: 236, label: 'Gmail', sub: 'email' },
  docs: { x: 630, y: 304, w: 236, label: 'Clinic documents', sub: 'fees, hours, policies' },
  inbox: { x: 630, y: 388, w: 236, label: 'Team inbox', sub: 'staff questions' },
}
export const EDGES = ['wa', 'web', 'cal', 'sheet', 'gmail', 'docs', 'inbox']
