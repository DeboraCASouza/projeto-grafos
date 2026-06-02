import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, CartesianGrid, Cell, ScatterChart, Scatter } from 'recharts';
import { AIRPORTS_METADATA } from '../data/airportsData';
import { BarChart3, Grid, Cpu, Table, ArrowUpDown, Filter } from 'lucide-react';

// Color definitions matching the canonical python / HTML colors
const REGION_COLORS: Record<string, string> = {
  "Norte": "#7C3AED",
  "Nordeste": "#A855F7",
  "Sudeste": "#D946EF",
  "Sul": "#F472B6",
  "Centro-Oeste": "#FB7185",
};

// Static performance data from the Python benchmark
const PERF_DATA = [
  { alg: "BFS", V: 20,  ms: 0.005,  real: false },
  { alg: "DFS", V: 20,  ms: 0.008,  real: false },
  { alg: "Dijkstra", V: 20,  ms: 0.020,  real: false },
  { alg: "Bellman-Ford",  V: 20,  ms: 0.050,  real: false },
  { alg: "BFS", V: 182, ms: 0.0859, real: true },
  { alg: "BFS", V: 182, ms: 0.0774, real: true },
  { alg: "BFS", V: 182, ms: 0.0739, real: true },
  { alg: "DFS", V: 182, ms: 0.1264, real: true },
  { alg: "DFS", V: 182, ms: 0.1185, real: true },
  { alg: "DFS", V: 182, ms: 0.1214, real: true },
  { alg: "Dijkstra", V: 182, ms: 0.4667, real: true },
  { alg: "Dijkstra", V: 182, ms: 0.1648, real: true },
  { alg: "Dijkstra", V: 182, ms: 0.4601, real: true },
  { alg: "Dijkstra", V: 182, ms: 0.2047, real: true },
  { alg: "Dijkstra", V: 182, ms: 0.5784, real: true },
  { alg: "Bellman-Ford",  V: 4,   ms: 0.0101, real: true },
  { alg: "Bellman-Ford",  V: 4,   ms: 0.0071, real: true },
  { alg: "Bellman-Ford",  V: 99,  ms: 0.9606, real: true },
];

const ALG_COLORS = {
  "BFS": "#34D399",
  "DFS": "#60A5FA",
  "Dijkstra": "#FBBF24",
  "Bellman-Ford": "#F87171"
};

// SVG Ego-grid structured data
const REGION_AIRPORTS: Record<string, { iata: string; name: string; ego: number; grau: number }[]> = {
  Norte: [
    { iata: 'MAO', name: 'Manaus', ego: 0.747253, grau: 13 },
    { iata: 'BEL', name: 'Belém', ego: 1.0, grau: 9 },
    { iata: 'PVH', name: 'Porto Velho', ego: 0.952381, grau: 6 },
    { iata: 'RBR', name: 'Rio Branco', ego: 1.0, grau: 5 },
  ],
  Nordeste: [
    { iata: 'REC', name: 'Recife', ego: 0.733333, grau: 15 },
    { iata: 'SSA', name: 'Salvador', ego: 0.758333, grau: 15 },
    { iata: 'FOR', name: 'Fortaleza', ego: 0.878788, grau: 11 },
    { iata: 'NAT', name: 'Natal', ego: 0.924242, grau: 11 },
    { iata: 'JPA', name: 'João Pessoa', ego: 1.0, grau: 8 },
    { iata: 'THE', name: 'Teresina', ego: 1.0, grau: 5 },
  ],
  Sudeste: [
    { iata: 'GRU', name: 'São Paulo (GRU)', ego: 0.605263, grau: 19 },
    { iata: 'CGH', name: 'São Paulo (CGH)', ego: 0.771429, grau: 14 },
    { iata: 'GIG', name: 'Rio de Janeiro', ego: 0.686275, grau: 17 },
    { iata: 'CNF', name: 'Belo Horizonte', ego: 0.605263, grau: 19 },
    { iata: 'VIX', name: 'Vitória', ego: 0.944444, grau: 8 },
  ],
  Sul: [
    { iata: 'CWB', name: 'Curitiba', ego: 0.933333, grau: 9 },
    { iata: 'FLN', name: 'Florianópolis', ego: 0.888889, grau: 9 },
    { iata: 'POA', name: 'Porto Alegre', ego: 0.909091, grau: 10 },
  ],
  "Centro-Oeste": [
    { iata: 'BSB', name: 'Brasília', ego: 0.605263, grau: 19 },
    { iata: 'GYN', name: 'Goiânia', ego: 0.972222, grau: 8 },
  ],
};

