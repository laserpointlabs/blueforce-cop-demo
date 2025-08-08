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
- [ ] PM Dashboard route with VS Code-style layout (sidebar, status bar, panels)
- [ ] Wire dashboard to mock orchestrator status/logs timeline
- [ ] Start/stop controls for mock workflow; progress bar
- [ ] Global toast/notification utility
- [ ] KPIs panel (time remaining, pass/fail counts, rules coverage, persona statuses)

## LLM / Ollama
- [ ] Streaming responses for /api/ollama/chat (SSE/NDJSON)
- [ ] Persona prompt templates (Standards Analyst, Pipeline Engineer, Data Modeler, UI/UX)
- [ ] Persona execution API: POST /api/personas/:type/execute via Ollama
- [ ] Model selector with persisted choice + fallback if model missing

## Standards & Knowledge (MVP mocked)
- [ ] Mock Link-16/VMF documents + schemas (JSON fixtures)
- [ ] Ontology extraction (deterministic): extract concepts/relations from fixtures into a basic ontology JSON
- [ ] Schema extraction stub → schema + rules from fixtures
- [ ] Save artifacts to artifacts/ + index/list API
- [ ] Compliance report generation (rules coverage, violations, provenance)

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
- [ ] Compliance dashboard (pass/fail counts, rules list)
- [ ] Artifact viewer (schemas, generated code, logs)
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

## CI / CD
- [ ] Extend CI to run unit + E2E tests headless
- [ ] Upload build artifact for preview (Actions artifacts)

## Docs
- [ ] README quickstart (start script, model notes)
- [ ] Demo script with timed steps in docs/demo/
 - [ ] Document ontology extraction flow (deterministic + probabilistic stretch goal)

---

We will update this checklist as tasks complete; PRs will reference items here.
