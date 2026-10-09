import { Composition } from 'remotion'
import { Walkthrough, walkthroughLength } from './Walkthrough.jsx'
import { StageFilm, stageFilmLength } from './stage/StageFilm.jsx'
import { StageClip, stageClipLength } from './stage/StageClip.jsx'
import { StageFramed, stageFramedLength } from './stage/StageFramed.jsx'
import { HeroReel, HERO_LEN } from './stage/HeroReel.jsx'
import { FRAMED } from './FramedClip.jsx'
import { WALKTHROUGHS } from './walkthroughs.js'
import { SCENES } from './platformScenes.jsx'
import { DEMO_SCENES } from './demoScenes.jsx'
import { ExplainerBrand, BRAND_LEN } from './explainers/ExplainerBrand.jsx'
import { ExplainerBrandCinematic, BRAND_CINEMATIC_LEN } from './explainers/ExplainerBrandCinematic.jsx'
import { ExplainerOpsSprintCinematic, OPS_CINEMATIC_LEN } from './explainers/ExplainerOpsSprintCinematic.jsx'
import { ExplainerAiAssistantCinematic, AI_CINEMATIC_LEN } from './explainers/ExplainerAiAssistantCinematic.jsx'
import { ExplainerInternalToolCinematic, TOOL_CINEMATIC_LEN } from './explainers/ExplainerInternalToolCinematic.jsx'
import { ExplainerOpsSprint, OPS_LEN } from './explainers/ExplainerOpsSprint.jsx'
import { ExplainerAiAssistant, AI_LEN } from './explainers/ExplainerAiAssistant.jsx'
import { ExplainerInternalTool, TOOL_LEN } from './explainers/ExplainerInternalTool.jsx'
import { ExplainerBrandV3, ExplainerBrandV3Tall, BRAND_V3_LEN } from './explainers/ExplainerBrandV3.jsx'
import { ExplainerOpsSprintV3, OPS_V3_LEN } from './explainers/ExplainerOpsSprintV3.jsx'
import { ExplainerAiAssistantV3, AI_V3_LEN } from './explainers/ExplainerAiAssistantV3.jsx'

/* Card previews: a short silent loop per tool. */
export const CARD_PICKS = {
  'consent-signer': [2, 5, 6, 8],
  'shared-inbox': [1, 3, 5, 7],
  'lead-research': [2, 3, 5, 6],
}

/*
  Compositions, rendered by scripts/render-videos.sh:
    Walkthrough-<slug>  1920x1080 case-study film, real captures
    Platform-<slug>     1920x1080 story film: schematic for the platforms,
                        real captures for the demos (the site's films)
    Clip-<slug>         1440x900 silent loop (raw viewport), kept for reuse
    Framed-<slug>       1920x1080 framed card loop for the three demos
    HeroReel            1440x900 silent loop for the home hero
    Explainer-<name>    1920x1080 illustrative explainers (brand, ops-sprint,
                        ai-assistant, internal-tool) in remotion/explainers/
    Explainer-brand-vertical  1080x1920, the brand film recomposed for phones
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
    {[...Object.keys(SCENES), ...Object.keys(DEMO_SCENES)].map((slug) => (
      <Composition
        key={`p-${slug}`}
        id={`Platform-${slug}`}
        component={StageFilm}
        durationInFrames={stageFilmLength(slug)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ slug }}
      />
    ))}
    {Object.keys(FRAMED).map((slug) => (
      <Composition
        key={`f-${slug}`}
        id={`Framed-${slug}`}
        component={StageFramed}
        durationInFrames={stageFramedLength(slug)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ slug }}
      />
    ))}
    {Object.keys(CARD_PICKS).map((slug) => (
      <Composition
        key={`c-${slug}`}
        id={`Clip-${slug}`}
        component={StageClip}
        durationInFrames={stageClipLength(slug)}
        fps={30}
        width={1440}
        height={900}
        defaultProps={{ slug }}
      />
    ))}
    <Composition id="Explainer-brand" component={ExplainerBrand} durationInFrames={BRAND_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Explainer-brand-cinematic" component={ExplainerBrandCinematic} durationInFrames={BRAND_CINEMATIC_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Explainer-ops-sprint-cinematic" component={ExplainerOpsSprintCinematic} durationInFrames={OPS_CINEMATIC_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Explainer-ai-assistant-cinematic" component={ExplainerAiAssistantCinematic} durationInFrames={AI_CINEMATIC_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Explainer-internal-tool-cinematic" component={ExplainerInternalToolCinematic} durationInFrames={TOOL_CINEMATIC_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Explainer-brand-vertical" component={ExplainerBrand} durationInFrames={BRAND_LEN} fps={30} width={1080} height={1920} />
    <Composition id="Explainer-ops-sprint" component={ExplainerOpsSprint} durationInFrames={OPS_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Explainer-ai-assistant" component={ExplainerAiAssistant} durationInFrames={AI_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Explainer-internal-tool" component={ExplainerInternalTool} durationInFrames={TOOL_LEN} fps={30} width={1920} height={1080} />
    {/* v3: voiceless, 120 BPM beat grid (films-2026-10-09/shot-list.md) */}
    <Composition id="Explainer-Brand-v3" component={ExplainerBrandV3} durationInFrames={BRAND_V3_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Explainer-Brand-Vertical-v3" component={ExplainerBrandV3Tall} durationInFrames={BRAND_V3_LEN} fps={30} width={1080} height={1920} />
    <Composition id="Explainer-OpsSprint-v3" component={ExplainerOpsSprintV3} durationInFrames={OPS_V3_LEN} fps={30} width={1920} height={1080} />
    <Composition id="Explainer-AiAssistant-v3" component={ExplainerAiAssistantV3} durationInFrames={AI_V3_LEN} fps={30} width={1920} height={1080} />
    <Composition id="HeroReel" component={HeroReel} durationInFrames={HERO_LEN} fps={30} width={1440} height={900} />
  </>
)
