import { Composition } from 'remotion'
import { Walkthrough, walkthroughLength } from './Walkthrough.jsx'
import { PlatformFilm, platformLength } from './PlatformFilm.jsx'
import { Clip, clipLength } from './Clip.jsx'
import { WALKTHROUGHS } from './walkthroughs.js'
import { SCENES } from './platformScenes.jsx'

/* The hero reel: the strongest beats of each working demo, back to back. */
export const HERO_REEL = [
  { slug: 'relay', pick: [2, 3, 7] },
  { slug: 'signet', pick: [2, 5, 7] },
  { slug: 'prospector', pick: [3, 5, 6] },
]

/* Card previews: a short silent loop per tool. */
export const CARD_PICKS = {
  signet: [2, 5, 6, 8],
  relay: [1, 3, 5, 7],
  prospector: [2, 3, 5, 6],
}

/*
  Compositions, rendered by scripts/render-videos.sh:
    Walkthrough-<slug>  1920x1080 case-study film, real captures
    Platform-<slug>     1920x1080 schematic film for the client platforms
    Clip-<slug>         1440x900 silent loop for the project cards
    HeroReel            1440x900 silent loop for the home hero
*/
export const RemotionRoot = () => (
  <>
    {Object.keys(WALKTHROUGHS).map((slug) => (
      <Composition
        key={`w-${slug}`}
        id={`Walkthrough-${slug}`}
        component={Walkthrough}
        durationInFrames={walkthroughLength(slug)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ slug }}
      />
    ))}
    {Object.keys(SCENES).map((slug) => (
      <Composition
        key={`p-${slug}`}
        id={`Platform-${slug}`}
        component={PlatformFilm}
        durationInFrames={platformLength(slug)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ slug }}
      />
    ))}
    {Object.entries(CARD_PICKS).map(([slug, pick]) => (
      <Composition
        key={`c-${slug}`}
        id={`Clip-${slug}`}
        component={Clip}
        durationInFrames={clipLength([{ slug, pick }])}
        fps={30}
        width={1440}
        height={900}
        defaultProps={{ items: [{ slug, pick }], captions: false }}
      />
    ))}
    <Composition
      id="HeroReel"
      component={Clip}
      durationInFrames={clipLength(HERO_REEL)}
      fps={30}
      width={1440}
      height={900}
      defaultProps={{ items: HERO_REEL, captions: true }}
    />
  </>
)
