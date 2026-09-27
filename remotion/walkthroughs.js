/* The captured walkthroughs. Each steps.json sits beside its PNGs in
   public/walkthroughs/<slug>/ and was written by the capture script that
   drove the running app: file, caption, the clicked element (`target`)
   and the region worth zooming into (`focus`), all in 1440x900 CSS px. */
import consentSigner from '../public/walkthroughs/consent-signer/steps.json'
import sharedInbox from '../public/walkthroughs/shared-inbox/steps.json'
import leadResearch from '../public/walkthroughs/lead-research/steps.json'

export const WALKTHROUGHS = {
  'consent-signer': consentSigner,
  'shared-inbox': sharedInbox,
  'lead-research': leadResearch,
}

/* Shown in the drawn address bar. Local captures, so a neutral host. */
export const URLS = {
  'consent-signer': 'consent-signer.app/documents',
  'shared-inbox': 'shared-inbox.app/inbox',
  'lead-research': 'lead-research.app/workspace',
}
