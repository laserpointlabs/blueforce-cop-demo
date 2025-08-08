import { NextResponse } from 'next/server';
import { createCopDemoWorkflow } from '@/lib/workflows/manager';

export async function POST() {
  const wf = createCopDemoWorkflow();
  return NextResponse.json({ id: wf.id, status: wf.status });
}


