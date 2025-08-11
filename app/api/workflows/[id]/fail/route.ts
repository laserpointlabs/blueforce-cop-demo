import { NextRequest, NextResponse } from 'next/server';
import { failWorkflow } from '@/lib/workflows/manager';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const reason = typeof body?.reason === 'string' ? body.reason : undefined;
  const wf = failWorkflow(params.id, reason);
  if (!wf) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ id: wf.id, status: wf.status });
}


