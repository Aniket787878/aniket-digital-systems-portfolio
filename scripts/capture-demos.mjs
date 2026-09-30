// Captures the demo walkthroughs (appointment-desk, knowledge-assistant,
// website-answer-widget) into public/walkthroughs/<slug>/.
//
//   node scripts/capture-demos.mjs [slug]      capture one slug, or all
//   node scripts/capture-demos.mjs --check     only verify transcripts vs test logs
//
// Honesty model: the chat UI is n8n's own @n8n/chat widget (installed on first
// run into .cache/n8n-chat, not a project dependency, so deploys never pull it;
// served under the same jsdelivr URL the demo page uses). Its webhook calls are
// answered here by page.route() with replies that were RECORDED from real n8n
// executions. scripts/demo-transcripts/<slug>/transcripts.json holds each input,
// reply and execution id; verifyTranscripts() fails the run if a reply is not
// found word for word in the matching test log. Nothing here writes a reply.
//
// Playwright is the sandbox's global install; Chromium comes from
// /opt/pw-browsers (do not run `playwright install`).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
function loadPlaywright() {
  for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
    try { return require(p); } catch { /* try next */ }
  }
  throw new Error('playwright not found (expected the global install)');
}

const CHAT_VERSION = '1.40.2';
const CDN = `https://cdn.jsdelivr.net/npm/@n8n/chat@${CHAT_VERSION}/dist/`;
const CHAT_PREFIX = path.join(ROOT, '.cache/n8n-chat');
const CHAT_DIST = path.join(CHAT_PREFIX, 'node_modules/@n8n/chat/dist/');
// @n8n/chat drags in Vue and friends (thousands of lockfile lines). Only this
// script needs it, so it is installed on demand instead of in package.json,
// which would make every Vercel build install it.
function ensureChat() {
  if (fs.existsSync(CHAT_DIST)) return;
  console.log(`installing @n8n/chat@${CHAT_VERSION} into .cache/n8n-chat (first run only)`);
  fs.mkdirSync(CHAT_PREFIX, { recursive: true });
  execFileSync('npm', ['install', '--prefix', CHAT_PREFIX, '--no-save', '--no-audit', '--no-fund', `@n8n/chat@${CHAT_VERSION}`], { stdio: 'inherit' });
}
const HOST = 'https://demo-clinic.test';
const CHAT_PATH = '/webhook/DEMO-CHAT-ID/chat';
const LEAD_PATH = '/webhook/website-answer-widget-lead-DEMO';
const VIEW = { width: 1440, height: 900 };

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r/g, '');
const transcriptsFor = (slug) => JSON.parse(read(`scripts/demo-transcripts/${slug}/transcripts.json`));

// ---------- honesty check ----------
const LOGS = {
  'knowledge-assistant': 'n8n/demos/knowledge-assistant/test-log.md',
  'appointment-desk': 'n8n/demos/appointment-desk/test-log.md',
  'website-answer-widget': 'n8n/demos/knowledge-assistant/test-log.md',
};
function normLog(text) {
  // <br> means newline in the table; blockquote markers are stripped per line.
  return text.replace(/<br>/g, '\n').split('\n').map((l) => l.replace(/^>\s?/, '')).join('\n');
}
function verifyTranscripts(slugs) {
  let bad = 0;
  for (const slug of slugs) {
    const log = normLog(read(LOGS[slug]));
    for (const t of transcriptsFor(slug)) {
      if (t.kind === 'ui-chrome') continue;
      if (!t.reply || !log.includes(t.reply)) { console.error(`FAIL ${slug}/${t.id}: reply not found verbatim in ${LOGS[slug]}`); bad++; }
      if (!normLog(read(LOGS[slug])).includes(t.input)) { console.error(`FAIL ${slug}/${t.id}: input not found in log`); bad++; }
      if (!read(LOGS[slug]).includes(String(t.execution))) { console.error(`FAIL ${slug}/${t.id}: execution ${t.execution} not in log`); bad++; }
    }
  }
  if (bad) throw new Error(`${bad} transcript check(s) failed`);
  console.log('transcripts OK: every reply matches its test log word for word');
}

// ---------- harness ----------
const FONT_CSS = ['400', '500', '600'].map((w) =>
  `@font-face{font-family:Inter;font-weight:${w};src:url(${HOST}/fonts/inter-${w}.woff2) format('woff2')}`).join('');

