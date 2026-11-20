import type { Point, Edge, PSOParams, WorkerCommand, WorkerResponse, ParticleRenderData } from '../types/simulation';

interface InternalParticle {
  positions: Point[];     // K punktów Steinera
  velocities: Point[];    // Wektory prędkości dla każdego z K punktów
  pBestPositions: Point[];
  pBestCost: number;
}

let terminals: Point[] = [];
let particles: InternalParticle[] = [];
let gBestPositions: Point[] = [];
let gBestCost = Infinity;
let mstBaseCost = 0;
let currentIteration = 0;
let maxIterations = 150;
let animationTimer: ReturnType<typeof setTimeout> | null = null;

// Odległość euklidesowa
const dist = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

// Algorytm Prima wyznaczający MST oraz oczyszczający zbędne punkty Steinera (stopnia <= 2)
function evaluateSteinerTree(terms: Point[], steinerCandidates: Point[]): {
  cost: number;
  edges: Edge[];
  activeSteinerPoints: Point[];
} {
  const nTerms = terms.length;
  if (nTerms < 2) return { cost: 0, edges: [], activeSteinerPoints: [] };

  // Filtrujemy punkty Steinera, które są zbyt blisko siebie lub terminali
  const allPoints: Point[] = [...terms, ...steinerCandidates];

  const runPrim = (pts: Point[]) => {
    const n = pts.length;
    const inMST = new Array(n).fill(false);
    const minDist = new Array(n).fill(Infinity);
    const parent = new Array(n).fill(-1);
    const degree = new Array(n).fill(0);

    minDist[0] = 0;
    let totalCost = 0;
    const edges: Edge[] = [];

    for (let step = 0; step < n; step++) {
      let u = -1;
      for (let i = 0; i < n; i++) {
        if (!inMST[i] && (u === -1 || minDist[i] < minDist[u])) {
          u = i;
        }
      }

      if (u === -1 || minDist[u] === Infinity) break;
      inMST[u] = true;
      totalCost += minDist[u];

      if (parent[u] !== -1) {
        edges.push({ from: pts[parent[u]], to: pts[u] });
        degree[u]++;
        degree[parent[u]]++;
      }

      for (let v = 0; v < n; v++) {
        if (!inMST[v]) {
          const d = dist(pts[u], pts[v]);
          if (d < minDist[v]) {
            minDist[v] = d;
            parent[v] = u;
          }
        }
      }
    }

    return { totalCost, edges, degree };
  };

  // Pierwszy przebieg Prima
  const firstPass = runPrim(allPoints);

  // Odrzucamy punkty Steinera o stopniu < 3 (w drzewie Steinera każdy punkt ma stopień >= 3)
  const validSteinerPoints = steinerCandidates.filter((_, idx) => {
    return firstPass.degree[nTerms + idx] >= 3;
  });

  if (validSteinerPoints.length === steinerCandidates.length) {
    return {
      cost: firstPass.totalCost,
      edges: firstPass.edges,
      activeSteinerPoints: validSteinerPoints,
    };
  }

  // Drugi przebieg tylko z właściwymi punktami Steinera
  const secondPass = runPrim([...terms, ...validSteinerPoints]);
  return {
    cost: secondPass.totalCost,
    edges: secondPass.edges,
    activeSteinerPoints: validSteinerPoints,
  };
}

function initSwarm(terms: Point[], params: PSOParams) {
  terminals = terms;
  currentIteration = 0;
  maxIterations = params.maxIterations;
  gBestCost = Infinity;
  gBestPositions = [];

  if (terminals.length < 3) {
    const base = evaluateSteinerTree(terminals, []);
    mstBaseCost = base.cost;
    gBestCost = base.cost;
    return;
  }

  mstBaseCost = evaluateSteinerTree(terminals, []).cost;
  const steinerCount = terminals.length - 2;

  // Wyznaczenie granic (Bounding Box) terminali do inicjalizacji cząstek
  const xs = terminals.map((p) => p.x);
  const ys = terminals.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(maxX - minX, 50);
  const height = Math.max(maxY - minY, 50);

  particles = Array.from({ length: params.swarmSize }, () => {
    const positions: Point[] = Array.from({ length: steinerCount }, () => ({
      x: minX + Math.random() * width,
      y: minY + Math.random() * height,
    }));

    const velocities: Point[] = Array.from({ length: steinerCount }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
    }));

    const evalRes = evaluateSteinerTree(terminals, positions);

    if (evalRes.cost < gBestCost) {
      gBestCost = evalRes.cost;
      gBestPositions = positions.map((p) => ({ ...p }));
    }

    return {
      positions,
      velocities,
      pBestPositions: positions.map((p) => ({ ...p })),
      pBestCost: evalRes.cost,
    };
  });
}

