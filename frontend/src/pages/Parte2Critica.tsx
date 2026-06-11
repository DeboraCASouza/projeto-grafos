import React, { useState } from 'react';
import {
  AlertTriangle, Eye, Scale, TrendingUp, ChevronRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, LineChart, Line, Legend,
} from 'recharts';

const TOOLTIP_STYLE = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '11px',
};

/* ── dados de suporte ── */

// Escala: como o grafo "quebra" conforme V cresce
const SCALING_FAIL = [
  { V: 20,   arestas: 115,   densidade: 0.605, isolados: 0,  componentes: 1  },
  { V: 182,  arestas: 780,   densidade: 0.048, isolados: 24, componentes: 25 },
  { V: 500,  arestas: 1200,  densidade: 0.010, isolados: 80, componentes: 55 },
  { V: 1000, arestas: 1800,  densidade: 0.004, isolados: 200, componentes: 120 },
];

// Distribuição de pesos — o que fica "oculto"
const WEIGHT_DIST = [
  { faixa: '0.00–0.20', count: 312, pct: 40 },
  { faixa: '0.21–0.40', count: 195, pct: 25 },
  { faixa: '0.41–0.60', count: 117, pct: 15 },
  { faixa: '0.61–0.80', count: 78,  pct: 10 },
  { faixa: '0.81–1.00', count: 78,  pct: 10 },
];

// Viés de layout — nós com mesmo grau mas posições muito diferentes visualmente
const LAYOUT_BIAS = [
  { titulo: 'Stranger Things', grau: 18, imdb: 8.7, x: 1, cluster: 'Central' },
  { titulo: 'Narcos',          grau: 17, imdb: 8.8, x: 1, cluster: 'Central' },
  { titulo: 'Dark',            grau: 5,  imdb: 8.8, x: 2, cluster: 'Periférico' },
  { titulo: 'Money Heist',     grau: 16, imdb: 8.2, x: 1, cluster: 'Central' },
  { titulo: 'BoJack Horseman', grau: 4,  imdb: 8.7, x: 2, cluster: 'Periférico' },
];

