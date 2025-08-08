"use client";
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icon } from '../../components/Icon';

export default function CopDemoPage() {
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [model, setModel] = useState('llama3');
  const [models, setModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('Summarize the COP demo MVP in 3 bullets.');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [wfId, setWfId] = useState<string | null>(null);
  const [wfStatus, setWfStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health/ollama')
      .then(async (r) => setOllamaOk(r.ok))
      .catch(() => setOllamaOk(false));
    fetch('/api/ollama/models')
      .then(async (r) => (r.ok ? r.json() : Promise.resolve({ models: [] })))
      .then((d) => setModels(Array.isArray(d.models) ? d.models : []))
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2"><Icon name="beaker" size="sm" /> COP Demo</h1>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <a href="/" className="underline">Home</a>
            <span>Ollama</span>
            {ollamaOk === null ? (
              <Icon name="loading" className="animate-spin" />
            ) : ollamaOk ? (
              <span className="text-green-500 flex items-center gap-1"><Icon name="check" /> healthy</span>
            ) : (
              <span className="text-red-500 flex items-center gap-1"><Icon name="error" /> down</span>
            )}
          </div>
        </div>

        <div className="space-y-3 p-4 rounded border" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="input"
                style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-input-border)', color: 'var(--theme-text-primary)' }}
              >
                {[model, ...models.filter(m => m !== model)].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="input"
                rows={3}
                placeholder="Ask something..."
                style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-input-border)', color: 'var(--theme-text-primary)' }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAsk} disabled={loading} className="btn-primary inline-flex items-center gap-2" style={{ backgroundColor: 'var(--theme-accent-primary)' }}>
              <Icon name="play" size="sm" /> {loading ? 'Asking…' : 'Ask'}
            </button>
            {loading ? <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Streaming…</span> : null}
          </div>
        </div>

        <div className="p-4 rounded border" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            code({ inline, className, children, ...props }) {
              const content = String(children);
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
              {wfStatus.logs.map((l: string, i: number) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </main>
  );
}


