"use client";
import { useEffect, useMemo, useState } from 'react';
import { Icon } from "../../components/Icon";
import { useToast } from "@/components/ToastProvider";

export default function PMDashboard() {
  const { notify } = useToast();
  const [wfId, setWfId] = useState<string | null>(null);
  const [wf, setWf] = useState<any>(null);
  const [polling, setPolling] = useState<number | null>(null);
  const [sseActive, setSseActive] = useState<boolean>(false);
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [preview, setPreview] = useState<null | { id: string; name: string; type: string; mime: string; content: string }>(null);
  const [alignment, setAlignment] = useState<null | { coveragePct: number; cdmEntitiesCovered: number; cdmEntitiesTotal: number; conflicts: any[] }>(null);
  const [ontologyArtifacts, setOntologyArtifacts] = useState<Array<{ name: string; type: string; mime: string; size: number; createdAt: number }>>([]);
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState('');
  const [mappingSummaries, setMappingSummaries] = useState<Record<string, { rows: Array<{ source: string; target: string }>; stats: { mappings: number; covered: number; conflicts: number } }>>({});
  const ontologyIndex = useMemo(() => {
    const map = new Map(ontologyArtifacts.map((a) => [a.name, a] as const));
    return {
      base: map.get('base_defense_core.json'),
      link16: map.get('link16_ontology.json'),
      vmf: map.get('vmf_ontology.json'),
      cdm: map.get('cdm.json'),
      mapLink: map.get('cdm_link16.json'),
      mapVmf: map.get('cdm_vmf.json'),
      report: map.get('alignment_report.md'),
    } as const;
  }, [ontologyArtifacts]);

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
    // Prefer SSE; fallback to polling if SSE errors
    try {
      const es = new EventSource(`/api/workflows/${wfId}/events`);
      es.onopen = () => setSseActive(true);
      es.onmessage = (ev) => {
        try { setWf(JSON.parse(ev.data)); } catch {}
      };
      es.onerror = () => {
        es.close();
        setSseActive(false);
      };
      return () => es.close();
    } catch {
      setSseActive(false);
    }
  }, [wfId]);

  useEffect(() => {
    if (!wfId) return;
    if (sseActive) return; // SSE is handling updates
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
  }, [wfId, sseActive]);

  useEffect(() => {
    // Environment health snapshot for PM context
    fetch('/api/health/ollama')
      .then((r) => setOllamaOk(r.ok))
      .catch(() => setOllamaOk(false));
    // Load available models
    fetch('/api/ollama/models')
      .then(async (r) => (r.ok ? r.json() : Promise.resolve({ models: [] })))
      .then((d) => {
        const list = Array.isArray(d.models) ? d.models : [];
        setModels(list);
        const saved = typeof window !== 'undefined' ? localStorage.getItem('ollama:model') : '';
        setModel(saved && list.includes(saved) ? saved : (list[0] ?? ''));
      })
      .catch(() => {});
    // Ontology/CDM alignment metrics & artifacts
    fetch('/api/ontology/metrics').then(async (r) => {
      if (!r.ok) return;
      const m = await r.json();
      setAlignment(m);
    }).catch(() => {});
    fetch('/api/ontology/artifacts').then(async (r) => {
      if (!r.ok) return;
      const items = await r.json();
      setOntologyArtifacts(items);
    }).catch(() => {});
  }, []);

  // Build mapping snippets for quick inline context in lineage table
  useEffect(() => {
    const want = ['cdm_link16.json', 'cdm_vmf.json'] as const;
    const present = new Set(ontologyArtifacts.map((a) => a.name));
    (async () => {
      const next: Record<string, { rows: Array<{ source: string; target: string }>; stats: { mappings: number; covered: number; conflicts: number } }> = {};
      for (const name of want) {
        if (!present.has(name)) continue;
        try {
          const res = await fetch(`/api/ontology/artifacts/${name}`, { cache: 'no-store' });
          const text = await res.text();
          const json = JSON.parse(text);
          const rows: Array<{ source: string; target: string }> = [];
          const list = Array.isArray(json?.mappings) ? json.mappings : [];
          for (const m of list.slice(0, 3)) {
            rows.push({
              source: `${m?.from?.entity ?? ''}.${m?.from?.field ?? ''}`,
              target: `${m?.to?.entity ?? ''}.${m?.to?.field ?? ''}`,
            });
          }
          const stats = {
            mappings: list.length || 0,
            covered: Array.isArray(json?.coverage?.cdmEntitiesCovered) ? json.coverage.cdmEntitiesCovered.length : 0,
            conflicts: Array.isArray(json?.coverage?.conflicts) ? json.coverage.conflicts.length : 0,
          };
          if (rows.length > 0 || stats.mappings > 0) next[name] = { rows, stats };
        } catch {
          // ignore
        }
      }
      setMappingSummaries(next);
    })();
  }, [ontologyArtifacts]);

  const start = async () => {
    const res = await fetch('/api/workflows/cop-demo/start', { method: 'POST' });
    const data = await res.json();
    setWfId(data.id);
    setWf({ status: data.status, logs: [] });
    notify('Workflow started', 'success', 2500);
  };
  const stop = async () => {
    if (!wfId) return;
    await fetch(`/api/workflows/${wfId}/stop`, { method: 'POST' });
    notify('Workflow stopped', 'info', 2000);
  };
  const injectFailure = async () => {
    if (!wfId) return;
    await fetch(`/api/workflows/${wfId}/fail`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Injected failure for demo' }) });
    notify('Failure injected', 'warning', 2000);
  };
  const retry = async () => {
    if (!wfId) return;
    await fetch(`/api/workflows/${wfId}/retry`, { method: 'POST' });
    notify('Retry started', 'info', 2000);
  };

  const openOntologyArtifact = async (name: string) => {
    try {
      const res = await fetch(`/api/ontology/artifacts/${name}`, { cache: 'no-store' });
      if (!res.ok) return;
      const content = await res.text();
      const meta = ontologyArtifacts.find((a) => a.name === name);
      const fallbackMime = name.endsWith('.json') ? 'application/json' : (name.endsWith('.md') ? 'text/markdown; charset=utf-8' : 'text/plain; charset=utf-8');
      setPreview({ id: name, name, type: (meta?.type ?? 'ontology') as any, mime: meta?.mime ?? fallbackMime, content });
    } catch {
      // ignore
    }
  };

  const previewStandardSchema = async (standard: 'link16' | 'vmf') => {
    try {
      const res = await fetch(`/api/standards/schemas?standard=${standard}`, { cache: 'no-store' });
      if (!res.ok) return;
      const content = await res.text();
      setPreview({ id: `schema:${standard}`, name: `${standard.toUpperCase()} schema (stub)`, type: 'schema', mime: 'application/json', content });
    } catch {
      // ignore
    }
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

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="p-4 rounded border space-y-2" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Alignment</div>
            {alignment ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold">{alignment.coveragePct}%</div>
                  <div className="text-xs opacity-80">CDM coverage</div>
                </div>
                <div className="text-xs opacity-80">{alignment.cdmEntitiesCovered}/{alignment.cdmEntitiesTotal} entities</div>
                <div className="text-xs opacity-80">Conflicts: {alignment.conflicts.length}</div>
                {alignment.conflicts.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                    {alignment.conflicts.slice(0, 4).map((c: any, i: number) => (
                      <li key={i} className="flex items-start justify-between gap-3">
                        <span>
                          [{c.severity ?? 'INFO'}] {c.detail}
                          {c.source && <span className="opacity-70"> — {c.source}</span>}
                        </span>
                        {c.source && (
                          <button
                            className="underline"
                            onClick={async () => {
                              const res = await fetch(`/api/ontology/artifacts/${c.source}`, { cache: 'no-store' });
                              const content = await res.text();
                              setPreview({ id: c.source, name: c.source, type: 'mapping', mime: 'application/json', content });
                            }}
                          >
                            Preview
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="text-xs opacity-80">Loading…</div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="list-ordered" size="sm" /> Logs</h2>
              <div className="flex items-center gap-2">
                <button className="btn-primary" style={{ backgroundColor: 'var(--theme-accent-primary)' }} onClick={start}><Icon name="debug-start" size="sm" /> Start</button>
                <button className="btn-primary" style={{ backgroundColor: 'var(--theme-accent-error)' }} onClick={stop}><Icon name="debug-stop" size="sm" /> Stop</button>
                <button className="btn" onClick={injectFailure}><Icon name="alert" size="sm" /> Inject Failure</button>
                {wf?.status === 'FAILED' && (
                  <button className="btn" onClick={retry}><Icon name="refresh" size="sm" /> Retry</button>
                )}
                <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                  <span>Model</span>
                  <select
                    value={model}
                    onChange={(e) => { setModel(e.target.value); try { localStorage.setItem('ollama:model', e.target.value); } catch {} }}
                    className="input"
                    style={{ backgroundColor: 'var(--theme-input-bg)', border: 'none', color: 'var(--theme-text-primary)' }}
                  >
                    {models.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
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
          <div className="md:col-span-2 p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="timeline" size="sm" /> Milestones</h2>
            {(() => {
              const phases = ['INGEST', 'CODEGEN', 'MAPPING', 'VIZ', 'DONE'];
              const tooltip: Record<string, string> = {
                INGEST: 'Standards Analyst ingests Link-16/VMF docs and extracts schemas/rules',
                CODEGEN: 'Pipeline Engineer generates parsing/validation code and configs',
                MAPPING: 'Data Modeler aligns schemas and resolves interoperability conflicts',
                VIZ: 'UI/UX Prototyper assembles COP views, symbology, and overlays',
                DONE: 'Workflow completes with artifacts and compliance report'
              };
              const current = wf?.step ?? 0; // 0..5
              return (
                <ol className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {phases.map((ph, idx) => {
                    const stepNum = idx + 1;
                    const isDone = (wf?.status === 'COMPLETED') || current > idx + 0;
                    const isActive = current === stepNum;
                    const color = isDone ? 'var(--theme-accent-success)' : isActive ? 'var(--theme-accent-primary)' : 'var(--theme-text-muted)';
                    const icon = isDone ? 'check' : isActive ? 'loading' : 'circle-large-outline';
                    return (
                      <li key={ph} className="p-3 rounded border" style={{ borderColor: 'var(--theme-border)' }} title={tooltip[ph]}>
                        <div className="flex items-center gap-2">
                          <i className={`codicon codicon-${icon}`} style={{ color }} />
                          <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{ph}</span>
                          <i className="codicon codicon-info" style={{ color: 'var(--theme-text-muted)' }} />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              );
            })()}
            <div className="text-xs opacity-80 flex items-center gap-2">
              <span>Environment:</span>
              <span>Ollama</span>
              {ollamaOk === null ? <Icon name="loading" className="animate-spin" /> : ollamaOk ? <span className="text-green-500">healthy</span> : <span className="text-red-500">down</span>}
            </div>
          </div>
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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="file" size="sm" /> Workflow Artifacts</h2>
            <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Generated during the workflow. Click to download.</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderColor: 'var(--theme-border)' }}>
                <thead style={{ color: 'var(--theme-text-secondary)' }}>
                  <tr className="text-left">
                    <th className="py-2">Name</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Size</th>
                    <th className="py-2">Created</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(wf?.artifacts ?? []).length === 0 ? (
                    <tr><td className="py-2" colSpan={5}>No artifacts yet.</td></tr>
                  ) : (
                    (wf?.artifacts ?? []).slice().reverse().map((a: any) => (
                      <tr key={a.id} className="border-t" style={{ borderColor: 'var(--theme-border)' }}>
                        <td className="py-2">{a.name}</td>
                        <td className="py-2 uppercase">{a.type}</td>
                        <td className="py-2">{Math.round(a.size / 1024)} KB</td>
                        <td className="py-2">{new Date(a.createdAt).toLocaleTimeString()}</td>
                        <td className="py-2 flex items-center gap-3">
                          <a className="underline" href={`/api/workflows/${wfId ?? ''}/artifacts/${a.id}`}>Download</a>
                          <button
                            className="underline"
                            onClick={async () => {
                              if (!wfId) return;
                              const res = await fetch(`/api/workflows/${wfId}/artifacts/${a.id}`, { cache: 'no-store' });
                              const content = await res.text();
                              setPreview({ id: a.id, name: a.name, type: a.type, mime: a.mime, content });
                            }}
                          >
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="file-code" size="sm" /> Ontology/CDM Artifacts</h2>
            <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Static, deterministic artifacts (preview/download).</div>
            <ul className="text-sm divide-y" style={{ borderColor: 'var(--theme-border)' }}>
              {ontologyArtifacts.length === 0 ? (
                <li className="py-2">None</li>
              ) : (
                ontologyArtifacts.map((a) => (
                  <li key={a.name} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs">{a.name}</div>
                      <div className="text-xs opacity-70 uppercase">{a.type}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <a className="underline" href={`/api/ontology/artifacts/${a.name}`}>Download</a>
                      <button
                        className="underline"
                        onClick={async () => {
                          const res = await fetch(`/api/ontology/artifacts/${a.name}`, { cache: 'no-store' });
                          const content = await res.text();
                          setPreview({ id: a.name, name: a.name, type: a.type, mime: a.mime, content });
                        }}
                      >
                        Preview
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        <section className="p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
          <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="git-merge" size="sm" /> Data Lineage</h2>
          <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Source → Schema/Ontology → CDM Mapping → Viz</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderColor: 'var(--theme-border)' }}>
              <thead style={{ color: 'var(--theme-text-secondary)' }}>
                <tr className="text-left">
                  <th className="py-2">Standard</th>
                  <th className="py-2">Source</th>
                  <th className="py-2">Schema/Ontology</th>
                  <th className="py-2">CDM Mapping</th>
                  <th className="py-2">Viz</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'Link-16', std: 'link16' as const, schemaName: 'link16_ontology.json', mapName: 'cdm_link16.json' },
                  { key: 'VMF', std: 'vmf' as const, schemaName: 'vmf_ontology.json', mapName: 'cdm_vmf.json' },
                ].map((row) => (
                  <tr key={row.key} className="border-t" style={{ borderColor: 'var(--theme-border)' }}>
                    <td className="py-2 font-medium">{row.key}</td>
                    <td className="py-2">
                      <button className="underline" onClick={() => previewStandardSchema(row.std)}>Preview source schema</button>
                    </td>
                    <td className="py-2">
                      {(() => {
                        const meta = ontologyArtifacts.find((a) => a.name === row.schemaName);
                        return meta ? (
                          <button className="underline" onClick={() => openOntologyArtifact(row.schemaName)}>{row.schemaName}</button>
                        ) : (
                          <span className="opacity-70">{row.schemaName} (missing)</span>
                        );
                      })()}
                    </td>
                    <td className="py-2">
                      {(() => {
                        const meta = ontologyArtifacts.find((a) => a.name === row.mapName);
                        const summary = mappingSummaries[row.mapName];
                        return (
                          <div className="space-y-1">
                            {meta ? (
                              <button className="underline" onClick={() => openOntologyArtifact(row.mapName)}>{row.mapName}</button>
                            ) : (
                              <span className="opacity-70">{row.mapName} (missing)</span>
                            )}
                            {summary?.stats && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--theme-border)' }}>Mappings {summary.stats.mappings}</span>
                                <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--theme-accent-success)', color: 'var(--theme-accent-success)' }}>Covered {summary.stats.covered}</span>
                                <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--theme-accent-error)', color: 'var(--theme-accent-error)' }}>Conflicts {summary.stats.conflicts}</span>
                              </div>
                            )}
                            {summary?.rows && summary.rows.length > 0 && (
                              <ul className="text-xs opacity-80 space-y-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                                {summary.rows.map((m, i) => (
                                  <li key={i} className="font-mono">{m.source} → {m.target}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-2">
                      <div className="space-y-0.5">
                        <a className="underline" href={`/cop-demo?schema=${row.std}`}>Open Viz ({row.key})</a>
                        <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                          <a className="underline" href={`/cop-demo?schema=${row.std}&viz=tracks`}>tracks</a>
                          <span> · </span>
                          <a className="underline" href={`/cop-demo?schema=${row.std}&viz=units`}>units</a>
                          <span> · </span>
                          <a className="underline" href={`/cop-demo?schema=${row.std}&viz=messages`}>messages</a>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs opacity-80" style={{ color: 'var(--theme-text-secondary)' }}>
            CDM: {ontologyIndex.cdm ? (
              <button className="underline" onClick={() => openOntologyArtifact(ontologyIndex.cdm!.name)}>{ontologyIndex.cdm!.name}</button>
            ) : (
              <span className="opacity-70">cdm.json (missing)</span>
            )}
          </div>
        </section>

        {preview && (
          <div className="fixed inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setPreview(null)}>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-3xl max-h-[80vh] overflow-hidden rounded border" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{preview.name} <span className="opacity-70">({preview.type})</span></div>
                <button className="btn-primary" style={{ backgroundColor: 'var(--theme-accent-primary)' }} onClick={() => setPreview(null)}>
                  <Icon name="close" size="sm" />
                </button>
              </div>
              <div className="p-3 overflow-auto" style={{ backgroundColor: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)' }}>
                {preview.mime.includes('application/json') ? (
                  <pre className="text-xs" style={{ whiteSpace: 'pre-wrap' }}>{safePrettyJson(preview.content)}</pre>
                ) : preview.mime.includes('text/markdown') ? (
                  <pre className="text-xs" style={{ whiteSpace: 'pre-wrap' }}>{preview.content}</pre>
                ) : (
                  <pre className="text-xs" style={{ whiteSpace: 'pre-wrap' }}>{preview.content}</pre>
                )}
              </div>
            </div>
          </div>
        )}
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

function safePrettyJson(text: string): string {
  try {
    const obj = JSON.parse(text);
    return JSON.stringify(obj, null, 2);
  } catch {
    return text;
  }
}



