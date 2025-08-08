"use client";
import { useEffect, useState } from 'react';
import { Icon } from '../../components/Icon';

export default function CopDemoPage() {
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [model, setModel] = useState('llama3');
  const [prompt, setPrompt] = useState('Summarize the COP demo MVP in 3 bullets.');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [wfId, setWfId] = useState<string | null>(null);
  const [wfStatus, setWfStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health/ollama').then(async (r) => setOllamaOk(r.ok)).catch(() => setOllamaOk(false));
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnswer(data.text ?? '');
    } catch (e: any) {
      setAnswer(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2"><Icon name="beaker" size="sm" /> COP Demo</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Ollama</span>
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
          <label className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Model</label>
          <input value={model} onChange={(e) => setModel(e.target.value)} className="input" style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-input-border)', color: 'var(--theme-text-primary)' }} />

          <label className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Prompt</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="input" rows={4} style={{ backgroundColor: 'var(--theme-input-bg)', borderColor: 'var(--theme-input-border)', color: 'var(--theme-text-primary)' }} />

          <button onClick={handleAsk} disabled={loading} className="btn-primary inline-flex items-center gap-2" style={{ backgroundColor: 'var(--theme-accent-primary)' }}>
            <Icon name="play" size="sm" /> {loading ? 'Asking…' : 'Ask'}
          </button>
        </div>

        <div className="p-4 rounded border whitespace-pre-wrap" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>{answer}</div>

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
                const interval = setInterval(async () => {
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


