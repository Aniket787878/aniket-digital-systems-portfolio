/*
  Declarative hooks for the StringTune layer (see controller.js).

  Components spread `fx(...)` onto the element they want an effect on. The
  result is plain `data-string*` attributes: inert HTML if the library never
  loads (reduced motion, no JS, a failed chunk), which is what keeps the page
  whole without it. They are `data-` attributes rather than the bare `string`
  ones on purpose: these are spread onto `m.*` elements too, and Motion can be
  given a prop validator that drops unknown props, whereas `data-*` is valid
  HTML that passes any such filter.

    fx('view')       cursor turns into a "View" disc over the element
    fx('media')      cursor grows, no label (a film that is not a link)
    fx('text')       cursor ring steps aside (over form fields)
    fx('magnet')     the element leans toward the pointer, cursor grows
    fx('split')      heading arrives word by word
    fx('progress')   writes --st-progress (0..1) while it crosses the screen
    fx('lerp')       writes --lerp, the scroll velocity, for lagging motion

  Combine freely: fx('lerp', 'view'). The CSS that reads the results lives in
  interactions.css and only applies while html.st-on is set.
*/
const KINDS = {
  view: { token: 'cursor', attrs: { 'data-string-cursor-class': 'is-view' } },
  media: { token: 'cursor', attrs: { 'data-string-cursor-class': 'is-media' } },
  text: { token: 'cursor', attrs: { 'data-string-cursor-class': 'is-text' } },
  magnet: {
    token: 'magnetic|cursor',
    attrs: {
      'data-string-radius': 120,
      'data-string-strength': 0.28,
      'data-string-cursor-class': 'is-cta'
    }
  },
  split: { token: 'split', attrs: { 'data-string-split': 'word' } },
  progress: { token: 'progress' },
  /* `[default]` = also run in native scroll mode. StringLerp is smooth-scroll
     only unless told otherwise, and we never use smooth scroll. */
  lerp: { token: 'lerp[default]' }
}

export function fx(...kinds) {
  const tokens = []
  let attrs = {}
  for (const kind of kinds) {
    const k = KINDS[kind]
    if (!k) continue
    tokens.push(k.token)
    attrs = { ...attrs, ...k.attrs }
  }
  return { 'data-string': tokens.join('|'), ...attrs }
}
