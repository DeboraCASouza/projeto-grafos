import React, { useState } from 'react';
import { BookOpen, Globe, Cpu, TrendingUp, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { AIRPORTS_METADATA, AIRPORT_ROUTES } from '../data/airportsData';

const REGION_COLORS: Record<string, string> = {
  Norte: '#7C3AED',
  Nordeste: '#A855F7',
  Sudeste: '#D946EF',
  Sul: '#F472B6',
  'Centro-Oeste': '#FB7185',
};

const SECTION_META = [
  { id: 'contexto',    label: '1. Contexto',    icon: BookOpen,      color: 'text-purple-400' },
  { id: 'exploracao',  label: '2. Exploração',  icon: Globe,         color: 'text-sky-400' },
  { id: 'modelagem',   label: '3. Modelagem',   icon: Cpu,           color: 'text-emerald-400' },
  { id: 'resultados',  label: '4. Resultados',  icon: TrendingUp,    color: 'text-amber-400' },
  { id: 'limitacoes',  label: '5. Limitações',  icon: AlertTriangle, color: 'text-rose-400' },
  { id: 'conclusao',   label: '6. Conclusão',   icon: CheckCircle,   color: 'text-teal-400' },
];

const ROUTE_CHART_DATA = AIRPORT_ROUTES.map((r) => ({
  name: `${r.path[0]}→${r.path[r.path.length - 1]}`,
  custo: r.cost,
  saltos: r.path.length - 1,
  color: r.color,
}));

const GLOBAL_METRICS = {
  V: 20,
  E: 115,
  densidade: 0.6053,
  grauMedio: 11.5,
  grauMax: 19,
  grauMin: 5,
};

const REGION_DATA = [
  { regiao: 'Norte',        V: 4,  E: 4,  densidade: 0.667 },
  { regiao: 'Nordeste',     V: 6,  E: 11, densidade: 0.733 },
  { regiao: 'Sudeste',      V: 5,  E: 10, densidade: 1.000 },
  { regiao: 'Sul',          V: 3,  E: 3,  densidade: 1.000 },
  { regiao: 'Centro-Oeste', V: 2,  E: 1,  densidade: 1.000 },
];

const ALG_PERF = [
  { alg: 'BFS',          ms: 0.005,  complexidade: 'O(V+E)',  color: '#34D399' },
  { alg: 'DFS',          ms: 0.008,  complexidade: 'O(V+E)',  color: '#60A5FA' },
  { alg: 'Dijkstra',     ms: 0.020,  complexidade: 'O(V²)',   color: '#FBBF24' },
  { alg: 'Bellman-Ford', ms: 0.050,  complexidade: 'O(V·E)',  color: '#F87171' },
];

const DEGREE_GROUPS = Object.values(AIRPORTS_METADATA).reduce<Record<string, number>>(
  (acc, m) => {
    const key = m.grau >= 17 ? 'Hub Nacional' : m.grau >= 11 ? 'Hub Regional' : m.grau >= 6 ? 'Conector' : 'Periférico';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}
);
const DEGREE_GROUP_DATA = [
  { name: 'Hub Nacional', count: DEGREE_GROUPS['Hub Nacional'] || 0, color: '#D946EF' },
  { name: 'Hub Regional', count: DEGREE_GROUPS['Hub Regional'] || 0, color: '#A855F7' },
  { name: 'Conector',     count: DEGREE_GROUPS['Conector'] || 0,     color: '#7C3AED' },
  { name: 'Periférico',   count: DEGREE_GROUPS['Periférico'] || 0,   color: '#6D28D9' },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '11px',
};

export const Parte1Narrativa: React.FC = () => {
  const [active, setActive] = useState('contexto');
  const current = SECTION_META.find((s) => s.id === active)!;

  return (
    <div className="flex flex-col gap-6 py-2 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Parte 1 — Narrativa Analítica</h1>
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
                <h3 className="text-slate-200 font-semibold text-base mb-2">Por que modelar rotas aéreas como grafo?</h3>
                <p>
                  A malha aérea brasileira conecta regiões com diferenças culturais, econômicas e geográficas enormes.
                  Um grafo captura exatamente isso: cada aeroporto é um vértice; cada rota comercial regular, uma aresta.
                  A estrutura do grafo revela quais hubs são indispensáveis e onde a rede é vulnerável.
                </p>
              </div>
              <div>
                <h3 className="text-slate-200 font-semibold text-base mb-2">Por que estes pesos?</h3>
                <p>
                  O peso de cada aresta representa a <strong className="text-slate-200">distância euclidiana</strong> entre
                  aeroportos (calculada a partir das coordenadas lat/lng), normalizada em unidades de custo relativo.
                  Essa escolha é justificada por AVD: distância física é um canal visual intuitivo — o olho associa
                  aresta mais comprida a custo maior sem legenda numérica.
                </p>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Alternativas descartadas:</strong> usar capacidade de assentos (indisponível no dataset),
              frequência de voos (sujeita a sazonalidade), ou tempo médio de voo (redundante com distância). A distância
              euclidiana oferece reprodutibilidade e correlação direta com custo operacional real.
            </div>
          </div>
        )}

        {/* ── 2. EXPLORAÇÃO ── */}
        {active === 'exploracao' && (
          <div className="flex flex-col gap-6">
            {/* Global metrics */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'Vértices', value: GLOBAL_METRICS.V, color: 'text-purple-400' },
                { label: 'Arestas', value: GLOBAL_METRICS.E, color: 'text-sky-400' },
                { label: 'Densidade', value: GLOBAL_METRICS.densidade.toFixed(4), color: 'text-emerald-400' },
                { label: 'Grau Médio', value: GLOBAL_METRICS.grauMedio, color: 'text-amber-400' },
                { label: 'Grau Máx.', value: GLOBAL_METRICS.grauMax, color: 'text-rose-400' },
                { label: 'Grau Mín.', value: GLOBAL_METRICS.grauMin, color: 'text-teal-400' },
              ].map((m) => (
                <div key={m.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">{m.label}</span>
                  <span className={`font-extrabold text-lg font-mono ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Degree group chart */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Hierarquia de Hubs</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={DEGREE_GROUP_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#101827" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#1e293b', opacity: 0.15 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40} name="Aeroportos">
                      {DEGREE_GROUP_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Regional density */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Densidade por Região</h4>
                <div className="flex flex-col gap-2 mt-1">
                  {REGION_DATA.map((r) => (
                    <div key={r.regiao} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 w-28 shrink-0">{r.regiao}</span>
                      <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${r.densidade * 100}%`,
                            backgroundColor: REGION_COLORS[r.regiao],
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 w-12 text-right">{(r.densidade * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                  Sul e Centro-Oeste têm densidade 1,0 — todos os aeroportos da região se conectam entre si.
                  O Norte tem a menor densidade, refletindo a dispersão geográfica da Amazônia.
                </p>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">O que isso diz sobre o Brasil?</strong> A alta densidade global (0,605) significa que a malha é
              altamente conectada — quase qualquer aeroporto chega a qualquer outro em 2 saltos via os hubs nacionais (GRU, BSB, GIG, CNF).
              Isso cria eficiência mas também concentração de risco.
            </div>
          </div>
        )}

        {/* ── 3. MODELAGEM ── */}
        {active === 'modelagem' && (
          <div className="flex flex-col gap-6 text-sm text-slate-400 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <h3 className="text-slate-200 font-semibold text-base">Design do Grafo sob as Leis da Gestalt</h3>
                {[
                  {
                    principle: 'Similaridade',
                    application: 'Cor única por região (5 cores distintas). O sistema visual agrupa automaticamente aeroportos vizinhos por cor, sem necessidade de bordas explícitas.',
                    impact: 'Redução de carga cognitiva: identifica cluster regional em < 200ms.',
                  },
                  {
                    principle: 'Região Comum',
                    application: 'Áreas tracejadas semi-transparentes envolvem cada cluster. Cria fronteiras visuais sem poluir o campo visual com linhas opacas.',
                    impact: 'Melhora percepção de pertencimento regional mesmo quando aeroportos estão próximos geograficamente.',
                  },
                  {
                    principle: 'Conectividade',
                    application: 'Espessura de aresta proporcional à média dos graus dos nós conectados. Hubs produzem naturalmente linhas mais grossas.',
                    impact: 'Encode duplo: conectividade (topológica) + importância (visual).',
                  },
                  {
                    principle: 'Figura-Fundo',
                    application: 'Fundo escuro (#090d16). Nós hubs maiores com halo de brilho. Hubs nacionais se destacam imediatamente do fundo.',
                    impact: 'Hierarquia visual em 3 níveis: hub nacional > hub regional > periférico.',
                  },
                ].map((item) => (
                  <div key={item.principle} className="border border-slate-800 rounded-xl p-3">
                    <div className="text-xs font-bold text-purple-300 mb-1">{item.principle}</div>
                    <p className="text-[11px] text-slate-400 mb-1">{item.application}</p>
                    <p className="text-[10px] text-slate-500"><ChevronRight className="w-3 h-3 inline text-emerald-400" /> {item.impact}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-slate-200 font-semibold text-base">Justificativa das Escolhas Visuais</h3>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs leading-relaxed">
                  <p className="mb-3">
                    <strong className="text-slate-200">Layout geográfico vs. force-directed:</strong> Optamos por projetar
                    as coordenadas geográficas reais (lat/lng → SVG) em vez de um layout force-directed. Isso preserva
                    a intuição espacial do usuário e evita distorções arbitrárias que um algoritmo de força criaria.
                  </p>
                  <p className="mb-3">
                    <strong className="text-slate-200">Cor como canal primário:</strong> Cada região recebe uma cor da
                    escala purple-to-pink (violeta → magenta → rosa), criando distinção clara mas harmoniosa.
                    Cores análogas reduzem o salto cognitivo entre regiões geograficamente próximas.
                  </p>
                  <p>
                    <strong className="text-slate-200">Hierarquia de tamanho:</strong> Raio mínimo 3.5px, máximo 14px.
                    Essa faixa é larga o suficiente para perceber diferença sem sobreposição de nós.
                    GRU/BSB/GIG/CNF (grau 17-19) têm raio ~13px; THE/RBR (grau 5) têm raio ~5px.
                  </p>
                </div>
                <div className="bg-emerald-900/10 border border-emerald-800/30 rounded-xl p-4 text-xs text-emerald-300 leading-relaxed">
                  <strong className="text-emerald-200 block mb-1">Lei da Simplicidade (Pregnância)</strong>
                  Toda decisão de design priorizou eliminar ruído visual: arestas com opacidade baixa (0.22)
                  para não competir com os nós; fundo neutro escuro que funciona como "chão"; halos de brilho
                  apenas nos hubs nacionais. O resultado é um grafo legível mesmo sem legenda explícita.
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
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Custo das Rotas (Dijkstra)</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ROUTE_CHART_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#101827" horizontal={false} />
                    <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={[0, 5]} />
                    <YAxis type="category" dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} width={70} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v} u.c.`, 'Custo']} />
                    <Bar dataKey="custo" radius={[0, 4, 4, 0]} maxBarSize={20} name="Custo">
                      {ROUTE_CHART_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Saltos por Rota</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ROUTE_CHART_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#101827" horizontal={false} />
                    <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} width={70} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v} salto(s)`, 'Saltos']} />
                    <Bar dataKey="saltos" radius={[0, 4, 4, 0]} maxBarSize={20} fill="#60A5FA" name="Saltos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 leading-relaxed">
                <strong className="text-slate-200 block mb-1">Rotas diretas (1 salto)</strong>
                REC→POA (3,62) e MAO→GRU (3,40) são rotas diretas longas — representam ligações inter-regionais
                que conectam extremos do país sem escalas. Alto custo, máxima conveniência.
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 leading-relaxed">
                <strong className="text-slate-200 block mb-1">Rotas com escala (2 saltos)</strong>
                CWB→GRU→NAT (3,68) usa GRU como hub hub intermediário — padrão típico da aviação brasileira.
                A rota VIX→CNF→MAO (4,03) é a mais custosa, ligando periferia do Sudeste ao Norte via hub regional.
              </div>
            </div>
          </div>
        )}

        {/* ── 5. LIMITAÇÕES ── */}
        {active === 'limitacoes' && (
          <div className="flex flex-col gap-5 text-sm text-slate-400 leading-relaxed">
            <h3 className="text-slate-200 font-semibold text-base">Onde os dados mentem — e onde a visualização falha</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  title: 'Grafo estático × realidade dinâmica',
                  color: 'border-rose-800/40 bg-rose-900/10',
                  body: 'O dataset captura uma "fotografia" da malha. Rotas são canceladas, novas são abertas, frequências mudam sazonalmente. Um grafo estático com 20 nós não captura o peso real de uma rota com 50 voos/dia vs. uma com 2 voos/semana.',
                },
                {
                  title: 'Peso euclidiano vs. custo real',
                  color: 'border-amber-800/40 bg-amber-900/10',
                  body: 'A distância euclidiana ignora: altitude de voo, rotas de tráfego aéreo, restrições de espaço aéreo, ventos predominantes e diferenças de infraestrutura aeroportuária. Dois aeroportos a 1.000 km podem ter custos operacionais muito diferentes.',
                },
                {
                  title: 'Viés de centralidade do Sudeste',
                  color: 'border-purple-800/40 bg-purple-900/10',
                  body: 'GRU, GIG e CNF concentram ~57% das arestas. O layout geográfico amplifica visualmente o Norte (maior área física) mas subestima a densidade real de voos no Sudeste. A visualização pode induzir a conclusão errada sobre "onde o Brasil voa mais".',
                },
                {
                  title: 'Aeroportos vs. cidades',
                  color: 'border-sky-800/40 bg-sky-900/10',
                  body: 'São Paulo tem dois aeroportos (GRU e CGH). Tratá-los como nós separados sub-representa a força do hub São Paulo. No mundo real, a conectividade de SP seria a soma de ambos, tornando-a o hub mais dominante da rede por larga margem.',
                },
              ].map((item) => (
                <div key={item.title} className={`border rounded-xl p-4 ${item.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-200">{item.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. CONCLUSÃO ── */}
        {active === 'conclusao' && (
          <div className="flex flex-col gap-5 text-sm text-slate-400 leading-relaxed">
            <h3 className="text-slate-200 font-semibold text-base">Insights Acionáveis para a Malha Aérea</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Alta resiliência, alta concentração',
                  color: 'text-purple-400',
                  body: 'Densidade global de 0,605 significa rede robusta — qualquer par de aeroportos se comunica em ≤ 2 saltos. Mas os 4 hubs nacionais (GRU, BSB, GIG, CNF) são pontos únicos de falha: remover qualquer um fragmentaria a rede.',
                },
                {
                  title: 'Sul e Centro-Oeste são cliques',
                  color: 'text-emerald-400',
                  body: 'Densidade 1,0 nessas regiões: todo aeroporto conecta-se a todos os outros da região. Isso reflete a maturidade da malha no Sul e a função estratégica de BSB/GYN no Centro-Oeste.',
                },
                {
                  title: 'Norte precisa de mais hubs',
                  color: 'text-amber-400',
                  body: 'Com apenas 4 aeroportos e 4 arestas internas, o Norte tem a menor densidade (0,667) e aeroportos periféricos (PVH, RBR grau ≤ 6). Uma rota PVH-BEL direta aumentaria significativamente a conectividade da região.',
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
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Performance por Algoritmo</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={ALG_PERF} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#101827" vertical={false} />
                    <XAxis dataKey="alg" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v} ms`, 'Tempo']} />
                    <Bar dataKey="ms" radius={[4, 4, 0, 0]} maxBarSize={35} name="Tempo (ms)">
                      {ALG_PERF.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-teal-900/10 border border-teal-800/30 rounded-xl p-4 text-xs text-teal-200 leading-relaxed">
                <strong className="block mb-2 text-teal-100">Qual algoritmo usar em cada cenário?</strong>
                <ul className="flex flex-col gap-1.5 text-[11px]">
                  <li><span className="text-emerald-400 font-bold">BFS</span> — contar saltos mínimos (conexões de emergência)</li>
                  <li><span className="text-sky-400 font-bold">DFS</span> — detectar circuitos e validar conectividade</li>
                  <li><span className="text-amber-400 font-bold">Dijkstra</span> — otimizar custo de rota (caso de uso principal)</li>
                  <li><span className="text-rose-400 font-bold">Bellman-Ford</span> — cenários com créditos/subsídios (pesos negativos)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
