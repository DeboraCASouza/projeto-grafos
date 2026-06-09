import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip,
  ResponsiveContainer, CartesianGrid, Cell, ScatterChart, Scatter,
} from 'recharts';
import { AIRPORTS_METADATA, AIRPORTS_EDGES } from '../data/airportsData';
import { AIRPORT_COORDS } from '../data/airportsCoords';
import {
  BarChart3, Grid, Cpu, Table, ArrowUpDown, Filter,
  Eye, Layers, GitBranch, Info,
} from 'lucide-react';

/* ─────────────────────────── shared constants ─────────────────────────── */

const REGION_COLORS: Record<string, string> = {
  Norte: '#7C3AED',
  Nordeste: '#A855F7',
  Sudeste: '#D946EF',
  Sul: '#F472B6',
  'Centro-Oeste': '#FB7185',
};

/* ─────────────────────── gestalt / SVG constants ──────────────────────── */

const W = 580, H = 500, M = 36;
const LNG_MIN = -72, LNG_MAX = -33, LAT_MAX = 4, LAT_MIN = -32;

function proj(lat: number, lng: number) {
  const x = M + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (W - 2 * M);
  const y = M + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (H - 2 * M);
  return { x, y };
}

const NODE_POS: Record<string, { x: number; y: number }> = Object.fromEntries(
  Object.entries(AIRPORT_COORDS).map(([iata, c]) => [iata, proj(c.lat, c.lng)])
);
const MAX_DEG = Math.max(...Object.values(AIRPORTS_METADATA).map((m) => m.grau));

const PRINCIPLES = [
  { name: 'Similaridade',   color: '#A855F7', icon: '🎨', desc: 'Cor única por região — o olho agrupa aeroportos sem esforço consciente (pré-atentivo).' },
  { name: 'Região Comum',   color: '#34D399', icon: '🔲', desc: 'Áreas tracejadas semi-transparentes envolvem cada cluster regional sem linhas duras.' },
  { name: 'Conectividade',  color: '#60A5FA', icon: '〰',  desc: 'Espessura ∝ média dos graus dos nós conectados. Hubs geram linhas visualmente mais grossas.' },
  { name: 'Figura-Fundo',   color: '#F59E0B', icon: '⊙',  desc: 'Tamanho dos nós ∝ grau. Hubs nacionais (GRU, BSB, GIG, CNF) dominam o campo visual.' },
];

const HUB_GROUPS = [
  { label: 'Hubs Nacionais', range: '≥ 17',  iatas: ['GRU', 'BSB', 'GIG', 'CNF'],            color: '#D946EF' },
  { label: 'Hubs Regionais', range: '11–16', iatas: ['REC', 'SSA', 'MAO', 'CGH', 'POA'],      color: '#A855F7' },
  { label: 'Conectores',     range: '6–10',  iatas: ['FOR', 'NAT', 'VIX', 'CWB', 'FLN', 'BEL'], color: '#7C3AED' },
  { label: 'Periféricos',    range: '≤ 5',   iatas: ['THE', 'RBR', 'PVH', 'JPA', 'GYN'],      color: '#6D28D9' },
];

/* ───────────────────────── stats-table constants ───────────────────────── */

const PERF_DATA = [
  { alg: 'BFS',          V: 20,  ms: 0.005,  real: false },
  { alg: 'DFS',          V: 20,  ms: 0.008,  real: false },
  { alg: 'Dijkstra',     V: 20,  ms: 0.020,  real: false },
  { alg: 'Bellman-Ford', V: 20,  ms: 0.050,  real: false },
  { alg: 'BFS',  V: 182, ms: 0.0859, real: true },
  { alg: 'BFS',  V: 182, ms: 0.0774, real: true },
  { alg: 'BFS',  V: 182, ms: 0.0739, real: true },
  { alg: 'DFS',  V: 182, ms: 0.1264, real: true },
  { alg: 'DFS',  V: 182, ms: 0.1185, real: true },
  { alg: 'DFS',  V: 182, ms: 0.1214, real: true },
  { alg: 'Dijkstra',     V: 182, ms: 0.4667, real: true },
  { alg: 'Dijkstra',     V: 182, ms: 0.1648, real: true },
  { alg: 'Dijkstra',     V: 182, ms: 0.4601, real: true },
  { alg: 'Dijkstra',     V: 182, ms: 0.2047, real: true },
  { alg: 'Dijkstra',     V: 182, ms: 0.5784, real: true },
  { alg: 'Bellman-Ford', V: 4,   ms: 0.0101, real: true },
  { alg: 'Bellman-Ford', V: 4,   ms: 0.0071, real: true },
  { alg: 'Bellman-Ford', V: 99,  ms: 0.9606, real: true },
];

