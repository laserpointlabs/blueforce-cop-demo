import { NextRequest, NextResponse } from 'next/server';
import { listDiskArtifacts } from '@/lib/artifacts';

export async function GET(_req: NextRequest) {
  const items = await listDiskArtifacts();
  return NextResponse.json({ artifacts: items });
}


