import React from 'react';
import { Plane, Film, Award, TrendingUp, Cpu, CheckCircle } from 'lucide-react';

interface DashboardGeneralProps {
  onNavigate: (tab: string) => void;
}

export const DashboardGeneral: React.FC<DashboardGeneralProps> = ({ onNavigate }) => {
  const stats = [
    {
      title: 'Aeroportos Processados',
      value: '20',
      change: '100% Cobertura Nacional',
      icon: Plane,
      color: 'from-sky-500 to-blue-600',
      bgColor: 'bg-sky-500/10'
    },
    {
      title: 'Rotas de Voos Ativas',
      value: '115',
      change: 'Adjacências Georreferenciadas',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Shows da Netflix',
      value: '182',
      change: 'Filtragem por Atributos',
      icon: Film,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-500/10'
    },
    {
      title: 'Relacionamentos de Similaridade',
      value: '615',
      change: 'Pesos por Atores/Gêneros',
      icon: Award,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="flex flex-col gap-8 py-2 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-2xl flex flex-col gap-4">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-950/50 border border-purple-800/30 px-3 py-1 rounded-full w-fit">
            Projeto de Teoria dos Grafos e AVD
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Análise e Otimização de <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-transparent">Estruturas de Rede</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Exploração interativa dos algoritmos fundamentais de grafos aplicados à malha aeroportuária nacional e à rede de similaridade de produções originais da Netflix.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => onNavigate('parte1')}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-sky-500/10"
            >
              Análise de Aeroportos
            </button>
            <button
              onClick={() => onNavigate('parte2')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-purple-500/10"
            >
              Análise Netflix
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card rounded-xl p-5 flex items-center justify-between transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stat.title}</span>
                <span className="text-3xl font-extrabold text-slate-100">{stat.value}</span>
                <span className="text-[10px] text-slate-400 mt-1">{stat.change}</span>
              </div>
              <div className={`p-3.5 rounded-xl ${stat.bgColor} bg-gradient-to-br`}>
                <Icon className="w-6 h-6 text-slate-200" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parte 1 details */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
              <Plane className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Parte 1 — Hubs e Conexões Aéreas</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Uma abordagem geográfica com visualização em mapa de Leaflet. Analisamos a centralidade de grau e a densidade ego dos aeroportos de capitais brasileiras, computando rotas otimizadas por meio de algoritmos de caminhos mínimos de ponto a ponto.
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
              Visualização de rotas com curvas Bezier e animação de fluxo.
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
              Tabela interativa de métricas de centralidade.
            </div>
          </div>
          <button
            onClick={() => onNavigate('parte1')}
            className="mt-4 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors text-left"
          >
            Acessar painel de aeroportos →
          </button>
        </div>

        {/* Parte 2 details */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Parte 2 — Recomendação Netflix</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Uma rede complexa dinâmica criada via vis.js. Shows são conectados se compartilham atores, diretores ou múltiplos gêneros. O subgrafo permite testar filtros de densidade, limites de força de conexão e conferir a distribuição de graus.
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-rose-400" />
              Renderização interativa 2D com física de corpos rígidos.
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-rose-400" />
              Benchmarks comparativos de BFS, DFS, Dijkstra e Bellman-Ford.
            </div>
          </div>
          <button
            onClick={() => onNavigate('parte2')}
            className="mt-4 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors text-left"
          >
            Acessar painel de recomendação →
          </button>
        </div>
      </div>

      {/* Algorithms Summary Row */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
        <h3 className="text-md font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          Implementação de Algoritmos sob Benchmark
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Nossa suíte de testes comparou o desempenho absoluto de algoritmos de busca e rotas. Dijkstra e Bellman-Ford foram utilizados para extrair a topologia de menores caminhos em cenários com e sem pesos negativos.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">BFS</span>
            <span className="text-sm font-semibold text-purple-400">0.14 ms</span>
            <span className="text-[9px] text-slate-500 block">Busca em Largura</span>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">DFS</span>
            <span className="text-sm font-semibold text-sky-400">0.28 ms</span>
            <span className="text-[9px] text-slate-500 block">Busca em Profundidade</span>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Dijkstra</span>
            <span className="text-sm font-semibold text-emerald-400">0.48 ms</span>
            <span className="text-[9px] text-slate-500 block">Menor Caminho O(V²)</span>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Bellman-Ford</span>
            <span className="text-sm font-semibold text-amber-400">1.17 ms</span>
            <span className="text-[9px] text-slate-500 block">Com Pesos Negativos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
