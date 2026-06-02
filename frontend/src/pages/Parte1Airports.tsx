import React, { useState, useMemo } from 'react';
import { LeafletMap } from '../components/LeafletMap';
import { AIRPORTS_METADATA } from '../data/airportsData';
import { Map, GitCommit, Search, ArrowLeft, Navigation } from 'lucide-react';

const REGION_COLORS: Record<string, string> = {
  "Norte": "#7C3AED",
  "Nordeste": "#A855F7",
  "Sudeste": "#D946EF",
  "Sul": "#F472B6",
  "Centro-Oeste": "#FB7185",
};

interface Parte1AirportsProps {
  onBack: () => void;
}

export const Parte1Airports: React.FC<Parte1AirportsProps> = ({ onBack }) => {
  // Page states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegs, setActiveRegs] = useState<Set<string>>(
    new Set(['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'])
  );
  const [minDegree, setMinDegree] = useState(0);
  const [selectedIata, setSelectedIata] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'complete' | 'shortest' | 'simulation'>('complete');

  // Regions list
  const regions = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'];

  // Toggle region filter
  const toggleRegion = (reg: string) => {
    const newRegs = new Set(activeRegs);
    if (newRegs.has(reg)) {
      if (newRegs.size === 1) return; // Prevent disabling all regions
      newRegs.delete(reg);
    } else {
      newRegs.add(reg);
    }
    setActiveRegs(newRegs);

    if (selectedIata) {
      const meta = AIRPORTS_METADATA[selectedIata];
      if (meta && !newRegs.has(meta.regiao)) {
        setSelectedIata(null);
      }
    }
  };

  // Handle search query changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toUpperCase();
    setSearchQuery(val);
    if (AIRPORTS_METADATA[val]) {
      const meta = AIRPORTS_METADATA[val];
      if (activeRegs.has(meta.regiao) && meta.grau >= minDegree) {
        setSelectedIata(val);
      }
    }
  };

  // Handle degree slider changes
  const handleDegreeChange = (val: number) => {
    setMinDegree(val);
    if (selectedIata) {
      const meta = AIRPORTS_METADATA[selectedIata];
      if (meta && meta.grau < val) {
        setSelectedIata(null);
      }
    }
  };

  // Get selected airport details
  const selectedInfo = useMemo(() => {
    if (!selectedIata) return null;
    return {
      iata: selectedIata,
      ...AIRPORTS_METADATA[selectedIata],
    };
  }, [selectedIata]);

  // Calculate visible airports count
  const visibleCount = useMemo(() => {
    return Object.keys(AIRPORTS_METADATA).filter((iata) => {
      const meta = AIRPORTS_METADATA[iata];
      return activeRegs.has(meta.regiao) && meta.grau >= minDegree;
    }).length;
  }, [activeRegs, minDegree]);

  return (
    <div className="flex h-screen w-screen overflow-hidden animate-fade-in">
      
      {/* ── Left Sidebar (284px) ── */}
      <aside className="w-[284px] shrink-0 bg-slate-950/85 backdrop-blur-md border-r border-slate-900 flex flex-col overflow-y-auto scrollbar-thin select-none">
        
        {/* Header with Back button */}
        <div className="p-4 border-b border-slate-900 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer transition-colors"
            title="Voltar para o Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">Dashboard Interativo</h1>
            <p className="text-[10px] text-slate-500 font-medium">Rede Aeroportuária Brasileira · Parte 1</p>
          </div>
        </div>

        {mapMode === 'shortest' ? (
          /* Shortest Path Tree Sidebar Content */
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-900 flex flex-col gap-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Árvore de Percurso</label>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Este subgrafo exibe exclusivamente os caminhos mínimos calculados via algoritmo de <strong>Dijkstra</strong> para os pares de aeroportos obrigatórios do projeto.
              </p>
            </div>

            <div className="p-4 border-b border-slate-900 flex flex-col gap-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Rotas Obrigatórias</span>
              
              {/* REC -> POA */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-purple-400">⭐ REC → POA</span>
                  <span className="text-[9.5px] text-slate-500 font-mono">Custo: 3.62h</span>
                </div>
                <div className="text-[10px] text-slate-300 font-medium">
                  Caminho: <strong className="font-mono text-purple-300">REC → POA</strong>
                </div>
              </div>

              {/* MAO -> GRU */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-pink-400">⭐ MAO → GRU</span>
                  <span className="text-[9.5px] text-slate-500 font-mono">Custo: 3.40h</span>
                </div>
                <div className="text-[10px] text-slate-300 font-medium">
                  Caminho: <strong className="font-mono text-pink-300">MAO → GRU</strong>
                </div>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Métricas do Subgrafo</label>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2 flex flex-col justify-between">
                  <span className="text-base font-extrabold text-purple-400 font-mono leading-none">4</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold mt-1">Aeroportos (|V|)</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2 flex flex-col justify-between">
                  <span className="text-base font-extrabold text-purple-400 font-mono leading-none">2</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold mt-1">Arestas (|E|)</span>
                </div>
              </div>
            </div>
          </div>
        ) : mapMode === 'simulation' ? (
          /* Route Simulation Sidebar Content */
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-slate-900 flex flex-col gap-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Simulador de Rotas</label>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Use a janela flutuante no canto inferior esquerdo do mapa para selecionar qualquer rota da malha aérea (obrigatórias e adicionais).
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                O simulador calculará e exibirá o caminho mínimo correspondente animado em curvas Bezier no mapa.
              </p>
            </div>
            
            <div className="p-4 flex flex-col gap-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Métricas da Rede</label>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2 flex flex-col justify-between">
                  <span className="text-base font-extrabold text-purple-400 font-mono leading-none">20</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold mt-1">Aeroportos (|V|)</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2 flex flex-col justify-between">
                  <span className="text-base font-extrabold text-purple-400 font-mono leading-none">115</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold mt-1">Conexões (|E|)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Complete Network Sidebar Content */
          <>
            {/* Section: Search */}
            <div className="p-3.5 border-b border-slate-900 flex flex-col gap-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Busca por IATA</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="ex: GRU, REC, MAO.."
                  maxLength={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors uppercase font-mono"
                />
                <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2" />
              </div>
              {searchQuery && (
                <div className="text-[10px] text-slate-500 leading-relaxed min-h-[20px]">
                  {AIRPORTS_METADATA[searchQuery] ? (
                    <span>
                      <strong style={{ color: REGION_COLORS[AIRPORTS_METADATA[searchQuery].regiao] }}>
                        {searchQuery}
                      </strong>{' '}
                      {AIRPORTS_METADATA[searchQuery].cidade} · grau {AIRPORTS_METADATA[searchQuery].grau}
                    </span>
                  ) : (
                    <span className="text-rose-500 font-medium">Não encontrado</span>
                  )}
                </div>
              )}
            </div>

            {/* Section: Region Filters */}
            <div className="p-3.5 border-b border-slate-900 flex flex-col gap-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Filtrar por Região</label>
              <div className="flex flex-col gap-1">
                {regions.map((reg) => {
                  const color = REGION_COLORS[reg];
                  const isActive = activeRegs.has(reg);
                  return (
                    <button
                      key={reg}
                      onClick={() => toggleRegion(reg)}
                      style={{
                        borderColor: isActive ? `${color}40` : 'transparent',
                        backgroundColor: isActive ? `${color}08` : 'transparent',
                      }}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                        isActive ? 'text-slate-200' : 'text-slate-500 hover:bg-slate-900/30'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[11px] font-semibold">{reg}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Degree Filter */}
            <div className="p-3.5 border-b border-slate-900 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Filtrar por Grau Mínimo</span>
                <span className="font-mono text-purple-400 font-bold">Grau ≥ {minDegree}</span>
              </div>
              <input
                type="range"
                min={0}
                max={19}
                value={minDegree}
                onChange={(e) => handleDegreeChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Section: Selected Airport Info */}
            <div className="p-3.5 border-b border-slate-900 flex flex-col gap-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Aeroporto Selecionado</label>
              <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2.5 min-h-[50px] flex flex-col gap-1.5 justify-center">
                {selectedInfo ? (
                  <>
                    <div className="flex items-baseline justify-between">
                      <span
                        className="text-base font-extrabold font-mono leading-none"
                        style={{ color: REGION_COLORS[selectedInfo.regiao] }}
                      >
                        {selectedInfo.iata}
                      </span>
                      <span className="text-[9px] font-semibold" style={{ color: REGION_COLORS[selectedInfo.regiao] }}>
                        {selectedInfo.regiao}
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-300">{selectedInfo.cidade}</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-500 mt-1 border-t border-slate-900/40 pt-1.5">
                      <div className="flex justify-between">
                        <span>Grau:</span>
                        <strong className="text-slate-300 font-mono">{selectedInfo.grau}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Ego-dens:</span>
                        <strong className="text-slate-300 font-mono">{selectedInfo.densidade.toFixed(4)}</strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-600 italic text-center">Clique em um aeroporto no mapa</span>
                )}
              </div>
            </div>

            {/* Section: Global Metrics */}
            <div className="p-3.5 flex flex-col gap-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Métricas Globais</label>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2 flex flex-col justify-between">
                  <span className="text-base font-extrabold text-purple-400 font-mono leading-none">20</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold mt-1">Aeroportos (|V|)</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2 flex flex-col justify-between">
                  <span className="text-base font-extrabold text-purple-400 font-mono leading-none">115</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold mt-1">Conexões (|E|)</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2 flex flex-col justify-between">
                  <span className="text-base font-extrabold text-purple-400 font-mono leading-none">0.605</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold mt-1">Densidade global</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2 flex flex-col justify-between">
                  <span className="text-base font-extrabold text-emerald-400 font-mono leading-none">{visibleCount}</span>
                  <span className="text-[8.5px] text-slate-500 font-semibold mt-1">Visíveis (filtro)</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sidebar Footer */}
        <div className="p-3 mt-auto text-[8.5px] text-slate-600 border-t border-slate-900/50 leading-relaxed font-semibold">
          Dijkstra · grafo não-dir. ponderado
          <br />
          20 aeroportos · 115 arestas · 5 regiões
        </div>
      </aside>

      {/* ── Main Map Area ── */}
      <main className="flex-grow flex flex-col relative min-w-0">
        
        {/* Toggle Mode Button Strip */}
        <div className="absolute top-4 right-4 z-[999] flex bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setMapMode('complete')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
              mapMode === 'complete'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3 h-3" />
            Rede Completa
          </button>
          <button
            onClick={() => setMapMode('shortest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
              mapMode === 'shortest'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCommit className="w-3 h-3" />
            Árvore de Percurso
          </button>
          <button
            onClick={() => setMapMode('simulation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
              mapMode === 'simulation'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3 h-3" />
            Simulador de Rotas
          </button>
        </div>

        {/* Leaflet Map Component */}
        <div className="flex-1 w-full h-full min-h-0 bg-slate-950">
          <LeafletMap
            viewMode={mapMode}
            searchQuery={searchQuery}
            activeRegs={activeRegs}
            minDegree={minDegree}
            selectedIata={selectedIata}
            onSelectIata={setSelectedIata}
          />
        </div>
      </main>

    </div>
  );
};
