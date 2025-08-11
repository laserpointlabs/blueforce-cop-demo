"use client";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../../components/Icon";

type OntMeta = { name: string; type: string; mime: string; size: number; createdAt: number };

export default function OntologyPage() {
  const [artifacts, setArtifacts] = useState<OntMeta[]>([]);
  const [preview, setPreview] = useState<null | { name: string; type: string; mime: string; content: string }>(null);
  const [metrics, setMetrics] = useState<null | { coveragePct: number; cdmEntitiesCovered: number; cdmEntitiesTotal: number; conflicts: any[] }>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<{ ts: number; message: string; agent?: string }[]>([]);
  const [model, setModel] = useState('');
  const [models, setModels] = useState<string[]>([]);

  const index = useMemo(() => {
    const map = new Map(artifacts.map((a) => [a.name, a] as const));
    return {
      base: map.get("base_defense_core.json"),
      link16: map.get("link16_ontology.json"),
      vmf: map.get("vmf_ontology.json"),
      cdm: map.get("cdm.json"),
      mapLink: map.get("cdm_link16.json"),
      mapVmf: map.get("cdm_vmf.json"),
      report: map.get("alignment_report.md"),
    };
  }, [artifacts]);

  useEffect(() => {
    // Load ontology/CDM artifacts inventory
    fetch("/api/ontology/artifacts")
      .then(async (r) => setArtifacts(r.ok ? await r.json() : []))
      .catch(() => setArtifacts([]));
    // Load available models and restore selection
    fetch('/api/ollama/models')
      .then(async (r) => (r.ok ? r.json() : Promise.resolve({ models: [] })))
      .then((d) => {
        const list = Array.isArray(d.models) ? d.models : [];
        setModels(list);
        const saved = typeof window !== 'undefined' ? localStorage.getItem('ollama:model') : '';
        setModel(saved && list.includes(saved) ? saved : (list[0] ?? ''));
      })
      .catch(() => {});
  }, []);

  const runAgents = async () => {
    if (running) return;
    setRunning(true);
    setLogs([]);
    setMetrics(null);
    setStep(0);
    // Step 1: Standards Analyst extracts Link-16
    pushLog("Standards Analyst: extracting Link-16 ontology from spec", "STANDARDS_ANALYST");
    await runPersona('STANDARDS_ANALYST', 'Extract Link-16 schema/entities/rules from curated spec', { artifact: 'link16_ontology.json' });
    await delay(900);
    setStep(1);
    // Step 2: Standards Analyst extracts VMF
    pushLog("Standards Analyst: extracting VMF ontology from spec", "STANDARDS_ANALYST");
    await runPersona('STANDARDS_ANALYST', 'Extract VMF schema/entities/rules from curated spec', { artifact: 'vmf_ontology.json' });
    await delay(900);
    setStep(2);
    // Step 3: Data Modeler aligns to CDM
    pushLog("Data Modeler: aligning extracted ontologies to Defense Core / CDM", "DATA_MODELER");
    await runPersona('DATA_MODELER', 'Align Link-16/VMF to CDM and note conflicts', { artifacts: ['cdm_link16.json','cdm_vmf.json'] });
    const m = await fetch("/api/ontology/metrics").then((r) => (r.ok ? r.json() : null)).catch(() => null);
    if (m) setMetrics(m);
    await delay(600);
    setStep(3);
    pushLog("Alignment complete. Report available.", "DATA_MODELER");
    setRunning(false);
  };

  const pushLog = (message: string, agent?: string) => setLogs((l) => [...l, { ts: Date.now(), message, agent }]);
  const open = async (name: string) => {
    const res = await fetch(`/api/ontology/artifacts/${name}`, { cache: "no-store" });
    const content = await res.text();
    const meta = artifacts.find((a) => a.name === name);
    if (!meta) return;
    setPreview({ name, type: meta.type, mime: meta.mime, content });
  };

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Icon name="symbol-enum" size="sm" /> Ontology Workspace</h1>
          <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <a href="/" className="underline">Home</a>
            <span>/</span>
            <a href="/pm-dashboard" className="underline">PM Dashboard</a>
          </nav>
        </header>

        <section className="p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="run-all" size="sm" /> Simulated Multi-Agent Extraction & Alignment</h2>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                <span>Model</span>
                <select
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    try { localStorage.setItem('ollama:model', e.target.value); } catch {}
                  }}
                  className="input"
                  style={{ backgroundColor: 'var(--theme-input-bg)', border: 'none', color: 'var(--theme-text-primary)' }}
                >
                  {models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <button className="btn-primary" style={{ backgroundColor: 'var(--theme-accent-primary)' }} onClick={runAgents} disabled={running}>
                {running ? 'Running…' : 'Run Agents'}
              </button>
              <button className="btn" onClick={() => { setLogs([]); setMetrics(null); setStep(0); }}>
                Reset
              </button>
            </div>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { t: 'Base Ontology ready', done: true },
              { t: 'Link-16 extracted', done: step >= 1 },
              { t: 'VMF extracted', done: step >= 2 },
              { t: 'Aligned to CDM', done: step >= 3 },
            ].map((s, i) => (
              <li key={i} className="p-3 rounded border flex items-center gap-2" style={{ borderColor: 'var(--theme-border)' }}>
                <i className={`codicon ${s.done ? 'codicon-check' : 'codicon-circle-large-outline'}`} style={{ color: s.done ? 'var(--theme-accent-success)' : 'var(--theme-text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{s.t}</span>
              </li>
            ))}
          </ol>
          <div className="text-xs opacity-80">This is a deterministic simulation using curated fixtures. LLM-backed extraction can be enabled as a stretch goal.</div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Panel
            title="Defense Core (Base Ontology)"
            subtitle="foundation for alignment"
            action={index.base ? (<button className="underline" onClick={() => open(index.base!.name)}>Preview</button>) : null}
          >
            <ArtifactSummary item={index.base} />
          </Panel>
          <Panel
            title="Link-16 (Extracted)"
            subtitle={step >= 1 ? "extracted by Standards Analyst" : "pending extraction"}
            action={index.link16 ? (<button className="underline" onClick={() => open(index.link16!.name)} disabled={step < 1}>Preview</button>) : null}
          >
            <ArtifactSummary item={index.link16} disabled={step < 1} />
          </Panel>
          <Panel
            title="VMF (Extracted)"
            subtitle={step >= 2 ? "extracted by Standards Analyst" : "pending extraction"}
            action={index.vmf ? (<button className="underline" onClick={() => open(index.vmf!.name)} disabled={step < 2}>Preview</button>) : null}
          >
            <ArtifactSummary item={index.vmf} disabled={step < 2} />
          </Panel>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Panel
            title="CDM"
            subtitle="common data model"
            action={index.cdm ? (<button className="underline" onClick={() => open(index.cdm!.name)}>Preview</button>) : null}
          >
            <ArtifactSummary item={index.cdm} />
          </Panel>
          <Panel
            title="Mappings"
            subtitle="Link-16 and VMF to CDM"
            action={<div className="flex items-center gap-3">
              {index.mapLink && <button className="underline" onClick={() => open(index.mapLink!.name)}>Link-16</button>}
              {index.mapVmf && <button className="underline" onClick={() => open(index.mapVmf!.name)}>VMF</button>}
            </div>}
          >
            <ul className="text-sm space-y-1" style={{ color: 'var(--theme-text-secondary)' }}>
              <li>{index.mapLink ? index.mapLink.name : 'cdm_link16.json'} {index.mapLink ? '' : '(missing)'}</li>
              <li>{index.mapVmf ? index.mapVmf.name : 'cdm_vmf.json'} {index.mapVmf ? '' : '(missing)'}</li>
            </ul>
          </Panel>
          <Panel
            title="Alignment"
            subtitle="coverage & conflicts"
            action={metrics ? <span className="text-xs opacity-80">{metrics.cdmEntitiesCovered}/{metrics.cdmEntitiesTotal}</span> : null}
          >
            {metrics ? (
              <div className="space-y-2">
                <div className="text-lg font-semibold">{metrics.coveragePct}%</div>
                <div className="text-xs opacity-80">Conflicts: {metrics.conflicts.length}</div>
              </div>
            ) : (
              <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Run agents to compute metrics.</div>
            )}
          </Panel>
        </section>

        <section className="p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
          <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="list-ordered" size="sm" /> Activity Log</h2>
          <ul className="text-sm space-y-1" style={{ color: 'var(--theme-text-secondary)' }}>
            {logs.length === 0 ? (
              <li>Idle.</li>
            ) : (
              logs.map((l, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="opacity-60 text-xs" style={{ minWidth: 100 }}>{new Date(l.ts).toLocaleTimeString()}</span>
                  <span>{l.message}</span>
                  {l.agent && <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}>{l.agent}</span>}
                </li>
              ))
            )}
          </ul>
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

