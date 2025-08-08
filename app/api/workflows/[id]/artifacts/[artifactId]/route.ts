import { NextRequest, NextResponse } from 'next/server';
import { getWorkflow } from '@/lib/workflows/manager';

export async function GET(_req: NextRequest, { params }: { params: { id: string; artifactId: string } }) {
  const wf = getWorkflow(params.id);
  if (!wf) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const art = wf.artifacts.find(a => a.id === params.artifactId);
  if (!art) return NextResponse.json({ error: 'artifact not found' }, { status: 404 });
  return new NextResponse(art.content, {
    status: 200,
    headers: {
      'Content-Type': art.mime,
      'Content-Disposition': `attachment; filename=${art.name}`
    }
  });
}


