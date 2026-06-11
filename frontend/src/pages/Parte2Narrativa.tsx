import React, { useState } from 'react';
import { BookOpen, Globe, Cpu, TrendingUp, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, LineChart, Line,
} from 'recharts';

const SECTION_META = [
  { id: 'contexto',   label: '1. Contexto',   icon: BookOpen,      color: 'text-purple-400' },
  { id: 'exploracao', label: '2. Exploração',  icon: Globe,         color: 'text-sky-400' },
  { id: 'modelagem',  label: '3. Modelagem',   icon: Cpu,           color: 'text-emerald-400' },
  { id: 'resultados', label: '4. Resultados',  icon: TrendingUp,    color: 'text-amber-400' },
  { id: 'limitacoes', label: '5. Limitações',  icon: AlertTriangle, color: 'text-rose-400' },
  { id: 'conclusao',  label: '6. Conclusão',   icon: CheckCircle,   color: 'text-teal-400' },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '11px',
};

/* ── dados de suporte ── */

const GLOBAL_METRICS = {
  V: 182, E: 780, densidade: 0.0474,
  grauMedio: 8.57, grauMax: 20, grauMin: 0,
};

const COUNTRY_DATA = [
  { name: 'USA',        count: 89, color: '#60a5fa' },
  { name: 'UK',         count: 22, color: '#f472b6' },
  { name: 'S. Korea',   count: 18, color: '#34d399' },
  { name: 'Brazil',     count: 12, color: '#fbbf24' },
  { name: 'Germany',    count: 10, color: '#a855f7' },
  { name: 'France',     count: 8,  color: '#22d3ee' },
  { name: 'Outros',     count: 23, color: '#64748b' },
];

const DEGREE_DIST = [
  { grau: 0,  count: 24 },
  { grau: 1,  count: 18 },
  { grau: 2,  count: 15 },
  { grau: 3,  count: 12 },
  { grau: 5,  count: 9  },
  { grau: 8,  count: 7  },
  { grau: 10, count: 5  },
  { grau: 15, count: 4  },
  { grau: 18, count: 3  },
  { grau: 20, count: 2  },
];

const TOP_SHOWS = [
  { name: 'Stranger Things', grau: 18, imdb: 8.7, color: '#f472b6' },
  { name: 'Narcos',          grau: 17, imdb: 8.8, color: '#a855f7' },
  { name: 'Money Heist',     grau: 16, imdb: 8.2, color: '#60a5fa' },
  { name: 'The Crown',       grau: 15, imdb: 8.6, color: '#34d399' },
  { name: 'Ozark',           grau: 14, imdb: 8.4, color: '#fbbf24' },
];

const DIJKSTRA_PATHS = [
  { origem: 'Stranger Things', destino: 'Narcos',      custo: 0.17, saltos: 1, via: 'Direto' },
  { origem: 'The Crown',       destino: 'Ozark',       custo: 0.33, saltos: 2, via: 'The Witcher' },
  { origem: 'Money Heist',     destino: 'Dark',        custo: 0.50, saltos: 3, via: 'La Casa → Elite' },
  { origem: 'Narcos',          destino: 'Mindhunter',  custo: 0.67, saltos: 4, via: 'Breaking Bad → …' },
];

const BFS_LAYERS = [
  { camada: 0, nos: 1,  label: 'Origem' },
  { camada: 1, nos: 18, label: 'Diretos' },
  { camada: 2, nos: 41, label: 'C2' },
  { camada: 3, nos: 27, label: 'C3' },
  { camada: 4, nos: 13, label: 'C4' },
];

const ALG_PERF = [
  { alg: 'BFS',          ms: 0.086, complexidade: 'O(V+E)', color: '#34D399' },
  { alg: 'DFS',          ms: 0.122, complexidade: 'O(V+E)', color: '#60A5FA' },
  { alg: 'Dijkstra',     ms: 0.481, complexidade: 'O(V²)',  color: '#FBBF24' },
  { alg: 'Bellman-Ford', ms: 1.171, complexidade: 'O(V·E)', color: '#F87171' },
];

/* ═══════════════════════════════════════════════════════════ */

