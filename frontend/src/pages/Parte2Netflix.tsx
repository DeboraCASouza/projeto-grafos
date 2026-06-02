import React, { useState, useMemo } from 'react';
import { ALL_NODES, ALL_EDGES } from '../data/netflixData';
import type { NetflixNode } from '../data/netflixData';
import { NetflixNetwork } from '../components/NetflixNetwork';
import { RechartsDegreeDist } from '../components/RechartsDegreeDist';
import { RechartsBenchmark } from '../components/RechartsBenchmark';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter } from 'recharts';
import { Filter, BarChart3 } from 'lucide-react';

export const Parte2Netflix: React.FC = () => {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Todos');
  const [minDegree, setMinDegree] = useState(0);
  const [minSimilarity, setMinSimilarity] = useState(1);
  const [selectedNode, setSelectedNode] = useState<NetflixNode | null>(null);

  // Active chart tab
  const [chartTab, setChartTab] = useState<'degree' | 'imdb' | 'country' | 'benchmark'>('degree');

  // Country counts & top countries from raw data
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

  const topCountriesList = useMemo(() => {
    return Object.keys(rawCountryCounts)
      .sort((a, b) => rawCountryCounts[b] - rawCountryCounts[a])
      .slice(0, 6);
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
        const isTopCountry = topCountriesList.some(c => n.pais.includes(c));
        matchesCountry = !isTopCountry && n.pais !== '-';
      } else if (!matchesCountry) {
        matchesCountry = n.pais.includes(selectedCountry);
      }

      // 3. Min Degree
      const matchesDegree = n.value >= minDegree;

      return matchesSearch && matchesCountry && matchesDegree;
    });
  }, [searchQuery, selectedCountry, minDegree, topCountriesList]);

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

  // Re-calculate actual degrees inside the filtered subgraph
  const nodesWithActualDegrees = useMemo(() => {
    const degreeCounts: Record<string, number> = {};
    filteredEdges.forEach((e) => {
      degreeCounts[e.from] = (degreeCounts[e.from] || 0) + 1;
      degreeCounts[e.to] = (degreeCounts[e.to] || 0) + 1;
    });

    return filteredNodes.map((n) => ({
      ...n,
      actualDegree: degreeCounts[n.id] || 0
    }));
  }, [filteredNodes, filteredEdges]);

  // Charts Pre-calculations
  // 1. Degree Dist Data
  const degreeDistData = useMemo(() => {
    const counts: Record<number, number> = {};
    nodesWithActualDegrees.forEach((n) => {
      counts[n.actualDegree] = (counts[n.actualDegree] || 0) + 1;
    });

    return Object.keys(counts).map((deg) => ({
      degree: Number(deg),
      count: counts[Number(deg)]
    }));
  }, [nodesWithActualDegrees]);

  // 2. Scatter plot Data (IMDb vs Degree)
  const scatterPlotData = useMemo(() => {
    return nodesWithActualDegrees
      .filter(n => n.imdb !== '-')
      .map(n => ({
        name: n.label,
        imdb: parseFloat(n.imdb),
        degree: n.actualDegree
      }));
  }, [nodesWithActualDegrees]);

  // 3. Filtered Country Distribution Data
  const countryDistData = useMemo(() => {
    const counts: Record<string, number> = {};
    nodesWithActualDegrees.forEach((n) => {
      if (n.pais && n.pais !== '-') {
        const parts = n.pais.split(/[\/,]/);
        parts.forEach((p) => {
          const trimmed = p.trim();
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        });
      }
    });

    return Object.keys(counts)
      .map(c => ({ name: c, count: counts[c] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [nodesWithActualDegrees]);

  // Statistics summaries
  const averageImdb = useMemo(() => {
    const rated = filteredNodes.filter(n => n.imdb !== '-');
    if (rated.length === 0) return 0;
    const sum = rated.reduce((acc, n) => acc + parseFloat(n.imdb), 0);
    return sum / rated.length;
  }, [filteredNodes]);

  return (
    <div className="flex flex-col gap-6 py-2 animate-fade-in">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Parte 2 — Rede de Semelhanças Netflix</h1>
        <p className="text-xs text-slate-400">
          Mapeamento relacional de programas originais baseado em conexões de diretores, atores e gêneros.
        </p>
      </div>

      {/* Main Grid: Filters + Vis Network Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Filter Panel */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Filter className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-200">Painel de Controle</h3>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Busca por Título</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: Stranger Things..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Min Degree Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-400 font-semibold uppercase tracking-wider">Grau Mínimo: {minDegree}</label>
              <span className="text-[10px] text-slate-500">Conexões no grafo geral</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={minDegree}
              onChange={(e) => setMinDegree(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Similarity threshold */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-400 font-semibold uppercase tracking-wider">Força de Conexão Mínima</label>
              <span className="text-[10px] font-mono text-purple-400 font-semibold">
                {minSimilarity === 1 ? '1+ (Tudo)' : minSimilarity === 2 ? '2+ (Média)' : minSimilarity === 3 ? '3+ (Forte)' : '4+ (Exclusiva)'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              value={minSimilarity}
              onChange={(e) => setMinSimilarity(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Country Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Filtrar por País</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCountry('Todos')}
                className={`py-1.5 px-2.5 rounded-lg text-[10px] font-bold border transition-all ${
                  selectedCountry === 'Todos'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                }`}
              >
                Todos
              </button>
              {topCountriesList.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCountry(c)}
                  className={`py-1.5 px-2.5 rounded-lg text-[10px] font-bold border transition-all ${
                    selectedCountry === c
                      ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                      : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
              <button
                onClick={() => setSelectedCountry('Outros')}
                className={`py-1.5 px-2.5 rounded-lg text-[10px] font-bold border transition-all ${
                  selectedCountry === 'Outros'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                }`}
              >
                Outros
              </button>
            </div>
          </div>

          {/* Subgraph Quick Stats */}
          <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Shows</span>
              <span className="text-sm font-extrabold text-white">{filteredNodes.length}</span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Arestas</span>
              <span className="text-sm font-extrabold text-white">{filteredEdges.length}</span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Méd. IMDb</span>
              <span className="text-sm font-extrabold text-amber-400">{averageImdb.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Vis Network Container */}
        <div className="lg:col-span-8">
          <NetflixNetwork
            nodes={filteredNodes}
            edges={filteredEdges}
            onSelectNode={setSelectedNode}
            selectedNode={selectedNode}
          />
        </div>
      </div>

      {/* Bottom Section: Charts Panel */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h2 className="text-md font-bold text-slate-200">Estatísticas e Análise do Subgrafo</h2>
          </div>
          <div className="flex bg-slate-950 border border-slate-900 rounded-lg p-1 w-fit">
            {[
              { id: 'degree', label: 'Distribuição de Graus' },
              { id: 'imdb', label: 'IMDb vs Grau' },
              { id: 'country', label: 'Top Países' },
              { id: 'benchmark', label: 'Benchmark Algoritmos' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setChartTab(t.id as any)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                  chartTab === t.id
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Chart rendering */}
        <div className="mt-2 min-h-[300px] flex items-center justify-center">
          {chartTab === 'degree' && (
            <div className="w-full">
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Este gráfico mostra a quantidade de shows (Eixo Y) com um determinado número de conexões de semelhança (Eixo X). Permite observar se o subgrafo atual se aproxima de uma distribuição de lei de potência típica de redes de escala livre.
              </p>
              <RechartsDegreeDist data={degreeDistData} />
            </div>
          )}

          {chartTab === 'imdb' && (
            <div className="w-full">
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Gráfico de dispersão correlacionando a nota IMDb do show com o seu grau de similaridade no subgrafo atual.
              </p>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      type="number"
                      dataKey="imdb"
                      name="Nota IMDb"
                      domain={[4, 10]}
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      type="number"
                      dataKey="degree"
                      name="Grau"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                        fontSize: '12px',
                        fontFamily: 'Outfit, sans-serif'
                      }}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Scatter name="Shows" data={scatterPlotData} fill="#f43f5e" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {chartTab === 'country' && (
            <div className="w-full">
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Distribuição das produções filtradas pelos países de origem mais recorrentes no catálogo selecionado.
              </p>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                        fontSize: '12px',
                        fontFamily: 'Outfit, sans-serif'
                      }}
                    />
                    <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {chartTab === 'benchmark' && (
            <div className="w-full">
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                Comparação de desempenho dos algoritmos de busca e caminho mínimo implementados sob a estrutura de dados de listas de adjacência na Parte 2 do projeto.
              </p>
              <RechartsBenchmark />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
