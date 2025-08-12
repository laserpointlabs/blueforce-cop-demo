import { NextRequest } from 'next/server';

type SourceType = 'link16' | 'vmf';

interface Deviation {
  field: string;
  issue: string;
}

interface CdmEvent {
  id: string;
  ts: number;
  source: SourceType;
  cdm: {
    entity: 'Track' | 'Unit';
    unitId: string;
    lat: number;
    lon: number;
    speed?: number;
    heading?: number;
  };
  deviations: Deviation[];
}

function randId(): string {
  return Math.random().toString(36).slice(2);
}

function jitter(base: number, delta: number): number {
  return base + (Math.random() * 2 - 1) * delta;
}

function generateEvent(source: SourceType): CdmEvent {
  // Simulate different coverage/format patterns by source
  const now = Date.now();
  const entity: 'Track' | 'Unit' = Math.random() < 0.7 ? 'Track' : 'Unit';
  const unitId = source === 'link16' ? `L16-${(Math.floor(Math.random() * 900) + 100)}` : `VMF_${(Math.floor(Math.random() * 9000) + 1000)}`;
  const lat = jitter(34.05, 1.5); // around SoCal for demo
  const lon = jitter(-118.25, 1.5);
  const deviations: Deviation[] = [];

  // Coverage differences by source
  const includeSpeed = source === 'link16' ? Math.random() > 0.05 : Math.random() > 0.25; // VMF missing more often
  const includeHeading = source === 'link16' ? Math.random() > 0.1 : Math.random() > 0.35;

  if (!includeSpeed) deviations.push({ field: 'speed', issue: 'missing' });
  if (!includeHeading) deviations.push({ field: 'heading', issue: 'missing' });

  // Example of ID format deviation noted in mapping
  if (source === 'vmf') {
    deviations.push({ field: 'unitId', issue: 'format_diff (VMF underscore vs Link-16 dash)' });
  }

  const evt: CdmEvent = {
    id: randId(),
    ts: now,
    source,
    cdm: {
      entity,
      unitId,
      lat: Number(lat.toFixed(5)),
      lon: Number(lon.toFixed(5)),
      ...(includeSpeed ? { speed: Math.round(jitter(120, 25)) } : {}),
      ...(includeHeading ? { heading: Math.round(jitter(180, 60)) % 360 } : {}),
    },
    deviations,
  };
  return evt;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sourcesParam = url.searchParams.get('sources') || 'link16,vmf';
  const intervalMs = Math.max(200, Math.min(2000, Number(url.searchParams.get('intervalMs') || 800)));
  const sources = sourcesParam.split(',').map((s) => s.trim().toLowerCase()).filter((s) => s === 'link16' || s === 'vmf') as SourceType[];
  const active: SourceType[] = sources.length > 0 ? sources : ['link16', 'vmf'];

  const encoder = new TextEncoder();
  let timer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const tick = () => {
        const src = active[Math.floor(Math.random() * active.length)];
        const evt = generateEvent(src);
        const line = `data: ${JSON.stringify(evt)}\n\n`;
        controller.enqueue(encoder.encode(line));
      };

      // initial warmup: send a couple of events instantly
      for (let i = 0; i < Math.min(3, active.length); i++) tick();
      timer = setInterval(tick, intervalMs);

      req.signal.addEventListener('abort', () => {
        if (timer) clearInterval(timer);
        try { controller.close(); } catch {}
      });
    },
    cancel() {
      if (timer) clearInterval(timer);
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