const ALG_COLORS: Record<string, string> = {
  BFS: '#34D399',
  DFS: '#60A5FA',
  Dijkstra: '#FBBF24',
  'Bellman-Ford': '#F87171',
};

const REGION_AIRPORTS: Record<string, { iata: string; name: string; ego: number; grau: number }[]> = {
  Norte:         [{ iata: 'MAO', name: 'Manaus',        ego: 0.747253, grau: 13 }, { iata: 'BEL', name: 'Belém',         ego: 1.0,      grau: 9  }, { iata: 'PVH', name: 'Porto Velho',   ego: 0.952381, grau: 6  }, { iata: 'RBR', name: 'Rio Branco',    ego: 1.0,      grau: 5  }],
  Nordeste:      [{ iata: 'REC', name: 'Recife',        ego: 0.733333, grau: 15 }, { iata: 'SSA', name: 'Salvador',      ego: 0.758333, grau: 15 }, { iata: 'FOR', name: 'Fortaleza',     ego: 0.878788, grau: 11 }, { iata: 'NAT', name: 'Natal',         ego: 0.924242, grau: 11 }, { iata: 'JPA', name: 'João Pessoa',   ego: 1.0,      grau: 8  }, { iata: 'THE', name: 'Teresina',      ego: 1.0,      grau: 5  }],
  Sudeste:       [{ iata: 'GRU', name: 'São Paulo (GRU)', ego: 0.605263, grau: 19 }, { iata: 'CGH', name: 'São Paulo (CGH)', ego: 0.771429, grau: 14 }, { iata: 'GIG', name: 'Rio de Janeiro', ego: 0.686275, grau: 17 }, { iata: 'CNF', name: 'Belo Horizonte', ego: 0.605263, grau: 19 }, { iata: 'VIX', name: 'Vitória',       ego: 0.944444, grau: 8  }],
  Sul:           [{ iata: 'CWB', name: 'Curitiba',      ego: 0.933333, grau: 9  }, { iata: 'FLN', name: 'Florianópolis', ego: 0.888889, grau: 9  }, { iata: 'POA', name: 'Porto Alegre',  ego: 0.909091, grau: 10 }],
  'Centro-Oeste': [{ iata: 'BSB', name: 'Brasília',     ego: 0.605263, grau: 19 }, { iata: 'GYN', name: 'Goiânia',      ego: 0.972222, grau: 8  }],
};

/* ══════════════════════════════ COMPONENT ══════════════════════════════ */

