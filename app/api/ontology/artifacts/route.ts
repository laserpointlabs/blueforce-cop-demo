import { NextRequest, NextResponse } from 'next/server';
import { listOntologyArtifacts } from '@/lib/ontology';

export async function GET(_req: NextRequest) {
  const items = await listOntologyArtifacts();
  return NextResponse.json(items);
}


