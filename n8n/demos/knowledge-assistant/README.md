# Practice Knowledge Assistant (portfolio project #2)

An n8n workflow that lets staff and patients of a clinic ask questions in plain
English and get answers from the practice's own documents. It is a working
demo for a fictional clinic, "Demo Physio Clinic". Every document, price, phone
number and email in it is invented.

n8n workflow: **Portfolio demo · Practice Knowledge Assistant**
ID `r9qd1Q5I346ywxQb`, <your-n8n-host>/workflow/r9qd1Q5I346ywxQb
(in Aniket's personal project, **inactive**).

## What it does, in plain words

Someone types a question into the chat window. The assistant:

1. Looks it up in the clinic's documents (fee list, opening hours and contact,
   cancellation policy, consent and privacy policy, FAQ) and answers from what
   it finds.
2. For anything with a price or a duration ("How much is a 45-minute session?")
   it reads the services table instead of guessing, and does any arithmetic with
   a calculator (for example a pack of 5 sessions with the pack discount).
3. Ends the answer with a footer naming the source document(s), for example
   `Sources: Cancellation Policy`.
4. If the answer is not in the documents it says exactly "I don't know, please
   ask the front desk." and nothing else. It never says "we don't offer X" just
   because X is missing.
5. Never gives clinical advice (symptoms, exercises, medication, diagnosis, what
   treatment is needed). It says so, points to the physiotherapist or front desk
   and mentions the emergency number, and it holds that line when the user says
   "ignore your previous instructions".

## Built on coleam00/ottomator-agents (MIT)

