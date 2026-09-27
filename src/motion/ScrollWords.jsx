import { useRef } from 'react'
import { m, useScroll, useTransform, useReducedMotion } from 'motion/react'
import Icon from '../components/icons.jsx'

/*
  ScrollWords — a paragraph whose words brighten one by one as it scrolls
  through the viewport (the getstage.co statement pattern).

  `parts` is an array of strings and { icon } objects; strings are split
  into words, icons render as small inline chips that brighten with their
  neighbours. The full sentence is always in the DOM for screen readers;
  under reduced motion every word is simply lit.
*/
export default function ScrollWords({ parts, className = '' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'end 45%']
  })

  const tokens = parts.flatMap((p) =>
    typeof p === 'string'
      ? p.split(' ').filter(Boolean).map((w) => ({ word: w }))
      : [p]
  )
  const label = parts.filter((p) => typeof p === 'string').join(' ')
  const n = tokens.length

  return (
    <p ref={ref} className={`scroll-words ${className}`.trim()} aria-label={label}>
      {tokens.map((t, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          range={[i / n, Math.min(1, (i + 1.5) / n)]}
          lit={reduce}
        >
          {t.word ? (
            t.word
          ) : (
            <span className="word-chip">
              <Icon name={t.icon} size={16} />
            </span>
          )}
        </Word>
      ))}
    </p>
  )
}

function Word({ children, progress, range, lit }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <m.span aria-hidden="true" className="scroll-word" style={{ opacity: lit ? 1 : opacity }}>
      {children}{' '}
    </m.span>
  )
}
