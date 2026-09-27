import { Img, staticFile } from 'remotion'
import { C, SANS } from './shared.jsx'

/*
  The window every real capture is shown in (walkthrough films, loops, the
  brand film's proof beat). The captures in public/walkthroughs/ are 16:10,
  so the body height follows the width. The chrome bar carries the product
  name rather than a URL: it stays readable when the window is pulled back,
  where a URL would be tiny.

  Children are laid over the capture (the spotlight lives there), so they
  move with whatever camera transform the caller puts on `style`.
*/

export const SHADOW_NIGHT = '0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4)'
export const SHADOW_PAPER = '0 2px 4px rgba(22,20,18,0.10), 0 30px 70px rgba(22,20,18,0.22), 0 80px 160px rgba(22,20,18,0.16)'

export function BrowserFrame({ src, prevSrc, fade = 1, width, title, chrome = 56, radius = 18, bare = false, shadow = SHADOW_PAPER, style, children }) {
  const bodyH = Math.round((width * 10) / 16)
  return (
    <div
      style={{
        width,
        height: bodyH + chrome,
        boxSizing: 'border-box',
        borderRadius: bare ? 0 : radius,
        overflow: 'hidden',
        background: '#0d0e11',
        border: bare ? 'none' : '1px solid rgba(242,240,237,0.14)',
        boxShadow: bare ? 'none' : shadow,
        ...style,
      }}
    >
      {chrome > 0 && <WindowChrome height={chrome} title={title} />}
      <div style={{ position: 'relative', width, height: bodyH }}>
        <Shot src={src} prevSrc={prevSrc} fade={fade} w={width} h={bodyH} />
        {children}
      </div>
    </div>
  )
}

/* Traffic lights and the product name. */
export function WindowChrome({ height, title }) {
  return (
    <div style={{ height, display: 'flex', alignItems: 'center', gap: 24, padding: `0 ${height * 0.4}px`, background: '#17171a', borderBottom: '1px solid rgba(242,240,237,0.08)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: height * 0.16 }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{ width: height * 0.23, height: height * 0.23, borderRadius: '50%', background: c, opacity: 0.9 }} />
        ))}
      </div>
      {title && <div style={{ fontFamily: SANS, fontSize: Math.max(26, height * 0.5), fontWeight: 500, letterSpacing: '-0.02em', color: C.inkSoft, whiteSpace: 'nowrap' }}>{title}</div>}
    </div>
  )
}

/* A capture, or two crossfading (the match cut between steps). */
export function Shot({ src, prevSrc, fade = 1, w, h }) {
  return (
    <div style={{ position: 'relative', width: w, height: h, overflow: 'hidden', background: '#0d0e11' }}>
      {prevSrc && fade < 1 && <Img src={staticFile(prevSrc)} style={{ position: 'absolute', inset: 0, width: w, height: h }} />}
      <Img src={staticFile(src)} style={{ position: 'absolute', inset: 0, width: w, height: h, opacity: fade }} />
    </div>
  )
}
