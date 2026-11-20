import { SwarmCanvas } from './components/SwarmCanvas';
import { useSimulationStore } from './store/useSimulationStore';

function App() {
  const {
    terminals,
    steinerPoints,
    treeEdges,
    particles,
    params,
    iteration,
    bestCost,
    mstBaseCost,
    isRunning,
    addTerminal,
    clearAll,
    updateParams,
    runOptimalSteinerSearch,
    stepOptimization,
    stopSimulation,
  } = useSimulationStore();

  const savingsPercent =
    mstBaseCost && bestCost && mstBaseCost > 0
      ? (((mstBaseCost - bestCost) / mstBaseCost) * 100).toFixed(2)
      : '0.00';

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Panel boczny sterowania */}
      <aside className="w-85 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Drzewo Steinera (PSO)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kliknij na płótno, aby dodać co najmniej 3 wierzchołki (terminale).
          </p>
        </div>

        {/* Główne przyciski akcji */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={runOptimalSteinerSearch}
            disabled={terminals.length < 2 || isRunning}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer disabled:cursor-not-allowed"
          >
            {isRunning ? 'Szukanie w toku...' : 'Wyznacz punkty Steinera'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={stepOptimization}
              disabled={terminals.length < 2 || isRunning}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
            >
              Krok (+1 iteracja)
            </button>

            <button
              onClick={stopSimulation}
              disabled={!isRunning}
              className="py-2 px-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
            >
              Zatrzymaj
            </button>
          </div>

          <button
            onClick={clearAll}
            className="py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition cursor-pointer"
          >
            Wyczyść płótno
          </button>
        </div>

        {/* Parametry algorytmu */}
        <div className="flex flex-col gap-4 border-t border-slate-200 pt-4">
          <h2 className="text-sm font-semibold text-slate-800">Parametry roju</h2>

          <label className="flex flex-col gap-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Bezwładność (w)</span>
              <span className="font-mono font-semibold">{params.inertia.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.2"
              step="0.02"
              value={params.inertia}
              onChange={(e) => updateParams({ inertia: parseFloat(e.target.value) })}
              className="accent-emerald-600"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Wsp. poznawczy (c1 - pBest)</span>
              <span className="font-mono font-semibold">{params.cognitive.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.05"
              value={params.cognitive}
              onChange={(e) => updateParams({ cognitive: parseFloat(e.target.value) })}
              className="accent-emerald-600"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Wsp. społeczny (c2 - gBest)</span>
              <span className="font-mono font-semibold">{params.social.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3.0"
              step="0.05"
              value={params.social}
              onChange={(e) => updateParams({ social: parseFloat(e.target.value) })}
              className="accent-emerald-600"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Liczba cząstek</span>
              <span className="font-mono font-semibold">{params.swarmSize}</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={params.swarmSize}
              onChange={(e) => updateParams({ swarmSize: parseInt(e.target.value, 10) })}
              className="accent-emerald-600"
            />
          </label>
        </div>

        {/* Statystyki */}
        <div className="mt-auto bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Wierzchołki (V):</span>
            <span className="font-semibold">{terminals.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Aktywne pkt Steinera:</span>
            <span className="font-semibold text-emerald-600">{steinerPoints.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Iteracja:</span>
            <span className="font-mono font-semibold">
              {iteration} / {params.maxIterations}
            </span>
          </div>
          {mstBaseCost !== null && (
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
              <span className="text-slate-500">Koszt zwykłego MST:</span>
              <span className="font-mono">{mstBaseCost.toFixed(1)} px</span>
            </div>
          )}
          {bestCost !== null && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-500">Koszt drzewa Steinera:</span>
                <span className="font-mono font-bold text-emerald-600">
                  {bestCost.toFixed(1)} px
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Redukcja długości:</span>
                <span className="font-mono font-semibold text-emerald-700">
                  -{savingsPercent}%
                </span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Płótno Canvas */}
      <SwarmCanvas
        terminals={terminals}
        steinerPoints={steinerPoints}
        treeEdges={treeEdges}
        particles={particles}
        onAddTerminal={addTerminal}
      />
    </div>
  );
}

export default App;