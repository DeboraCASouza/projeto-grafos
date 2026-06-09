import React, { useState, useMemo } from 'react';
import { Eye, Layers, GitBranch, Info } from 'lucide-react';
import { AIRPORT_COORDS } from '../data/airportsCoords';
import { AIRPORTS_METADATA, AIRPORTS_EDGES } from '../data/airportsData';

const REGION_COLORS: Record<string, string> = {
  Norte: '#7C3AED',
  Nordeste: '#A855F7',
  Sudeste: '#D946EF',
  Sul: '#F472B6',
  'Centro-Oeste': '#FB7185',
};

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
  {
    name: 'Similaridade',
    color: '#A855F7',
    icon: '🎨',
    desc: 'Cor única por região — o olho agrupa aeroportos sem esforço consciente (pré-atentivo).',
  },
  {
    name: 'Região Comum',
    color: '#34D399',
    icon: '🔲',
    desc: 'Áreas tracejadas semi-transparentes envolvem cada cluster regional sem linhas duras.',
  },
  {
    name: 'Conectividade',
    color: '#60A5FA',
    icon: '〰',
    desc: 'Espessura ∝ média dos graus dos nós conectados. Hubs geram linhas visualmente mais grossas.',
  },
  {
    name: 'Figura-Fundo',
    color: '#F59E0B',
    icon: '⊙',
    desc: 'Tamanho dos nós ∝ grau. Hubs nacionais (GRU, BSB, GIG, CNF) dominam o campo visual.',
  },
];

const HUB_GROUPS = [
  { label: 'Hubs Nacionais', range: '≥ 17', iatas: ['GRU', 'BSB', 'GIG', 'CNF'], color: '#D946EF' },
  { label: 'Hubs Regionais', range: 'topo/região', iatas: ['REC', 'SSA', 'MAO', 'CGH', 'POA'], color: '#A855F7' },
  { label: 'Conectores', range: '6–11', iatas: ['FOR', 'NAT', 'VIX', 'CWB', 'FLN', 'BEL', 'JPA', 'GYN', 'PVH'], color: '#7C3AED' },
  { label: 'Periféricos', range: '≤ 5', iatas: ['THE', 'RBR'], color: '#6D28D9' },
];

