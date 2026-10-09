/* The captured steps of each still-only demo (data.js `stills`), read
   straight from the steps.json that sits beside the screens in
   public/walkthroughs/<slug>/. Imported rather than fetched, so the case
   study has its captions on first render and there is one source for them:
   re-running scripts/capture-demos.mjs updates the page too.

   Kept out of data.js on purpose: vite.config.js imports data.js at build
   time, and it has no business pulling JSON from public/. */
import appointmentDesk from '../public/walkthroughs/appointment-desk/steps.json'
import knowledgeAssistant from '../public/walkthroughs/knowledge-assistant/steps.json'
import websiteAnswerWidget from '../public/walkthroughs/website-answer-widget/steps.json'
/* Demo screens (designed, not captured): scripts/render-demo-screens.mjs
   writes these, with the caption and crop of every screen. */
import enquiryRescue from '../public/demo-screens/missed-enquiry-rescue/steps.json'
import proposalDrafter from '../public/demo-screens/proposal-drafter/steps.json'
import trialClassDesk from '../public/demo-screens/trial-class-desk/steps.json'

/* The two chat-only demos: each step's focus marks the reply, which cuts
   the patient's own message off at the right edge. Widen every crop to
   the whole chat column (x 280 to 1160 in capture space) so both sides of
   the conversation stay in frame; the height still follows the step. */
const CHAT_COLUMN = { x: 280, w: 880 }

/* The widget's steps mark its tall chat panel, and a 4:3 frame around it
   would slice the clinic's headline mid-word. Show the page's whole
   content width instead: the widget reads as something on a website. */
const PAGE_WIDTH = { x: 260, w: 1180 }

const withPaths = (slug, steps, column, dir = 'walkthroughs') =>
  steps.map((step) => ({
    ...step,
    src: `/${dir}/${slug}/${step.file}`,
    focus: column && step.focus ? { ...step.focus, ...column } : step.focus
  }))

export const walkthroughs = {
  'appointment-desk': withPaths('appointment-desk', appointmentDesk, CHAT_COLUMN),
  'knowledge-assistant': withPaths('knowledge-assistant', knowledgeAssistant, CHAT_COLUMN),
  'website-answer-widget': withPaths('website-answer-widget', websiteAnswerWidget, PAGE_WIDTH),
  'missed-enquiry-rescue': withPaths('missed-enquiry-rescue', enquiryRescue, null, 'demo-screens'),
  'proposal-drafter': withPaths('proposal-drafter', proposalDrafter, null, 'demo-screens'),
  'trial-class-desk': withPaths('trial-class-desk', trialClassDesk, null, 'demo-screens')
}
