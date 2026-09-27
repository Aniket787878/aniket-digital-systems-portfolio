/* The captured walkthroughs. Each steps.json sits beside its PNGs in
   public/walkthroughs/<slug>/ and was written by the capture script that
   drove the running app: file, caption, the clicked element (`target`)
   and the region worth zooming into (`focus`), all in 1440x900 CSS px. */
import signet from '../public/walkthroughs/signet/steps.json'
import relay from '../public/walkthroughs/relay/steps.json'
import prospector from '../public/walkthroughs/prospector/steps.json'

export const WALKTHROUGHS = { signet, relay, prospector }

/* Shown in the drawn address bar. Local captures, so a neutral host. */
export const URLS = {
  signet: 'signet.app/documents',
  relay: 'relay.app/inbox',
  prospector: 'prospector.app/workspace',
}
