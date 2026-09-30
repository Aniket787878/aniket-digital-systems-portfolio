/* Shared by both builds: the image paths the capture script writes
   (scripts/capture-concepts.mjs), the made-up address and the counter. */

export const heroSrc = (slug) => `/showcase/websites/${slug}-hero.webp`
export const stripSrc = (slug) => `/showcase/websites/${slug}-strip.webp`

// A made-up address from the made-up name: "Aura Skin Studio" becomes
// aura-skin-studio.example, a domain reserved for examples, so nobody's
// real site is implied.
export const address = (name) => `${name.toLowerCase().replace(/[^a-z]+/g, '-')}.example`

export const counter = (i, n) => `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`

export const TAG = 'Concept design · made-up business'
