import { useEffect, useState } from 'react'

/*
  HeroMountains — the getstage.co-style mountain scene behind the hero,
  drawn as three SVG layers so a small scroll listener can move each at
  a different rate for a real parallax feel (far layer barely moves,
  near layer moves the most).

  All three are inline SVGs — no assets to preload, no separate fetch,
  and the palette resolves from the hero's saffron-into-black ground.
*/
export default function HeroMountains() {
  const [y, setY] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return undefined
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        setY(window.scrollY)
        raf = 0
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="hero-mountains" aria-hidden="true">
      {/* Star / grain field, moves slowest. */}
      <div
        className="hero-mtn-layer hero-mtn-stars"
        style={{ transform: `translate3d(0, ${y * 0.05}px, 0)` }}
      />
      {/* Far range — hazy, low contrast. */}
      <svg
        className="hero-mtn-layer hero-mtn-far"
        viewBox="0 0 1600 500"
        preserveAspectRatio="xMidYMax slice"
        style={{ transform: `translate3d(0, ${y * 0.12}px, 0)` }}
      >
        <path
          d="M0 380 L0 500 L1600 500 L1600 320 L1500 350 L1380 280 L1240 340 L1120 260 L980 320 L830 240 L700 320 L570 260 L430 340 L300 300 L160 360 Z"
          fill="url(#hero-mtn-far-fill)"
          opacity="0.55"
        />
        <defs>
          <linearGradient id="hero-mtn-far-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a1806" />
            <stop offset="100%" stopColor="#160804" />
          </linearGradient>
        </defs>
      </svg>
      {/* Mid range. */}
      <svg
        className="hero-mtn-layer hero-mtn-mid"
        viewBox="0 0 1600 500"
        preserveAspectRatio="xMidYMax slice"
        style={{ transform: `translate3d(0, ${y * 0.22}px, 0)` }}
      >
        <path
          d="M0 440 L0 500 L1600 500 L1600 380 L1470 420 L1310 340 L1150 400 L1010 320 L870 400 L720 340 L580 410 L440 350 L280 420 L120 380 Z"
          fill="url(#hero-mtn-mid-fill)"
          opacity="0.85"
        />
        <defs>
          <linearGradient id="hero-mtn-mid-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b1206" />
            <stop offset="100%" stopColor="#0a0402" />
          </linearGradient>
        </defs>
      </svg>
      {/* Near range — sharper silhouette, moves the most. */}
      <svg
        className="hero-mtn-layer hero-mtn-near"
        viewBox="0 0 1600 500"
        preserveAspectRatio="xMidYMax slice"
        style={{ transform: `translate3d(0, ${y * 0.38}px, 0)` }}
      >
        <path
          d="M0 500 L0 470 L110 430 L230 460 L360 400 L470 445 L600 380 L720 435 L860 385 L980 430 L1120 375 L1260 420 L1400 380 L1520 430 L1600 400 L1600 500 Z"
          fill="url(#hero-mtn-near-fill)"
        />
        <defs>
          <linearGradient id="hero-mtn-near-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0803" />
            <stop offset="100%" stopColor="#050201" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
