import { NextRequest, NextResponse } from 'next/server';
import { computeOntologyMetrics } from '@/lib/ontology';

export async function GET(_req: NextRequest) {
  const metrics = await computeOntologyMetrics();
  return NextResponse.json(metrics);
}


