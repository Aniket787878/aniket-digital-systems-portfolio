import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/archivo/latin-500.css'
import '@fontsource/archivo/latin-600.css'
import '@fontsource/archivo/latin-700.css'
import '@fontsource/archivo/latin-800.css'
import '@fontsource/archivo/latin-900.css'
/* Base sheet first, page sheets after.

   Order matters and it is not obvious: importing App before index.css
   pulls every page's CSS in ahead of the base sheet, so index.css ends
   up last in the document and wins every specificity *tie* against page
   CSS — the exact inverse of what a page override is written to do.
   (.cta-band-kicker vs .kicker is how this surfaced: both one class, so
   the base sheet's accent orange won and the kicker went invisible on
   its own orange band.) */
import './index.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