function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: any; children: any }) {
  return (
    <div className="p-4 rounded border space-y-3" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="symbol-structure" size="sm" /> {title}</h2>
        {action}
      </div>
      {subtitle && <div className="text-xs opacity-80" style={{ color: 'var(--theme-text-secondary)' }}>{subtitle}</div>}
      {children}
    </div>
  );
}

function ArtifactSummary({ item, disabled }: { item?: OntMeta; disabled?: boolean }) {
  if (!item) return <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Missing.</div>;
  return (
    <div className={`text-sm ${disabled ? 'opacity-50' : ''}`} style={{ color: 'var(--theme-text-secondary)' }}>
      <div className="font-mono text-xs">{item.name}</div>
      <div className="text-xs uppercase">{item.type}</div>
      <div className="text-xs">{Math.round(item.size / 1024)} KB</div>
    </div>
  );
}

function delay(ms: number) { return new Promise((res) => setTimeout(res, ms)); }
function safePrettyJson(text: string): string {
  try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return text; }
}

async function runPersona(type: 'STANDARDS_ANALYST' | 'DATA_MODELER', task: string, context: any) {
  try {
    const model = (typeof window !== 'undefined' ? localStorage.getItem('ollama:model') : '') || '';
    const res = await fetch(`/api/personas/${type}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, task, context })
    });
    // We ignore the streamed body here, as this page shows a deterministic simulation.
    // In a later PR, we can surface the streamed content live.
    if (!res.ok) {
      // no-op; simulation continues regardless
    }
  } catch {
    // ignore; simulation continues
  }
}


