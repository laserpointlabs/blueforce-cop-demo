import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_DETERMINISTIC_FALLBACK = process.env.OLLAMA_DETERMINISTIC_FALLBACK === '1';

function createDeterministicFallbackStream(prompt: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const lines = [
    `Deterministic fallback response (Ollama unavailable)`,
    ``,
    `- Prompt: ${prompt?.slice(0, 160)}`,
    `- Model: simulated`,
    ``,
    `Key points:`,
    `1. The demo environment can operate without Ollama using canned outputs.`,
    `2. All flows remain reproducible; enable Ollama later for live generation.`,
    `3. See TODO.md for the fallback item status.`,
  ];
  let i = 0;
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const interval = setInterval(() => {
        if (i >= lines.length) {
          clearInterval(interval);
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(lines[i++] + '\n'));
      }, 120);
    }
  });
}

export async function POST(req: NextRequest) {
  const { model = 'llama3', prompt } = await req.json();
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'prompt required' }, { status: 400 });
  }

  try {
    if (OLLAMA_DETERMINISTIC_FALLBACK) {
      const stream = createDeterministicFallbackStream(prompt);
      return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
    }
    const upstream = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: true })
    });

    if (!upstream.ok || !upstream.body) {
      // If the service is unreachable or errors, provide deterministic fallback
      const stream = createDeterministicFallbackStream(prompt);
      return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
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
                if (json.error) {
                  controller.enqueue(encoder.encode(`\n[error] ${json.error}\n`));
                }
                if (json.response) {
                  controller.enqueue(encoder.encode(json.response));
                }
                // Ollama sends { done: true } at the end; we just let the stream close naturally
              } catch {
                // Ignore malformed lines
              }
            }
          }

          // Flush any remaining buffered line
          if (buffer.length) {
            try {
              const json = JSON.parse(buffer);
              if (json.response) controller.enqueue(encoder.encode(json.response));
            } catch {
              // ignore
            }
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
    // Network/connection errors → deterministic fallback
    const stream = createDeterministicFallbackStream(prompt);
    return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
}