Built on **coleam00/ottomator-agents** by Cole Medin (MIT licence),
https://github.com/coleam00/ottomator-agents, specifically the
`ultimate-n8n-rag-agent` folder (`Ultimate_RAG_AI_Agent_V4.json`, "Ultimate n8n
Agentic RAG Template") with ideas from `contextual-retrieval-n8n-agent`
(`Contextual_Retrieval_RAG_Agent.json`). Neither folder has its own LICENSE
file; the repository-root MIT licence covers them.

```
MIT License

Copyright (c) 2024 Cole Medin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### What was kept from the original

- The agentic RAG idea: one agent that chooses between vector search, a document
  list, full-document retrieval and SQL on tabular data, instead of one fixed
  lookup. Tabular data is kept out of the vector store and stored as JSONB rows
  (`demo_document_metadata` + `demo_document_rows` tables).
- The Postgres + PGVector design (now enabled and tested, as the second variant).
- The "always say when you did not find the answer" rule.

### What was changed or added

- English, one fictional clinic, six short mock documents (see `docs/`).
- Chat front end via the n8n Chat Trigger instead of the original Webhook/Drive
  flow. No Google Drive, no file triggers, no trash-cleanup branches.
- Embeddings and chat model are Google Gemini (credential "Aniket - Gemini")
  instead of OpenAI. No Cohere reranker (optional in the target design).
- Every chunk is prefixed with its source title (`Source: Fee List`, section
  name) before embedding. This is the cheap version of the contextual-retrieval
  idea (no LLM call per chunk) and is what makes the citation footer reliable.
- New system prompt: citations footer, the exact "I don't know, please ask the
  front desk." refusal, "missing information is never proof of a no", a strict
  no-clinical-advice guardrail, prompt-injection wording, plain-text style.
- A Calculator tool for totals and discounts.
- Two variants (below).

## The two variants in the one workflow

| | (b) In-memory demo | (a) Postgres + PGVector |
|---|---|---|
| Vector store | n8n Simple Vector Store (in memory, key `demo-physio-clinic`) | Postgres PGVector Store, table `demo_documents_pg` |
| Tabular data | Code Tool holding the 8-row services table | Postgres tool with read-only SQL on `demo_document_rows` (JSONB) |
| Chat memory | Simple Memory (in n8n) | Postgres Chat Memory, table `demo_chat_histories` |
| Chat trigger | `Chat with Practice Assistant` | `Chat (target design, Postgres)` |
| Credentials | `Aniket - Gemini` | `Aniket - Gemini` + `Portfolio demos - Supabase` |

Both variants are enabled and both are tested (see `test-log.md`). One manual
run of `Ingest knowledge base (run first)` fills both.

Credentials: only two are used anywhere, `Aniket - Gemini` (Gemini chat and
embeddings) and `Portfolio demos - Supabase` (id `cKw565YTFnbb6aWb`, a Supabase
free project used only for portfolio demos). It is assigned explicitly to all
six Postgres-type nodes (setup, PGVector insert, PGVector search tool, chat
memory, and the three Postgres tools). The live business credentials
("Postgres account", "udaan-postgres") are not used; after every update n8n
reported `autoAssignedCredentials: []`.

Every database object is prefixed `demo_`: `demo_documents_pg`,
`demo_document_metadata`, `demo_document_rows`, `demo_chat_histories`, and the
role `demo_reader`.

## Setup (demo path, 2 minutes)

1. Open the workflow. It already uses the `Aniket - Gemini` credential.
2. Click **Execute workflow** on `Ingest knowledge base (run first)`. This
   sets up the Postgres tables, then embeds the mock documents (26 chunks) into
   the Simple Vector Store and into Postgres PGVector.
3. Open the chat (`Chat with Practice Assistant`, "Open chat") and ask.
   Try: "What happens if I cancel with 12 hours notice?", "How much is a
   45-minute session?", "Do you offer acupuncture?".

The in-memory store lives in the n8n process. It is shared by every execution
(so ingest once, chat as often as you like) but is empty again after n8n
restarts; run the ingest again. Ingest replaces the store each time
(`clearStore: true`), so re-running never duplicates chunks. If you change a
document, edit the `docs = [...]` array in the `Load mock documents` node (the
markdown files in `docs/` are the source of truth) and re-ingest.

Leave the workflow inactive. The chat is for testing in the editor. To publish
it as a public chat page later, set the Chat Trigger to public, add
authentication, and think about who can spend Gemini quota.

## Setup (Postgres + PGVector variant)

Already done for the demo Supabase project. To rebuild elsewhere: create a
Postgres with the pgvector extension (Supabase or Neon free tier), create an n8n
Postgres credential, and assign it to the six Postgres-type nodes. Then:

1. Run `Ingest knowledge base (run first)` once. The chain is: `Postgres: create
   tables and load services table` (enables `vector`, drops and recreates
   `demo_documents_pg`, creates `demo_document_metadata` and
   `demo_document_rows`, loads the 8 services rows with prices in INR, creates
   the read-only role and its policies) -> `Load mock documents` -> both vector
   store inserts. Re-running never duplicates (the vector table is dropped and
   rebuilt, the services rows are deleted and reinserted).
2. Chat with `Chat (target design, Postgres)`.

Read-only SQL: the model writes the SQL for `Query services table`, so the tool
prefixes it with `SET LOCAL ROLE demo_reader;`. `demo_reader` is a NOLOGIN role
with SELECT on `demo_document_metadata` and `demo_document_rows` only, plus
row-level-security SELECT policies. On the Supabase pooler a separate login for
the role was not needed. Verified directly: as `demo_reader` a SELECT returns
the 8 rows and an INSERT fails with "permission denied for table
demo_document_metadata". Caveat: this is a mitigation, not a guarantee. The
prompt forbids SET/RESET, but model-written SQL could in principle issue
`RESET ROLE`. For real data use a dedicated read-only login in a second
credential.

Note: `gemini-embedding-001` returns 3072-dimension vectors. That is fine for
plain PGVector storage in this demo; ANN indexes (HNSW/IVFFlat) are limited to
2000 dimensions, so add one only after choosing a smaller output size. pgvector
0.8.2 is on in the Supabase project.

## Known limits (honest list)

- Both variants were run end to end (ingest plus the full question set). The
  Postgres variant is on a Supabase free project, so it can pause when idle.
- The `SET LOCAL ROLE demo_reader` protection is a mitigation (see above), not a
  hard guarantee against model-written SQL.
- The Gemini API occasionally returns 503 under load; both agents retry 3 times.
- Prices are fictional rupee amounts (for example a follow-up session is
  Rs 900 for 45 minutes), not real clinic rates.
- The services table tool returns all 8 rows and lets the model pick. That is
  right for 8 rows; for a big table use the Postgres SQL variant.
- There is no full-document tool in the in-memory variant (the six documents are
  short; the Postgres variant has `Get document text`).
- Model: `models/gemini-3.1-flash-lite`. `models/gemini-2.5-flash` returned
  404 ("no longer available to new users") and `models/gemini-3.8-flash` returned
  503 (high demand) at build time. Change it in the two "Gemini chat model" nodes
  if needed. The agent retries 3 times on failure.
- The guardrail is prompt-based. It held in the tests (including a "ignore your
  previous instructions" attempt) but a prompt is not a guarantee; for real
  patient use add an input classifier and human review.
- Real clinic documents will hold personal data. This demo has none.

## Files

- `workflow.json`: export of the workflow (via `get_workflow_details`;
  credential references re-added by id and name; re-select them if you import
  it into another n8n).
- `docs/`: the mock knowledge set (5 markdown documents and the services CSV,
  prices in Indian rupees).
- `test-log.md`: test inputs and the actual replies.
