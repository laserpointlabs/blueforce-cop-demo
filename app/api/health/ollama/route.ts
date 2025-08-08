import { NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function GET() {
  try {
    const res = await fetch(OLLAMA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 503 });
  }
}



