import { NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ models: [] }, { status: 200 });
    }
    const data = await res.json().catch(() => ({ models: [] }));
    // Ollama returns { models: [{ name, model, size, ... }, ...] }
    const models: string[] = Array.isArray(data.models)
      ? data.models.map((m: any) => m.name || m.model).filter(Boolean)
      : [];
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [] }, { status: 200 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json({ error: `Ollama error: ${res.status} ${text}` }, { status: 502 });
    }
    const data = await res.json().catch(() => ({ models: [] }));
    const models: string[] = Array.isArray(data?.models)
      ? data.models.map((m: any) => m?.model || m?.name).filter((x: any) => typeof x === 'string')
      : [];
    return NextResponse.json({ models });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, models: [] }, { status: 500 });
  }
}