export const Parte1Stats: React.FC = () => {
  // Local page filters
  const [activeRegs, setActiveRegs] = useState<Set<string>>(
    new Set(['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'])
  );
  const [minDegree, setMinDegree] = useState(0);
  const [selectedIata, setSelectedIata] = useState<string | null>(null);

  // Table sorting
  const [sortField, setSortField] = useState<'grau' | 'densidade'>('grau');
  const [sortAsc, setSortAsc] = useState(false);

  // Tooltip tracking for custom SVG Ego-density grid
  const [hoveredAp, setHoveredAp] = useState<{ iata: string; name: string; ego: number; grau: number; regiao: string } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const regions = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'];

  // Toggle region filter
  const toggleRegion = (reg: string) => {
    const newRegs = new Set(activeRegs);
    if (newRegs.has(reg)) {
      if (newRegs.size === 1) return;
      newRegs.delete(reg);
    } else {
      newRegs.add(reg);
    }
    setActiveRegs(newRegs);
    if (selectedIata && AIRPORTS_METADATA[selectedIata] && !newRegs.has(AIRPORTS_METADATA[selectedIata].regiao)) {
      setSelectedIata(null);
    }
  };

  // Helper to check visibility
  const isVis = (_iata: string, grau: number, regiao: string) => {
    return activeRegs.has(regiao) && grau >= minDegree;
  };

  // Calculate visible airports list
  const visibleAirports = useMemo(() => {
    return Object.keys(AIRPORTS_METADATA)
      .filter((iata) => {
        const meta = AIRPORTS_METADATA[iata];
        return isVis(iata, meta.grau, meta.regiao);
      })
      .map((iata) => ({
        iata,
        ...AIRPORTS_METADATA[iata],
      }));
  }, [activeRegs, minDegree]);

  // Sort table data
  const sortedTableData = useMemo(() => {
    const data = [...visibleAirports];
    data.sort((a, b) => {
      const factor = sortAsc ? 1 : -1;
      if (sortField === 'grau') {
        return (a.grau - b.grau) * factor;
      } else {
        return (a.densidade - b.densidade) * factor;
      }
    });
    return data;
  }, [visibleAirports, sortField, sortAsc]);

  const toggleSort = (field: 'grau' | 'densidade') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // 1. Calculate Degree Distribution Data reactively
  const degreeDistData = useMemo(() => {
    const freq: Record<number, number> = {};
    visibleAirports.forEach((ap) => {
      freq[ap.grau] = (freq[ap.grau] || 0) + 1;
    });
    return Object.keys(freq)
      .map(Number)
      .sort((a, b) => a - b)
      .map((d) => ({
        degree: d,
        count: freq[d],
      }));
  }, [visibleAirports]);

  // SVG dimensions for Ego-density Grid
  const svgW = 450;
  const svgH = 180;
  const pl = 75;
  const pr = 5;
  const pt = 5;
  const pb = 5;
  const cW = svgW - pl - pr;
  const cH = svgH - pt - pb;
  const rowH = cH / 5;

  const handleSvgMouseMove = (e: React.MouseEvent<SVGRectElement>, ap: any, reg: string) => {
    // Offset relative to viewport
    setTooltipPos({
      x: e.clientX + 12,
      y: e.clientY - 42,
    });
    setHoveredAp({
      ...ap,
      regiao: reg,
    });
  };

  return (
    <div className="flex flex-col gap-6 py-2 animate-fade-in relative">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Parte 1 — Estatísticas da Rede Aérea</h1>
        <p className="text-xs text-slate-400">
          Análise quantitativa de centralidade, ego-redes e benchmarks de algoritmos.
        </p>
      </div>

      {/* Glassmorphic Filters Bar */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Regions selectors */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            Filtrar por Região
          </span>
          <div className="flex flex-wrap gap-2">
            {regions.map((reg) => {
              const color = REGION_COLORS[reg];
              const isActive = activeRegs.has(reg);
              return (
                <button
                  key={reg}
                  onClick={() => toggleRegion(reg)}
                  style={{
                    borderColor: isActive ? color : '#1e293b',
                    backgroundColor: isActive ? `${color}18` : 'transparent',
                    color: isActive ? '#f1f5f9' : '#64748b',
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-150"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {reg}
                </button>
              );
            })}
          </div>
        </div>

        {/* Degree filter slider */}
        <div className="flex-1 max-w-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Grau de Conectividade Mínimo</span>
            <span className="font-mono text-purple-400">≥ {minDegree}</span>
          </div>
          <input
            type="range"
            min={0}
            max={19}
            value={minDegree}
            onChange={(e) => setMinDegree(Number(e.target.value))}
            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500 border border-slate-900"
          />
        </div>

        {/* Global Summary counts */}
        <div className="flex items-center gap-4 text-center shrink-0">
          <div className="bg-slate-950/50 border border-slate-900 px-3 py-2 rounded-xl">
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Visíveis</span>
            <span className="text-base font-extrabold text-sky-400 font-mono leading-none">{visibleAirports.length}</span>
          </div>
          <div className="bg-slate-950/50 border border-slate-900 px-3 py-2 rounded-xl">
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Média Grau</span>
            <span className="text-base font-extrabold text-purple-400 font-mono leading-none">
              {(visibleAirports.reduce((acc, a) => acc + a.grau, 0) / (visibleAirports.length || 1)).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Degree Distribution */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col h-80">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Distribuição de Graus</h3>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={degreeDistData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#101827" vertical={false} />
                <XAxis dataKey="degree" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '11px',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  cursor={{ fill: '#1e293b', opacity: 0.15 }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={30}>
                  {degreeDistData.map((entry, index) => {
                    // map visual color matching python's degree logic
                    const t = (entry.degree - 5) / (19 - 5);
                    const color = t < 0.4 ? '#7C3AEDcc' : t < 0.75 ? '#A855F7cc' : '#D946EFcc';
                    const isHighlighted = selectedIata && AIRPORTS_METADATA[selectedIata]?.grau === entry.degree;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isHighlighted ? '#ffffff' : color}
                        stroke={isHighlighted ? '#ffffff' : 'transparent'}
                        strokeWidth={isHighlighted ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 leading-tight">
            Frequência absoluta (Eixo Y) dos graus de centralidade do aeroporto (Eixo X).
          </span>
        </div>

        {/* Chart 2: Custom SVG Ego-density Grid */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col h-80">
          <div className="flex items-center gap-2 mb-3">
            <Grid className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Densidade Ego-Rede por Aeroporto</h3>
          </div>

          <div className="flex-1 min-h-0 bg-slate-950/40 border border-slate-900/50 rounded-xl p-2 flex items-center justify-center relative">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {regions.map((reg, ri) => {
                const airports = REGION_AIRPORTS[reg] || [];
                const col = REGION_COLORS[reg];
                const regActive = activeRegs.has(reg);
                const y = pt + ri * rowH;
                const cellW = Math.max(2, Math.floor(cW / airports.length) - 1.5);

                return (
                  <g key={reg}>
                    {/* Region Label */}
                    <text
                      x={pl - 8}
                      y={y + rowH / 2 + 3.5}
                      fill={regActive ? col : '#334155'}
                      fontSize="9"
                      textAnchor="end"
                      fontWeight="700"
                    >
                      {reg}
                    </text>

                    {/* Airport Cells */}
                    {airports.map((ap, ci) => {
                      const x = pl + ci * (cW / airports.length);
                      const active = regActive && ap.grau >= minDegree;
                      const opacity = active ? 0.14 + ap.ego * 0.86 : 0.07;
                      const isSel = selectedIata === ap.iata;

                      return (
                        <g key={ap.iata} className="group">
                          <rect
                            x={x}
                            y={y}
                            width={cellW}
                            height={rowH - 1.5}
                            fill={col}
                            opacity={opacity}
                            rx="2.5"
                            stroke={isSel ? '#ffffff' : 'transparent'}
                            strokeWidth={isSel ? 1.5 : 0}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => handleSvgMouseMove(e, ap, reg)}
                            onMouseMove={(e) => handleSvgMouseMove(e, ap, reg)}
                            onMouseLeave={() => setHoveredAp(null)}
                            onClick={() => setSelectedIata(isSel ? null : ap.iata)}
                          />
                          <text
                            x={x + cellW / 2}
                            y={y + rowH - 4.5}
                            fill={active ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.22)'}
                            fontSize={cellW > 20 ? 8.5 : 7}
                            textAnchor="middle"
                            pointerEvents="none"
                            fontWeight="600"
                          >
                            {ap.iata}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 leading-tight">
            A opacidade representa a densidade do ego-network de cada aeroporto.
          </span>
        </div>

        {/* Chart 3: Execution Time Benchmark */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col h-80">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">|V| × Tempo de Execução (ms)</h3>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#101827" />
                <XAxis type="number" dataKey="V" name="Nós (|V|)" stroke="#475569" fontSize={9} tickLine={false} domain={[0, 200]} />
                <YAxis type="number" dataKey="ms" name="Tempo (ms)" stroke="#475569" fontSize={9} tickLine={false} />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '11px',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter name="BFS" data={PERF_DATA.filter(p => p.alg === 'BFS')} fill={ALG_COLORS.BFS} />
                <Scatter name="DFS" data={PERF_DATA.filter(p => p.alg === 'DFS')} fill={ALG_COLORS.DFS} />
                <Scatter name="Dijkstra" data={PERF_DATA.filter(p => p.alg === 'Dijkstra')} fill={ALG_COLORS.Dijkstra} />
                <Scatter name="Bell-Ford" data={PERF_DATA.filter(p => p.alg === 'Bellman-Ford')} fill={ALG_COLORS["Bellman-Ford"]} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 leading-tight">
            Pontos cheios medidos no catálogo Netflix; pontos abertos são estimativas do Aeroporto.
          </span>
        </div>
      </div>

      {/* Tabular data section */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-sky-400" />
            <h2 className="text-md font-bold text-slate-200">Resultados e Métricas Locais</h2>
          </div>
          {selectedIata && (
            <button
              onClick={() => setSelectedIata(null)}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              Limpar Destaque ({selectedIata})
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tabela detalhada com a centralidade de grau e a densidade ego-rede calculadas para cada aeroporto. Clique nos cabeçalhos para ordenar.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-900 mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <th className="p-3">Aeroporto (IATA)</th>
                <th className="p-3">Cidade</th>
                <th className="p-3">Região</th>
                <th className="p-3 cursor-pointer select-none hover:text-white transition-colors" onClick={() => toggleSort('grau')}>
                  <div className="flex items-center gap-1">
                    Centralidade de Grau
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="p-3 cursor-pointer select-none hover:text-white transition-colors" onClick={() => toggleSort('densidade')}>
                  <div className="flex items-center gap-1">
                    Densidade Ego Network
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50 text-slate-300">
              {sortedTableData.map((row) => {
                const isHighlighted = selectedIata === row.iata;
                const regColor = REGION_COLORS[row.regiao];
                return (
                  <tr
                    key={row.iata}
                    onClick={() => setSelectedIata(isHighlighted ? null : row.iata)}
                    className={`cursor-pointer transition-colors ${
                      isHighlighted
                        ? 'bg-purple-950/20 hover:bg-purple-950/30 border-l-2 border-purple-500'
                        : 'hover:bg-slate-900/35'
                    }`}
                  >
                    <td className="p-3 font-bold text-slate-200">{row.iata}</td>
                    <td className="p-3">{row.cidade}</td>
                    <td className="p-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] border"
                        style={{
                          borderColor: `${regColor}40`,
                          backgroundColor: `${regColor}10`,
                          color: regColor,
                        }}
                      >
                        {row.regiao}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-sky-400">{row.grau}</td>
                    <td className="p-3 font-mono text-emerald-400">{row.densidade.toFixed(4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Custom Tooltip for SVG Ego Grid */}
      {hoveredAp && (
        <div
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
          className="fixed bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-2xl z-[9999] pointer-events-none flex flex-col gap-1 min-w-[160px]"
        >
          <div className="flex items-baseline justify-between gap-4">
            <b className="text-sm font-extrabold font-mono" style={{ color: REGION_COLORS[hoveredAp.regiao] }}>
              {hoveredAp.iata}
            </b>
            <span className="text-[9px] font-bold text-slate-500 uppercase">{hoveredAp.regiao}</span>
          </div>
          <div className="text-[10px] text-slate-300 font-semibold">{hoveredAp.name}</div>
          <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-800/60 pt-1">
            Ego-dens: <b className="text-slate-200 font-mono">{hoveredAp.ego.toFixed(4)}</b>
          </div>
          <div className="text-[10px] text-slate-400">
            Grau: <b className="text-slate-200 font-mono">{hoveredAp.grau}</b>
          </div>
        </div>
      )}
    </div>
  );
};
