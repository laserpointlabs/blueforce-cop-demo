## MVP Work Plan — Orchestration, Viz Placeholder, Deterministic Fallback

Aligned with `TODO.md` and `docs/demo/cop-demo-storyboard.md` (Expanded storyboard). This doc tracks the focused scope for branch `feat/mvp-orchestration-viz`.

### Scope
- **Workflow Orchestration (mock, in‑app)**
  - Expand step machine: phases, percent complete, per‑persona tasks
  - Event updates: SSE/WebSocket with long‑poll fallback
  - Failure/retry paths and recovery button

- **Visualization (MVP)**
  - COP placeholder "map" with tactical layer toggles (mock data)
  - Wire `vizLayer` control to show/hide layers programmatically

- **LLM / Ollama**
  - Deterministic fallback text when Ollama is unavailable (opt‑in)

- **CI / Stability**
  - Keep CI lean (lint + build); revisit smoke later per TODO

### Acceptance (incremental)
- Orchestration widget shows multi‑phase progress and emits events; retry recovers a failed phase
- Placeholder viz shows at least two togglable layers with mock data
- When Ollama is missing/disabled, UI displays deterministic fallback responses without errors

### References
- `TODO.md` (Workflow Orchestration, Visualization, LLM/Ollama, CI/CD)
- `docs/demo/cop-demo-storyboard.md` (Expanded storyboard items 6–8)
- `docs/storyboard-status-and-estimates.md` (Option A near‑term scope)

### Notes
- Keep PRs focused and small; add screenshots/GIFs when UI pieces land
- Feature flags/env controls for fallback and event transport


