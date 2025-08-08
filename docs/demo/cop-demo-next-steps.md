# Blue Force COP Demo - Immediate Next Steps

## ✅ Environment
- Use `./dadms-start.sh start` to launch infra + apps
- UI: http://localhost:3000, API: http://localhost:3001

## 🔧 Step 1: Verify Frontend ↔ Backend Integration
- Visit `/cop-demo` and confirm Backend Status shows `healthy`
- If unreachable:
  - Check `./dadms-start.sh status`
  - Logs: `pm2 logs dadms-backend --lines 100`
  - API check: `curl http://localhost:3001/api`

## 🏗️ Step 2: Task Orchestrator Bootstrap
- Create minimal Express server in `dadms-services/task-orchestrator` with `GET /health`
- Scripts: `dev`, `build`, `start`
- Manual run to validate: `npm run dev` in the orchestrator folder
- Do not change start script until health is green

## 🧩 Step 3: COP Demo Workflow Scaffold
- UI: Add disabled "Start Demo" button under Backend Status
- After orchestrator `/health` is green, wire to `POST /workflows/cop-demo/start`
- Show in-UI toast/messages only (no complex state yet)

## 🧪 Step 4: Smoke Tests
- UI renders `/cop-demo` without errors
- Backend health returns JSON
- Orchestrator health returns JSON

## 📝 Notes
- Follow theme and Icon standards in all components (no emojis)
- Respect port allocations: UI 3000, Project 3001, Orchestrator 3017
