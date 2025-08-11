## Storyboard/Demo Status and Options

Prepared: August 8, 2025

### Executive summary
- **UI scaffold**: On track; lineage panel and deep-links implemented.
- **Estimate options**:
  - **Option A**: Basic first-order common data model (CDM) demo.
  - **Option B**: Probabilistic ontology extraction + CDM demo.

### Near-term milestone
- **Scaffolded UI**: 16–24 engineer-hours, target by Monday.
- **Stakeholder working session**: 1 hour to align on scope, data, and acceptance criteria.

### Option A — Basic First-Order CDM Demo
- **Objective**: Demonstrate ingesting heterogeneous tabular data and mapping to a first-order CDM via a guided, deterministic mapping flow.
- **Scope & steps**
   - UI: Complete storyboard scaffold, navigation, mapping wizard, and lineage panel.
  - Data ingestion: CSV/Excel/JSON file upload; basic schema detection and preview.
  - Mapping: Manual/assisted field mapping, rule-based normalization, simple validation.
  - CDM: Persist mapped output, export as JSON/CSV; simple lineage log.
   - Demo content: 2–3 curated datasets and demo script; readme/runbook; lineage walkthrough.
  - Hardening: Basic error handling, logging, and lightweight auth (if required).
- **Deliverables**
  - Working UI with mapping wizard and one connector (file upload).
  - Deterministic mapping engine with export.
  - Sample datasets, demo script, and runbook.
- **NRE effort (estimate)**
  - **UI scaffold and flows**: 16–24 h
  - **Mapping engine (rules, normalization, export)**: 20–30 h
  - **Ingestion (CSV/Excel/JSON), schema preview**: 8–12 h
  - **Persistence, lineage log, packaging**: 6–10 h
  - **QA/demo content/docs**: 6–8 h
  - **PM/stakeholder alignment and acceptance**: 4–6 h
  - **Total**: 60–90 engineer-hours (≈1.5–2.5 weeks calendar with 1–2 engineers)
- **Assumptions**
  - File-based inputs acceptable; no live source integrations required.
  - Open-source libraries acceptable; no security review beyond demo scope.
  - Single environment; non-production data.
- **Acceptance criteria**
  - Import 2–3 sample datasets, map to CDM, and export reproducibly.
  - Clear demo path under 10 minutes, with screenshots and docs.

### Option B — Probabilistic Ontology Extraction + CDM Demo
- **Objective**: Automatically infer entities, attributes, and relationships from source data using probabilistic/NLP techniques, propose mappings to a CDM, and allow human-in-the-loop confirmation.
- **Scope & steps**
  - Ingestion: Same as Option A; add lightweight connector abstraction for future sources.
  - Ontology bootstrap: Seed ontology/labels from CDM or standard vocabularies.
  - Model layer: Integrate NLP/ML components (e.g., transformer-based semantic similarity, field-type classifiers, string similarity, frequency heuristics).
  - Probabilistic mapping: Generate ranked mapping suggestions with confidence scores.
  - Active learning UI: Side-by-side suggestions, accept/correct interactions, feedback loops.
  - Evaluation: Metrics (precision/recall@k), error analysis on sample datasets.
  - Export: CDM output with confidence and lineage; audit log of decisions.
  - Hardening: Caching, batching, timeout controls; observability for model outputs.
- **Deliverables**
  - Model-backed extraction and mapping service with APIs.
  - UI for suggestion review and feedback capture.
  - Evaluation report on demo datasets; configuration for ontology seeds.
- **NRE effort (estimate)**
  - **Data/model exploration and ontology bootstrap**: 24–40 h
  - **Model integration (similarity, classifiers, scoring, ensemble)**: 60–90 h
  - **Probabilistic mapping engine and APIs**: 40–60 h
  - **Active learning/UX for review and corrections**: 32–48 h
  - **Evaluation, metrics, and tuning loop**: 24–40 h
  - **Packaging, observability, docs, demo script**: 20–30 h
  - **PM/stakeholder alignment and acceptance**: 8–12 h
  - **Total**: 200–320 engineer-hours (≈4–8 weeks calendar with 1–2 engineers)
- **Assumptions**
  - Use of open-source NLP/ML libraries and pre-trained models is acceptable.
  - No requirement for enterprise-grade data privacy or governance in the demo.
  - Sample datasets representative of target domains will be provided early.
- **Acceptance criteria**
  - For each dataset, produce ranked mapping suggestions with confidence.
  - Human-in-the-loop correction updates the final CDM export and improves subsequent runs.
  - Evaluation summary shows meaningful lift over deterministic-only approach.

### Risks and mitigations
- **Data variability**: Early access to sample datasets reduces rework; add flexible mapping rules.
- **Model suitability**: Start with pre-trained, domain-agnostic models; parameterize model choice.
- **Timeline compression**: Phase deliverables; timebox experiments; maintain a thin vertical slice first; keep CI lean (lint/build) and add smoke later.

### Next steps
- **Monday (1 hour)**: Alignment to confirm datasets, acceptance criteria, and which option to pursue.
- **Post-alignment**: Proceed with UI scaffold completion and demo dataset preparation.

### Optional follow-ups
- **Cost translation**: Convert NRE hours into budget ranges using your preferred blended rate.
- **Packaging**: Provide the above as a branded PDF/email and add to the project tracker.
- **Presentation**: Present Option A as near-term path with Option B as advanced roadmap.
- **Demo**: Prepare a 10-minute demo script for Monday’s session.
- **Governance**: Add a simple risk register and RACI if desired.







