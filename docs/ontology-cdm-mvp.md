## Ontology/CDM deterministic MVP – base ontology, per-spec ontologies, CDM, mappings

- **Branch**: `feat/ontology-cdm`
- **Purpose**: Produce a minimal, deterministic set of ontology and mapping artifacts (no heavy AI reasoning) that demonstrate how Link-16 and VMF can be aligned to a Common Data Model (CDM), surfaced in the UI with alignment status and downloadable artifacts.

### Scope (what we will deliver)
- **Base ontology (Defense Core)** JSON with a few core concepts and relations
  - Concepts: Unit, Track, Message, Position, Time, Platform, Link
  - Relations: hasPosition, observedAt, emitsMessage, belongsToUnit, mapsToCDM
- **Per‑spec ontologies** from curated fixtures (deterministic, not parsed live)
  - `link16_ontology.json`
  - `vmf_ontology.json`
- **CDM core and mappings**
  - `cdm.json` – normalized model aligned to the base ontology
  - `cdm_link16.json` – mapping Link‑16 → CDM
  - `cdm_vmf.json` – mapping VMF → CDM
- **Alignment report**
  - `alignment_report.md` – coverage %, conflicts, and mapping decisions
- **UI integration**
  - PM Dashboard shows alignment coverage/conflicts in an alignment widget
  - Artifact Viewer lists and allows download/preview of all ontology/CDM artifacts

### Artifacts (file inventory)
- `ontology/base_defense_core.json`
- `ontology/link16_ontology.json`
- `ontology/vmf_ontology.json`
- `ontology/cdm.json`
- `ontology/cdm_link16.json`
- `ontology/cdm_vmf.json`
- `ontology/alignment_report.md`

### Implementation notes
- Deterministic, fixture‑based generation to ensure demo reliability and speed
- Artifacts are surfaced via the existing Artifact Viewer; alignment metrics feed the Compliance/Alignment panels
- No probabilistic/question‑guided extraction in MVP (kept as stretch)

### Stretch goal (optional)
- Probabilistic, question‑guided ontology extraction with multiple runs and convergence/uncertainty reporting. Outputs would be added as supplemental artifacts and trends in the dashboard.

### Working branch and PR process
- Work on `feat/ontology-cdm`
- Open a PR early; follow short‑lived feature branch workflow
- Merge policy: wait for green checks (lint/build), squash‑merge, delete branch (as captured in `.cursorrules`)

### Local environment & constraints
- Use the provided start script for stability:
  - `./blueforce-start.sh start|stop|restart|status|logs`
- Ports (WSL stability constraints):
  - UI: 4000, Ollama: 11434
  - Avoid 3000–3023 (reserved) and avoid ad‑hoc starts/stops that can destabilize ports under WSL
- Health checks:
  - UI: http://localhost:4000
  - Ollama: http://localhost:11434

### Milestones
- M1: Commit base ontology + CDM skeleton
- M2: Commit per‑spec ontologies (Link‑16, VMF)
- M3: Commit CDM mappings and alignment report
- M4: Wire alignment widget in PM Dashboard and expose artifacts for preview/download

### Success criteria
- All ontology/CDM artifacts present and downloadable from the UI
- Alignment widget shows meaningful coverage/conflict stats
- CI green on PR; demo runs consistently end‑to‑end within the time budget
