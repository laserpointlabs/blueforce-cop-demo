import { NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json({ error: `Ollama error: ${res.status} ${text}` }, { status: 502 });
    }
    const data = await res.json();
    const names: string[] = Array.isArray(data?.models)
      ? data.models.map((m: any) => m?.name).filter((n: any) => typeof n === 'string')
      : [];
    return NextResponse.json({ models: names });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


