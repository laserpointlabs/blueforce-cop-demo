import { NextRequest, NextResponse } from 'next/server';
import { readOntologyArtifact } from '@/lib/ontology';

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  const result = await readOntologyArtifact(params.name);
  if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const { content, meta } = result;
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': meta.mime,
      'Content-Disposition': `attachment; filename=${meta.name}`,
    },
  });
}


