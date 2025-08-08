# Blueforce COP Demo – TODO

## Bootstrap (done)
- [x] Init Next.js app with DADMS theme
- [x] Local Docker Compose with Ollama on 11434
- [x] Basic Ollama chat API (non-streaming)
- [x] Mock orchestrator API (start + status)
- [x] /cop-demo page with health, chat, and mock workflow start
- [x] Start script: blueforce-start.sh (start/stop/restart/status/logs)
- [x] CI workflow: lint + build on PRs
- [x] Repo pushed to GitHub

## Foundation
- [x] PM Dashboard route with VS Code-style layout (sidebar, status bar, panels)
- [x] Wire dashboard to mock orchestrator status/logs timeline
- [x] Start/stop controls for mock workflow; progress bar
- [x] Global toast/notification utility
- [x] KPIs panel (time remaining, pass/fail counts, rules coverage, persona statuses)

## LLM / Ollama
- [x] Streaming responses for /api/ollama/chat (server proxy streams Ollama)
- [x] Markdown rendering for streamed answers in COP Demo
- [ ] Persona prompt templates (Standards Analyst, Pipeline Engineer, Data Modeler, UI/UX)
- [ ] Persona execution API: POST /api/personas/:type/execute via Ollama
- [ ] Model selector with persisted choice + fallback if model missing
- [ ] /api/ollama/models endpoint to list available models (UI wired)
- [ ] Stretch Goal: Add AI agnet to dicuss the results on the page and offers feedback/suggestions

## Standards & Knowledge (MVP mocked)
- [ ] Mock Link-16/VMF documents + schemas (JSON fixtures)
- [x] Ontology extraction (deterministic): curated ontologies for Link-16/VMF
- [ ] Schema extraction stub → schema + rules from fixtures
- [x] Artifact viewer and list/download API endpoints
- [x] Persist artifacts to `artifacts/` directory (optional)
- [x] Compliance report generation (rules coverage, violations)

## Ontology & CDM (deterministic MVP)
- [x] Define minimal base ontology (Defense Core) JSON (Unit, Track, Message, Position, Time, Platform, Link; relations: hasPosition, observedAt, emitsMessage, belongsToUnit)
- [x] Create `link16_ontology.json` from curated fixture
- [x] Create `vmf_ontology.json` from curated fixture
- [x] Define CDM core (`cdm.json`) aligned to base ontology
- [x] Mapping: `cdm_link16.json` (Link-16 → CDM)
- [x] Mapping: `cdm_vmf.json` (VMF → CDM)
- [x] Alignment report generation (`alignment_report.md`) with coverage %, conflicts, decisions
 - [x] PM Dashboard: alignment status widget (coverage %, conflicts list + preview)
- [x] Expose all ontology/CDM artifacts in Artifact Viewer (PM Dashboard side panel)
- [x] Ontology workspace page (`/ontology`) with simulated multi-agent alignment
- [x] APIs: `/api/ontology/artifacts`, `/api/ontology/metrics`
 - [x] API: `/api/artifacts` (disk-persisted artifacts listing)

### Stretch Goal: Probabilistic Ontology Extraction
- [ ] Question-guided extraction loops with multiple runs
- [ ] Aggregate confidence scoring and convergence tracking
- [ ] Uncertainty reporting (low-confidence areas) and comparison view across runs

## Workflow Orchestration (in-app mock)
- [ ] Expand step machine (phases, %), per-persona tasks
- [ ] Event stream updates (SSE/WebSocket) with long-poll fallback
- [ ] Failure/retry paths and recovery button

## Visualization (MVP)
- [ ] COP placeholder "map" with tactical layer toggles (mock data)
- [x] Compliance dashboard (pass/fail counts, rules list)
- [x] Artifact viewer (schemas, generated code, logs)
- [ ] Data lineage panel (source → schema → model → pipeline → viz)

## UI / Theme
- [ ] Shared components: Card, Panel, TabBar, Toolbar, IconButton (using dadmsTheme)
- [ ] Light/dark toggle honoring CSS variables
- [ ] Keyboard shortcuts for demo flow (start/pause, toggle panels)

## DX / Testing
- [ ] E2E smoke test (Playwright): start → complete mock workflow
- [ ] Unit tests: orchestrator manager + API routes
- [ ] npm run demo:* scripts (seed, start, open)
- [ ] Failure-injection test and recovery verification
- [x] Post-build smoke test to start server on 4010 and verify key routes
- [x] Start script hardening: free stale port 4000, clean `.next/`, wait until ready
 - [ ] CI smoke stabilization: shorter timeouts, fewer checks to avoid flakey hangs

## CI / CD
- [ ] Extend CI to run unit + E2E tests headless
- [ ] Upload build artifact for preview (Actions artifacts)
- [x] CI smoke test step after build

## Docs
- [ ] README quickstart (start script, model notes)
- [ ] Demo script with timed steps in docs/demo/
 - [ ] Document ontology extraction flow (deterministic + probabilistic stretch goal)

## Navigation / UX
- [x] Add Home link in top-right on key pages (COP Demo, PM Dashboard, Ontology)
- [x] Add Ontology Workspace tile to home page

---

We will update this checklist as tasks complete; PRs will reference items here.
