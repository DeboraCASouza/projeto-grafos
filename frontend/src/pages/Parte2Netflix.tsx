import React, { useState, useMemo } from 'react';
import { ALL_NODES, ALL_EDGES } from '../data/netflixData';
import type { NetflixNode } from '../data/netflixData';
import { NetflixNetwork } from '../components/NetflixNetwork';
import { Search, ArrowLeft } from 'lucide-react';

interface Parte2NetflixProps {
  onBack: () => void;
}

export const Parte2Netflix: React.FC<Parte2NetflixProps> = ({ onBack }) => {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Todos');
  const [minDegree, setMinDegree] = useState(0);
  const [minSimilarity, setMinSimilarity] = useState(1);
  const [selectedNode, setSelectedNode] = useState<NetflixNode | null>(null);

  // Country counts from raw data for counts in the buttons
  const rawCountryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ALL_NODES.forEach((n) => {
      if (n.pais && n.pais !== '-') {
        const parts = n.pais.split(/[\/,]/);
        parts.forEach((p) => {
          const trimmed = p.trim();
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        });
      }
    });
    return counts;
  }, []);

  const countries = ['USA', 'UK', 'South Korea', 'Spain', 'France', 'Germany'];

  // Country Options array for the sidebar
  const countryOptions = useMemo(() => {
    return [
      { id: 'Todos', label: 'Todos os Países', color: '#cba6f7' },
      { id: 'USA', label: `USA (${rawCountryCounts['USA'] || 0})`, color: '#60a5fa' },
      { id: 'UK', label: `UK (${rawCountryCounts['UK'] || 0})`, color: '#f472b6' },
      { id: 'South Korea', label: `South Korea (${rawCountryCounts['South Korea'] || 0})`, color: '#34d399' },
      { id: 'Spain', label: `Spain (${rawCountryCounts['Spain'] || 0})`, color: '#94a3b8' },
      { id: 'France', label: `France (${rawCountryCounts['France'] || 0})`, color: '#22d3ee' },
      { id: 'Germany', label: `Germany (${rawCountryCounts['Germany'] || 0})`, color: '#a855f7' },
      { id: 'Outros', label: 'Outros países', color: '#64748b' }
    ];
  }, [rawCountryCounts]);

  // Dynamic filtering of nodes and edges
  const filteredNodes = useMemo(() => {
    return ALL_NODES.filter((n) => {
      // 1. Search Query
      const matchesSearch = 
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Country
      let matchesCountry = selectedCountry === 'Todos';
      if (selectedCountry === 'Outros') {
        const isTopCountry = countries.some(c => n.pais.includes(c));
        matchesCountry = !isTopCountry && n.pais !== '-';
      } else if (!matchesCountry) {
        matchesCountry = n.pais.includes(selectedCountry);
      }

      // 3. Min Degree
      const matchesDegree = n.value >= minDegree;

      return matchesSearch && matchesCountry && matchesDegree;
    });
  }, [searchQuery, selectedCountry, minDegree]);

  // Keep track of active node IDs for filtering edges
  const filteredNodeIds = useMemo(() => {
    return new Set(filteredNodes.map(n => n.id));
  }, [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return ALL_EDGES.filter((e) => {
      const bothNodesVisible = filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to);
      const matchesSimilarity = e.width >= (minSimilarity === 1 ? 0 : minSimilarity === 2 ? 2.5 : minSimilarity === 3 ? 5 : 8);
      return bothNodesVisible && matchesSimilarity;
    });
  }, [filteredNodeIds, minSimilarity]);

  // Statistics summaries
  const averageImdb = useMemo(() => {
    const rated = filteredNodes.filter(n => n.imdb !== '-');
    if (rated.length === 0) return 0;
    const sum = rated.reduce((acc, n) => acc + parseFloat(n.imdb), 0);
    return sum / rated.length;
  }, [filteredNodes]);

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
            <p className="text-[10px] text-slate-500 font-medium">Recomendações Netflix · Parte 2</p>
          </div>
        </div>

        {/* Section: Search */}
        <div className="p-3.5 border-b border-slate-900 flex flex-col gap-2">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Busca por título</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o título do show..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2" />
          </div>
        </div>

        {/* Section: Country Filters */}
        <div className="p-3.5 border-b border-slate-900 flex flex-col gap-2">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Filtrar por País</label>
          <div className="flex flex-col gap-1">
            {countryOptions.map((opt) => {
              const isActive = selectedCountry === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedCountry(opt.id)}
                  style={{
                    borderColor: isActive ? `${opt.color}40` : 'transparent',
                    backgroundColor: isActive ? `${opt.color}08` : 'transparent',
                  }}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                    isActive ? 'text-slate-200' : 'text-slate-500 hover:bg-slate-900/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                  <span className="text-[11px] font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Degree Filter */}
        <div className="p-3.5 border-b border-slate-900 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Filtrar por Grau Mínimo</span>
            <span className="font-mono text-rose-400 font-bold">Grau ≥ {minDegree}</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={minDegree}
            onChange={(e) => setMinDegree(Number(e.target.value))}
            className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>

        {/* Section: Connection Strength Filter */}
        <div className="p-3.5 border-b border-slate-900 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Força de Conexão Mínima</span>
            <span className="font-mono text-purple-400 font-bold">
              {minSimilarity === 1 ? '1+ (Tudo)' : minSimilarity === 2 ? '2+ (Média)' : minSimilarity === 3 ? '3+ (Forte)' : '4+ (Exclusiva)'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            value={minSimilarity}
            onChange={(e) => setMinSimilarity(Number(e.target.value))}
            className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Section: Selected Node Info */}
        <div className="p-3.5 border-b border-slate-900 flex flex-col gap-2">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Título Selecionado</label>
          <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2.5 min-h-[50px] flex flex-col gap-1.5 justify-center">
            {selectedNode ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span
                    className="text-xs font-extrabold font-mono leading-none text-rose-400"
                  >
                    {selectedNode.label}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase">
                    {selectedNode.ano}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-slate-300">
                  IMDb: <strong className="text-amber-400 font-mono">{selectedNode.imdb}</strong>
                </div>
                <div className="text-[10px] text-slate-500 border-t border-slate-900/40 pt-1.5 flex flex-col gap-1">
                  <div>País: <strong className="text-slate-300">{selectedNode.pais}</strong></div>
                  <div>Grau original: <strong className="text-slate-300">{selectedNode.value}</strong></div>
                </div>
              </>
            ) : (
              <span className="text-[10px] text-slate-600 italic text-center">Clique em um título no grafo</span>
            )}
          </div>
        </div>

        {/* Section: Subgraph Metrics */}
        <div className="p-3.5 flex flex-col gap-2">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Métricas do Subgrafo</label>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-base font-extrabold text-rose-400 font-mono leading-none">{filteredNodes.length}</span>
              <span className="text-[8.5px] text-slate-500 font-semibold mt-1">Shows (|V|)</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-900/80 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-base font-extrabold text-purple-400 font-mono leading-none">{filteredEdges.length}</span>
              <span className="text-[8.5px] text-slate-500 font-semibold mt-1">Arestas (|E|)</span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900 col-span-2 flex justify-between items-center px-3">
              <span className="text-[8.5px] text-slate-500 font-semibold">Média IMDb</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">{averageImdb.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 mt-auto text-[8.5px] text-slate-600 border-t border-slate-900/50 leading-relaxed font-semibold">
          Rede de Recomendação Netflix
          <br />
          182 shows · 615 arestas
        </div>
      </aside>

      {/* ── Main Map Area ── */}
      <main className="flex-grow flex flex-col relative min-w-0 bg-slate-950">
        <NetflixNetwork
          nodes={filteredNodes}
          edges={filteredEdges}
          onSelectNode={setSelectedNode}
          selectedNode={selectedNode}
        />
      </main>

    </div>
  );
};
