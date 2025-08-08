# Blueforce COP Demo – Build TODO

Track progress of the demo implementation. Update this file as items complete.

## Foundation
- [ ] PM Dashboard route with VS Code-style layout (status bar, sidebar, content panes)
- [ ] Wire dashboard to mock orchestrator workflow status/logs
- [ ] Start/Stop controls for mock workflow from UI
- [ ] Global toast/notification utility

## LLM / Ollama
- [ ] Streaming responses for `/api/ollama/chat` (NDJSON/SSE)
- [ ] Persona prompt templates (Standards Analyst, Pipeline Engineer, Data Modeler, UI/UX)
- [ ] Persona execution API: `POST /api/personas/:type/execute` using Ollama
- [ ] Model selector (persisted, with missing-model fallback)

## Standards & Knowledge (MVP mocked)
- [ ] Mock Link-16/VMF documents and schemas (JSON fixtures)
- [ ] Schema extraction stub: generate schema + rules from fixtures
- [ ] Artifact storage in `artifacts/` + index endpoint

## Workflow Orchestration (in-app mock)
- [ ] Expand step machine: phases, progress %, per-persona tasks
- [ ] Live updates via EventSource (SSE) with fallback
- [ ] Failure/retry paths + recovery button

## Visualization (MVP)
- [ ] COP map placeholder with tactical layer toggles (mock data)
- [ ] Compliance dashboard (pass/fail counts, rules list)
- [ ] Artifact viewer (schemas, generated code, logs)

## UI / Theme
- [ ] Shared components: Card, Panel, TabBar, Toolbar, IconButton using `dadmsTheme`
- [ ] Light/dark toggle honoring CSS variables
- [ ] Keyboard shortcuts for demo flow (start/pause, toggle panels)

## DX / Testing
- [ ] E2E smoke test (Playwright): start → complete mock workflow
- [ ] Unit tests for orchestrator manager and API handlers
- [ ] `npm run demo:*` scripts (seed, start, open)

## CI/CD
- [x] CI lint + build on PRs
- [ ] Extend CI to run unit + E2E tests headless

## Docs
- [ ] Short README: run instructions, model notes
- [ ] Demo script (timed steps, talking points) in `docs/demo/`

---

Immediate next steps:
- [ ] Implement PM Dashboard UI with workflow timeline
- [ ] Add streaming chat and persona prompt templates
