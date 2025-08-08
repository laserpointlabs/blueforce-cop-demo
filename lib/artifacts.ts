import fs from 'fs/promises';
import path from 'path';

export interface DiskArtifactMeta {
  name: string;
  size: number;
  modifiedAt: number;
}

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');

async function ensureDir(): Promise<void> {
  await fs.mkdir(ARTIFACTS_DIR, { recursive: true });
}

export async function persistIfEnabled(name: string, content: string): Promise<void> {
  if (process.env.ARTIFACTS_PERSIST !== '1') return;
  await ensureDir();
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = path.join(ARTIFACTS_DIR, safeName);
  await fs.writeFile(filePath, content, 'utf8');
}

export async function listDiskArtifacts(): Promise<DiskArtifactMeta[]> {
  try {
    const entries = await fs.readdir(ARTIFACTS_DIR, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile());
    const metas: DiskArtifactMeta[] = [];
    for (const f of files) {
      const p = path.join(ARTIFACTS_DIR, f.name);
      const stat = await fs.stat(p);
      metas.push({ name: f.name, size: stat.size, modifiedAt: stat.mtimeMs });
    }
    metas.sort((a, b) => a.name.localeCompare(b.name));
    return metas;
  } catch {
    return [];
  }
}


