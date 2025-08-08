import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow } from '@/lib/workflows/manager';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const wf = getWorkflow(params.id);
  if (!wf) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const { artifacts } = wf;
  return NextResponse.json(artifacts.map(({ content, ...rest }) => rest));
}


