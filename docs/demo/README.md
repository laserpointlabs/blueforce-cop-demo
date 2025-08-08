# Blue Force COP Demo - MVP Documentation

## 🎯 Overview

This directory contains comprehensive documentation for the **Blue Force Common Operating Picture (COP) Demonstration MVP** - an advanced showcase of ontology-driven semantic interoperability through AI personas. The demonstration transforms DADMS from a decision platform into a revolutionary knowledge-driven integration platform.

## 🚀 Development Startup

- Start infrastructure and apps:
  - `./dadms-start.sh start`
  - Status: `./dadms-start.sh status`
  - Stop: `./dadms-start.sh stop`
- UI (Next.js): `http://localhost:3000`
- Project Service API: `http://localhost:3001`

### Environment Variables
- UI API base (default): `NEXT_PUBLIC_API_BASE=http://localhost:3001/api`
- Set in your shell before starting the UI, or in `.env.local`.

## 🔒 Startup & Ports Policy (MANDATORY)
- Always use `./dadms-start.sh` to start/stop/status all services (PM2-managed, detached)
- Never launch ad‑hoc UI/backend servers in attached terminals
- Respect dev ports: UI `3000`, Project Service `3001`, LLM `3002`, Knowledge `3003`, Orchestrator `3017`
- Preflight check before any actions:
  - `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/` → expect `200`
  - `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3001/api` → expect `200`
- If checks fail, use the start script: `./dadms-start.sh start` and re‑verify

## 🧭 Access Points
- COP Demo entry: `http://localhost:3000/cop-demo`
- Project Service health: `http://localhost:3001/health`
- Project Service API root: `http://localhost:3001/api`

## ✅ Current Progress

- New route scaffolded: `/cop-demo`
- Theming aligned with `dadmsTheme` (light/dark via CSS variables)
- Icons: using VS Code Codicons via shared `Icon` component (no emojis)
- Backend Status widget on `/cop-demo`:
  - Pings the Project Service
  - Displays service, status, and port

## 📚 Documentation Structure

### Core Planning Documents

#### [📋 Blue Force COP Demo Plan](./blue-force-cop-demo-plan.md)
Executive overview and high-level demonstration strategy.

#### [🏗️ Architecture Overview](./architecture-overview.md)
System, data flow, infrastructure, and persona interaction diagrams.

#### [📖 Technical Specification](./cop-demo-technical-spec.md)
Detailed technical implementation requirements and semantic workflow.

### Implementation Guidance

#### [🛣️ Implementation Roadmap](./cop-demo-implementation-roadmap.md)
3-week sprint planning with detailed milestones.

#### [🎯 MVP Priorities](./cop-demo-mvp-priorities.md)
MVP scope and success criteria.

#### [🚀 Next Steps](./cop-demo-next-steps.md)
Immediate actions and development readiness.

### Advanced Features

#### [🧠 Ontology Enhancement](./cop-demo-ontology-enhancement.md)
Semantic interoperability through ontology integration.

#### [⚙️ Ontology Manager Service Specification](./ontology-manager-service-spec.md)
Technical specification for semantic processing service.

#### [🎲 Probabilistic Ontology Extraction](./probabilistic-ontology-extraction.md) *(Stretch Goal)*
Advanced question-guided probabilistic extraction with statistical convergence.

## 🧩 UI Implementation Notes

- Always use `dadmsTheme` for colors/typography/shadows (no hardcoded colors)
- Use shared `Icon` (VS Code Codicons) instead of emojis
- Prefer small, composable components in `src/app/cop-demo/components`

## ⚙️ Ports (Development)
- UI: 3000
- Project Service: 3001
- LLM: 3002
- Knowledge: 3003
- Task Orchestrator (planned): 3017

## 📈 Success Metrics

- Total demo time: 40–45 minutes
- Ontology extraction < 3 minutes per standard
- Semantic alignment < 2 minutes for ~1k concepts
- Code generation < 1 minute per pipeline

---

This documentation is kept current as we implement the COP demo and integrate with existing DADMS services.