function chatPage(title, sub) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<link rel="stylesheet" href="${CDN}style.css">
<style>${FONT_CSS}
body{--chat--color--primary:#0f6e66;--chat--color--primary-shade-50:#0d5f58;--chat--color--primary--shade-100:#0b514b;--chat--color--secondary:#0f6e66;--chat--color-secondary-shade-50:#0d5f58;--chat--font-family:Inter,system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0;background:#eef2f1;font:16px Inter,system-ui,sans-serif;color:#1d2a2a;height:100vh;display:flex;justify-content:center}
.col{width:860px;height:100vh;display:flex;flex-direction:column;padding:28px 0 28px}
h1{margin:0;font-size:22px;font-weight:600;letter-spacing:-.01em}p.sub{margin:4px 0 18px;color:#5b6b6b;font-size:14px}
.chat-header{display:none !important}
#n8n-chat{flex:1;min-height:0;background:#fff;border:1px solid #d5dedb;border-radius:14px;overflow:hidden}
</style></head><body><div class="col"><h1>${title}</h1><p class="sub">${sub}</p><div id="n8n-chat"></div></div>
<script type="module">
import { createChat } from '${CDN}chat.bundle.es.js';
createChat({ webhookUrl: '${HOST}${CHAT_PATH}', mode: 'fullscreen', target: '#n8n-chat', showWelcomeScreen: false,
  loadPreviousSession: false, initialMessages: window.__INITIAL__ || [],
  i18n: { en: { title: '', subtitle: '', footer: '', getStarted: 'New conversation', inputPlaceholder: 'Type your message...' } } });
</script></body></html>`;
}

async function setupRoutes(context, replies, siteHtml) {
  const byInput = new Map(replies.map((t) => [t.input, t.reply]));
  await context.route(`${CDN}*`, (r) => {
    const f = r.request().url().slice(CDN.length).split('?')[0];
    r.fulfill({ path: path.join(CHAT_DIST, f), headers: { 'access-control-allow-origin': '*' } });
  });
  await context.route(`${HOST}/fonts/*`, (r) => {
    const w = r.request().url().match(/inter-(\d+)/)[1];
    r.fulfill({ path: path.join(ROOT, `node_modules/@fontsource/inter/files/inter-latin-${w}-normal.woff2`), contentType: 'font/woff2' });
  });
  await context.route(`${HOST}${CHAT_PATH}`, async (r) => {
    let body = {};
    try { body = JSON.parse(r.request().postData() || '{}'); } catch { /* multipart etc. */ }
    if (body.action === 'loadPreviousSession') return r.fulfill({ json: { data: [] } });
    const reply = byInput.get(body.chatInput);
    if (reply === undefined) return r.fulfill({ status: 500, json: { message: `no recorded reply for: ${body.chatInput}` } });
    await new Promise((res) => setTimeout(res, 500));
    return r.fulfill({ json: { output: reply } });
  });
  await context.route(`${HOST}${LEAD_PATH}`, (r) => r.fulfill({ json: { ok: true } }));
  if (siteHtml) {
    await context.route(`${HOST}/site/index.html`, (r) => r.fulfill({ contentType: 'text/html', body: siteHtml }));
    await context.route(`${HOST}/site/widget.css`, (r) => r.fulfill({ contentType: 'text/css', body: read('n8n/demos/website-answer-widget/widget.css') + FONT_CSS + 'body,.chat-window{font-family:Inter,system-ui,sans-serif}' }));
  }
}

function siteHtml() {
  // Only the two documented placeholders are swapped, so the page is the file in the repo.
  return read('n8n/demos/website-answer-widget/index.html')
    .replace('https://<your-n8n-host>/webhook/<knowledge-assistant-chat-webhook-id>/chat', `${HOST}${CHAT_PATH}`)
    .replace('https://<your-n8n-host>/webhook/website-answer-widget-lead-REPLACE_WITH_RANDOM_SUFFIX', `${HOST}${LEAD_PATH}`);
}

// ---------- shot helpers ----------
const rectOf = async (page, sel, nth = -1) => page.evaluate(([s, n]) => {
  const els = document.querySelectorAll(s); const el = els[n < 0 ? els.length + n : n];
  if (!el) return null; const b = el.getBoundingClientRect();
  return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
}, [sel, nth]);

