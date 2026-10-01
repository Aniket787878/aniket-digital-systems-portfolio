import { useEffect, useRef } from 'react'
import { concepts } from '../../../concepts/registry.js'
import { address, counter, heroSrc } from '../showcase/websites/shared.js'
import Window from './Window.jsx'
import useLoop from './useLoop.js'

/*
  /websites: "a site builds itself". Saffron wireframe lines draw a page
  (nav, headline, image, three cards), the blocks fill grey, then a scan
  line sweeps down and the wireframe becomes one of the five real concept
  sites (the posters scripts/capture-concepts.mjs writes). The address
  bar types that concept's made-up address while it builds. One concept
  per step, ~5s each. The wireframe is generic on purpose: it is the
  idea of a layout, the finished poster is the real thing.

  Reduced motion: the first concept, finished, no wireframe.
*/

const STEP_MS = 5200

// x, y, w, h (and corner radius) on a 160 x 100 page.
const WIRE = [
  [8, 6, 16, 4, 1],
  [70, 7, 10, 2, 1],
  [84, 7, 10, 2, 1],
  [98, 7, 10, 2, 1],
  [134, 5, 18, 6, 3],
  [10, 24, 66, 9, 1.5],
  [10, 36, 52, 9, 1.5],
  [10, 51, 46, 2.5, 1],
  [10, 56, 38, 2.5, 1],
  [10, 64, 26, 7, 3.5],
  [88, 20, 62, 54, 2.5],
  [10, 80, 44, 15, 2],
  [58, 80, 44, 15, 2],
  [106, 80, 44, 15, 2]
]

const STATUS = ['Laying out the page', 'Filling it in', 'Going live']

export default function SitesScene({ live }) {
  const ref = useRef(null)
  const n = concepts.length
  const { step, index, running } = useLoop(ref, { count: n, ms: STEP_MS, enabled: live })
  const c = concepts[index]
  const prev = concepts[(index + n - 1) % n]
  const url = address(c.name)

  // Warm the next poster so the scan never reveals a half-loaded image.
  useEffect(() => {
    if (!live) return
    const img = new Image()
    img.src = heroSrc(concepts[(index + 1) % n].slug)
  }, [live, index, n])

  return (
    <Window
      ref={ref}
      className={`sv-sites ${live ? 'is-live' : 'is-still'}`}
      hold={live && !running}
      tag="Concept designs · made-up businesses"
      bar={
        <>
          <span className="sv-url stage-mono" key={`u${step}`}>
            <span className="sv-url-lock" aria-hidden="true" />
            <span className="sv-url-text" style={{ '--chars': url.length }}>
              {url}
            </span>
          </span>
          <span className="stage-mono sv-count">{counter(index, n)}</span>
        </>
      }
      status={
        <span className="sv-steps stage-mono" key={`s${step}`}>
          {live && STATUS.map((s, i) => (
            <span key={s} className={`sv-step sv-step-${i}`}>
              {s}
            </span>
          ))}
          <span className="sv-step sv-step-done">
            <b>{c.name}</b> · {c.type.toLowerCase()}
          </span>
          <i className="sv-progress" aria-hidden="true" />
        </span>
      }
    >
      <div className="sv-page" aria-hidden="true">
        {live && step > 0 && (
          <img className="sv-prev" key={`p${step}`} src={heroSrc(prev.slug)} width="1440" height="900" alt="" />
        )}
        <div className="sv-build" key={`b${step}`}>
          {live && (
            <svg className="sv-wire" viewBox="0 0 160 100">
              {WIRE.map(([x, y, w, h, r], i) => (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={r}
                  pathLength="1"
                  style={{ '--i': i }}
                />
              ))}
            </svg>
          )}
          <img
            className="sv-shot"
            src={heroSrc(c.slug)}
            width="1440"
            height="900"
            alt=""
            decoding="async"
          />
          {live && <i className="sv-scan" />}
        </div>
      </div>
      <p className="sr-only">
        A short loop: a website layout draws itself, then turns into one of five concept sites made for
        made-up businesses.
      </p>
    </Window>
  )
}
