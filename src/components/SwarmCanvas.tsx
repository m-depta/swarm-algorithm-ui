import React, { useRef, useEffect } from 'react';
import type { Point, Edge, ParticleRenderData } from '../types/simulation';

interface SwarmCanvasProps {
  terminals: Point[];                 // Stałe wierzchołki dodane przez użytkownika
  steinerPoints: Point[];             // Najlepsze znalezione punkty Steinera (gBest)
  treeEdges: Edge[];                  // Krawędzie najlepszego drzewa Steinera
  particles: ParticleRenderData[];    // Cząstki roju (do rysowania chmury i prędkości)
  onAddTerminal: (point: Point) => void;
}

export const SwarmCanvas: React.FC<SwarmCanvasProps> = ({
  terminals,
  steinerPoints,
  treeEdges,
  particles,
  onAddTerminal,
}) => { 
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Obsługa kliknięcia myszą — przelicza pozycję kursora na współrzędne płótna
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onAddTerminal({ x, y });
  };

  // 2. Funkcja rysująca wszystko na płótnie
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Czyszczenie płótna przed narysowaniem nowej klatki
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // A. Rysowanie delikatnej siatki w tle (opcjonalnie, wygląda bardzo profesjonalnie)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // B. Rysowanie cząstek roju oraz ich wektorów prędkości
// B. Rysowanie cząstek roju oraz ich wektorów prędkości (każda cząstka ma inny kolor)
    particles.forEach((p) => {
      // Złoty kąt (137.508°) gwarantuje dobrze rozróżnialne kolory dla kolejnych ID cząstek
      const hue = (p.particleId * 137.508) % 360;

      // Wektor prędkości (kreska pokazująca dokąd leci dany punkt cząstki)
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hue}, 80%, 50%, 0.4)`;
      ctx.lineWidth = 1.5;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 3);
      ctx.stroke();

      // Punkt należący do cząstki
      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, 85%, 45%, 0.75)`;
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // C. Rysowanie krawędzi drzewa Steinera
    ctx.strokeStyle = '#10b981'; // Zielony (szmaragdowy)
    ctx.lineWidth = 2.5;
    treeEdges.forEach((edge) => {
      ctx.beginPath();
      ctx.moveTo(edge.from.x, edge.from.y);
      ctx.lineTo(edge.to.x, edge.to.y);
      ctx.stroke();
    });

    // D. Rysowanie znalezionych punktów Steinera (zielone punkty z białą obwódką)
    steinerPoints.forEach((sp) => {
      ctx.beginPath();
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // E. Rysowanie stałych wierzchołków użytkownika (duże ciemne punkty na wierzchu)
    terminals.forEach((t, index) => {
      ctx.beginPath();
      ctx.fillStyle = '#0f172a'; // Bardzo ciemny granat/czarny
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.arc(t.x, t.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Podpis wierzchołka (np. V1, V2...)
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`V${index + 1}`, t.x + 10, t.y - 10);
    });
  }, [terminals, steinerPoints, treeEdges, particles]);

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-100 p-4 overflow-hidden min-h-0">
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        onClick={handleCanvasClick}
        className="max-w-full max-h-full bg-white rounded-xl shadow-md border border-slate-200 cursor-crosshair"
      />
    </div>
  );
};