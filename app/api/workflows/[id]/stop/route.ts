import { NextRequest, NextResponse } from 'next/server';
import { stopWorkflow } from '@/lib/workflows/manager';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const wf = stopWorkflow(params.id);
  if (!wf) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ id: wf.id, status: wf.status });
}



