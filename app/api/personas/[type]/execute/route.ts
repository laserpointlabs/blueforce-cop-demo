import { NextRequest, NextResponse } from 'next/server';
import { buildPersonaPrompt } from '@/lib/personas/prompts';
import type { PersonaType } from '@/lib/workflows/manager';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function POST(req: NextRequest, { params }: { params: { type: PersonaType } }) {
  const personaType = params.type;
  const { model = 'llama3', task = '', context = {} } = await req.json().catch(() => ({}));

  if (!personaType) {
    return NextResponse.json({ error: 'persona type required' }, { status: 400 });
  }

  const prompt = buildPersonaPrompt(personaType, String(task ?? ''), context);

  try {
    const upstream = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: true })
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '');
      return NextResponse.json({ error: `Ollama error: ${upstream.status} ${text}` }, { status: 502 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = upstream.body!.getReader();
        let buffer = '';
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const json = JSON.parse(trimmed);
                if (json.error) controller.enqueue(encoder.encode(`\n[error] ${json.error}\n`));
                if (json.response) controller.enqueue(encoder.encode(json.response));
              } catch {
                // ignore
              }
            }
          }
          if (buffer.length) {
            try {
              const json = JSON.parse(buffer);
              if (json.response) controller.enqueue(encoder.encode(json.response));
            } catch {}
          }
        } catch (err) {
          controller.error(err);
          return;
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


