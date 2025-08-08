"use client";
import { useEffect, useMemo, useState } from 'react';
import { Icon } from "../../components/Icon";

export default function PMDashboard() {
  const [wfId, setWfId] = useState<string | null>(null);
  const [wf, setWf] = useState<any>(null);
  const [polling, setPolling] = useState<number | null>(null);

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
    const interval = setInterval(async () => {
      const res = await fetch(`/api/workflows/${wfId}/status`);
      const data = await res.json();
      setWf(data);
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        clearInterval(interval);
        setPolling(null);
      }
    }, 1500);
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="list-ordered" size="sm" /> Logs</h2>
              <div className="flex items-center gap-2">
                <button className="btn-primary" style={{ backgroundColor: 'var(--theme-accent-primary)' }} onClick={start}><Icon name="debug-start" size="sm" /> Start</button>
                <button className="btn-primary" style={{ backgroundColor: 'var(--theme-accent-error)' }} onClick={stop}><Icon name="debug-stop" size="sm" /> Stop</button>
              </div>
            </div>
            <ul className="text-sm space-y-1" style={{ color: 'var(--theme-text-secondary)' }}>
              {(wf?.logs ?? []).length === 0 ? <li>No logs yet.</li> : (wf.logs.map((l: string, i: number) => <li key={i}>• {l}</li>))}
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
      </div>
    </main>
  );
}



