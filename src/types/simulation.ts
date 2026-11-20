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

export type StopConditionType = 'iterations' | 'convergence';

export type PresetType =
  | 'custom'
  | 'equilateral_triangle'
  | 'obtuse_triangle'
  | 'square'
  | 'pentagon'
  | 'hexagon';

export type PlaybackSpeed = 0.1 | 0.5 | 1 | 5;

export interface PSOParams {
  // 1. Parametry algorytmu PSO
  swarmSize: number;                // Liczba cząstek (N)
  inertia: number;                  // Stała bezwładność (w)
  cognitive: number;                // Współczynnik kognitywny (c1)
  social: number;                   // Współczynnik socjalny (c2)
  useMaxVelocity: boolean;          // Ograniczenie prędkości ON/OFF
  maxVelocity: number;              // V_max
  stopCondition: StopConditionType; // Warunek stopu
  maxIterations: number;            // Sztywna liczba iteracji
  convergenceEpsilon: number;       // Próg poprawy (epsilon)
  convergencePatience: number;      // Liczba iteracji bez poprawy (k)

  // 2. Sterowanie czasem i historia
  playbackSpeed: PlaybackSpeed;     // Mnożnik tempa animacji
  interpolateMotion: boolean;       // Interpolacja ruchu ON/OFF

  // 4. Konfiguracja wierzchołków
  preset: PresetType;               // Wybrany układ wbudowany
  randomVertexCount: number;        // Liczba losowych wierzchołków do wygenerowania
  dynamicDragMode: boolean;         // Przeciąganie wierzchołków w locie ON/OFF
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
  mstBaseCost: number;
  steinerPoints: Point[];
  treeEdges: Edge[];
  particles: ParticleRenderData[];
  isFinished: boolean;
}