export const Parte1Stats: React.FC = () => {
  /* ── stats filters ── */
  const [activeRegs, setActiveRegs] = useState<Set<string>>(
    new Set(['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'])
  );
  const [minDegree, setMinDegree] = useState(0);
  const [selectedIata, setSelectedIata] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'grau' | 'densidade'>('grau');
  const [sortAsc, setSortAsc] = useState(false);

  /* ── gestalt state ── */
  const [gHovered, setGHovered] = useState<string | null>(null);
  const [gActiveRegs, setGActiveRegs] = useState<Set<string>>(new Set(Object.keys(REGION_COLORS)));
  const [showRegions, setShowRegions] = useState(true);
  const [showEdges, setShowEdges]   = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  /* ── ego-grid tooltip ── */
  const [hoveredAp, setHoveredAp] = useState<{ iata: string; name: string; ego: number; grau: number; regiao: string } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const regions = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'];

  /* ── toggles ── */
  const toggleRegion = (reg: string) => {
    const n = new Set(activeRegs);
    if (n.has(reg)) { if (n.size === 1) return; n.delete(reg); }
    else n.add(reg);
    setActiveRegs(n);
    if (selectedIata && AIRPORTS_METADATA[selectedIata] && !n.has(AIRPORTS_METADATA[selectedIata].regiao))
      setSelectedIata(null);
  };

  const toggleGReg = (reg: string) => {
    setGActiveRegs((prev) => {
      const n = new Set(prev);
      if (n.has(reg)) { if (n.size > 1) n.delete(reg); }
      else n.add(reg);
      return n;
    });
  };

  /* ── gestalt bounds ── */
  const regionBounds = useMemo(() => {
    const res: Record<string, { x: number; y: number; w: number; h: number }> = {};
    for (const reg of Object.keys(REGION_COLORS)) {
      const iatas = Object.entries(AIRPORTS_METADATA).filter(([, m]) => m.regiao === reg).map(([id]) => id);
      const xs = iatas.map((id) => NODE_POS[id]?.x ?? 0);
      const ys = iatas.map((id) => NODE_POS[id]?.y ?? 0);
      const pad = 14;
      res[reg] = { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, w: Math.max(...xs) - Math.min(...xs) + 2 * pad, h: Math.max(...ys) - Math.min(...ys) + 2 * pad };
    }
    return res;
  }, []);

  const gHovMeta  = gHovered ? AIRPORTS_METADATA[gHovered] : null;
  const gHovCoord = gHovered ? AIRPORT_COORDS[gHovered]    : null;

  /* ── stats derived data ── */
  const isVis = (_iata: string, grau: number, regiao: string) =>
    activeRegs.has(regiao) && grau >= minDegree;

  const visibleAirports = useMemo(() =>
    Object.keys(AIRPORTS_METADATA)
      .filter((iata) => { const m = AIRPORTS_METADATA[iata]; return isVis(iata, m.grau, m.regiao); })
      .map((iata) => ({ iata, ...AIRPORTS_METADATA[iata] })),
    [activeRegs, minDegree]
  );

  const sortedTableData = useMemo(() => {
    const data = [...visibleAirports];
    data.sort((a, b) => {
      const f = sortAsc ? 1 : -1;
      return sortField === 'grau' ? (a.grau - b.grau) * f : (a.densidade - b.densidade) * f;
    });
    return data;
  }, [visibleAirports, sortField, sortAsc]);

  const toggleSort = (field: 'grau' | 'densidade') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const degreeDistData = useMemo(() => {
    const freq: Record<number, number> = {};
    visibleAirports.forEach((ap) => { freq[ap.grau] = (freq[ap.grau] || 0) + 1; });
    return Object.keys(freq).map(Number).sort((a, b) => a - b).map((d) => ({ degree: d, count: freq[d] }));
  }, [visibleAirports]);

  /* ── ego-grid SVG dimensions ── */
  const svgW = 450, svgH = 180, pl = 75, pr = 5, pt = 5, pb = 5;
  const cW = svgW - pl - pr, cH = svgH - pt - pb, rowH = cH / 5;

  const handleSvgMouseMove = (e: React.MouseEvent<SVGRectElement>, ap: any, reg: string) => {
    setTooltipPos({ x: e.clientX + 12, y: e.clientY - 42 });
    setHoveredAp({ ...ap, regiao: reg });
  };

  /* ══════════════ JSX ══════════════ */
  return (
    <div className="flex flex-col gap-6 py-2 animate-fade-in relative">

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Parte 1 — Estatísticas & Gestalt da Rede Aérea</h1>
        <p className="text-xs text-slate-400">
          Métricas quantitativas de centralidade e ego-redes combinadas com a visualização Gestalt da topologia da rede.
        </p>
      </div>

      {/* ── Filters Bar ── */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                <button key={reg} onClick={() => toggleRegion(reg)}
                  style={{ borderColor: isActive ? color : '#1e293b', backgroundColor: isActive ? `${color}18` : 'transparent', color: isActive ? '#f1f5f9' : '#64748b' }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-150"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {reg}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 max-w-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Grau de Conectividade Mínimo</span>
            <span className="font-mono text-purple-400">≥ {minDegree}</span>
          </div>
          <input type="range" min={0} max={19} value={minDegree}
            onChange={(e) => setMinDegree(Number(e.target.value))}
            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500 border border-slate-900"
          />
        </div>

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

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Degree Distribution */}
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
                <ChartTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '11px' }} cursor={{ fill: '#1e293b', opacity: 0.15 }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={30}>
                  {degreeDistData.map((entry, index) => {
                    const t = (entry.degree - 5) / (19 - 5);
                    const color = t < 0.4 ? '#7C3AEDcc' : t < 0.75 ? '#A855F7cc' : '#D946EFcc';
                    const isHighlighted = selectedIata && AIRPORTS_METADATA[selectedIata]?.grau === entry.degree;
                    return <Cell key={`cell-${index}`} fill={isHighlighted ? '#ffffff' : color} stroke={isHighlighted ? '#ffffff' : 'transparent'} strokeWidth={isHighlighted ? 2 : 0} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 leading-tight">Frequência absoluta (Eixo Y) dos graus de centralidade (Eixo X).</span>
        </div>

        {/* Ego-density Grid */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col h-80">
          <div className="flex items-center gap-2 mb-3">
            <Grid className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Densidade Ego-Rede por Aeroporto</h3>
          </div>
          <div className="flex-1 min-h-0 bg-slate-950/40 border border-slate-900/50 rounded-xl p-2 flex items-center justify-center relative">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height="100%" preserveAspectRatio="none" className="w-full h-full">
              {regions.map((reg, ri) => {
                const airports = REGION_AIRPORTS[reg] || [];
                const col = REGION_COLORS[reg];
                const regActive = activeRegs.has(reg);
                const y = pt + ri * rowH;
                const cellW = Math.max(2, Math.floor(cW / airports.length) - 1.5);
                return (
                  <g key={reg}>
                    <text x={pl - 8} y={y + rowH / 2 + 3.5} fill={regActive ? col : '#334155'} fontSize="9" textAnchor="end" fontWeight="700">{reg}</text>
                    {airports.map((ap, ci) => {
                      const x = pl + ci * (cW / airports.length);
                      const active = regActive && ap.grau >= minDegree;
                      const opacity = active ? 0.14 + ap.ego * 0.86 : 0.07;
                      const isSel = selectedIata === ap.iata;
                      return (
                        <g key={ap.iata} className="group">
                          <rect x={x} y={y} width={cellW} height={rowH - 1.5} fill={col} opacity={opacity} rx="2.5"
                            stroke={isSel ? '#ffffff' : 'transparent'} strokeWidth={isSel ? 1.5 : 0}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => handleSvgMouseMove(e, ap, reg)}
                            onMouseMove={(e) => handleSvgMouseMove(e, ap, reg)}
                            onMouseLeave={() => setHoveredAp(null)}
                            onClick={() => setSelectedIata(isSel ? null : ap.iata)}
                          />
                          <text x={x + cellW / 2} y={y + rowH - 4.5} fill={active ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.22)'} fontSize={cellW > 20 ? 8.5 : 7} textAnchor="middle" pointerEvents="none" fontWeight="600">{ap.iata}</text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 leading-tight">A opacidade representa a densidade do ego-network de cada aeroporto.</span>
        </div>

        {/* Execution Time Scatter */}
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
                <ChartTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f1f5f9', fontSize: '11px' }} cursor={{ strokeDasharray: '3 3' }} />
                {(['BFS', 'DFS', 'Dijkstra', 'Bellman-Ford'] as const).map((alg) => (
                  <Scatter key={alg} name={alg} data={PERF_DATA.filter((p) => p.alg === alg)} fill={ALG_COLORS[alg]} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 leading-tight">Pontos medidos no catálogo Netflix; estimativas para o grafo de Aeroportos.</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
           GESTALT & HIERARQUIA VISUAL
          ════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 pt-2">
        <Eye className="w-4 h-4 text-violet-400 shrink-0" />
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Gestalt & Hierarquia Visual</h2>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* SVG Graph */}
        <div className="glass-card rounded-2xl border border-slate-800 p-4 flex-1">
          {/* Gestalt controls */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {Object.entries(REGION_COLORS).map(([reg, color]) => (
              <button key={reg} onClick={() => toggleGReg(reg)}
                style={{ borderColor: gActiveRegs.has(reg) ? color : '#1e293b', backgroundColor: gActiveRegs.has(reg) ? `${color}20` : 'transparent', color: gActiveRegs.has(reg) ? '#f1f5f9' : '#475569' }}
                className="px-2 py-1 rounded-md border text-[10px] font-bold transition-all duration-150"
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ backgroundColor: color }} />
                {reg}
              </button>
            ))}
            <div className="ml-auto flex gap-1.5">
              {([['Áreas', showRegions, setShowRegions, '#34D399'], ['Arestas', showEdges, setShowEdges, '#60A5FA'], ['Labels', showLabels, setShowLabels, '#F59E0B']] as const).map(
                ([label, state, setter, color]) => (
                  <button key={label as string} onClick={() => (setter as any)(!state)}
                    className="px-2 py-1 rounded-md border text-[10px] font-bold transition-all duration-150"
                    style={{ borderColor: state ? color as string : '#1e293b', backgroundColor: state ? `${color as string}18` : 'transparent', color: state ? '#f1f5f9' : '#475569' }}
                  >
                    {label as string}
                  </button>
                )
              )}
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: 480 }} className="rounded-xl bg-slate-950/60 border border-slate-900/50">
            {/* Common Region areas */}
            {showRegions && Object.entries(regionBounds).map(([reg, b]) => {
              if (!gActiveRegs.has(reg)) return null;
              const color = REGION_COLORS[reg];
              return <rect key={reg} x={b.x} y={b.y} width={b.w} height={b.h} fill={color} fillOpacity={0.06} stroke={color} strokeOpacity={0.3} strokeWidth={1.5} rx={10} strokeDasharray="5 3" />;
            })}

            {/* Region labels */}
            {showRegions && Object.entries(regionBounds).map(([reg, b]) => {
              if (!gActiveRegs.has(reg)) return null;
              return <text key={`lbl-${reg}`} x={b.x + 6} y={b.y + 12} fill={REGION_COLORS[reg]} fillOpacity={0.5} fontSize={7} fontWeight="800" letterSpacing="0.05em" pointerEvents="none">{reg.toUpperCase()}</text>;
            })}

            {/* Edges — Conectividade */}
            {showEdges && AIRPORTS_EDGES.map((edge, i) => {
              const p1 = NODE_POS[edge.source], p2 = NODE_POS[edge.target];
              if (!p1 || !p2) return null;
              const m1 = AIRPORTS_METADATA[edge.source], m2 = AIRPORTS_METADATA[edge.target];
              if (!m1 || !m2) return null;
              if (!gActiveRegs.has(m1.regiao) && !gActiveRegs.has(m2.regiao)) return null;
              const bothActive = gActiveRegs.has(m1.regiao) && gActiveRegs.has(m2.regiao);
              const avgDeg = (m1.grau + m2.grau) / 2 / MAX_DEG;
              const isHovEdge = gHovered === edge.source || gHovered === edge.target;
              return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={isHovEdge ? '#ffffff' : 'rgba(148,163,184,0.22)'} strokeWidth={isHovEdge ? 2 : 0.5 + avgDeg * 2.8} strokeOpacity={bothActive ? (isHovEdge ? 1 : 0.55) : 0.1} />;
            })}

            {/* Nodes — Similaridade + Figura-Fundo */}
            {Object.entries(AIRPORTS_METADATA).map(([iata, meta]) => {
              const pos = NODE_POS[iata];
              if (!pos || !gActiveRegs.has(meta.regiao)) return null;
              const r = 3.5 + (meta.grau / MAX_DEG) * 10.5;
              const color = REGION_COLORS[meta.regiao];
              const isHov = gHovered === iata;
              const isHub = meta.grau >= 17;
              return (
                <g key={iata} style={{ cursor: 'pointer' }} onMouseEnter={() => setGHovered(iata)} onMouseLeave={() => setGHovered(null)}>
                  {isHub && <circle cx={pos.x} cy={pos.y} r={r + 4} fill={color} fillOpacity={0.12} stroke={color} strokeOpacity={0.35} strokeWidth={1} />}
                  {isHov && <circle cx={pos.x} cy={pos.y} r={r + 7} fill={color} fillOpacity={0.18} />}
                  <circle cx={pos.x} cy={pos.y} r={r} fill={color} fillOpacity={isHov ? 1 : 0.88} stroke={isHov ? '#ffffff' : color} strokeWidth={isHov ? 1.5 : 0} />
                  {showLabels && (meta.grau >= 13 || isHov) && (
                    <text x={pos.x} y={pos.y - r - 3} fill={isHov ? '#ffffff' : color} fontSize={isHov ? 9 : 7.5} textAnchor="middle" fontWeight="700" pointerEvents="none" fillOpacity={isHov ? 1 : 0.85}>{iata}</text>
                  )}
                  {showLabels && meta.grau < 13 && !isHov && (
                    <text x={pos.x} y={pos.y - r - 2} fill={color} fontSize={6.5} textAnchor="middle" fontWeight="600" pointerEvents="none" fillOpacity={0.6}>{iata}</text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip */}
          {gHovered && gHovMeta && gHovCoord ? (
            <div className="mt-3 flex items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs">
              <span className="font-extrabold text-xl font-mono" style={{ color: REGION_COLORS[gHovMeta.regiao] }}>{gHovered}</span>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-200">{gHovCoord.name}</span>
                <span className="text-slate-400">{gHovMeta.regiao}</span>
              </div>
              <div className="ml-auto flex gap-5 text-center">
                <div><span className="text-[9px] text-slate-500 block uppercase tracking-wider">Grau</span><span className="font-bold text-sky-400 text-base">{gHovMeta.grau}</span></div>
                <div><span className="text-[9px] text-slate-500 block uppercase tracking-wider">Dens. Ego</span><span className="font-bold text-emerald-400 text-base">{gHovMeta.densidade.toFixed(3)}</span></div>
                <div><span className="text-[9px] text-slate-500 block uppercase tracking-wider">Lat / Lng</span><span className="font-mono text-slate-300 text-xs">{gHovCoord.lat.toFixed(2)}, {gHovCoord.lng.toFixed(2)}</span></div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[10px] text-slate-600 text-center">Passe o mouse sobre um nó para ver os detalhes.</p>
          )}
        </div>

        {/* Right panel — principles + hub groups */}
        <div className="flex flex-col gap-4 w-full xl:w-72 shrink-0">
          <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              Princípios Gestalt Aplicados
            </h3>
            {PRINCIPLES.map((p) => (
              <div key={p.name} className="flex gap-3 items-start">
                <span className="text-base shrink-0 mt-0.5">{p.icon}</span>
                <div>
                  <div className="text-[11px] font-bold mb-0.5" style={{ color: p.color }}>{p.name}</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Lei da Proximidade — Hubs
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">Aeroportos agrupados por centralidade de grau:</p>
            {HUB_GROUPS.map((g) => (
              <div key={g.label} className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor: g.color }} />
                <div>
                  <span className="text-[10px] font-bold text-slate-200">{g.label} </span>
                  <span className="text-[10px] text-slate-500">(grau {g.range})</span>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5 leading-relaxed">{g.iatas.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AVD weight note */}
      <div className="glass-card rounded-2xl border border-slate-800 p-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-rose-400" />
          Pesos como Variável de AVD — Custo Cognitivo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-400 leading-relaxed">
          <div><span className="text-slate-200 font-semibold block mb-1">Canal visual usado</span>Espessura das arestas encoda a distância euclidiana entre aeroportos como percentual do maior grau médio do par. Canal <em>pré-atentivo</em>: o olho percebe sem contar pixels.</div>
          <div><span className="text-slate-200 font-semibold block mb-1">Por que este mapeamento?</span>Distância física correlaciona com custo operacional. Espessura torna esse custo imediatamente legível sem legenda numérica — reduz carga cognitiva.</div>
          <div><span className="text-slate-200 font-semibold block mb-1">Alternativas consideradas</span>Cor de aresta foi descartada (conflito com cor de região). Opacidade foi descartada (perda de contraste). Espessura foi a mais clara perceptualmente.</div>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Interatividade UX:</strong> Os filtros de região e os botões Áreas / Arestas / Labels isolam cada canal visual individualmente, permitindo analisar cada princípio Gestalt sem ruído dos demais.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════
           RESULTADOS E MÉTRICAS GLOBAIS (tabela)
          ════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 pt-2">
        <Table className="w-4 h-4 text-sky-400 shrink-0" />
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Resultados e Métricas Globais</h2>
        <div className="flex-1 h-px bg-slate-800" />
        {selectedIata && (
          <button onClick={() => setSelectedIata(null)} className="text-xs text-rose-400 hover:underline font-semibold shrink-0">
            Limpar Destaque ({selectedIata})
          </button>
        )}
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
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
                  <div className="flex items-center gap-1">Centralidade de Grau<ArrowUpDown className="w-3 h-3 text-slate-500" /></div>
                </th>
                <th className="p-3 cursor-pointer select-none hover:text-white transition-colors" onClick={() => toggleSort('densidade')}>
                  <div className="flex items-center gap-1">Densidade Ego Network<ArrowUpDown className="w-3 h-3 text-slate-500" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50 text-slate-300">
              {sortedTableData.map((row) => {
                const isHighlighted = selectedIata === row.iata;
                const regColor = REGION_COLORS[row.regiao];
                return (
                  <tr key={row.iata} onClick={() => setSelectedIata(isHighlighted ? null : row.iata)}
                    className={`cursor-pointer transition-colors ${isHighlighted ? 'bg-purple-950/20 hover:bg-purple-950/30 border-l-2 border-purple-500' : 'hover:bg-slate-900/35'}`}
                  >
                    <td className="p-3 font-bold text-slate-200">{row.iata}</td>
                    <td className="p-3">{row.cidade}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] border" style={{ borderColor: `${regColor}40`, backgroundColor: `${regColor}10`, color: regColor }}>{row.regiao}</span>
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

      {/* Floating ego-grid tooltip */}
      {hoveredAp && (
        <div style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          className="fixed bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-2xl z-[9999] pointer-events-none flex flex-col gap-1 min-w-[160px]"
        >
          <div className="flex items-baseline justify-between gap-4">
            <b className="text-sm font-extrabold font-mono" style={{ color: REGION_COLORS[hoveredAp.regiao] }}>{hoveredAp.iata}</b>
            <span className="text-[9px] font-bold text-slate-500 uppercase">{hoveredAp.regiao}</span>
          </div>
          <div className="text-[10px] text-slate-300 font-semibold">{hoveredAp.name}</div>
          <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-800/60 pt-1">
            Ego-dens: <b className="text-slate-200 font-mono">{hoveredAp.ego.toFixed(4)}</b>
          </div>
          <div className="text-[10px] text-slate-400">Grau: <b className="text-slate-200 font-mono">{hoveredAp.grau}</b></div>
        </div>
      )}
    </div>
  );
};
