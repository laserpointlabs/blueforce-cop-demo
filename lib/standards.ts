import fs from 'fs/promises';
import path from 'path';

export type StandardKind = 'link16' | 'vmf';

export interface ExtractedSchema {
  standard: string;
  version: string;
  entities: Array<{
    name: string;
    fields: Array<{ name: string; type: string; required?: boolean }>;
  }>;
  rules: Array<Record<string, unknown>>;
}

const FIXTURES_DIR = path.join(process.cwd(), 'fixtures', 'standards');

export async function listAvailableStandards(): Promise<StandardKind[]> {
  return ['link16', 'vmf'];
}

export async function readSchemaFixture(kind: StandardKind): Promise<ExtractedSchema> {
  const file = kind === 'link16' ? 'link16_schema.json' : 'vmf_schema.json';
  const p = path.join(FIXTURES_DIR, file);
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw);
}

export async function extractSchemaFromFixtures(kind: StandardKind): Promise<ExtractedSchema> {
  // Deterministic stub: simply returns curated fixtures for now
  return readSchemaFixture(kind);
}


