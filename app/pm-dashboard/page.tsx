"use client";
import { useEffect, useMemo, useState } from 'react';
import { Icon } from "../../components/Icon";

export default function PMDashboard() {
  const [wfId, setWfId] = useState<string | null>(null);
  const [wf, setWf] = useState<any>(null);
  const [polling, setPolling] = useState<number | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');

  const kpis = useMemo(() => {
    const status = wf?.status ?? 'PENDING';
    const logs = wf?.logs ?? [];
    const step = wf?.step ?? 0;
    const totalSteps = 5;
    const progressPct = Math.round((step / totalSteps) * 100);
    // Estimate by step machine timing (2s/step in mock manager)
    const stepMs = 2000;
    const totalMs = totalSteps * stepMs;
    const createdAt = wf?.createdAt ? Number(wf.createdAt) : Date.now();
    const elapsedMs = Math.max(0, Date.now() - createdAt);
    const remainingMs = Math.max(0, totalMs - elapsedMs);
    const fmt = (ms: number) => {
      const s = Math.ceil(ms / 1000);
      return `${Math.floor(s / 60)}m ${s % 60}s`;
    };
    // Mock rules coverage and pass/fail as proportional to step
    const rulesCoveragePct = progressPct;
    const passCount = step * 5;
    const failCount = 0;
    return {
      status,
      steps: step,
      personas: (wf?.personas ?? []).length,
      progressPct,
      remainingText: fmt(remainingMs),
      rulesCoveragePct,
      passCount,
      failCount,
    };
  }, [wf]);

  useEffect(() => {
    if (!wfId) return;
    const tick = async () => {
      const res = await fetch(`/api/workflows/${wfId}/status`, { cache: 'no-store' });
      const data = await res.json();
      setWf(data);
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        return false;
      }
      return true;
    };
    const interval = setInterval(async () => {
      const keep = await tick();
      if (!keep) {
        clearInterval(interval);
        setPolling(null);
      }
    }, 1200);
    setPolling(1);
    return () => clearInterval(interval);
  }, [wfId]);

  const start = async () => {
    const res = await fetch('/api/workflows/cop-demo/start', { method: 'POST' });
    const data = await res.json();
    setWfId(data.id);
    setWf({ status: data.status, logs: [] });
  };
  const stop = async () => {
    if (!wfId) return;
    await fetch(`/api/workflows/${wfId}/stop`, { method: 'POST' });
  };

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Icon name="dashboard" size="sm" /> PM Dashboard</h1>
          <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <a href="/" className="underline">Home</a>
            <span>/</span>
            <a href="/cop-demo" className="underline">COP Demo</a>
          </nav>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded border space-y-2" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Status</div>
            <div className="text-xl font-semibold">{kpis.status}</div>
            <div className="text-xs opacity-80">Steps {kpis.steps}/5 • Personas {kpis.personas}</div>
          </div>
          <div className="p-4 rounded border space-y-2" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Progress</div>
            <div className="w-full h-2 rounded" style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}>
              <div className="h-2 rounded" style={{ width: `${kpis.progressPct}%`, backgroundColor: 'var(--theme-accent-primary)' }} />
            </div>
            <div className="text-xs opacity-80">{kpis.progressPct}% • ~{kpis.remainingText} remaining</div>
          </div>
          <div className="p-4 rounded border space-y-2" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Validation</div>
            <div className="flex items-center gap-4">
              <div className="text-lg font-semibold">{kpis.rulesCoveragePct}%</div>
              <div className="text-xs opacity-80">rules coverage</div>
            </div>
            <div className="text-xs opacity-80">Pass {kpis.passCount} • Fail {kpis.failCount}</div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="list-ordered" size="sm" /> Logs</h2>
              <div className="flex items-center gap-2">
                <button className="btn-primary" style={{ backgroundColor: 'var(--theme-accent-primary)' }} onClick={start}><Icon name="debug-start" size="sm" /> Start</button>
                <button className="btn-primary" style={{ backgroundColor: 'var(--theme-accent-error)' }} onClick={stop}><Icon name="debug-stop" size="sm" /> Stop</button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
              <span>Filter:</span>
              <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)} className="input" style={{ maxWidth: 200 }}>
                {['ALL','INGEST','CODEGEN','MAPPING','VIZ','DONE'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <ul className="text-sm space-y-1" style={{ color: 'var(--theme-text-secondary)' }}>
              {(wf?.logs ?? []).length === 0 ? (
                <li>No logs yet.</li>
              ) : (
                wf.logs
                  .slice()
                  .reverse()
                  .filter((entry: any) => phaseFilter === 'ALL' || entry.phase === phaseFilter)
                  .map((entry: any, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="opacity-60 text-xs" style={{ minWidth: 100 }}>
                        {new Date(entry.ts).toLocaleTimeString()}
                      </span>
                      <span>{entry.message}</span>
                      {entry.phase && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}>
                          {entry.phase}
                        </span>
                      )}
                    </li>
                  ))
              )}
            </ul>
          </div>

          <div className="p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="account" size="sm" /> Personas</h2>
            <ul className="text-sm space-y-1">
              {(wf?.personas ?? []).map((p: any) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{p.type}</span>
                  <span className="opacity-80">{p.status}</span>
                </li>
              ))}
              {(wf?.personas ?? []).length === 0 && <li>Not started.</li>}
            </ul>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="shield" size="sm" /> Compliance</h2>
            {wf?.compliance ? (
              <>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs opacity-80">Total</div>
                    <div className="text-lg font-semibold">{wf.compliance.total}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-80">Passed</div>
                    <div className="text-lg font-semibold" style={{ color: 'var(--theme-accent-success)' }}>{wf.compliance.passed}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-80">Failed</div>
                    <div className="text-lg font-semibold" style={{ color: 'var(--theme-accent-error)' }}>{wf.compliance.failed}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm mb-2" style={{ color: 'var(--theme-text-secondary)' }}>Trend</div>
                  <TrendChart history={wf.compliance.history} total={wf.compliance.total} />
                  <div className="flex items-center gap-4 mt-2 text-xs opacity-80">
                    <div className="flex items-center gap-1"><span style={{ width: 10, height: 2, background: 'var(--theme-accent-success)', display: 'inline-block' }} /> Coverage%</div>
                    <div className="flex items-center gap-1"><span style={{ width: 8, height: 8, background: 'var(--theme-accent-success)', display: 'inline-block' }} /> Pass</div>
                    <div className="flex items-center gap-1"><span style={{ width: 8, height: 8, background: 'var(--theme-accent-error)', display: 'inline-block' }} /> Fail</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Violations</div>
                  <ul className="text-sm space-y-1">
                    {wf.compliance.violations.length === 0 ? (
                      <li>None</li>
                    ) : (
                      wf.compliance.violations.slice().reverse().map((v: any) => {
                        const related = (wf.logs ?? []).find((l: any) => l.phase === v.phase);
                        return (
                          <li key={v.id} className="flex items-center justify-between">
                            <span>
                              <a href="#" onClick={(e) => { e.preventDefault(); alert(`${v.rule}: ${v.message}`); }} className="underline">{v.rule}</a>
                              {related ? <span className="opacity-70"> — see logs around {new Date(related.ts).toLocaleTimeString()}</span> : null}
                            </span>
                            <span className="text-xs opacity-70">{v.severity}</span>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>No compliance data yet.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function TrendChart({ history, total }: { history: Array<{ ts: number; passed: number; failed: number; total: number }>; total: number }) {
  const width = 300;
  const height = 80;
  const pad = 8;
  const points = history.map((h: any, i: number) => {
    const x = pad + (i * (width - 2 * pad)) / Math.max(1, history.length - 1);
    const pct = (h.passed / total) * 100;
    const y = height - pad - (pct / 100) * (height - 2 * pad);
    return { x, y, passed: h.passed, failed: h.failed, ts: h.ts };
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const last = points[points.length - 1];
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Compliance trend">
      <rect x="0" y="0" width={width} height={height} fill="var(--theme-bg-tertiary)" rx="6" />
      {/* grid */}
      {[0, 25, 50, 75, 100].map((pct, i) => {
        const y = height - pad - (pct / 100) * (height - 2 * pad);
        return <line key={i} x1={pad} y1={y} x2={width - pad} y2={y} stroke="var(--theme-border)" strokeOpacity="0.3" strokeWidth="1" />;
      })}
      {/* line */}
      <path d={pathD} fill="none" stroke="var(--theme-accent-success)" strokeWidth="2" />
      {/* points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--theme-accent-success)" />
      ))}
      {/* last value label */}
      {last && (
        <text x={last.x + 6} y={last.y - 6} fontSize="10" fill="var(--theme-text-secondary)">{`${Math.round((last.passed / total) * 100)}%`}</text>
      )}
      {/* pass/fail bars */}
      {points.map((p, i) => (
        <g key={`bars-${i}`}>
          <rect x={p.x - 2} width="4" y={height - pad - (p.passed / total) * (height - 2 * pad)} height={(p.passed / total) * (height - 2 * pad)} fill="var(--theme-accent-success)" opacity="0.2" />
          {p.failed > 0 && (
            <rect x={p.x + 3} width="3" y={height - pad - (p.failed / total) * (height - 2 * pad)} height={(p.failed / total) * (height - 2 * pad)} fill="var(--theme-accent-error)" opacity="0.3" />
          )}
        </g>
      ))}
    </svg>
  );
}



