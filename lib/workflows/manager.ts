export type PersonaType = 'STANDARDS_ANALYST' | 'DATA_PIPELINE_ENGINEER' | 'DATA_MODELER' | 'UIUX_PROTOTYPER';

export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface PersonaInstance {
  id: string;
  type: PersonaType;
  status: 'IDLE' | 'WORKING' | 'WAITING' | 'COMPLETED';
  lastUpdate: number;
}

export interface LogEntry {
  ts: number; // epoch ms
  message: string;
  personaId?: string;
  phase?: string;
}

export interface Workflow {
  id: string;
  name: string;
  type: 'COP_DEMO';
  status: WorkflowStatus;
  createdAt: number;
  step: number; // simple linear step for demo
  personas: PersonaInstance[];
  logs: LogEntry[];
}

const workflows = new Map<string, Workflow>();

function generateId(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function createCopDemoWorkflow(): Workflow {
  const id = generateId();
  const now = Date.now();
  const wf: Workflow = {
    id,
    name: 'Blue Force COP Demo',
    type: 'COP_DEMO',
    status: 'RUNNING',
    createdAt: now,
    step: 0,
    personas: [
      { id: generateId(), type: 'STANDARDS_ANALYST', status: 'WORKING', lastUpdate: now },
      { id: generateId(), type: 'DATA_PIPELINE_ENGINEER', status: 'IDLE', lastUpdate: now },
      { id: generateId(), type: 'DATA_MODELER', status: 'IDLE', lastUpdate: now },
      { id: generateId(), type: 'UIUX_PROTOTYPER', status: 'IDLE', lastUpdate: now }
    ],
    logs: [{ ts: now, message: 'Workflow started' }]
  };
  workflows.set(id, wf);
  return wf;
}

export function getWorkflow(id: string): Workflow | undefined {
  // advance simple state machine on read to simulate progress
  const wf = workflows.get(id);
  if (!wf) return undefined;
  if (wf.status === 'COMPLETED' || wf.status === 'FAILED') return wf;

  const millisSince = Date.now() - wf.createdAt;
  const newStep = Math.min(5, Math.floor(millisSince / 2000)); // step every 2s up to 5
  if (newStep !== wf.step) {
    wf.step = newStep;
    const push = (message: string, opts?: Partial<LogEntry>) => wf.logs.push({ ts: Date.now(), message, ...opts });
    switch (wf.step) {
      case 1:
        push('Standards Analyst parsed Link-16/VMF docs', { personaId: wf.personas[0].id, phase: 'INGEST' });
        wf.personas[0].status = 'COMPLETED';
        wf.personas[1].status = 'WORKING';
        break;
      case 2:
        push('Pipeline Engineer generated parsing/validation code', { personaId: wf.personas[1].id, phase: 'CODEGEN' });
        wf.personas[1].status = 'COMPLETED';
        wf.personas[2].status = 'WORKING';
        break;
      case 3:
        push('Data Modeler aligned schemas and validated interoperability', { personaId: wf.personas[2].id, phase: 'MAPPING' });
        wf.personas[2].status = 'COMPLETED';
        wf.personas[3].status = 'WORKING';
        break;
      case 4:
        push('UI/UX Prototyper created COP visualization', { personaId: wf.personas[3].id, phase: 'VIZ' });
        wf.personas[3].status = 'COMPLETED';
        break;
      case 5:
        push('Workflow completed successfully', { phase: 'DONE' });
        wf.status = 'COMPLETED';
        break;
    }
  }
  return wf;
}

export function stopWorkflow(id: string): Workflow | undefined {
  const wf = workflows.get(id);
  if (!wf) return undefined;
  if (wf.status === 'COMPLETED' || wf.status === 'FAILED') return wf;
  wf.status = 'FAILED';
  wf.logs.push({ ts: Date.now(), message: 'Workflow stopped by user' });
  return wf;
}