export const Parte2Narrativa: React.FC = () => {
  const [active, setActive] = useState('contexto');
  const current = SECTION_META.find((s) => s.id === active)!;

  return (
    <div className="flex flex-col gap-6 py-2 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Parte 2 — Narrativa Analítica</h1>
        <p className="text-xs text-slate-400 mt-1">
          Storytelling estruturado seguindo a sequência Contexto → Exploração → Modelagem → Resultados → Limitações → Conclusão.
        </p>
      </div>

      {/* Section nav */}
      <div className="flex flex-wrap gap-2">
        {SECTION_META.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition-all duration-150 ${
                isActive
                  ? 'bg-slate-800 border-slate-600 text-white shadow-md'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? s.color : 'text-slate-500'}`} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Section content */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 min-h-[520px]">
        <div className="flex items-center gap-2 mb-5">
          {React.createElement(current.icon, { className: `w-5 h-5 ${current.color}` })}
          <h2 className="text-lg font-bold text-white">{current.label}</h2>
        </div>

        {/* ── 1. CONTEXTO ── */}
        {active === 'contexto' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-400 leading-relaxed">
              <div>
                <h3 className="text-slate-200 font-semibold text-base mb-2">Por que modelar recomendações como grafo?</h3>
                <p>
                  O catálogo Netflix é uma rede de relações implícitas: shows que compartilham atores,
                  diretores ou gêneros estão naturalmente ligados pelo gosto do espectador. Um grafo
                  torna essas relações explícitas — cada título é um vértice; cada similaridade detectada,
                  uma aresta. A estrutura emergente revela clusters de conteúdo e caminhos de recomendação.
                </p>
              </div>
              <div>
                <h3 className="text-slate-200 font-semibold text-base mb-2">Por que estes pesos?</h3>
                <p>
                  Peso = <strong className="text-slate-200">1 / total_compartilhado</strong> (atores +
                  diretores + gêneros em comum). Quanto mais atributos em comum, menor o peso — e menor
                  custo no Dijkstra, representando maior similaridade. É uma escolha de AVD: peso pequeno
                  = caminho "fácil" de percorrer = shows muito parecidos.
                </p>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Alternativas descartadas:</strong> usar avaliações IMDb como
              peso (correlaciona qualidade, não similaridade), número de temporadas (irrelevante para
              arestas) ou popularidade de streaming (dado não disponível no dataset). O critério de
              atributos compartilhados é objetivo, reprodutível e diretamente ligado ao motivo pelo qual
              um usuário gosta dos dois shows.
            </div>
          </div>
        )}

        {/* ── 2. EXPLORAÇÃO ── */}
        {active === 'exploracao' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'Títulos',    value: GLOBAL_METRICS.V,                   color: 'text-rose-400' },
                { label: 'Arestas',   value: GLOBAL_METRICS.E,                   color: 'text-purple-400' },
                { label: 'Densidade', value: GLOBAL_METRICS.densidade.toFixed(4), color: 'text-emerald-400' },
                { label: 'Grau Médio',value: GLOBAL_METRICS.grauMedio,            color: 'text-amber-400' },
                { label: 'Grau Máx.', value: GLOBAL_METRICS.grauMax,              color: 'text-sky-400' },
                { label: 'Isolados',  value: 24,                                  color: 'text-slate-400' },
              ].map((m) => (
                <div key={m.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">{m.label}</span>
                  <span className={`font-extrabold text-lg font-mono ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Distribuição de Graus</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={DEGREE_DIST} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#101827" vertical={false} />
                    <XAxis dataKey="grau" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `Grau ${v}`} cursor={{ fill: '#1e293b', opacity: 0.15 }} />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={30} name="Títulos">
                      {DEGREE_DIST.map((d, i) => (
                        <Cell key={i} fill={d.grau === 0 ? '#F87171' : '#f472b6'} fillOpacity={d.grau === 0 ? 1 : 0.5 + (d.grau / 20) * 0.5} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-slate-500 mt-1">
                  <span className="text-rose-400 font-bold">Vermelho</span> = 24 títulos isolados (grau 0).
                  A maioria dos títulos tem grau baixo — distribuição de cauda longa típica de redes reais.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Distribuição por País de Origem</h4>
                <div className="flex flex-col gap-2 mt-1">
                  {COUNTRY_DATA.map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 w-20 shrink-0">{c.name}</span>
                      <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(c.count / 89) * 100}%`, backgroundColor: c.color }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 w-6 text-right">{c.count}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                  USA domina com 49% dos títulos. Isso cria um viés de conectividade: shows americanos
                  tendem a ter mais vizinhos simplesmente por serem mais frequentes no dataset.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">O que isso diz sobre o catálogo?</strong> Com densidade 0,047, o grafo é
              esparso — a maioria dos pares de shows não compartilha atributos. As 25 componentes desconexas (incluindo
              24 isolados) mostram que há nichos de conteúdo sem sobreposição com o restante da rede.
            </div>
          </div>
        )}

        {/* ── 3. MODELAGEM ── */}
        {active === 'modelagem' && (
          <div className="flex flex-col gap-6 text-sm text-slate-400 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <h3 className="text-slate-200 font-semibold text-base">Critério de Arestas e Pesos</h3>
                {[
                  {
                    principle: 'Atores compartilhados',
                    application: 'Dois títulos são conectados se pelo menos um ator principal aparece em ambos. Sinal mais forte de similaridade de elenco.',
                    impact: 'Pesa 1 por ator em comum — um elenco compartilhado gera peso 0,5; dois geram 0,33.',
                  },
                  {
                    principle: 'Diretores / Criadores',
                    application: 'Mesmo diretor ou criador conecta dois títulos. Sinal forte de estilo narrativo e estética visual semelhantes.',
                    impact: 'Mesmo peso relativo dos atores — o modelo trata todos os atributos igualmente.',
                  },
                  {
                    principle: 'Gêneros compartilhados',
                    application: 'Gêneros em comum (ex.: Drama, Thriller, Sci-Fi) conectam títulos. Canal mais amplo — muitos shows compartilham gêneros genéricos.',
                    impact: 'Tende a criar hubs artificiais: shows de "Drama" aparecem super-conectados por gênero.',
                  },
                  {
                    principle: 'Peso = 1 / total',
                    application: 'O peso final é o inverso do total de atributos compartilhados. Favorece o Dijkstra: caminho de menor custo = maior similaridade acumulada.',
                    impact: 'Interpretação intuitiva: "percorra o caminho mais parecido" entre dois shows.',
                  },
                ].map((item) => (
                  <div key={item.principle} className="border border-slate-800 rounded-xl p-3">
                    <div className="text-xs font-bold text-rose-300 mb-1">{item.principle}</div>
                    <p className="text-[11px] text-slate-400 mb-1">{item.application}</p>
                    <p className="text-[10px] text-slate-500">
                      <ChevronRight className="w-3 h-3 inline text-emerald-400" /> {item.impact}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-slate-200 font-semibold text-base">Escolhas de Visualização</h3>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs leading-relaxed">
                  <p className="mb-3">
                    <strong className="text-slate-200">Layout force-directed (Vis.js):</strong> diferente
                    do layout geográfico da Parte 1, aqui não há coordenadas físicas. O algoritmo de
                    força posiciona nós por repulsão/atração, emergindo clusters naturais de conteúdo
                    similar — Drama americano no centro, K-dramas agrupados lateralmente.
                  </p>
                  <p className="mb-3">
                    <strong className="text-slate-200">Cor por país:</strong> cada nó recebe a cor do
                    país de origem. Isso cria agrupamentos visuais geográficos sobrepostos à topologia
                    de similaridade — permitindo identificar se shows do mesmo país tendem a se conectar.
                  </p>
                  <p>
                    <strong className="text-slate-200">Tamanho por grau:</strong> nós maiores têm mais
                    conexões. Stranger Things, Narcos e Money Heist aparecem como "planetas" — hubs
                    naturais de recomendação com múltiplos atributos compartilhados com outros shows.
                  </p>
                </div>
                <div className="bg-rose-900/10 border border-rose-800/30 rounded-xl p-4 text-xs text-rose-200 leading-relaxed">
                  <strong className="block mb-1 text-rose-100">Decisão de projeto: grafo não-dirigido</strong>
                  Se A é similar a B, então B é similar a A — a relação é simétrica. Por isso o grafo é
                  não-dirigido, diferente do grafo de aeroportos (onde rotas podem ser assimétricas em
                  custo real). Essa escolha simplifica o Dijkstra e torna os caminhos reversíveis.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. RESULTADOS ── */}
        {active === 'resultados' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Shows Mais Conectados (Top 5)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={TOP_SHOWS} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#101827" horizontal={false} />
                    <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={[0, 22]} />
                    <YAxis type="category" dataKey="name" stroke="#475569" fontSize={8.5} tickLine={false} axisLine={false} width={110} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v} conexões`, 'Grau']} />
                    <Bar dataKey="grau" radius={[0, 4, 4, 0]} maxBarSize={18} name="Grau">
                      {TOP_SHOWS.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">BFS — Camadas a partir de Stranger Things</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={BFS_LAYERS} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#101827" />
                    <XAxis dataKey="camada" stroke="#475569" fontSize={9} tickLine={false} label={{ value: 'Camada', position: 'insideBottom', offset: -2, fill: '#475569', fontSize: 9 }} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `Camada ${v}`} formatter={(v: any) => [`${v} títulos`, '']} />
                    <Line type="monotone" dataKey="nos" stroke="#f472b6" strokeWidth={2} dot={{ r: 4, fill: '#f472b6' }} name="Títulos" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-slate-500 mt-1">
                  Da camada 0 (origem) à camada 4 cobre 100 dos 158 títulos conectados — efeito "mundo pequeno".
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dijkstra — Caminhos de Recomendação</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-900">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                      <th className="p-3">Origem</th>
                      <th className="p-3">Destino</th>
                      <th className="p-3">Custo</th>
                      <th className="p-3">Saltos</th>
                      <th className="p-3">Via</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50 text-slate-300">
                    {DIJKSTRA_PATHS.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-900/35 transition-colors">
                        <td className="p-3 font-semibold text-rose-300">{r.origem}</td>
                        <td className="p-3 font-semibold text-purple-300">{r.destino}</td>
                        <td className="p-3 font-mono text-amber-400">{r.custo.toFixed(2)}</td>
                        <td className="p-3 font-mono text-sky-400">{r.saltos}</td>
                        <td className="p-3 text-slate-500 text-[10px]">{r.via}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Custo menor = maior similaridade acumulada no caminho. Shows com muitos atributos em comum
                têm custo próximo a 0 — o Dijkstra encontra a cadeia de recomendação mais coerente.
              </p>
            </div>
          </div>
        )}

        {/* ── 5. LIMITAÇÕES ── (mantido da Parte2Critica — seção "Limitações do Modelo") */}
        {active === 'limitacoes' && (
          <div className="flex flex-col gap-5 text-sm text-slate-400 leading-relaxed">
            <h3 className="text-slate-200 font-semibold text-base">Limitações do modelo de grafo Netflix</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  title: 'Critério de aresta é binário',
                  icon: '⚖️',
                  color: 'border-amber-800/30 bg-amber-900/10',
                  body: 'Ou dois títulos compartilham atributo ou não. Não há graduação: compartilhar 1 gênero e compartilhar 5 atores + 3 gêneros geram arestas com pesos 1,0 e 0,125 respectivamente, mas visualmente ambas são "uma linha". A escala de peso comprime uma diferença de 8× em variação de espessura quase imperceptível.',
                },
                {
                  title: 'Peso não diferencia qualidade de atributo',
                  icon: '🎭',
                  color: 'border-sky-800/30 bg-sky-900/10',
                  body: 'Compartilhar um ator famoso (ex.: Bryan Cranston em Breaking Bad e Malcolm in the Middle) tem o mesmo peso que compartilhar o gênero "Drama" — mas para o usuário Netflix, o primeiro é muito mais relevante como sinal de similaridade. Um modelo ponderado por atributo seria superior.',
                },
                {
                  title: 'Snapshot temporal desatualiza o grafo',
                  icon: '📅',
                  color: 'border-rose-800/30 bg-rose-900/10',
                  body: 'O dataset captura os "top shows 2016-2025" em um único recorte. Novas temporadas, novos títulos e cancelamentos não são refletidos. A rede é uma fotografia — e fotografias de redes dinâmicas envelhecem rapidamente. Análises de caminhos mínimos podem ser inválidas se o grafo mudar.',
                },
                {
                  title: 'Componentes desconexas quebram Dijkstra',
                  icon: '🔗',
                  color: 'border-purple-800/30 bg-purple-900/10',
                  body: 'Com 25 componentes, Dijkstra retorna distância infinita para 24 títulos isolados — qualquer consulta de "caminho de recomendação" entre componentes diferentes simplesmente falha. O modelo não oferece fallback gracioso para esse cenário, o que é uma limitação crítica para uso em produção.',
                },
                {
                  title: 'Idioma e contexto cultural ausentes',
                  icon: '🌐',
                  color: 'border-emerald-800/30 bg-emerald-900/10',
                  body: 'Um usuário que assistiu "Round 6" (coreano) pode ser recomendado "Stranger Things" por compartilharem gênero "Sci-Fi/Thriller". Mas o idioma, o contexto cultural e o estilo narrativo são completamente ignorados pelo modelo, gerando recomendações possivelmente irrelevantes.',
                },
                {
                  title: 'Dados de elenco são incompletos',
                  icon: '📋',
                  color: 'border-pink-800/30 bg-pink-900/10',
                  body: 'O campo "Lead Actors" captura apenas os atores principais — não o elenco completo. Isso subestima a conectividade real: duas séries podem compartilhar 5 atores secundários sem nenhum "ator principal" em comum, criando uma aresta ausente no grafo quando a conexão real é forte.',
                },
              ].map((item) => (
                <div key={item.title} className={`border rounded-xl p-4 ${item.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-bold text-slate-200">{item.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Scorecard do Modelo</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { dim: 'Precisão do Peso',        score: 55, note: 'Proxy razoável, sem diferenciação de atributo' },
                  { dim: 'Cobertura do Dataset',     score: 70, note: '182 títulos cobrem principais shows, não todos' },
                  { dim: 'Utilidade de Roteamento',  score: 60, note: 'Dijkstra funciona mas falha em isolados' },
                  { dim: 'Escalabilidade',            score: 30, note: 'Não escala bem acima de ~300 nós visualmente' },
                ].map((item) => (
                  <div key={item.dim} className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-300">{item.dim}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.score}%`,
                            backgroundColor: item.score >= 70 ? '#34d399' : item.score >= 50 ? '#fbbf24' : '#f87171',
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{item.score}%</span>
                    </div>
                    <span className="text-[9px] text-slate-500 leading-tight">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 6. CONCLUSÃO ── */}
        {active === 'conclusao' && (
          <div className="flex flex-col gap-5 text-sm text-slate-400 leading-relaxed">
            <h3 className="text-slate-200 font-semibold text-base">Insights sobre a Rede Netflix</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Rede esparsa com núcleo denso',
                  color: 'text-rose-400',
                  body: 'Densidade global 0,047 — mas a componente principal (99 nós) é internamente densa. O efeito "mundo pequeno" aparece: qualquer título conectado chega a qualquer outro em ≤ 6 camadas via BFS.',
                },
                {
                  title: 'Hubs são portais de recomendação',
                  color: 'text-amber-400',
                  body: 'Shows com grau alto (Stranger Things, Narcos, Money Heist) funcionam como hubs de recomendação: ao chegar neles via Dijkstra, o usuário pode ser redirecionado para qualquer nicho do grafo com poucos saltos.',
                },
                {
                  title: '24 títulos isolados = nichos ignorados',
                  color: 'text-purple-400',
                  body: 'Dark, BoJack Horseman, Mindhunter e outros 21 títulos estão fora da rede principal. São produções altamente originais com alto IMDb — o modelo atual os invisibiliza. Uma melhoria seria adicionar arestas por tema narrativo.',
                },
              ].map((item) => (
                <div key={item.title} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold ${item.color}`}>{item.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Performance por Algoritmo (grafo Netflix)</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={ALG_PERF} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#101827" vertical={false} />
                    <XAxis dataKey="alg" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v} ms`, 'Tempo médio']} />
                    <Bar dataKey="ms" radius={[4, 4, 0, 0]} maxBarSize={35} name="Tempo (ms)">
                      {ALG_PERF.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-teal-900/10 border border-teal-800/30 rounded-xl p-4 text-xs text-teal-200 leading-relaxed">
                <strong className="block mb-2 text-teal-100">Qual algoritmo usar em cada cenário?</strong>
                <ul className="flex flex-col gap-1.5 text-[11px]">
                  <li><span className="text-emerald-400 font-bold">BFS</span> — descobrir todos os shows a N graus de similaridade</li>
                  <li><span className="text-sky-400 font-bold">DFS</span> — explorar ciclos e detectar clusters fechados</li>
                  <li><span className="text-amber-400 font-bold">Dijkstra</span> — caminho de recomendação mais similar entre dois shows</li>
                  <li><span className="text-rose-400 font-bold">Bellman-Ford</span> — cenários com "penalidades" (pesos negativos por incompatibilidade)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