function stepSwarm(params: PSOParams): WorkerResponse {
  if (terminals.length < 3) {
    const base = evaluateSteinerTree(terminals, []);
    return {
      type: 'UPDATE',
      iteration: 1,
      bestCost: base.cost,
      mstBaseCost: base.cost,
      steinerPoints: [],
      treeEdges: base.edges,
      particles: [],
      isFinished: true,
    };
  }

  currentIteration++;
  const maxVel = 18;

  for (const p of particles) {
    for (let i = 0; i < p.positions.length; i++) {
      const r1 = Math.random();
      const r2 = Math.random();

      const vx =
        params.inertia * p.velocities[i].x +
        params.cognitive * r1 * (p.pBestPositions[i].x - p.positions[i].x) +
        params.social * r2 * (gBestPositions[i].x - p.positions[i].x);

      const vy =
        params.inertia * p.velocities[i].y +
        params.cognitive * r1 * (p.pBestPositions[i].y - p.positions[i].y) +
        params.social * r2 * (gBestPositions[i].y - p.positions[i].y);

      p.velocities[i].x = Math.max(-maxVel, Math.min(maxVel, vx));
      p.velocities[i].y = Math.max(-maxVel, Math.min(maxVel, vy));

      p.positions[i].x += p.velocities[i].x;
      p.positions[i].y += p.velocities[i].y;
    }

    const evalRes = evaluateSteinerTree(terminals, p.positions);
    if (evalRes.cost < p.pBestCost) {
      p.pBestCost = evalRes.cost;
      p.pBestPositions = p.positions.map((pt) => ({ ...pt }));
    }

    if (evalRes.cost < gBestCost) {
      gBestCost = evalRes.cost;
      gBestPositions = p.positions.map((pt) => ({ ...pt }));
    }
  }

  const bestTree = evaluateSteinerTree(terminals, gBestPositions);

  // Spłaszczamy wszystkie punkty Steinera ze wszystkich cząstek, aby widzieć pełną chmurę roju na Canvasie
  const renderParticles: ParticleRenderData[] = particles.flatMap((p, pIdx) =>
    p.positions.map((pos, idx) => ({
      particleId: pIdx,
      x: pos.x,
      y: pos.y,
      vx: p.velocities[idx].x,
      vy: p.velocities[idx].y,
    }))
  );

  return {
    type: 'UPDATE',
    iteration: currentIteration,
    bestCost: bestTree.cost,
    mstBaseCost,
    steinerPoints: bestTree.activeSteinerPoints,
    treeEdges: bestTree.edges,
    particles: renderParticles,
    isFinished: currentIteration >= maxIterations,
  };
}

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const msg = e.data;

  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }

  if (msg.type === 'STOP') return;

  if (msg.type === 'INIT_STEP_MODE') {
    initSwarm(msg.terminals, msg.params);
    const res = stepSwarm(msg.params);
    self.postMessage(res);
  } else if (msg.type === 'NEXT_STEP') {
    const res = stepSwarm(msg.params);
    self.postMessage(res);
  } else if (msg.type === 'INIT_AND_RUN') {
    initSwarm(msg.terminals, msg.params);

    const runLoop = () => {
      const res = stepSwarm(msg.params);
      self.postMessage(res);
      if (!res.isFinished) {
        animationTimer = setTimeout(runLoop, 30); // ~33 FPS dla czytelnej animacji roju
      }
    };
    runLoop();
  }
};
