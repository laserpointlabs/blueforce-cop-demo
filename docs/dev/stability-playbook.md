## Dev stability playbook (WSL + Next.js)

### Why things have broken historically
- WSL port reuse: Node dev server leaves port 4000 in TIME_WAIT, causing `EADDRINUSE` on restart.
- Stale Next build cache: old webpack chunks in `.next/` trigger missing module errors (e.g., `Cannot find module './948.js'`).
- Race to ready: UI reported “up” before it actually served 200, resulting in white screens/500s.
- Duplicate/invalid API modules: accidental duplicate exports or route collisions (e.g., models route) break builds.
- Flaky smoke in CI: long timeouts and multi-route checks hung runs.
- Build vs. runtime assumptions: fetching internal routes or importing server-only code in unexpected places can surface at build.

### Mitigations we implemented
- Start script hardening: `./blueforce-start.sh` frees 4000/tcp, cleans `.next/`, and waits for HTTP 200.
- Clean builds: `rm -rf .next` in `npm run build` to avoid stale chunks.
- Health checks: `./blueforce-start.sh status` and `curl /` after changes; tail `logs/next.log` on errors.
- Simplified CI: removed flaky smoke; kept lint+build with timeouts.
- Safer API routes: deduped `/api/ollama/models`; client-only fetches moved into `useEffect`.

### Guardrails (do every time)
1) `npm ci && npm run build` (clean build).
2) `./blueforce-start.sh restart`; wait for “UI ready”.
3) `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4000/` → expect 200.
4) Hit key routes: `/pm-dashboard`, `/ontology` → expect 200.
5) `tail -n 200 logs/next.log` to confirm no runtime errors.

### Coding guidelines that help
- Keep API and server utilities free of client-only imports.
- Fetch internal APIs from client `useEffect` (not during build/SSR) unless necessary.
- One change per PR, small and focused; run build + health checks pre-push.
- Prefer feature branches; squash-merge after green checks.

### If it still breaks
- Re-run steps above; if 500 persists, delete `.next/`, restart, and review `logs/next.log`.
- Check for duplicate route files or conflicting exports.
- Verify WSL hasn’t orphaned the port: `fuser -k 4000/tcp` (handled by the start script).


