import { m } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1]

/*
  SplitText — reveals a heading word by word, each word rising a touch as it
  fades in. The editorial way to make a title arrive, rather than a flat fade.

  It can run on its own (standalone: its own whileInView trigger) or as a
  child of a staggering container, in which case it inherits the show/hidden
  state and just contributes its per-word stagger. Reduced motion is handled
  globally by MotionConfig, which strips the movement and shows the words.
*/
export default function SplitText({
  text,
  as = 'span',
  className,
  standalone = true,
  wordStagger = 0.045,
}) {
  const M = m[as]
  const words = String(text).split(' ')

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: wordStagger, delayChildren: 0.02 } },
  }
  const word = {
    hidden: { opacity: 0, y: '0.5em' },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  }

  const trigger = standalone
    ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } }
    : {}

  return (
    <M className={className} variants={container} {...trigger} aria-label={text}>
      {words.map((w, i) => (
        <m.span
          key={i}
          aria-hidden="true"
          variants={word}
          style={{ display: 'inline-block', willChange: 'transform' }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </m.span>
      ))}
    </M>
  )
}
