import { Icon } from '../components/Icon';

export default function Home() {
  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: 'var(--theme-bg-primary)', color: 'var(--theme-text-primary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Icon name="rocket" size="sm" />
          Blue Force COP Demo
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/cop-demo" className="p-4 rounded border" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center gap-2 text-lg font-medium"><Icon name="server" size="sm" /> COP Demo</div>
            <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Enter the COP demonstration workspace</p>
          </a>
          <a href="/pm-dashboard" className="p-4 rounded border" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center gap-2 text-lg font-medium"><Icon name="dashboard" size="sm" /> PM Dashboard</div>
            <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Monitor KPIs, personas, and logs</p>
          </a>
          <a href="/ontology" className="p-4 rounded border" style={{ backgroundColor: 'var(--theme-bg-secondary)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center gap-2 text-lg font-medium"><Icon name="symbol-enum" size="sm" /> Ontology Workspace</div>
            <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Extract, align, and preview ontology/CDM artifacts</p>
          </a>
        </div>
      </div>
    </main>
  );
}


