import { create } from 'zustand';
import type { Point, Edge, ParticleRenderData, PSOParams, WorkerResponse } from '../types/simulation';

interface SimulationState {
  terminals: Point[];
  steinerPoints: Point[];
  treeEdges: Edge[];
  particles: ParticleRenderData[];
  params: PSOParams;
  iteration: number;
  bestCost: number | null;
  mstBaseCost: number | null;
  isRunning: boolean;

  addTerminal: (point: Point) => void;
  clearAll: () => void;
  updateParams: (partial: Partial<PSOParams>) => void;
  runOptimalSteinerSearch: () => void;
  stepOptimization: () => void;
  stopSimulation: () => void;
}

let worker: Worker | null = null;

const getWorker = (set: (fn: (state: SimulationState) => Partial<SimulationState>) => void): Worker => {
  if (!worker) {
    worker = new Worker(new URL('../workers/psoWorker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const data = e.data;
      if (data.type === 'UPDATE') {
        set(() => ({
          iteration: data.iteration,
          bestCost: data.bestCost,
          mstBaseCost: data.mstBaseCost,
          steinerPoints: data.steinerPoints,
          treeEdges: data.treeEdges,
          particles: data.particles,
          isRunning: !data.isFinished,
        }));
      }
    };
  }
  return worker;
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  terminals: [],
  steinerPoints: [],
  treeEdges: [],
  particles: [],
  iteration: 0,
  bestCost: null,
  mstBaseCost: null,
  isRunning: false,
  params: {
    swarmSize: 50,
    inertia: 0.72,
    cognitive: 1.49,
    social: 1.49,
    maxIterations: 1200,
  },

  addTerminal: (point) =>
    set((state) => ({
      terminals: [...state.terminals, point],
      steinerPoints: [],
      treeEdges: [],
      particles: [],
      iteration: 0,
      bestCost: null,
      mstBaseCost: null,
    })),

  clearAll: () => {
    const w = getWorker(set);
    w.postMessage({ type: 'STOP' });
    set({
      terminals: [],
      steinerPoints: [],
      treeEdges: [],
      particles: [],
      iteration: 0,
      bestCost: null,
      mstBaseCost: null,
      isRunning: false,
    });
  },

  updateParams: (partial) =>
    set((state) => ({
      params: { ...state.params, ...partial },
    })),

  runOptimalSteinerSearch: () => {
    const { terminals, params } = get();
    if (terminals.length < 2) return;
    const w = getWorker(set);
    set({ isRunning: true });
    w.postMessage({ type: 'INIT_AND_RUN', terminals, params });
  },

  stepOptimization: () => {
    const { terminals, params, iteration } = get();
    if (terminals.length < 2) return;
    const w = getWorker(set);
    set({ isRunning: false });
    if (iteration === 0) {
      w.postMessage({ type: 'INIT_STEP_MODE', terminals, params });
    } else {
      w.postMessage({ type: 'NEXT_STEP', params });
    }
  },

  stopSimulation: () => {
    const w = getWorker(set);
    w.postMessage({ type: 'STOP' });
    set({ isRunning: false });
  },
}));
