import { projects, films, stills, labelFor, mediaKind } from '../data.js'

/*
  One project as the data a ProjectCard draws, shared by the service-page
  proof grids and /projects so every card says the same thing about what
  its picture is. `label` is the one truth label a card carries (in its
  meta row, never on the picture):

  - schematic  a client platform; the film is a labelled wireframe because
               the real screens hold client records
  - real       a working demo; a film over real captures, or one real still
               from a recorded test run (data.js `stills`)
  - demo       designed screens for a made-up business, not a built system

  `overrides` lets a proof entry swap the body line (`note`) for one aimed
  at that page.
*/
export function projectCard(slug, overrides = {}) {
  const project = projects.find((p) => p.slug === slug)
  const film = films[slug]
  const still = !film && stills[slug]
  const kind = mediaKind(slug)

  let label
  let media
  if (still) {
    label = still.kind === 'demo' ? labelFor(slug).badge : 'Working demo · recorded test run'
    media = {
      type: 'still',
      file: still.cover.file,
      focus: still.card || still.cover.focus,
      /* The light chat captures sit in a window on the dark well, so they
         read as one family with the dark films and demo screens instead of
         white blocks on the night ground. */
      window: still.kind === 'real'
    }
  } else if (film) {
    const real = film.kind === 'real'
    label = real ? 'Working demo · real screens' : 'Client platform · illustrated'
    media = real
      ? { type: 'film', src: film.framed, poster: film.framedPoster }
      : { type: 'film', src: film.src, poster: film.poster }
  }

  /* A designed cover (data.js `projects[].cover`, scripts/covers/) wins on
     the card: it explains the job in words that read at card size, where a
     whole screen shrunk into the well did not. The label above still says
     what kind of project it is; the films and real screens stay on the
     case page. Without a cover the card falls back to the media above. */
  if (project.cover) {
    media = { type: 'image', src: project.cover.src, alt: project.cover.alt }
  }

  return {
    id: slug,
    to: `/projects/${slug}`,
    kind,
    label,
    media,
    index: project.index,
    title: project.title,
    subtitle: project.subtitle,
    note: project.tagline,
    ...overrides
  }
}