function focusAround(t, pad = 90) {
  const x = Math.max(0, t.x - pad), y = Math.max(0, t.y - pad);
  return { x, y, w: Math.min(VIEW.width - x, t.w + pad * 2), h: Math.min(VIEW.height - y, t.h + pad * 2) };
}

async function ask(page, text) {
  await page.fill('.chat-inputs textarea', text);
  await page.click('.chat-input-send-button');
}
async function waitReply(page, transcript) {
  const first = transcript.reply.split('\n')[0].slice(0, 30);
  await page.waitForFunction((f) => [...document.querySelectorAll('.chat-message-from-bot')].some((e) => e.textContent.includes(f)), first);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

class Shots {
  constructor(page, slug) { this.page = page; this.slug = slug; this.steps = []; this.dir = path.join(ROOT, 'public/walkthroughs', slug); fs.mkdirSync(this.dir, { recursive: true }); }
  async take(caption, { target = null, focus = null, sel = null } = {}) {
    const file = String(this.steps.length + 1).padStart(2, '0') + '.png';
    await this.page.evaluate(() => document.fonts.ready);
    await this.page.screenshot({ path: path.join(this.dir, file), type: 'png' });
    const t = target || (sel ? await rectOf(this.page, sel) : null);
    this.steps.push({ file, caption, target: t, focus: focus || (t ? focusAround(t) : { x: 0, y: 0, w: VIEW.width, h: VIEW.height }) });
    console.log(`  ${this.slug}/${file}  ${caption}`);
  }
  finish() {
    fs.writeFileSync(path.join(this.dir, 'steps.json'), JSON.stringify(this.steps, null, 2) + '\n');
  }
}

async function fresh(browser, slug, transcripts, opts = {}) {
  const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 2 });
  await setupRoutes(context, transcripts, opts.site ? siteHtml() : null);
  const page = await context.newPage();
  if (opts.title) {
    await context.route(`${HOST}/chat.html`, (r) => r.fulfill({ contentType: 'text/html', body: chatPage(opts.title, opts.sub) }));
    if (opts.initial) await page.addInitScript((m) => { window.__INITIAL__ = m; }, opts.initial);
    await page.goto(`${HOST}/chat.html`);
  } else {
    await page.goto(`${HOST}/site/index.html`);
  }
  await page.waitForSelector(opts.title ? '.chat-inputs textarea' : '.chat-window-toggle');
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

const T = (list, id) => list.find((t) => t.id === id);

// ---------- scenarios ----------
async function chatFlow(browser, slug, title, sub, welcome, list, scenes) {
  const s = { steps: null };
  let shots = null;
  for (let i = -1; i < scenes.length; i++) {
    const { context, page } = await fresh(browser, slug, list, { title, sub, initial: i < 0 && welcome ? [welcome] : [] });
    shots = shots || new Shots(page, slug);
    shots.page = page;
    if (i < 0) {
      await shots.take(s.welcomeCaption || scenes.welcomeCaption, { sel: '.chat-inputs' });
    } else {
      const sc = scenes[i]; const tr = T(list, sc.id);
      await ask(page, tr.input);
      await waitReply(page, tr);
      await shots.take(sc.caption, { sel: '.chat-message-from-bot' });
    }
    await context.close();
  }
  shots.finish();
}

async function appointmentDesk(browser) {
  const list = transcriptsFor('appointment-desk');
  const scenes = [
    { id: 'fees', caption: 'Asks for fees and timings, gets the real answer from the clinic’s own FAQ' },
    { id: 'slots', caption: 'Asks to book: the assistant checks the calendar and offers real free slots' },
    { id: 'clinical', caption: 'A clinical question is refused politely and handed to a human' },
    { id: 'emergency', caption: 'An emergency message gets the fixed safety reply, no model involved' },
  ];
  scenes.welcomeCaption = 'The front desk assistant is ready at any hour';
  await chatFlow(browser, 'appointment-desk', 'Demo Physio Clinic', 'Front desk assistant. Fictional clinic, portfolio demo.', T(list, 'welcome').reply, list, scenes);
}

