import { create } from 'zustand';
import type { Point, Edge, ParticleRenderData, PSOParams } from '../types/simulation';

interface SimulationState {
  terminals: Point[];
  steinerPoints: Point[];
  treeEdges: Edge[];
  particles: ParticleRenderData[];
  params: PSOParams;
  iteration: number;
  isRunning: boolean;

  // Jedyne aktywne akcje w prototypie UI
  addTerminal: (point: Point) => void;
  clearAll: () => void;
  updateParams: (partial: Partial<PSOParams>) => void;

  // Atrapy akcji (odłączona symulacja)
  setIterationPreview: (iter: number) => void;
  togglePlayMock: () => void;
  resetSwarmMock: () => void;
  stepMock: (delta: number) => void;
  computeInstantMock: () => void;
  generateRandomMock: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  terminals: [],
  steinerPoints: [],
  treeEdges: [],
  particles: [],
  iteration: 0,
  isRunning: false,

  params: {
    // 1. Parametry PSO
    swarmSize: 50,
    inertia: 0.72,
    cognitive: 1.49,
    social: 1.49,
    useMaxVelocity: true,
    maxVelocity: 15,
    stopCondition: 'iterations',
    maxIterations: 500,
    convergenceEpsilon: 0.01,
    convergencePatience: 50,

    // 2. Sterowanie czasem
    playbackSpeed: 1,
    interpolateMotion: true,

    // 4. Konfiguracja wierzchołków
    preset: 'custom',
    randomVertexCount: 5,
    dynamicDragMode: false,
  },

  addTerminal: (point) =>
    set((state) => ({
      terminals: [...state.terminals, point],
      params: { ...state.params, preset: 'custom' },
    })),

  clearAll: () =>
    set({
      terminals: [],
      steinerPoints: [],
      treeEdges: [],
      particles: [],
      iteration: 0,
      isRunning: false,
    }),

  updateParams: (partial) =>
    set((state) => ({
      params: { ...state.params, ...partial },
    })),

  // Odłączone funkcje symulacji (no-op / wyłącznie reakcja wizualna UI)
  setIterationPreview: (iter) => set({ iteration: iter }),
  togglePlayMock: () => {},
  resetSwarmMock: () => set({ iteration: 0, isRunning: false }),
  stepMock: () => {},
  computeInstantMock: () => {},
  generateRandomMock: () => {},
}));