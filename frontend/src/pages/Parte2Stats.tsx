import React, { useState, useMemo } from 'react';
import { ALL_NODES, ALL_EDGES } from '../data/netflixData';
import { RechartsDegreeDist } from '../components/RechartsDegreeDist';
import { RechartsBenchmark } from '../components/RechartsBenchmark';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ScatterChart, Scatter } from 'recharts';
import { Filter, BarChart3, Award, TrendingUp, Cpu, Table, ArrowUpDown } from 'lucide-react';

const COUNTRY_COLORS: Record<string, string> = {
  "USA": "#60a5fa",
  "UK": "#f472b6",
  "South Korea": "#34d399",
  "Brazil": "#fbbf24",
  "Germany": "#a855f7",
  "Canada": "#fb7185",
  "France": "#22d3ee",
  "Japan": "#f87171"
};

const getCountryColor = (paisStr: string) => {
  if (!paisStr || paisStr === '-') return '#94a3b8';
  const parts = paisStr.split(/[\/,]/);
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i].trim();
    if (COUNTRY_COLORS[p]) return COUNTRY_COLORS[p];
  }
  return '#94a3b8';
};

export const Parte2Stats: React.FC = () => {
  // Filters state
  const [selectedCountry, setSelectedCountry] = useState('Todos');
  const [minDegree, setMinDegree] = useState(0);
  const [minSimilarity, setMinSimilarity] = useState(1);

  // Sorting state for table
  const [sortField, setSortField] = useState<'label' | 'imdb' | 'ano' | 'actualDegree'>('actualDegree');
  const [sortAsc, setSortAsc] = useState(false);

  // Top countries count list from raw data
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

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return ALL_NODES.filter((n) => {
      // Country Filter
      let matchesCountry = selectedCountry === 'Todos';
      if (selectedCountry === 'Outros') {
        const isTopCountry = countries.some(c => n.pais.includes(c));
        matchesCountry = !isTopCountry && n.pais !== '-';
      } else if (!matchesCountry) {
        matchesCountry = n.pais.includes(selectedCountry);
      }

      // Min Degree Filter
      const matchesDegree = n.value >= minDegree;

      return matchesCountry && matchesDegree;
    });
  }, [selectedCountry, minDegree]);

  // Active node IDs
  const filteredNodeIds = useMemo(() => {
    return new Set(filteredNodes.map(n => n.id));
  }, [filteredNodes]);

  // Filtered Edges
  const filteredEdges = useMemo(() => {
    return ALL_EDGES.filter((e) => {
      const bothNodesVisible = filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to);
      const matchesSimilarity = e.width >= (minSimilarity === 1 ? 0 : minSimilarity === 2 ? 2.5 : minSimilarity === 3 ? 5 : 8);
      return bothNodesVisible && matchesSimilarity;
    });
  }, [filteredNodeIds, minSimilarity]);

  // Recalculating actual degrees inside the filtered sub-graph
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

  // 1. Degree Distribution Data
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

  // 2. IMDb vs Degree Data
  const scatterPlotData = useMemo(() => {
    return nodesWithActualDegrees
      .filter(n => n.imdb !== '-')
      .map(n => ({
        name: n.label,
        imdb: parseFloat(n.imdb),
        degree: n.actualDegree
      }));
  }, [nodesWithActualDegrees]);

  // 3. Country Distribution Data
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

  // Average IMDb
  const averageImdb = useMemo(() => {
    const rated = filteredNodes.filter(n => n.imdb !== '-');
    if (rated.length === 0) return 0;
    const sum = rated.reduce((acc, n) => acc + parseFloat(n.imdb), 0);
    return sum / rated.length;
  }, [filteredNodes]);

  // Sort Table Data
  const sortedTableData = useMemo(() => {
    const data = [...nodesWithActualDegrees];
    data.sort((a, b) => {
      const factor = sortAsc ? 1 : -1;
      if (sortField === 'label') {
        return a.label.localeCompare(b.label) * factor;
      } else if (sortField === 'imdb') {
        const aImdb = a.imdb === '-' ? 0 : parseFloat(a.imdb);
        const bImdb = b.imdb === '-' ? 0 : parseFloat(b.imdb);
        return (aImdb - bImdb) * factor;
      } else if (sortField === 'ano') {
        return (parseInt(a.ano) - parseInt(b.ano)) * factor;
      } else {
        return (a.actualDegree - b.actualDegree) * factor;
      }
    });
    return data;
  }, [nodesWithActualDegrees, sortField, sortAsc]);

  const toggleSort = (field: 'label' | 'imdb' | 'ano' | 'actualDegree') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-2 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Parte 2 — Estatísticas da Rede Netflix</h1>
        <p className="text-xs text-slate-400">
          Análise quantitativa de similaridade, notas IMDb e benchmarks de algoritmos.
        </p>
      </div>

      {/* Glassmorphic Filters Bar */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Country buttons */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-rose-400" />
            Filtrar por País
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCountry('Todos')}
              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-150 ${
                selectedCountry === 'Todos'
                  ? 'bg-rose-500/10 border-rose-500 text-slate-200'
                  : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5 bg-rose-400" />
              Todos
            </button>
            {countries.map((c) => {
              const active = selectedCountry === c;
              const color = COUNTRY_COLORS[c] || '#94a3b8';
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCountry(c)}
                  style={{
                    borderColor: active ? color : '#1e293b',
                    backgroundColor: active ? `${color}18` : 'transparent',
                    color: active ? '#f1f5f9' : '#64748b',
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-150"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {c} ({rawCountryCounts[c] || 0})
                </button>
              );
            })}
            <button
              onClick={() => setSelectedCountry('Outros')}
              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-150 ${
                selectedCountry === 'Outros'
                  ? 'bg-slate-800 border-slate-600 text-slate-200'
                  : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5 bg-slate-400" />
              Outros
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="flex-1 max-w-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Grau Mínimo</span>
            <span className="font-mono text-rose-400">≥ {minDegree}</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={minDegree}
            onChange={(e) => setMinDegree(Number(e.target.value))}
            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500 border border-slate-900"
          />
        </div>

        <div className="flex-1 max-w-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Força de Conexão Mínima</span>
            <span className="font-mono text-purple-400">
              {minSimilarity === 1 ? '1+ (Tudo)' : minSimilarity === 2 ? '2+ (Média)' : minSimilarity === 3 ? '3+ (Forte)' : '4+ (Exclusiva)'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={4}
            value={minSimilarity}
            onChange={(e) => setMinSimilarity(Number(e.target.value))}
            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500 border border-slate-900"
          />
        </div>

        {/* Global Summary Counts */}
        <div className="flex items-center gap-4 text-center shrink-0">
          <div className="bg-slate-950/50 border border-slate-900 px-3 py-2 rounded-xl">
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Shows Visíveis</span>
            <span className="text-base font-extrabold text-rose-400 font-mono leading-none">{filteredNodes.length}</span>
          </div>
          <div className="bg-slate-950/50 border border-slate-900 px-3 py-2 rounded-xl">
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Arestas</span>
            <span className="text-base font-extrabold text-purple-400 font-mono leading-none">{filteredEdges.length}</span>
          </div>
          <div className="bg-slate-950/50 border border-slate-900 px-3 py-2 rounded-xl">
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Média IMDb</span>
            <span className="text-base font-extrabold text-amber-400 font-mono leading-none">{averageImdb.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Degree Distribution */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col h-80">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Distribuição de Graus</h3>
          </div>
          
          <div className="flex-1 min-h-0">
            <RechartsDegreeDist data={degreeDistData} />
          </div>
          <span className="text-[9px] text-slate-500 mt-2 leading-tight">
            Frequência absoluta (Eixo Y) dos graus de centralidade do show (Eixo X).
          </span>
        </div>

        {/* Chart 2: IMDb vs Degree Scatter */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col h-80">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">IMDb × Grau (Conexões)</h3>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="imdb"
                  name="Nota IMDb"
                  domain={[4, 10]}
                  stroke="#64748b"
                  fontSize={9}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="degree"
                  name="Grau"
                  stroke="#64748b"
                  fontSize={9}
                  tickLine={false}
                />
                <Tooltip
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
                <Scatter name="Shows" data={scatterPlotData} fill="#f43f5e" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 leading-tight">
            Relação entre a nota crítica do show (IMDb) e sua quantidade de semelhanças (Grau).
          </span>
        </div>

        {/* Chart 3: Country Frequencies (Horizontal Bar Chart) */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col h-80">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Distribuição por País</h3>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={countryDistData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} width={75} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '11px',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  {countryDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCountryColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 leading-tight">
            Principais países de origem representados no subgrafo selecionado.
          </span>
        </div>
      </div>

      {/* Benchmark section */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          Benchmark de Algoritmos na Parte 2
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Comparação empírica de desempenho (tempo e consumo de memória) das implementações de BFS, DFS, Dijkstra e Bellman-Ford no grafo da Netflix.
        </p>
        <RechartsBenchmark />
      </div>

      {/* Tabular data section */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-sky-400" />
          <h2 className="text-md font-bold text-slate-200">Metadados e Resultados das Produções</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tabela dinâmica listando as produções ativas no subgrafo com suas respectivas notas, anos de lançamento e graus de centralidade. Clique nos cabeçalhos para ordenar.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-900 mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <th className="p-3 cursor-pointer select-none hover:text-white transition-colors" onClick={() => toggleSort('label')}>
                  <div className="flex items-center gap-1">
                    Show (Título)
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="p-3 cursor-pointer select-none hover:text-white transition-colors" onClick={() => toggleSort('ano')}>
                  <div className="flex items-center gap-1">
                    Ano
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="p-3 cursor-pointer select-none hover:text-white transition-colors" onClick={() => toggleSort('imdb')}>
                  <div className="flex items-center gap-1">
                    Nota IMDb
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="p-3">País</th>
                <th className="p-3 cursor-pointer select-none hover:text-white transition-colors" onClick={() => toggleSort('actualDegree')}>
                  <div className="flex items-center gap-1">
                    Grau (Subgrafo)
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/50 text-slate-300">
              {sortedTableData.map((row) => {
                const cColor = getCountryColor(row.pais);
                return (
                  <tr key={row.id} className="hover:bg-slate-900/35 transition-colors">
                    <td className="p-3 font-bold text-slate-200">{row.label}</td>
                    <td className="p-3">{row.ano}</td>
                    <td className="p-3 font-semibold text-amber-400">{row.imdb}</td>
                    <td className="p-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] border"
                        style={{
                          borderColor: `${cColor}40`,
                          backgroundColor: `${cColor}10`,
                          color: cColor,
                        }}
                      >
                        {row.pais}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-purple-400 font-bold">{row.actualDegree}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
