import { SwarmCanvas } from './components/SwarmCanvas';
import { useSimulationStore } from './store/useSimulationStore';
import type { PlaybackSpeed, PresetType, StopConditionType } from './types/simulation';

const SPEED_OPTIONS: PlaybackSpeed[] = [0.1, 0.5, 1, 5];

function App() {
  const {
    terminals,
    steinerPoints,
    treeEdges,
    particles,
    params,
    iteration,
    isRunning,
    addTerminal,
    clearAll,
    updateParams,
    setIterationPreview,
    togglePlayMock,
    resetSwarmMock,
    stepMock,
    computeInstantMock,
    generateRandomMock,
  } = useSimulationStore();


  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-100 text-slate-900">
      {/* LEWY PANEL BOCZNY (przewijany) */}
      <aside className="w-96 bg-white border-r border-slate-200 flex flex-col shadow-sm h-full">
        {/* Nagłówek */}
        <div className="p-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Drzewo Steinera (PSO)
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              V = {terminals.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kliknij na płótno, aby dodać wierzchołki (terminale).
          </p>
        </div>

        {/* Przewijana zawartość parametrów */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* SEKCJA 4: Konfiguracja wierzchołków i wbudowane układy */}
          <section className="flex flex-col gap-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Konfiguracja wierzchołków
            </h2>

            {/* Wbudowane presety */}
            <label className="flex flex-col gap-1.5 text-xs text-slate-700">
              <span className="font-medium">Wbudowany układ (preset)</span>
              <select
                value={params.preset}
                onChange={(e) => updateParams({ preset: e.target.value as PresetType })}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value="custom">Własny (kliknięcia na płótnie)</option>
                <option value="equilateral_triangle">Trójkąt równoboczny (1 pkt Steinera)</option>
                <option value="obtuse_triangle">Trójkąt rozwartokątny (kąt ≥ 120°)</option>
                <option value="square">Kwadrat (2 pkt Steinera)</option>
                <option value="pentagon">Pięciokąt foremny</option>
                <option value="hexagon">Sześciokąt foremny</option>
              </select>
            </label>

            {/* Generator losowy */}
            <div className="flex items-end gap-2">
              <label className="flex-1 flex flex-col gap-1 text-xs text-slate-700">
                <span className="font-medium">Losowe wierzchołki (N)</span>
                <input
                  type="number"
                  min={3}
                  max={25}
                  value={params.randomVertexCount}
                  onChange={(e) =>
                    updateParams({ randomVertexCount: Math.max(3, parseInt(e.target.value, 10) || 3) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                />
              </label>
              <button
                type="button"
                onClick={generateRandomMock}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition cursor-pointer h-[30px]"
              >
                Losuj układ
              </button>
            </div>

            {/* Tryb dynamiczny (przeciąganie w locie) */}
            <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer select-none">
              <div>
                <div className="font-medium">Tryb dynamiczny (przeciąganie w locie)</div>
                <div className="text-[11px] text-slate-400">
                  Przesuwaj wierzchołki podczas działania roju
                </div>
              </div>
              <input
                type="checkbox"
                checked={params.dynamicDragMode}
                onChange={(e) => updateParams({ dynamicDragMode: e.target.checked })}
                className="accent-emerald-600 h-4 w-4"
              />
            </label>

            {/* Czyszczenie płótna (aktywne) */}
            <button
              type="button"
              onClick={clearAll}
              className="w-full py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              Wyczyść płótno
            </button>
          </section>

          <hr className="border-slate-200" />

          {/* SEKCJA 1: Parametry algorytmu PSO */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Parametry algorytmu PSO
            </h2>

            {/* Liczba cząstek (N) */}
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Liczba cząstek (N)</span>
                <span className="font-mono font-semibold text-slate-800">{params.swarmSize}</span>
              </div>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={params.swarmSize}
                onChange={(e) => updateParams({ swarmSize: parseInt(e.target.value, 10) })}
                className="accent-emerald-600"
              />
            </label>

            {/* Bezwładność (w) */}
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Bezwładność (w)</span>
                <span className="font-mono font-semibold text-slate-800">
                  {params.inertia.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.2}
                step={0.02}
                value={params.inertia}
                onChange={(e) => updateParams({ inertia: parseFloat(e.target.value) })}
                className="accent-emerald-600"
              />
            </label>

            {/* Współczynnik kognitywny (c1) */}
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Wsp. kognitywny (c1 — pBest)</span>
                <span className="font-mono font-semibold text-slate-800">
                  {params.cognitive.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={3.0}
                step={0.05}
                value={params.cognitive}
                onChange={(e) => updateParams({ cognitive: parseFloat(e.target.value) })}
                className="accent-emerald-600"
              />
            </label>

            {/* Współczynnik socjalny (c2) */}
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Wsp. socjalny (c2 — gBest)</span>
                <span className="font-mono font-semibold text-slate-800">
                  {params.social.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={3.0}
                step={0.05}
                value={params.social}
                onChange={(e) => updateParams({ social: parseFloat(e.target.value) })}
                className="accent-emerald-600"
              />
            </label>

            {/* Ograniczenie prędkości (V_max) */}
            <div className="flex flex-col gap-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={params.useMaxVelocity}
                    onChange={(e) => updateParams({ useMaxVelocity: e.target.checked })}
                    className="accent-emerald-600"
                  />
                  <span>Ograniczenie prędkości (V_max)</span>
                </label>
                <span className="font-mono font-semibold text-slate-800">
                  {params.useMaxVelocity ? `${params.maxVelocity} px` : 'Brak'}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={50}
                step={1}
                disabled={!params.useMaxVelocity}
                value={params.maxVelocity}
                onChange={(e) => updateParams({ maxVelocity: parseInt(e.target.value, 10) })}
                className="accent-emerald-600 disabled:opacity-40"
              />
            </div>

            {/* Warunek stopu */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-2.5">
              <span className="text-xs font-medium text-slate-700">Warunek stopu</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => updateParams({ stopCondition: 'iterations' as StopConditionType })}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md border transition cursor-pointer ${
                    params.stopCondition === 'iterations'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Liczba iteracji
                </button>
                <button
                  type="button"
                  onClick={() => updateParams({ stopCondition: 'convergence' as StopConditionType })}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md border transition cursor-pointer ${
                    params.stopCondition === 'convergence'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Zbieżność (ε)
                </button>
              </div>

              {params.stopCondition === 'iterations' ? (
                <label className="flex flex-col gap-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Maks. iteracji (T)</span>
                    <span className="font-mono font-semibold">{params.maxIterations}</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={2000}
                    step={50}
                    value={params.maxIterations}
                    onChange={(e) => updateParams({ maxIterations: parseInt(e.target.value, 10) })}
                    className="accent-emerald-600"
                  />
                </label>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1 text-xs text-slate-600">
                    <span>Próg poprawy (ε)</span>
                    <input
                      type="number"
                      step={0.001}
                      min={0.0001}
                      value={params.convergenceEpsilon}
                      onChange={(e) =>
                        updateParams({ convergenceEpsilon: parseFloat(e.target.value) || 0.01 })
                      }
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-mono"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-slate-600">
                    <span>Przez k iteracji</span>
                    <input
                      type="number"
                      min={5}
                      max={500}
                      value={params.convergencePatience}
                      onChange={(e) =>
                        updateParams({ convergencePatience: parseInt(e.target.value, 10) || 20 })
                      }
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-mono"
                    />
                  </label>
                </div>
              )}
            </div>
          </section>
        </div>
      </aside>

      {/* PRAWA CZĘŚĆ: Płótno + Dolny pasek sterowania czasem */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Płótno Canvas */}
        <SwarmCanvas
          terminals={terminals}
          steinerPoints={steinerPoints}
          treeEdges={treeEdges}
          particles={particles}
          onAddTerminal={addTerminal}
        />

        {/* SEKCJA 2: Dolny pasek sterowania czasem i historią */}
        <footer className="bg-white border-t border-slate-200 px-6 py-4 flex flex-col gap-3 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          {/* Górny wiersz: Oś czasu (Timeline scrubber) */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Oś czasu (historia):
            </span>
            <input
              type="range"
              min={0}
              max={params.maxIterations}
              value={iteration}
              onChange={(e) => setIterationPreview(parseInt(e.target.value, 10))}
              className="flex-1 accent-emerald-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-semibold text-slate-700 w-24 text-right">
              {iteration} / {params.maxIterations}
            </span>
          </div>

          {/* Dolny wiersz: Przyciski odtwarzania, kroki, prędkość i interpolacja */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Odtwarzanie + Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayMock}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                {isRunning ? 'Pauza' : 'Play'}
              </button>
              <button
                type="button"
                onClick={resetSwarmMock}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition cursor-pointer"
              >
                Reset roju
              </button>
              <button
                type="button"
                onClick={computeInstantMock}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                Przelicz natychmiast
              </button>
            </div>

            {/* Praca krokowa */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {[-10, -1, 1, 10].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => stepMock(delta)}
                  className="px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 hover:bg-white hover:shadow-xs rounded-md transition cursor-pointer"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>

            {/* Prędkość animacji + Interpolacja ruchu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Tempo:</span>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => updateParams({ playbackSpeed: speed })}
                      className={`px-2 py-1 text-xs font-mono rounded-md transition cursor-pointer ${
                        params.playbackSpeed === speed
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={params.interpolateMotion}
                  onChange={(e) => updateParams({ interpolateMotion: e.target.checked })}
                  className="accent-emerald-600 h-4 w-4"
                />
                <span>Interpolacja ruchu</span>
              </label>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;