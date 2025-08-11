#!/usr/bin/env node
import { spawn } from 'node:child_process';
import http from 'node:http';

const PORT = process.env.SMOKE_PORT ? Number(process.env.SMOKE_PORT) : 4010;
const START_TIMEOUT_MS = process.env.SMOKE_TIMEOUT_MS ? Number(process.env.SMOKE_TIMEOUT_MS) : 8000;

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function ping(pathname = '/') {
  return new Promise((resolve) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path: pathname, method: 'GET' }, (res) => {
      const status = res.statusCode || 0;
      res.resume();
      resolve(status);
    });
    req.on('error', () => resolve(0));
    req.end();
  });
}

async function waitForServer(timeoutMs = START_TIMEOUT_MS) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const code = await ping('/');
    if (code >= 200 && code < 500) return true;
    await wait(500);
  }
  return false;
}

async function main() {
  // Ensure built assets exist
  // next start will fail if not built, we let that surface
  const args = ['start', '-p', String(PORT)];
  const child = spawn('npx', ['--yes', 'next@14.2.5', ...args], { stdio: 'pipe', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } });
  let serverReady = false;
  child.stdout.on('data', (d) => {
    const s = d.toString();
    if (s.includes('Local:') && s.includes(`:${PORT}`)) serverReady = true;
    process.stdout.write(s);
  });
  child.stderr.on('data', (d) => process.stderr.write(d.toString()));

  const ok = await waitForServer();
  if (!ok) {
    child.kill('SIGKILL');
    console.error(`[smoke] server did not respond on :${PORT}`);
    process.exit(1);
  }

  // Check key routes/APIs including new deep-link
  const paths = [
    '/',
    '/pm-dashboard',
    '/cop-demo',
    '/ontology',
    '/api/ontology/artifacts',
    '/api/ontology/metrics',
    '/cop-demo?schema=link16&viz=tracks',
  ];
  const errors = [];
  for (const p of paths) {
    let attempts = 0;
    let status = 0;
    while (attempts < 3) {
      // small stagger between attempts
      // eslint-disable-next-line no-await-in-loop
      status = await ping(p);
      if (status >= 200 && status < 400) break;
      attempts += 1;
      // eslint-disable-next-line no-await-in-loop
      await wait(300);
    }
    if (!(status >= 200 && status < 400)) errors.push({ path: p, status });
  }
  if (errors.length > 0) {
    child.kill('SIGKILL');
    for (const e of errors) console.error(`[smoke] check failed ${e.path} -> ${e.status}`);
    process.exit(2);
  }

  child.kill('SIGTERM');
  // Give it a moment to exit
  await wait(500);
  console.log('[smoke] all checks passed');
}

main().catch((err) => {
  console.error('[smoke] error', err);
  process.exit(1);
});


