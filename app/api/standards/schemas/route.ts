import { NextRequest, NextResponse } from 'next/server';
import { extractSchemaFromFixtures, listAvailableStandards } from '@/lib/standards';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const standard = (searchParams.get('standard') || '').toLowerCase() as 'link16' | 'vmf' | '';
  if (!standard) {
    const available = await listAvailableStandards();
    return NextResponse.json({ available });
  }
  if (!['link16','vmf'].includes(standard)) {
    return NextResponse.json({ error: 'unsupported standard' }, { status: 400 });
  }
  const schema = await extractSchemaFromFixtures(standard);
  return NextResponse.json(schema);
}


