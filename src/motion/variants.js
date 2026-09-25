/*
  Shared Motion variants for the whole site.

  One easing and one distance everywhere, so every reveal feels like the
  same hand. `--ease-out` in index.css is cubic-bezier(0.22, 1, 0.36, 1);
  this mirrors it as a number tuple for Motion.

  Reduced motion is handled globally by <MotionConfig reducedMotion="user">
  in App.jsx — with that set, Motion strips the transform/opacity movement
  for users who ask for less motion and simply shows the final state. So
  these variants never need their own reduced-motion branch.
*/
const EASE = [0.22, 1, 0.36, 1]

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export const fadeLeft = {
  hidden: { opacity: 0, x: -34 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
}

/* Container that staggers its children as it enters. Children carry one of
   the item variants above and inherit the show/hidden state from here. */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}

export const staggerFast = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
}

/* Hero entrance — deliberately snappier and tighter than the scroll reveals,
   so the fold reads as a crisp arrival rather than the same drift used down
   the page. */
export const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
}
export const heroItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

/* Standard whileInView viewport: fire once, a little before fully in view. */
export const inview = { once: true, margin: '0px 0px -12% 0px' }

/* Props spread onto a self-revealing element. */
export const reveal = {
  variants: fadeUp,
  initial: 'hidden',
  whileInView: 'show',
  viewport: inview,
}

/* Props spread onto a staggering container. */
export const revealStagger = {
  variants: stagger,
  initial: 'hidden',
  whileInView: 'show',
  viewport: inview,
}
