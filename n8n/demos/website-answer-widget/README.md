# Website answer widget

A small chat bubble for a clinic website. A visitor asks about prices, hours or policies and gets an answer taken from the clinic's own documents, with the source named. If the documents do not say, it does not guess: it says "I don't know, please ask the front desk." and shows a small card where the visitor can leave a name and number for a callback.

`index.html` is a fictional one-page site for "Demo Physio Clinic" that shows it in place. It is plain HTML with one small script and `widget.css`. No build step.

## What it is built on

Built on `@n8n/chat` (n8n's own chat widget, loaded from the jsdelivr CDN, pinned to 1.40.2) and the Practice Knowledge Assistant workflow in `../knowledge-assistant/`. The lead card is a few lines of script in `index.html` that watch for the fixed "I don't know" reply.

**Licence note.** The `@n8n/chat` package on npm is not MIT. Version 1.40.2 ships `LICENSE.md` with the n8n Sustainable Use License (text below): internal business use, or non-commercial and personal use, and free non-commercial redistribution only. Check that it fits before putting this on a paying client's public site. Its `.ee.` files use a separate enterprise licence and are not used here.

## Status: capture-only for now

Nothing here is public. The chat trigger is not exposed, the leads workflow (`leads-workflow.json`, tested in `test-log.md`) is inactive, and both URLs in `index.html` are placeholders. The screenshots in `public/walkthroughs/website-answer-widget/` come from `scripts/capture-demos.mjs`, which answers the widget's network calls with replies recorded from real n8n executions (see `scripts/demo-transcripts/`). The lead POST in those shots is answered locally; the real run that saved this lead was n8n execution 23881.

## How to switch it on

1. In the Knowledge Assistant workflow, make the chat trigger public and set allowed origins to the site that will host the widget.
2. Import `leads-workflow.json` (webhook, field checks, append to a sheet with a `Leads` tab, `{"ok": true}` or a 400 with `{"error": "..."}`), attach a Google Sheets credential, replace `REPLACE_WITH_DEMO_LEADS_SHEET_ID` and `REPLACE_WITH_RANDOM_SUFFIX`, and activate it.
3. In `index.html`, replace the two placeholders: `CHAT_WEBHOOK` (`https://<your-n8n-host>/webhook/<knowledge-assistant-chat-webhook-id>/chat`) and `LEAD_WEBHOOK` (`.../webhook/website-answer-widget-lead-REPLACE_WITH_RANDOM_SUFFIX`, use a long random suffix).

## Data rules

- Dummy data only in the demo. Use invented names and numbers such as "Demo Visitor" and "0000000002".
- The widget page itself stores nothing and sets no cookies. The chat library may keep a session id in the browser so a conversation can continue.
- Leads go to a sheet through the leads webhook and nowhere else.
- The clinic is fictional. Do not present it as a real practice.

## Licence text for @n8n/chat 1.40.2 (copied from its LICENSE.md)

    # License

    Portions of this software are licensed as follows:

    - Content of branches other than the main branch (i.e. "master") are not licensed.
    - Source code files that contain ".ee." in their filename or ".ee" in their dirname are NOT licensed under
      the Sustainable Use License.
      To use source code files that contain ".ee." in their filename or ".ee" in their dirname you must hold a
    	valid n8n Enterprise License specifically allowing you access to such source code files and as defined
    	in "LICENSE_EE.md".
    - All third party components incorporated into the n8n Software are licensed under the original license
      provided by the owner of the applicable component.
    - Content outside of the above mentioned files or restrictions is available under the "Sustainable Use
      License" as defined below.

    ## Sustainable Use License

    Version 1.0

    ### Acceptance

    By using the software, you agree to all of the terms and conditions below.

    ### Copyright License

    The licensor grants you a non-exclusive, royalty-free, worldwide, non-sublicensable, non-transferable license
    to use, copy, distribute, make available, and prepare derivative works of the software, in each case subject
    to the limitations below.

    ### Limitations

    You may use or modify the software only for your own internal business purposes or for non-commercial or
    personal use. You may distribute the software or provide it to others only if you do so free of charge for
    non-commercial purposes. You may not alter, remove, or obscure any licensing, copyright, or other notices of
    the licensor in the software. Any use of the licensor’s trademarks is subject to applicable law.

    ### Patents

    The licensor grants you a license, under any patent claims the licensor can license, or becomes able to
    license, to make, have made, use, sell, offer for sale, import and have imported the software, in each case
    subject to the limitations and conditions in this license. This license does not cover any patent claims that
    you cause to be infringed by modifications or additions to the software. If you or your company make any
    written claim that the software infringes or contributes to infringement of any patent, your patent license
    for the software granted under these terms ends immediately. If your company makes such a claim, your patent
    license ends immediately for work on behalf of your company.

    ### Notices

    You must ensure that anyone who gets a copy of any part of the software from you also gets a copy of these
    terms. If you modify the software, you must include in any modified copies of the software a prominent notice
    stating that you have modified the software.

    ### No Other Rights

    These terms do not imply any licenses other than those expressly granted in these terms.

    ### Termination

    If you use the software in violation of these terms, such use is not licensed, and your license will
    automatically terminate. If the licensor provides you with a notice of your violation, and you cease all
    violation of this license no later than 30 days after you receive that notice, your license will be reinstated
    retroactively. However, if you violate these terms after such reinstatement, any additional violation of these
    terms will cause your license to terminate automatically and permanently.

    ### No Liability

    As far as the law allows, the software comes as is, without any warranty or condition, and the licensor will
    not be liable to you for any damages arising out of these terms or the use or nature of the software, under
    any kind of legal claim.

    ### Definitions

    The “licensor” is the entity offering these terms.

    The “software” is the software the licensor makes available under these terms, including any portion of it.

    “You” refers to the individual or entity agreeing to these terms.

    “Your company” is any legal entity, sole proprietorship, or other kind of organization that you work for, plus
    all organizations that have control over, are under the control of, or are under common control with that
    organization. Control means ownership of substantially all the assets of an entity, or the power to direct its
    management and policies by vote, contract, or otherwise. Control can be direct or indirect.

    “Your license” is the license granted to you for the software under these terms.

    “Use” means anything you do with the software requiring your license.

    “Trademark” means trademarks, service marks, and similar rights.
