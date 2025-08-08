import fs from 'fs/promises';
import path from 'path';

export interface OntologyArtifactMeta {
  name: string;
  type: 'ontology' | 'cdm' | 'mapping' | 'report';
  mime: string;
  size: number;
  createdAt: number;
}

export interface OntologyMetrics {
  cdmEntitiesTotal: number;
  cdmEntitiesCovered: number;
  coveragePct: number;
  conflicts: Array<{ type: string; detail: string; severity: string; status?: string; source?: string }>; 
}

const ONTOLOGY_DIR = path.join(process.cwd(), 'ontology');

function mimeForFile(name: string): string {
  if (name.endsWith('.json')) return 'application/json';
  if (name.endsWith('.md')) return 'text/markdown; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

function classifyFile(name: string): OntologyArtifactMeta['type'] {
  if (name === 'cdm.json') return 'cdm';
  if (name.startsWith('cdm_')) return 'mapping';
  if (name.endsWith('_ontology.json') || name === 'base_defense_core.json') return 'ontology';
  if (name.endsWith('.md')) return 'report';
  return 'ontology';
}

export async function listOntologyArtifacts(): Promise<OntologyArtifactMeta[]> {
  const entries = await fs.readdir(ONTOLOGY_DIR, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile());
  const metas: OntologyArtifactMeta[] = [];
  for (const f of files) {
    const p = path.join(ONTOLOGY_DIR, f.name);
    const stat = await fs.stat(p);
    metas.push({
      name: f.name,
      type: classifyFile(f.name),
      mime: mimeForFile(f.name),
      size: stat.size,
      createdAt: stat.mtimeMs,
    });
  }
  // sort stable by name
  metas.sort((a, b) => a.name.localeCompare(b.name));
  return metas;
}

export async function readOntologyArtifact(name: string): Promise<{ content: string; meta: OntologyArtifactMeta } | null> {
  const p = path.join(ONTOLOGY_DIR, name);
  try {
    const buf = await fs.readFile(p);
    const stat = await fs.stat(p);
    const meta: OntologyArtifactMeta = {
      name,
      type: classifyFile(name),
      mime: mimeForFile(name),
      size: stat.size,
      createdAt: stat.mtimeMs,
    };
    return { content: buf.toString('utf8'), meta };
  } catch {
    return null;
  }
}

export async function computeOntologyMetrics(): Promise<OntologyMetrics> {
  const cdmPath = path.join(ONTOLOGY_DIR, 'cdm.json');
  const mLinkPath = path.join(ONTOLOGY_DIR, 'cdm_link16.json');
  const mVmfPath = path.join(ONTOLOGY_DIR, 'cdm_vmf.json');
  const [cdmRaw, mLinkRaw, mVmfRaw] = await Promise.all([
    fs.readFile(cdmPath, 'utf8'),
    fs.readFile(mLinkPath, 'utf8'),
    fs.readFile(mVmfPath, 'utf8'),
  ]);
  const cdm = JSON.parse(cdmRaw);
  const mLink = JSON.parse(mLinkRaw);
  const mVmf = JSON.parse(mVmfRaw);
  const cdmEntities: string[] = (cdm.entities ?? []).map((e: any) => e.name);
  const coveredSet = new Set<string>();
  const linkCovered: string[] = mLink.coverage?.cdmEntitiesCovered ?? [];
  const vmfCovered: string[] = mVmf.coverage?.cdmEntitiesCovered ?? [];
  [...linkCovered, ...vmfCovered].forEach((e) => coveredSet.add(e));
  // Clamp to known CDM entities only
  const covered = Array.from(coveredSet).filter((e) => cdmEntities.includes(e));
  const cdmEntitiesTotal = cdmEntities.length;
  const cdmEntitiesCovered = covered.length;
  const coveragePct = cdmEntitiesTotal === 0 ? 0 : Math.round((cdmEntitiesCovered / cdmEntitiesTotal) * 100);
  const tag = (arr: any[] | undefined, source: string) => (arr ?? []).map((c: any) => ({ ...c, source }));
  const conflicts = [
    ...tag(mLink.coverage?.conflicts, 'cdm_link16.json'),
    ...tag(mVmf.coverage?.conflicts, 'cdm_vmf.json')
  ];
  return { cdmEntitiesTotal, cdmEntitiesCovered, coveragePct, conflicts };
}