async function knowledgeAssistant(browser) {
  const list = transcriptsFor('knowledge-assistant');
  const scenes = [
    { id: 'cancellation', caption: 'A policy question is answered from the clinic’s own document, with its source named' },
    { id: 'prices-45', caption: 'Prices come straight from the services table, not from memory' },
    { id: 'pack-of-5', caption: 'A pack-of-5 total is worked out from the table and the fee list' },
    { id: 'wifi', caption: 'If the documents do not say, it says so and points to the front desk' },
    { id: 'clinical', caption: 'It will not give clinical advice, and points the patient to a physiotherapist' },
    { id: 'injection', caption: 'An attempt to make it run a database command is refused' },
  ];
  scenes.welcomeCaption = 'Ask the practice anything: answers come only from its own documents';
  await chatFlow(browser, 'knowledge-assistant', 'Demo Physio Clinic · Practice Knowledge Assistant', 'Fictional clinic, portfolio demo.', 'Ask me about fees, hours and policies.', list, scenes);
}

async function websiteWidget(browser) {
  const list = transcriptsFor('website-answer-widget');
  let shots = null;
  const open = async (page) => { await page.click('.chat-window-toggle'); await page.waitForSelector('.chat-inputs textarea'); await page.waitForTimeout(500); };
  const bubbleRect = (page) => rectOf(page, '.chat-window-toggle');

  let { context, page } = await fresh(browser, 'website-answer-widget', list, { site: true });
  shots = new Shots(page, 'website-answer-widget');
  await page.waitForTimeout(400);
  await shots.take('A visitor lands on the clinic’s page. The answer bubble waits in the corner', { target: await bubbleRect(page), focus: { x: 1040, y: 640, w: 400, h: 260 } });
  await context.close();

  for (const [id, cap] of [
    ['saturday', 'They ask about Saturday hours and get the clinic’s real answer, with its source'],
    ['prices-45', 'Prices come from the clinic’s services table'],
  ]) {
    ({ context, page } = await fresh(browser, 'website-answer-widget', list, { site: true }));
    shots.page = page;
    await open(page); await ask(page, T(list, id).input); await waitReply(page, T(list, id));
    await shots.take(cap, { sel: '.chat-message-from-bot', focus: { x: 1040 - 60, y: 100, w: 460, h: 800 } });
    await context.close();
  }

  ({ context, page } = await fresh(browser, 'website-answer-widget', list, { site: true }));
  shots.page = page;
  const ac = T(list, 'acupuncture');
  await open(page); await ask(page, ac.input); await waitReply(page, ac);
  await page.waitForSelector('.lead-card');
  await page.waitForTimeout(300);
  const card = await rectOf(page, '.lead-card');
  await shots.take('Not in the documents? It does not guess. It offers a callback from the front desk', { target: card, focus: { x: 980, y: 100, w: 460, h: 800 } });
  await page.fill('.lead-card input[name=name]', 'Demo Visitor');
  await page.fill('.lead-card input[name=phone]', '0000000002');
  await shots.take('The visitor leaves a name and number (dummy data here)', { target: await rectOf(page, '.lead-card'), focus: { x: 980, y: 100, w: 460, h: 800 } });
  await page.click('.lead-card button');
  await page.waitForSelector('.lead-card.done');
  await page.waitForTimeout(300);
  await shots.take('Done: the front desk gets the question and number, the visitor gets a clear thank-you', { target: await rectOf(page, '.lead-card'), focus: { x: 980, y: 100, w: 460, h: 800 } });
  await context.close();
  shots.finish();
}

// ---------- main ----------
const SLUGS = { 'appointment-desk': appointmentDesk, 'knowledge-assistant': knowledgeAssistant, 'website-answer-widget': websiteWidget };
const arg = process.argv[2];
if (arg === '--check') { verifyTranscripts(Object.keys(SLUGS)); process.exit(0); }
const slugs = arg ? [arg] : Object.keys(SLUGS);
for (const s of slugs) if (!SLUGS[s]) { console.error(`unknown slug ${s}`); process.exit(1); }
verifyTranscripts(slugs);
ensureChat();
const { chromium } = loadPlaywright();
const exe = fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined;
const browser = await chromium.launch({ executablePath: exe });
try { for (const s of slugs) { console.log(s); await SLUGS[s](browser); } } finally { await browser.close(); }
