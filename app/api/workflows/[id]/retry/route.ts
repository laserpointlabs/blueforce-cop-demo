import { NextResponse } from 'next/server';
import { retryWorkflow } from '@/lib/workflows/manager';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const wf = retryWorkflow(params.id);
  if (!wf) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ id: wf.id, status: wf.status });
}


