export interface Point {
  x: number;
  y: number;
}

export interface Edge {
  from: Point;
  to: Point;
}

export interface ParticleRenderData {
  particleId: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface PSOParams {
  swarmSize: number;
  inertia: number;      // w - bezwładność
  cognitive: number;    // c1 - współczynnik poznawczy (pBest)
  social: number;       // c2 - współczynnik społeczny (gBest)
  maxIterations: number;
}

export type WorkerCommand =
  | { type: 'INIT_AND_RUN'; terminals: Point[]; params: PSOParams }
  | { type: 'INIT_STEP_MODE'; terminals: Point[]; params: PSOParams }
  | { type: 'NEXT_STEP'; params: PSOParams }
  | { type: 'STOP' };

export interface WorkerResponse {
  type: 'UPDATE';
  iteration: number;
  bestCost: number;
  mstBaseCost: number; // Koszt zwykłego MST bez punktów Steinera (do porównania)
  steinerPoints: Point[];
  treeEdges: Edge[];
  particles: ParticleRenderData[];
  isFinished: boolean;
}