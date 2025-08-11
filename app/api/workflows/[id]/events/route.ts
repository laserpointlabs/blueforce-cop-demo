import { NextRequest } from 'next/server';
import { getWorkflow } from '@/lib/workflows/manager';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const wf = getWorkflow(params.id);
  if (!wf) {
    return new Response('not found', { status: 404 });
  }

  const encoder = new TextEncoder();
  let timer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = () => {
        const current = getWorkflow(params.id);
        if (!current) return;
        const payload = JSON.stringify(current);
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        if (current.status === 'COMPLETED' || current.status === 'FAILED') {
          clear();
          controller.close();
        }
      };

      const clear = () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };

      // Initial push
      send();
      timer = setInterval(send, 1000);

      // Close on client disconnect
      req.signal.addEventListener('abort', () => {
        clear();
        try { controller.close(); } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    }
  });
}


