"use client";
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icon } from '../../components/Icon';

export default function CopDemoPage() {
  const { notify } = useToast();
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [model, setModel] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('Summarize the COP demo MVP in 3 bullets.');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [wfId, setWfId] = useState<string | null>(null);
  const [wfStatus, setWfStatus] = useState<any>(null);
  const [schemaPreview, setSchemaPreview] = useState<string>('');
  const [schemaKind, setSchemaKind] = useState<'link16' | 'vmf' | 'cdm' | ''>('');
  const [vizLayer, setVizLayer] = useState<string>('');
  // honor query param schema=link16|vmf|cdm for deep linking from PM Dashboard
  useEffect(() => {
    try {
      const url = new URL(typeof window !== 'undefined' ? window.location.href : '');
      const q = (url.searchParams.get('schema') || '').toLowerCase();
      const v = (url.searchParams.get('viz') || '').toLowerCase();
      if (q === 'link16' || q === 'vmf' || q === 'cdm') {
        // trigger the same fetch used by buttons
        fetchSchema(q as 'link16' | 'vmf' | 'cdm').catch(() => {});
      }
      if (v) setVizLayer(v);
    } catch {
      // ignore
    }
  }, []);
  const fetchSchema = async (kind: 'link16' | 'vmf' | 'cdm') => {
    try {
      setSchemaKind(kind);
      if (kind === 'cdm') {
        const res = await fetch('/api/ontology/artifacts/cdm.json', { cache: 'no-store' });
        const text = await res.text();
        setSchemaPreview(text);
        return;
      }
      const res = await fetch(`/api/standards/schemas?standard=${kind}`, { cache: 'no-store' });
      const text = await res.text();
      setSchemaPreview(text);
    } catch {
      setSchemaPreview('');
      setSchemaKind('');
    }
  };

  useEffect(() => {
    fetch('/api/health/ollama')
      .then(async (r) => setOllamaOk(r.ok))
      .catch(() => setOllamaOk(false));
    fetch('/api/ollama/models')
      .then(async (r) => (r.ok ? r.json() : Promise.resolve({ models: [] })))
      .then((d) => {
        const availableModels = Array.isArray(d.models) ? d.models : [];
        setModels(availableModels);
        if (!model && availableModels.length > 0) {
          setModel(availableModels[0]);
        }
      })
      .catch(() => setModels([]));
  }, []);

  const handleAsk = async () => {
    setLoading(true);
    setAnswer('');
    try {
      const res = await fetch('/api/ollama/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt })
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setAnswer(prev => prev + chunk);
      }
    } catch (e: any) {
      setAnswer(`Error: ${e.message}`);
      notify(`Chat error: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Icon name="beaker" size="sm" /> COP Demo</h1>
          <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <a href="/" className="underline">Home</a>
            <span>/</span>
            <a href="/pm-dashboard" className="underline">PM Dashboard</a>
          </nav>
        </header>

        <div className="space-y-3 p-4 rounded border" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 p-3 rounded border" style={{ borderColor: 'var(--theme-border)' }}>
              <label className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Model</label>
              <div className="rounded border" style={{ borderColor: 'var(--theme-border)' }}>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="input"
                  style={{ backgroundColor: 'var(--theme-input-bg)', border: 'none', width: '100%', color: 'var(--theme-text-primary)' }}
                >
                  {models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1 p-3 rounded border" style={{ borderColor: 'var(--theme-border)' }}>
              <label className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="input"
                rows={4}
                placeholder="Ask something..."
                style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-input-border)', color: 'var(--theme-text-primary)' }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAsk} disabled={loading || !model} className="btn-primary inline-flex items-center gap-2" style={{ backgroundColor: 'var(--theme-accent-primary)' }}>
              <Icon name="play" size="sm" /> {loading ? 'Asking…' : 'Ask'}
            </button>
            {loading ? <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Streaming…</span> : null}
          </div>
          <div className="text-xs opacity-80 flex items-center gap-2" style={{ color: 'var(--theme-text-secondary)' }}>
            <span>Environment:</span>
            <span>Ollama</span>
            {ollamaOk === null ? <Icon name="loading" className="animate-spin" /> : ollamaOk ? <span className="text-green-500">healthy</span> : <span className="text-red-500">down</span>}
          </div>
        </div>

        {!schemaKind && (
          <div className="p-4 rounded border" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            code: (codeProps: any) => {
              const { inline, className, children, ...props } = codeProps as any;
              const content = String(children ?? '');
              if (inline) {
                return <code className={className} {...props}>{content}</code>;
              }
              return (
                <pre className={className} style={{ overflowX: 'auto' }} {...props}>
                  <code>{content}</code>
                </pre>
              );
            }
            }}>
              {answer || ''}
            </ReactMarkdown>
          </div>
        )}

        <div className="space-y-3 p-4 rounded border" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="file-code" size="sm" /> Standards & CDM Schemas</h2>
            <div className="flex items-center gap-2">
              <button
                className={`btn ${schemaKind==='link16' ? 'btn-primary' : ''} rounded`}
                style={{
                  backgroundColor: schemaKind==='link16' ? 'var(--theme-accent-primary)' : 'transparent',
                  border: schemaKind==='link16' ? '1px solid transparent' : '2px solid var(--theme-border)'
                }}
                onClick={() => fetchSchema('link16')}
              >
                Preview Link-16
              </button>
              <button
                className={`btn ${schemaKind==='vmf' ? 'btn-primary' : ''} rounded`}
                style={{
                  backgroundColor: schemaKind==='vmf' ? 'var(--theme-accent-primary)' : 'transparent',
                  border: schemaKind==='vmf' ? '1px solid transparent' : '2px solid var(--theme-border)'
                }}
                onClick={() => fetchSchema('vmf')}
              >
                Preview VMF
              </button>
              <button
                className={`btn ${schemaKind==='cdm' ? 'btn-primary' : ''} rounded`}
                style={{
                  backgroundColor: schemaKind==='cdm' ? 'var(--theme-accent-primary)' : 'transparent',
                  border: schemaKind==='cdm' ? '1px solid transparent' : '2px solid var(--theme-border)'
                }}
                onClick={() => fetchSchema('cdm')}
              >
                Preview CDM
              </button>
              {schemaKind && (
                <button className="btn" onClick={() => { setSchemaKind(''); setSchemaPreview(''); }}>Close Preview</button>
              )}
            </div>
          </div>
          {vizLayer && (
            <div className="text-xs opacity-80" style={{ color: 'var(--theme-text-secondary)' }}>
              Active viz layer: <span className="px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--theme-border)' }}>{vizLayer}</span>
            </div>
          )}
          <div className="text-xs opacity-80" style={{ color: 'var(--theme-text-secondary)' }}>
            Open raw JSON:
            {' '}
            <a className="underline" href="/api/standards/schemas?standard=link16" target="_blank" rel="noreferrer">Link-16</a>,{' '}
            <a className="underline" href="/api/standards/schemas?standard=vmf" target="_blank" rel="noreferrer">VMF</a>,{' '}
            <a className="underline" href="/api/ontology/artifacts/cdm.json" target="_blank" rel="noreferrer">CDM</a>
          </div>
          {schemaKind && (
            <div className="rounded border p-3 overflow-auto" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-primary)' }}>
              <div className="text-xs mb-2 opacity-80" style={{ color: 'var(--theme-text-secondary)' }}>
                Previewing: {schemaKind.toUpperCase()}
              </div>
              <pre className="text-xs" style={{ whiteSpace: 'pre-wrap' }}>{schemaPreview}</pre>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4 rounded border" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Icon name="server-process" size="sm" /> Orchestrator (Mock)</h2>
            {wfId ? <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>ID: {wfId}</span> : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn-primary inline-flex items-center gap-2"
              style={{ backgroundColor: 'var(--theme-accent-primary)' }}
              onClick={async () => {
                const res = await fetch('/api/workflows/cop-demo/start', { method: 'POST' });
                const data = await res.json();
                setWfId(data.id);
                setWfStatus({ status: data.status });
                notify('Workflow started', 'success', 2500);
                // poll
                const interval: ReturnType<typeof setInterval> = setInterval(async () => {
                  if (!data.id) return clearInterval(interval);
                  const s = await fetch(`/api/workflows/${data.id}/status`).then(r => r.json());
                  setWfStatus(s);
                  if (s.status === 'COMPLETED' || s.status === 'FAILED') clearInterval(interval);
                }, 1500);
              }}
            >
              <Icon name="debug-start" size="sm" /> Start Demo
            </button>
            {wfStatus ? <span className="text-sm">Status: {wfStatus.status}</span> : null}
          </div>
          {wfStatus?.logs ? (
            <ul className="list-disc pl-5 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
              {wfStatus.logs.map((l: any, i: number) => {
                const text = typeof l === 'string' ? l : (l?.message ?? JSON.stringify(l));
                const when = typeof l === 'object' && l?.ts ? new Date(l.ts).toLocaleTimeString() : null;
                return (
                  <li key={i}>{when ? `[${when}] ${text}` : text}</li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </main>
  );
}