export const Parte1Gestalt: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeRegs, setActiveRegs] = useState<Set<string>>(new Set(Object.keys(REGION_COLORS)));
  const [showRegions, setShowRegions] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const toggleReg = (reg: string) => {
    setActiveRegs((prev) => {
      const n = new Set(prev);
      if (n.has(reg)) { if (n.size > 1) n.delete(reg); }
      else n.add(reg);
      return n;
    });
  };

  const regionBounds = useMemo(() => {
    const res: Record<string, { x: number; y: number; w: number; h: number }> = {};
    for (const reg of Object.keys(REGION_COLORS)) {
      const iatas = Object.entries(AIRPORTS_METADATA).filter(([, m]) => m.regiao === reg).map(([id]) => id);
      const xs = iatas.map((id) => NODE_POS[id]?.x ?? 0);
      const ys = iatas.map((id) => NODE_POS[id]?.y ?? 0);
      const pad = 14;
      res[reg] = {
        x: Math.min(...xs) - pad,
        y: Math.min(...ys) - pad,
        w: Math.max(...xs) - Math.min(...xs) + 2 * pad,
        h: Math.max(...ys) - Math.min(...ys) + 2 * pad,
      };
    }
    return res;
  }, []);

  const hoveredMeta = hovered ? AIRPORTS_METADATA[hovered] : null;
  const hoveredCoord = hovered ? AIRPORT_COORDS[hovered] : null;

  return (
    <div className="flex flex-col gap-6 py-2 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Parte 1 — Gestalt & Hierarquia Visual</h1>
        <p className="text-xs text-slate-400 mt-1">
          Rede aérea projetada em coordenadas geográficas reais aplicando os quatro princípios Gestalt exigidos pelo projeto.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* SVG Graph */}
        <div className="glass-card rounded-2xl border border-slate-800 p-4 flex-1">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {Object.entries(REGION_COLORS).map(([reg, color]) => (
              <button
                key={reg}
                onClick={() => toggleReg(reg)}
                style={{
                  borderColor: activeRegs.has(reg) ? color : '#1e293b',
                  backgroundColor: activeRegs.has(reg) ? `${color}20` : 'transparent',
                  color: activeRegs.has(reg) ? '#f1f5f9' : '#475569',
                }}
                className="px-2 py-1 rounded-md border text-[10px] font-bold transition-all duration-150"
              >
                <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ backgroundColor: color }} />
                {reg}
              </button>
            ))}
            <div className="ml-auto flex gap-1.5">
              {([['Áreas', showRegions, setShowRegions, '#34D399'], ['Arestas', showEdges, setShowEdges, '#60A5FA'], ['Labels', showLabels, setShowLabels, '#F59E0B']] as const).map(
                ([label, state, setter, color]) => (
                  <button
                    key={label as string}
                    onClick={() => (setter as any)(!state)}
                    className="px-2 py-1 rounded-md border text-[10px] font-bold transition-all duration-150"
                    style={{
                      borderColor: state ? color as string : '#1e293b',
                      backgroundColor: state ? `${color as string}18` : 'transparent',
                      color: state ? '#f1f5f9' : '#475569',
                    }}
                  >
                    {label as string}
                  </button>
                )
              )}
            </div>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ maxHeight: 480 }}
            className="rounded-xl bg-slate-950/60 border border-slate-900/50"
          >
            {/* Common Region — áreas coloridas por região */}
            {showRegions &&
              Object.entries(regionBounds).map(([reg, b]) => {
                if (!activeRegs.has(reg)) return null;
                const color = REGION_COLORS[reg];
                return (
                  <rect
                    key={reg}
                    x={b.x} y={b.y} width={b.w} height={b.h}
                    fill={color} fillOpacity={0.06}
                    stroke={color} strokeOpacity={0.3} strokeWidth={1.5}
                    rx={10} strokeDasharray="5 3"
                  />
                );
              })}

            {/* Region labels */}
            {showRegions &&
              Object.entries(regionBounds).map(([reg, b]) => {
                if (!activeRegs.has(reg)) return null;
                return (
                  <text
                    key={`label-${reg}`}
                    x={b.x + 6} y={b.y + 12}
                    fill={REGION_COLORS[reg]} fillOpacity={0.5}
                    fontSize={7} fontWeight="800" letterSpacing="0.05em"
                    pointerEvents="none"
                  >
                    {reg.toUpperCase()}
                  </text>
                );
              })}

            {/* Edges — Conectividade: espessura ∝ média dos graus */}
            {showEdges &&
              AIRPORTS_EDGES.map((edge, i) => {
                const p1 = NODE_POS[edge.source];
                const p2 = NODE_POS[edge.target];
                if (!p1 || !p2) return null;
                const m1 = AIRPORTS_METADATA[edge.source];
                const m2 = AIRPORTS_METADATA[edge.target];
                if (!m1 || !m2) return null;
                const bothActive = activeRegs.has(m1.regiao) && activeRegs.has(m2.regiao);
                if (!activeRegs.has(m1.regiao) && !activeRegs.has(m2.regiao)) return null;
                const avgDeg = (m1.grau + m2.grau) / 2 / MAX_DEG;
                const isHovEdge = hovered === edge.source || hovered === edge.target;
                return (
                  <line
                    key={i}
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke={isHovEdge ? '#ffffff' : 'rgba(148,163,184,0.22)'}
                    strokeWidth={isHovEdge ? 2 : 0.5 + avgDeg * 2.8}
                    strokeOpacity={bothActive ? (isHovEdge ? 1 : 0.55) : 0.1}
                  />
                );
              })}

            {/* Nodes — Similaridade (cor) + Figura-Fundo (tamanho) */}
            {Object.entries(AIRPORTS_METADATA).map(([iata, meta]) => {
              const pos = NODE_POS[iata];
              if (!pos || !activeRegs.has(meta.regiao)) return null;
              const r = 3.5 + (meta.grau / MAX_DEG) * 10.5;
              const color = REGION_COLORS[meta.regiao];
              const isHov = hovered === iata;
              const isHub = meta.grau >= 17;
              return (
                <g key={iata} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(iata)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {isHub && (
                    <circle cx={pos.x} cy={pos.y} r={r + 4}
                      fill={color} fillOpacity={0.12}
                      stroke={color} strokeOpacity={0.35} strokeWidth={1}
                    />
                  )}
                  {isHov && (
                    <circle cx={pos.x} cy={pos.y} r={r + 7}
                      fill={color} fillOpacity={0.18}
                    />
                  )}
                  <circle
                    cx={pos.x} cy={pos.y} r={r}
                    fill={color} fillOpacity={isHov ? 1 : 0.88}
                    stroke={isHov ? '#ffffff' : color}
                    strokeWidth={isHov ? 1.5 : 0}
                  />
                  {showLabels && (meta.grau >= 13 || isHov) && (
                    <text
                      x={pos.x} y={pos.y - r - 3}
                      fill={isHov ? '#ffffff' : color}
                      fontSize={isHov ? 9 : 7.5}
                      textAnchor="middle" fontWeight="700"
                      pointerEvents="none" fillOpacity={isHov ? 1 : 0.85}
                    >
                      {iata}
                    </text>
                  )}
                  {showLabels && meta.grau < 13 && !isHov && (
                    <text
                      x={pos.x} y={pos.y - r - 2}
                      fill={color} fontSize={6.5}
                      textAnchor="middle" fontWeight="600"
                      pointerEvents="none" fillOpacity={0.6}
                    >
                      {iata}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover info */}
          {hovered && hoveredMeta && hoveredCoord ? (
            <div className="mt-3 flex items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs">
              <span className="font-extrabold text-xl font-mono" style={{ color: REGION_COLORS[hoveredMeta.regiao] }}>
                {hovered}
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-200">{hoveredCoord.name}</span>
                <span className="text-slate-400">{hoveredMeta.regiao}</span>
              </div>
              <div className="ml-auto flex gap-5 text-center">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Grau</span>
                  <span className="font-bold text-sky-400 text-base">{hoveredMeta.grau}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Dens. Ego</span>
                  <span className="font-bold text-emerald-400 text-base">{hoveredMeta.densidade.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Lat / Lng</span>
                  <span className="font-mono text-slate-300 text-xs">
                    {AIRPORT_COORDS[hovered].lat.toFixed(2)}, {AIRPORT_COORDS[hovered].lng.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-[10px] text-slate-600 text-center">Passe o mouse sobre um nó para ver os detalhes.</p>
          )}
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 w-full xl:w-72 shrink-0">
          {/* Principles */}
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

          {/* Hub hierarchy — Proximity */}
          <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Lei da Proximidade — Hubs
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Aeroportos agrupados por centralidade de grau, seguindo a hierarquia visual:
            </p>
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
          <div>
            <span className="text-slate-200 font-semibold block mb-1">Canal visual usado</span>
            A espessura das arestas encoda a distância euclidiana entre aeroportos, projetada como
            percentual do maior grau médio do par. É um canal <em>pré-atentivo</em>: o olho percebe sem
            contar pixels.
          </div>
          <div>
            <span className="text-slate-200 font-semibold block mb-1">Por que este mapeamento?</span>
            Distância física correlaciona com custo operacional (combustível, tempo de voo). Usar
            espessura de aresta torna esse custo imediatamente legível sem necessidade de legenda
            numérica — reduz carga cognitiva.
          </div>
          <div>
            <span className="text-slate-200 font-semibold block mb-1">Alternativas consideradas</span>
            Cor de aresta (hue) foi descartada por conflito com a cor de região dos nós. Opacidade
            foi descartada por perda de contraste em fundo escuro. Espessura foi a mais clara
            perceptualmente.
          </div>
        </div>
      </div>

      {/* Interactivity note */}
      <div className="flex items-start gap-3 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Interatividade UX:</strong> Filtros de região aplicam-se em tempo real ao grafo e recalculam a opacidade das arestas inter-regionais.
          Hover nos nós revela métricas locais (grau, densidade ego, coordenadas). Os botões
          <em> Áreas</em>, <em>Arestas</em> e <em>Labels</em> permitem isolamento de cada canal visual para análise individual de cada princípio Gestalt.
        </p>
      </div>
    </div>
  );
};