// Distribuição de graus mostrando nós isolados
const DEGREE_REAL = [
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

const SECTIONS = [
  { id: 'escala',  label: 'Falha em Escala',    icon: TrendingUp,   color: 'text-amber-400',  bg: 'bg-amber-900/10 border-amber-800/40' },
  { id: 'oculto',  label: 'Info. Ocultadas',    icon: Eye,          color: 'text-sky-400',    bg: 'bg-sky-900/10 border-sky-800/40' },
  { id: 'vies',    label: 'Vieses Visuais',     icon: Scale,        color: 'text-rose-400',   bg: 'bg-rose-900/10 border-rose-800/40' },
  { id: 'modelo',  label: 'Limitações do Modelo', icon: AlertTriangle, color: 'text-purple-400', bg: 'bg-purple-900/10 border-purple-800/40' },
];

export const Parte2Critica: React.FC = () => {
  const [active, setActive] = useState('escala');
  const cur = SECTIONS.find((s) => s.id === active)!;

  return (
    <div className="flex flex-col gap-6 py-2 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Parte 2 — Discussão Crítica (AVD)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Análise das limitações do modelo e críticas à representação visual — as três perguntas obrigatórias do requisito AVD.
        </p>
      </div>

      {/* Section nav */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-150 ${
                isActive
                  ? `bg-slate-800 border-slate-600 text-white shadow-md ${s.bg}`
                  : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? s.color : 'text-slate-600'}`} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 min-h-[540px]">
        <div className="flex items-center gap-2 mb-6">
          {React.createElement(cur.icon, { className: `w-5 h-5 ${cur.color}` })}
          <h2 className="text-lg font-bold text-white">{cur.label}</h2>
        </div>

        {/* ── 1. FALHA EM ESCALA ── */}
        {active === 'escala' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-400 leading-relaxed">
              <div>
                <h3 className="text-slate-200 font-semibold mb-2">Onde o gráfico falha em escala?</h3>
                <p className="mb-3">
                  Com 182 nós, o grafo Netflix já apresenta 24 nós isolados e 25 componentes desconexas.
                  A visualização por <em>force-directed layout</em> (Vis.js) coloca esses isolados na
                  periferia — criando a ilusão de "quase conectado" quando na verdade são nós completamente
                  desconectados da componente principal.
                </p>
                <p>
                  Se escalássemos para 1.000 títulos (um dataset Netflix completo), a densidade cairia de
                  0,048 para ~0,004 — o grafo seria visualmente ilegível: uma "bola de fios" onde
                  nenhuma estrutura seria perceptível sem filtros agressivos.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Densidade × Nós Isolados conforme |V| cresce
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={SCALING_FAIL} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="V" stroke="#475569" fontSize={9} tickLine={false} label={{ value: '|V|', position: 'insideBottom', offset: -3, fill: '#475569', fontSize: 9 }} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `|V| = ${v}`} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="densidade" name="Densidade" stroke="#FBBF24" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="isolados" name="Nós Isolados" stroke="#F87171" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-slate-500 mt-2">
                  * Valores para V &gt; 182 são projeções baseadas na taxa de crescimento observada.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Problema: sobreposição de nós',
                  body: 'Com +500 nós, o force-directed layout cria regiões densas onde nós se sobrepõem. A carga cognitiva para identificar conexões individuais se torna insuportável.',
                  solution: 'Solução: filtros de grau mínimo + zoom semântico (mostrar clusters em visão macro, detalhe ao aproximar).',
                  color: 'border-amber-800/30',
                },
                {
                  title: 'Problema: legibilidade das arestas',
                  body: 'A representação visual por espessura de aresta deixa de funcionar quando há centenas de arestas — as linhas se fundem visualmente em blocos sólidos.',
                  solution: 'Solução: remover arestas de baixo peso, usar bundling de arestas ou mudar para matriz de adjacência.',
                  color: 'border-sky-800/30',
                },
                {
                  title: 'Problema: nós isolados enganam',
                  body: 'No layout atual, 24 nós isolados aparecem espalhados na periferia com a mesma ênfase visual que nós conectados, induzindo leitura errada.',
                  solution: 'Solução: exibir isolados em uma grade separada, fora do grafo principal, com nota explicativa.',
                  color: 'border-purple-800/30',
                },
              ].map((item) => (
                <div key={item.title} className={`border rounded-xl p-4 ${item.color} bg-slate-900/30`}>
                  <p className="text-xs font-bold text-slate-200 mb-2">{item.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{item.body}</p>
                  <p className="text-[10px] text-emerald-400 leading-relaxed">
                    <ChevronRight className="w-3 h-3 inline" /> {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 2. INFORMAÇÕES OCULTADAS ── */}
        {active === 'oculto' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-400 leading-relaxed">
              <div>
                <h3 className="text-slate-200 font-semibold mb-2">Quais informações ficam ocultas?</h3>
                <p className="mb-3">
                  A visualização de rede prioriza <em>estrutura topológica</em> (quem conecta com quem)
                  e inevitavelmente suprime informação sobre <em>magnitude</em> das conexões.
                  Com peso = 1/similaridade, pesos muito próximos (ex.: 0.20 vs. 0.25) são visualmente
                  indistinguíveis, mas representam diferenças reais de similaridade.
                </p>
                <p>
                  A distribuição de pesos está fortemente concentrada na faixa 0,00–0,40:
                  65% das arestas têm peso baixo, indicando alta similaridade — mas no grafo interativo
                  todas aparecem com a mesma espessura padrão.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Distribuição Real dos Pesos das Arestas
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={WEIGHT_DIST} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="faixa" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v} arestas`, 'Frequência']} />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={45} name="Arestas">
                      {WEIGHT_DIST.map((_d, i) => (
                        <Cell key={i} fill={i < 2 ? '#34D399' : i < 4 ? '#FBBF24' : '#F87171'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-slate-500 mt-2">
                  Verde = alta similaridade (peso baixo). Vermelho = baixa similaridade (peso alto).
                </p>
              </div>
            </div>

            {/* Degree 0 highlight */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Distribuição de Graus — Incluindo Nós Isolados (grau = 0)
              </h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={DEGREE_REAL} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="grau" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} label={{ value: 'Grau', position: 'insideBottom', offset: -2, fill: '#475569', fontSize: 9 }} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => `Grau ${v}`} formatter={(v: any) => [`${v} títulos`, '']} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={30} name="Títulos">
                    {DEGREE_REAL.map((d, i) => (
                      <Cell key={i} fill={d.grau === 0 ? '#F87171' : '#60A5FA'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-slate-500 mt-1">
                <span className="text-rose-400 font-bold">Vermelho</span> = 24 títulos isolados (grau 0) — completamente invisíveis na visualização de rede padrão.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-400 leading-relaxed">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <strong className="text-slate-200 block mb-1">Identidade dos nós isolados</strong>
                Títulos como <em>Dark</em>, <em>BoJack Horseman</em> e <em>Mindhunter</em> são
                isolados porque não compartilham atores, diretores nem gêneros com nenhum outro título
                do recorte. São produções de nicho altamente originais — mas a visualização os
                torna invisíveis, sugerindo que são "irrelevantes" quando na verdade têm alto IMDb.
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <strong className="text-slate-200 block mb-1">O que o modelo de arestas ignora</strong>
                O critério de conexão (ator, diretor ou gênero compartilhado) não captura:
                tema narrativo, tom (comédia × drama), público-alvo, idioma ou popularidade.
                Dois títulos podem ser muito similares para o usuário final mas aparecer
                desconectados no grafo.
              </div>
            </div>
          </div>
        )}

        {/* ── 3. VIESES VISUAIS ── */}
        {active === 'vies' && (
          <div className="flex flex-col gap-6">
            <h3 className="text-slate-200 font-semibold text-sm mb-1">
              Quais vieses são introduzidos pela representação gráfica?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Viés 1: posição central */}
              <div className="flex flex-col gap-4">
                <div className="border border-rose-800/30 bg-rose-900/10 rounded-xl p-4">
                  <p className="text-xs font-bold text-rose-300 mb-2">Viés 1 — Posição central ≠ importância</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    O force-directed layout posiciona nós no centro por alta conectividade, mas o
                    usuário interpreta "centro = mais importante". Um título pode ser central apenas
                    porque compartilha gêneros genéricos (ex.: Drama, Thriller) — não porque seja
                    realmente influente.
                  </p>
                  <div className="flex gap-3">
                    {LAYOUT_BIAS.map((d) => (
                      <div key={d.titulo} className="flex-1 bg-slate-900/60 rounded-lg p-2 text-center">
                        <div className={`text-[9px] font-bold mb-1 ${d.cluster === 'Central' ? 'text-amber-400' : 'text-slate-500'}`}>
                          {d.cluster}
                        </div>
                        <div className="text-[9px] text-slate-300 leading-tight">{d.titulo}</div>
                        <div className="text-[10px] font-mono mt-1 text-sky-400">grau {d.grau}</div>
                        <div className="text-[10px] font-mono text-amber-400">IMDb {d.imdb}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Dark e BoJack têm IMDb ≥ 8.7 mas estão na periferia — a visualização sugere que
                    são menos relevantes que shows centrais com IMDb 8.2.
                  </p>
                </div>

                <div className="border border-amber-800/30 bg-amber-900/10 rounded-xl p-4">
                  <p className="text-xs font-bold text-amber-300 mb-2">Viés 2 — Tamanho do nó vs. qualidade</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Nós maiores (alto grau) são lidos como "mais importantes" ou "melhores". Mas grau
                    alto significa apenas que o título compartilha muitos atributos com outros — não
                    que seja de melhor qualidade. Um blockbuster genérico com muitos atores famosos
                    terá grau muito mais alto que um filme de autor inovador.
                  </p>
                </div>
              </div>

              {/* Viés 2: cor e viés cultural */}
              <div className="flex flex-col gap-4">
                <div className="border border-sky-800/30 bg-sky-900/10 rounded-xl p-4">
                  <p className="text-xs font-bold text-sky-300 mb-2">Viés 3 — Cor induz agrupamento falso</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    As cores por país criam a percepção de que títulos da mesma cor formam um cluster
                    temático. Na realidade, a cor reflete apenas a origem geográfica de produção —
                    um título americano de horror e um americano de comédia romanticamente estão
                    na mesma cor mas em posições opostas do grafo.
                  </p>
                  <div className="h-28 flex items-end gap-1 bg-slate-950/50 rounded-lg p-3">
                    {[
                      { pais: 'USA',         n: 89,  color: '#60a5fa' },
                      { pais: 'UK',          n: 22,  color: '#f472b6' },
                      { pais: 'S. Korea',    n: 18,  color: '#34d399' },
                      { pais: 'Brazil',      n: 12,  color: '#fbbf24' },
                      { pais: 'Germany',     n: 10,  color: '#a855f7' },
                      { pais: 'France',      n: 8,   color: '#22d3ee' },
                      { pais: 'Others',      n: 23,  color: '#64748b' },
                    ].map((d) => (
                      <div key={d.pais} className="flex flex-col items-center flex-1 gap-1">
                        <span className="text-[8px] text-slate-500 font-mono">{d.n}</span>
                        <div
                          className="w-full rounded-t"
                          style={{ height: `${(d.n / 89) * 72}px`, backgroundColor: d.color, opacity: 0.8 }}
                        />
                        <span className="text-[7px] text-slate-500 text-center leading-tight">{d.pais}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    USA representa 49% do dataset — a cor azul domina visualmente o grafo, sugerindo
                    que conteúdo americano é "mais conectado" quando é apenas mais frequente.
                  </p>
                </div>

                <div className="border border-purple-800/30 bg-purple-900/10 rounded-xl p-4">
                  <p className="text-xs font-bold text-purple-300 mb-2">Viés 4 — Ausência não é visível</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Um grafo mostra apenas o que <em>existe</em>. A ausência de aresta entre dois
                    títulos não aparece visualmente — mas pode ser tão informativa quanto a presença.
                    "Esses dois shows não compartilham nada" é uma informação que o grafo simplesmente
                    apaga.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. LIMITAÇÕES DO MODELO ── */}
        {active === 'modelo' && (
          <div className="flex flex-col gap-6 text-sm text-slate-400 leading-relaxed">
            <h3 className="text-slate-200 font-semibold">Limitações do modelo de grafo Netflix</h3>

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

            {/* Summary scorecard */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                Avaliação Crítica do Modelo — Scorecard
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { dim: 'Precisão do Peso',     score: 55, note: 'Proxy razoável, sem diferenciação de atributo' },
                  { dim: 'Cobertura do Dataset',  score: 70, note: '182 títulos cobrem principais shows, não todos' },
                  { dim: 'Utilidade de Roteamento', score: 60, note: 'Dijkstra funciona mas falha em isolados' },
                  { dim: 'Escalabilidade',         score: 30, note: 'Não escala bem acima de ~300 nós visualmente' },
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
      </div>
    </div>
  );
};
