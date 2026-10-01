import { lazy } from 'react'

/* The five concept websites shown in the /websites orbit. Each is a full,
   standalone page at /concepts/<slug>, for a made-up business, built to show
   range: one cinematic centrepiece per site. Each loads as its own chunk
   (three.js included) so none of it touches the main bundle. */
export const concepts = [
  {
    slug: 'aura',
    name: 'Aura Skin Studio',
    type: 'Skin and aesthetics clinic',
    line: 'A glass serum bottle turns in the light, so the product sells the clinic before a word is read.',
    load: lazy(() => import('./aura/Concept.jsx'))
  },
  {
    slug: 'kinetic',
    name: 'Kinetic Physio',
    type: 'Sports and physio clinic',
    line: 'A chrome spine that flexes as you scroll: movement is the whole promise, so the page moves.',
    load: lazy(() => import('./kinetic/Concept.jsx'))
  },
  {
    slug: 'ekam',
    name: 'Studio Ekam',
    type: 'Yoga and breathwork studio',
    line: 'A living ink that breathes in and out with the words. Calm, shown rather than claimed.',
    load: lazy(() => import('./ekam/Concept.jsx'))
  },
  {
    slug: 'noor',
    name: 'Atelier Noor',
    type: 'Interior and architecture studio',
    line: 'A marble and bronze sculpture in low gallery light, so the studio reads as craft from the first second.',
    load: lazy(() => import('./noor/Concept.jsx'))
  },
  {
    slug: 'meridian',
    name: 'Meridian Advisory',
    type: 'Accounting and wealth advisory',
    line: 'A field of points gathers from a scattered cloud into a clear chart: the job, in one move.',
    load: lazy(() => import('./meridian/Concept.jsx'))
  }
]

export const conceptBySlug = Object.fromEntries(concepts.map((c) => [c.slug, c]))
