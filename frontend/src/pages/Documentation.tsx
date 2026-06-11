import React from 'react';
import { BookOpen, AlertTriangle, ShieldCheck, HelpCircle, Code, Plane, BarChart3, Scale, Film, Lightbulb, Network, GitBranch } from 'lucide-react';

export const Documentation: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 py-2 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          Documentação de Algoritmos de Grafos
        </h1>
        <p className="text-xs text-slate-400">
          Análise teórica das soluções implementadas, complexidades e tratamentos especiais.
        </p>
      </div>

      {/* Grid Sections */}
      <div className="flex flex-col gap-6">
        
        {/* Dijkstra vs Bellman-Ford */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Code className="w-4 h-4 text-sky-400" />
            Dijkstra vs Bellman-Ford: Diferenças Fundamentais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
              <h3 className="font-bold text-sky-400 text-sm">Algoritmo de Dijkstra</h3>
              <p className="leading-relaxed">
                Um algoritmo ganancioso (greedy) projetado para resolver o problema de caminho mínimo a partir de uma única origem em grafos direcionados ou não direcionados.
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1 mt-1 text-slate-400">
                <li>Complexidade: O(V²) na versão simples ou O(E log V) com Min-Heap.</li>
                <li>Restrição: Exige estritamente que todas as arestas tenham pesos não-negativos.</li>
                <li>Mecanismo: Escolhe sempre o nó de menor distância acumulada não-visitado e relaxa suas arestas.</li>
              </ul>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
              <h3 className="font-bold text-purple-400 text-sm">Algoritmo de Bellman-Ford</h3>
              <p className="leading-relaxed">
                Um algoritmo baseado em programação dinâmica que resolve caminhos mínimos de origem única permitindo arestas com pesos negativos.
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1 mt-1 text-slate-400">
                <li>Complexidade: O(V · E), o que o torna consideravelmente mais lento em grafos densos.</li>
                <li>Vantagem: Trata pesos negativos e identifica ciclos de custo negativo.</li>
                <li>Mecanismo: Relaxa todas as arestas do grafo repetidamente por (V - 1) iterações.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Negative Cycles and Dijkstra Failure */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Por que Dijkstra Falha com Pesos/Ciclos Negativos?
          </h2>
          
          <div className="text-xs text-slate-300 flex flex-col gap-3 leading-relaxed">
            <p>
              O algoritmo de Dijkstra apoia-se no <strong>pressuposto ganancioso</strong> de que adicionar uma nova aresta a um caminho sempre aumentará (ou manterá) o custo total do caminho. Sob essa premissa, uma vez que um nó é marcado como "visitado" e retirado da fila de prioridade, a menor distância até ele é considerada final e imutável.
            </p>
            <p>
              Quando existem arestas de peso negativo, esse pressuposto cai por terra. Um caminho mais longo em termos de número de nós pode conter uma aresta extremamente negativa que reduz o custo acumulado abaixo de um caminho direto já finalizado. Como Dijkstra não revisita nós cujos caminhos já foram marcados como visitados, ele falha em recalcular e encontrar o verdadeiro menor caminho.
            </p>
            <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-xl flex gap-3">
              <HelpCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 block mb-1">Como Bellman-Ford Identifica Ciclos Negativos?</strong>
                Um ciclo negativo é uma rota circular cuja soma total de pesos é menor que zero. Se um algoritmo de caminho mínimo continuar percorrendo esse ciclo, o custo do caminho diminuirá infinitamente (rumo a -∞). 
                Após realizar V - 1 relaxações, o Bellman-Ford realiza uma V-ésima iteração. Se na V-ésima iteração qualquer aresta ainda puder ser relaxada (ou seja, se a distância de origem a um nó destino puder ser reduzida), está provada a presença de um ciclo negativo acessível a partir da origem.
              </div>
            </div>
          </div>
        </div>

        {/* Searches (BFS vs DFS) */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Buscas: BFS vs DFS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-emerald-400">BFS (Busca em Largura)</h3>
              <p className="leading-relaxed">
                Utiliza uma estrutura de fila (FIFO) para explorar o grafo camada por camada. 
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1 text-slate-400">
                <li>Garante o menor caminho em grafos não-ponderados (sem pesos).</li>
                <li>Consumo de memória proporcional à largura máxima do nível do grafo.</li>
                <li>Complexidade de Tempo: O(V + E).</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-pink-400">DFS (Busca em Profundidade)</h3>
              <p className="leading-relaxed">
                Utiliza recursão ou uma estrutura de pilha (LIFO) para explorar ramos até suas folhas antes de realizar backtracking.
              </p>
              <ul className="list-disc pl-4 flex flex-col gap-1 text-slate-400">
                <li>Muito útil para detecção de ciclos, ordenação topológica e caminhos completos.</li>
                <li>Consumo de memória proporcional à profundidade máxima da árvore de recursão.</li>
                <li>Complexidade de Tempo: O(V + E).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* O Mesmo Algoritmo, Dois Domínios */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Network className="w-4 h-4 text-teal-400" />
            O Mesmo Algoritmo, Dois Domínios: Diferenças de Interpretação
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            BFS e DFS têm a mesma complexidade e estrutura, mas o que revelam depende inteiramente do domínio em que operam. Na rede de aeroportos, cada camada do BFS é uma "escala" de voo; na rede Netflix, cada camada é um "grau de separação de conteúdo". A mesma execução produz insights completamente diferentes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" /> Aeroportos (Parte 1)
              </h3>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5">
                <strong className="text-emerald-400">BFS → Alcance Operacional</strong>
                <p className="text-slate-400 leading-relaxed">
                  A rede é densa (densidade 0,606), então BFS a partir de qualquer aeroporto alcança <em>todos os outros em no máximo 2 camadas</em>. Isso confirma que a malha modelada não tem ilhas regionais isoladas — mesmo aeroportos do Norte (MAO, BEL) atingem os do Sul em poucos saltos via hubs centrais, sem necessidade de múltiplas escalas.
                </p>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5">
                <strong className="text-pink-400">DFS → Robustez da Malha</strong>
                <p className="text-slate-400 leading-relaxed">
                  O alto número de ciclos detectados pelo DFS confirma ausência de "pontes críticas": não existe nenhum aeroporto cuja remoção desconectaria o grafo. Para infraestrutura de transporte, isso é uma propriedade desejável — a rede tem redundância e não depende de um único ponto de falha.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" /> Netflix (Parte 2)
              </h3>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5">
                <strong className="text-emerald-400">BFS → Graus de Separação de Conteúdo</strong>
                <p className="text-slate-400 leading-relaxed">
                  A rede é esparsa (densidade 0,037), então o BFS precisa de mais camadas — até 6 — para atravessar a maior componente. Os títulos com grau mais alto (≥20) funcionam como "âncoras": a partir deles, praticamente todo o conteúdo da componente principal está a 2–3 camadas, tornando-os pontos naturais para iniciar recomendações em cadeia.
                </p>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5">
                <strong className="text-pink-400">DFS → Clusters Temáticos</strong>
                <p className="text-slate-400 leading-relaxed">
                  As 456 arestas de retorno (em apenas 99 nós da componente principal) revelam que o grafo está cheio de ciclos curtos — grupos de títulos que se interconectam densamente por gênero. Drama e Comedy, por serem gêneros muito frequentes, criam "bolhas" onde quase todos os títulos do grupo se conectam entre si.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modelagem do Grafo de Aeroportos: Pesos e Critérios de Conexão */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Plane className="w-4 h-4 text-amber-400" />
            Modelagem do Grafo de Aeroportos: Régua de Pesos e Critérios de Conexão
          </h2>

          <div className="text-xs text-slate-300 flex flex-col gap-3 leading-relaxed">
            <p>
              O grafo da Parte 1 é <strong>não-direcionado e ponderado</strong>, com 20 aeroportos (nós) e 115 conexões (arestas) extraídas de dados do VRA (ANAC). Cada aresta de <code className="text-amber-300">data/adjacencias_aeroportos.csv</code> carrega três campos: <code className="text-amber-300">tipo_conexao</code>, <code className="text-amber-300">justificativa</code> e <code className="text-amber-300">peso</code>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
                <h3 className="font-bold text-amber-400 text-sm">Fórmula / Régua de Peso</h3>
                <p className="leading-relaxed">
                  O <strong>peso</strong> representa a duração média do voo em horas (sempre positivo), variando de <strong>0,5h a 5,42h</strong> (média ≈ 1,99h). Como nenhuma aresta é negativa, o grafo é diretamente compatível com Dijkstra; Bellman-Ford entra apenas como comparação de corretude e desempenho.
                </p>
              </div>
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
                <h3 className="font-bold text-amber-400 text-sm">Como as Conexões Foram Definidas</h3>
                <p className="leading-relaxed">
                  Cada conexão recebe um <code className="text-amber-300">tipo_conexao</code>: <strong>"regional"</strong> (29 arestas, mesma região geográfica) ou <strong>"hub"</strong> (86 arestas, ligação inter-regional via aeroportos-polo), além de uma <code className="text-amber-300">justificativa</code> textual que documenta a origem/motivo daquela rota.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl flex gap-3">
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-1">Justificativas Usadas (fontes/critérios das arestas)</strong>
                Seis categorias documentam a origem de cada conexão: "Fluxo logístico regional", "Rota comercial de alta demanda", "Acordo de compartilhamento (Codeshare)", "Demanda sazonal identificada", "Conectividade entre centros urbanos" e "Conexão estratégica de malha aérea".
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
              <strong className="text-slate-200 block mb-1">Limitações do Modelo</strong>
              O peso reflete apenas a duração média do voo (não incorpora preço de passagem, frequência de voos ou sazonalidade real), e a separação "hub"/"regional" é uma simplificação da malha aérea verdadeira, que possui muito mais aeroportos e rotas do que os 20 modelados aqui.
            </div>
          </div>
        </div>

        {/* Insights da Parte 1 */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Insights da Parte 1: O Que os Algoritmos Disseram sobre a Malha Aérea
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed -mt-2">
            Além de verificar corretude, cada execução produziu informações interpretáveis sobre a estrutura da rede.
          </p>

          <div className="flex flex-col gap-3 text-xs text-slate-300">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2 leading-relaxed">
              <strong className="text-sky-400 text-sm">BFS a partir de qualquer aeroporto — Conectividade Total em 2 Saltos</strong>
              <p className="text-slate-400">
                A camada 1 do BFS a partir de REC contém os aeroportos do próprio Nordeste e alguns hubs inter-regionais diretos. A camada 2 já alcança todos os 19 aeroportos restantes. Isso é evidência concreta da alta densidade da rede: nenhum passageiro no modelo precisa de mais de uma escala para chegar a qualquer destino, o que é compatível com a realidade da aviação comercial brasileira concentrada em poucos hubs como GRU e BSB.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2 leading-relaxed">
              <strong className="text-pink-400 text-sm">DFS — Ciclos Confirmam Redundância de Rotas</strong>
              <p className="text-slate-400">
                O DFS identificou ciclos em todas as regiões. As sub-redes de Sudeste, Sul e Centro-Oeste têm densidade 1,0 internamente (grafos completos), o que já garante múltiplos ciclos. O mais relevante é que os ciclos também atravessam regiões — confirmando que a malha inter-regional não é uma árvore simples, mas uma rede com alternativas. Em termos práticos: se uma conexão via BSB estiver indisponível, existem rotas alternativas via GRU ou GIG para a mesma origem-destino.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2 leading-relaxed">
              <strong className="text-amber-400 text-sm">Dijkstra — O Que as Rotas Obrigatórias Revelaram</strong>
              <p className="text-slate-400">
                As rotas calculadas por Dijkstra mostraram que <strong className="text-amber-300">REC → POA</strong> e <strong className="text-amber-300">MAO → GRU</strong> não têm conexão direta no modelo — ambas passam por hubs intermediários. Isso reflete fielmente a malha real: conexões diretas entre Nordeste/Sul e Norte/Sudeste são operacionalmente raras. O custo total de MAO→GRU ser maior que REC→POA também é esperado: Manaus está geograficamente mais isolada e seus aeroportos têm menos conexões inter-regionais diretas. O algoritmo não "inventou" esse insight — ele emergiu naturalmente do modelo de pesos construído a partir dos dados reais.
              </p>
            </div>
          </div>
        </div>

        {/* Notas Analíticas das Visualizações */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            Notas Analíticas das Visualizações
          </h2>
          <p className="text-xs text-slate-400 -mt-2">
            Para cada visualização: o que está sendo mostrado, qual insight pode ser extraído e por que aquele tipo de gráfico foi escolhido.
          </p>

          <div className="flex flex-col gap-3 text-xs text-slate-300">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
              <h3 className="font-bold text-violet-400 text-sm">Visualizações Analíticas</h3>

              <div>
                <strong className="text-slate-100">Distribuição de Graus</strong> (histograma): mostra quantos aeroportos têm cada grau de conectividade. <span className="text-slate-400">Insight: a maioria se concentra perto da média (≈ 11,5), revelando uma malha relativamente coesa, sem grande dispersão. Por que esse gráfico: histograma é o formato padrão para revelar a forma de uma distribuição numérica.</span>
              </div>
              <div>
                <strong className="text-slate-100">Ranking de Aeroportos por Conectividade</strong> (barras horizontais coloridas por região): ordena os 20 aeroportos pelo grau. <span className="text-slate-400">Insight: hubs como GRU, BSB e GIG concentram o maior número de conexões, confirmando seu papel de polos logísticos. Por que esse gráfico: barras horizontais facilitam comparar e ranquear valores discretos entre muitas categorias.</span>
              </div>
              <div>
                <strong className="text-slate-100">Comparação Regional</strong> (três gráficos de barra: |V|, |E| e densidade): compara Norte, Nordeste, Sudeste, Sul e Centro-Oeste. <span className="text-slate-400">Insight: Sudeste, Sul e Centro-Oeste têm densidade 1.0 (clusters internos totalmente conectados), enquanto Norte e Nordeste são maiores em número de nós, porém menos densos, dependendo mais de conexões inter-regionais via hubs. Por que esse gráfico: painéis de barra lado a lado comparam três métricas em escalas diferentes sem misturá-las.</span>
              </div>
              <div>
                <strong className="text-slate-100">Subgrafo dos Aeroportos de Maior Grau</strong> (grafo de nós e arestas): isola os 8 aeroportos mais conectados e suas ligações mútuas. <span className="text-slate-400">Insight: os hubs formam um "núcleo" densamente interligado, o que explica por que rotas entre regiões distantes tendem a passar por eles. Por que esse gráfico: um desenho de rede é a única forma de mostrar simultaneamente nós, arestas e topologia relativa.</span>
              </div>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
              <h3 className="font-bold text-cyan-400 text-sm">Visualizações Exploratórias</h3>
              <div>
                <strong className="text-slate-100">Grau × Densidade do Ego Network</strong> (dispersão): cruza o grau de cada aeroporto com a densidade da sua rede ego (v ∪ N(v)). <span className="text-slate-400">Insight: aeroportos de grau baixo tendem a ter ego networks mais densos (vizinhos conectados entre si), enquanto hubs de grau alto têm ego networks mais esparsos, um padrão típico de estrutura "hub-and-spoke". Por que esse gráfico: dispersão é o formato ideal para investigar a relação entre duas variáveis numéricas contínuas.</span>
              </div>
              <div>
                <strong className="text-slate-100">Estrutura dos Ego Networks</strong> (dois gráficos de dispersão: grau × arestas e grau × nós do ego): explora como o tamanho do ego network cresce com o grau. <span className="text-slate-400">Insight: o crescimento não é estritamente linear, pois vizinhos de aeroportos muito conectados nem sempre se conectam entre si, reforçando o padrão hub-and-spoke. Por que esse gráfico: dispersões pareadas com o mesmo eixo X permitem comparar duas relações lado a lado de forma consistente.</span>
              </div>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
              <h3 className="font-bold text-emerald-400 text-sm">Visualizações Explanatórias</h3>
              <div>
                <strong className="text-slate-100">Rede de Aeroportos Brasileiros</strong> (grafo completo, com nós coloridos por região, tamanho proporcional ao grau e arestas inter/intra-regionais em cores distintas): comunica a estrutura geral da malha em uma única imagem. <span className="text-slate-400">Insight: as conexões inter-regionais convergem fortemente para poucos nós grandes, evidenciando visualmente o papel concentrador dos hubs. Por que esse gráfico: combina grau (tamanho), região (cor do nó) e tipo de conexão (cor da aresta) em uma peça voltada para comunicação a um público não-técnico.</span>
              </div>
              <div>
                <strong className="text-slate-100">Dashboard Explanatório</strong> (painel combinando ranking, distribuição e comparação regional): resume as métricas centrais do projeto em um só lugar. <span className="text-slate-400">Insight: permite "contar a história" da rede aeroportuária sem que o leitor precise abrir vários arquivos. Por que esse gráfico: formato de dashboard é o padrão para comunicação executiva, concentrando as conclusões mais relevantes.</span>
              </div>
              <div>
                <strong className="text-slate-100">Árvore de Percurso</strong> (grafo interativo HTML com caminhos mínimos destacados): exibe os trajetos calculados por Dijkstra para os pares obrigatórios (Recife→Porto Alegre, Manaus→São Paulo) e demais rotas de <code className="text-amber-300">data/rotas.csv</code>, com nós e arestas do caminho realçados sobre o grafo completo. <span className="text-slate-400">Insight: mostra por quantos "saltos" e por quais hubs cada rota obrigatória passa. Por que esse gráfico: a interatividade permite alternar entre rotas e inspecionar pesos sem gerar uma imagem estática para cada par.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Discussão Crítica dos Algoritmos aplicada ao Grafo Netflix */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Scale className="w-4 h-4 text-pink-400" />
            Discussão Crítica: Quando e Por Que Usar Cada Algoritmo (Grafo Netflix, Parte 2)
          </h2>

          <div className="text-xs text-slate-300 flex flex-col gap-3 leading-relaxed">
            <p>
              Os quatro algoritmos foram comparados sobre o mesmo grafo da Parte 2 (182 nós, 615 arestas): BFS e DFS partem dos mesmos nós-fonte, e Dijkstra/Bellman-Ford resolvem o mesmo par origem-destino. Resultado do benchmark (20 execuções):
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="py-1.5 pr-4">Algoritmo</th>
                    <th className="py-1.5 pr-4">Complexidade</th>
                    <th className="py-1.5 pr-4">Tempo médio</th>
                    <th className="py-1.5">Memória média</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-900">
                    <td className="py-1.5 pr-4">BFS</td><td className="py-1.5 pr-4">O(V+E)</td><td className="py-1.5 pr-4">≈ 0,11 ms</td><td className="py-1.5">≈ 5,8 KB</td>
                  </tr>
                  <tr className="border-b border-slate-900">
                    <td className="py-1.5 pr-4">DFS</td><td className="py-1.5 pr-4">O(V+E)</td><td className="py-1.5 pr-4">≈ 0,72 ms</td><td className="py-1.5">≈ 44,9 KB</td>
                  </tr>
                  <tr className="border-b border-slate-900">
                    <td className="py-1.5 pr-4">Dijkstra</td><td className="py-1.5 pr-4">O(V²)</td><td className="py-1.5 pr-4">≈ 0,59 ms</td><td className="py-1.5">≈ 26,2 KB</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-4">Bellman-Ford</td><td className="py-1.5 pr-4">O(V·E)</td><td className="py-1.5 pr-4">≈ 4,32 ms</td><td className="py-1.5">≈ 26,5 KB</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ul className="list-disc pl-4 flex flex-col gap-2 text-slate-400">
              <li><strong className="text-slate-200">BFS</strong>: ideal para achar o menor número de "saltos" entre títulos e mapear graus de similaridade. No grafo Netflix, qualquer título da maior componente está a no máximo 6 camadas de qualquer outro (efeito "mundo pequeno").</li>
              <li><strong className="text-slate-200">DFS</strong>: útil para detectar ciclos e explorar componentes a fundo. O alto número de arestas de retorno (456 entre 99 nós) confirma um grafo denso em ciclos, esperado já que muitos títulos compartilham gêneros populares; é menos intuitivo para gerar recomendações diretas.</li>
              <li><strong className="text-slate-200">Dijkstra</strong>: algoritmo de escolha aqui: como peso = 1/similaridade nunca é negativo, ele encontra com segurança o caminho de maior similaridade acumulada. A implementação atual é O(V²); para grafos maiores recomenda-se heap, atingindo O((V+E) log V).</li>
              <li><strong className="text-slate-200">Bellman-Ford</strong>: suporta pesos negativos e detecta ciclos negativos, mas é visivelmente mais lento (O(V·E), ~7× o tempo do Dijkstra no benchmark). Como "similaridade" nunca é negativa neste modelo, BF não traz vantagem real aqui; só se justificaria se o modelo incluísse "penalidades" (ex.: incompatibilidade de gênero como peso negativo), o que exigiria redesenhar as arestas.</li>
            </ul>

            <div className="p-4 bg-pink-950/20 border border-pink-900/30 rounded-xl flex gap-3">
              <HelpCircle className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-pink-300 block mb-1">Limitações do Design de Pesos (peso = 1 / total_compartilhado)</strong>
                O modelo é simples e interpretável (quanto mais atributos em comum, menor o custo), mas trata ator, diretor e gênero como igualmente relevantes. Uma evolução natural seria ponderar cada tipo de atributo (ex.: peso_ator &gt; peso_diretor &gt; peso_gênero) para refletir melhor a "similaridade real" entre títulos. Além disso, 24 dos 182 nós são isolados, ou seja, não compartilham nenhum atributo com o restante, o que limita o alcance de qualquer algoritmo de caminho à maior componente, de 99 nós.
              </div>
            </div>
          </div>
        </div>

        {/* Modelagem do Grafo Netflix */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <GitBranch className="w-4 h-4 text-rose-400" />
            Modelagem do Grafo Netflix: Régua de Pesos e Decisões de Design
          </h2>

          <div className="text-xs text-slate-300 flex flex-col gap-3 leading-relaxed">
            <p>
              Enquanto no grafo de aeroportos as arestas são definidas por rotas reais e os pesos por duração de voo, no grafo Netflix tanto a existência quanto o custo de cada aresta são <strong>construídos a partir do dataset</strong>. Essas decisões de design determinam o que os algoritmos conseguem — e não conseguem — revelar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5">
                <h3 className="font-bold text-rose-400 text-sm">Atores Compartilhados</h3>
                <p className="text-slate-400 leading-relaxed">
                  A conexão mais específica e semanticamente forte. Dois títulos com o mesmo ator principal têm um vínculo direto de identidade criativa. Como atores populares aparecem em poucos títulos, essas arestas são raras mas de alta confiabilidade — tendem a ligar obras do mesmo universo ou estilo.
                </p>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5">
                <h3 className="font-bold text-rose-400 text-sm">Diretores/Criadores Compartilhados</h3>
                <p className="text-slate-400 leading-relaxed">
                  Conexão de assinatura autoral. Um diretor recorrente conecta obras com linguagem visual e narrativa similar. Mais raro que gênero, mas mais específico — títulos conectados por diretor tendem a ter estilo mais próximo do que dois títulos do mesmo gênero.
                </p>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 flex flex-col gap-1.5">
                <h3 className="font-bold text-rose-400 text-sm">Gêneros Compartilhados</h3>
                <p className="text-slate-400 leading-relaxed">
                  A conexão mais frequente e menos específica. Gêneros populares (Drama, Comedy, Thriller) conectam dezenas de títulos entre si, criando clusters densos. São responsáveis pela maioria das 615 arestas e pela alta contagem de ciclos no DFS — mas individualmente carregam menos informação que ator ou diretor.
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-xl flex gap-3">
              <HelpCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 block mb-1">A Inversão de Peso: Transformando Similaridade em Distância</strong>
                <p className="leading-relaxed">
                  A escolha de <code className="text-rose-300">peso = 1 / total_compartilhado</code> é uma decisão de design que "inverte a semântica" do grafo: quanto <em>mais</em> similar, <em>menor</em> a distância. Isso permite reutilizar diretamente o Dijkstra — que minimiza custo — para encontrar o "caminho de máxima afinidade" entre dois títulos, sem precisar de nenhuma adaptação no algoritmo. Um par com 4 atributos em comum tem peso 0,25 (muito próximos); um par com apenas 1 atributo tem peso 1,0 (conexão fraca). O caminho mínimo encontrado pelo Dijkstra representa a sequência de títulos com maior densidade de atributos compartilhados ao longo de toda a rota.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl">
              <strong className="text-slate-200 block mb-1">Por que 24 Nós são Isolados?</strong>
              <p className="text-slate-400 leading-relaxed">
                Os 24 títulos sem nenhuma aresta são obras que, dentro do recorte de 182 títulos, não compartilham nenhum ator, diretor ou gênero com nenhum outro título. Isso não significa que são "únicos" no mundo — apenas que, no dataset utilizado, eles não têm par. Esses nós ficam inacessíveis para qualquer algoritmo de caminho: são casos em que a limitação do dataset cria diretamente uma limitação algorítmica.
              </p>
            </div>
          </div>
        </div>

        {/* Insights da Parte 2 */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lightbulb className="w-4 h-4 text-violet-400" />
            Insights da Parte 2: O Que os Algoritmos Disseram sobre o Catálogo Netflix
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed -mt-2">
            Cada execução produziu resultados interpretáveis sobre a estrutura do catálogo — não apenas métricas de desempenho.
          </p>

          <div className="flex flex-col gap-3 text-xs text-slate-300">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2 leading-relaxed">
              <strong className="text-sky-400 text-sm">BFS — O "Mundo Pequeno" do Conteúdo Netflix</strong>
              <p className="text-slate-400">
                Apesar da baixa densidade (0,037), a maior componente (99 nós) exibe o fenômeno de "mundo pequeno": o diâmetro máximo observado é de apenas 6 camadas. Os títulos-hub com grau ≥20 funcionam como atalhos estruturais — sua presença reduz drasticamente o número médio de saltos entre qualquer par. Para sistemas de recomendação, isso significa que um usuário pode ser "guiado" de qualquer título da componente principal até qualquer outro em no máximo 6 recomendações em cadeia, mesmo numa rede tão esparsa.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2 leading-relaxed">
              <strong className="text-pink-400 text-sm">DFS — 456 Ciclos Revelam a Dominância dos Gêneros</strong>
              <p className="text-slate-400">
                O DFS identificou 456 arestas de retorno em 99 nós — uma razão de ~4,6 ciclos por nó, muito acima do esperado numa rede esparsa aleatória. Esses ciclos não se distribuem uniformemente: concentram-se nos clusters de gêneros populares, onde praticamente todos os títulos de Drama ou Comedy se conectam uns aos outros. A conclusão é que gênero, apesar de ser o atributo individual mais fraco (peso 1,0), é o principal responsável pela conectividade global do grafo — ele é a "cola" estrutural da rede.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2 leading-relaxed">
              <strong className="text-amber-400 text-sm">Dijkstra — Caminhos de Afinidade Passam por Pontes de Gênero</strong>
              <p className="text-slate-400">
                Os caminhos mínimos calculados raramente são conexões diretas de ator para ator: na maioria dos pares testados, o caminho de menor custo passa por títulos que servem como "pontes de gênero" — obras que conectam domínios distintos (ex.: um thriller que também é drama conecta o cluster de ação ao cluster de drama). Isso confirma que gênero é o conector estrutural dominante, e que o Dijkstra acaba "aproveitando" esses atalhos de gênero para minimizar o custo total do caminho.
              </p>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2 leading-relaxed">
              <strong className="text-purple-400 text-sm">Bellman-Ford — Validação Cruzada e Preparação para Extensões</strong>
              <p className="text-slate-400">
                No grafo real Netflix (todos os pesos positivos), o Bellman-Ford produziu exatamente os mesmos caminhos que o Dijkstra — confirmando por validação cruzada que ambas as implementações estão corretas. Nos grafos sintéticos com pesos negativos, o algoritmo demonstrou sua capacidade distintiva: detectar quando um "bônus de similaridade" cria um ciclo que tornaria o problema matematicamente sem solução. Essa propriedade seria necessária se o modelo de pesos fosse expandido para incluir penalidades (ex.: incompatibilidade de público-alvo subtraindo da similaridade), um caminho natural de evolução do modelo atual.
              </p>
            </div>
          </div>
        </div>

        {/* Dataset da Parte 2 - Netflix */}
        <div className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Film className="w-4 h-4 text-rose-400" />
            Dataset da Parte 2: Grafo de Similaridade Netflix
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
              <h3 className="font-bold text-rose-400 text-sm">Descrição do Grafo</h3>
              <ul className="list-disc pl-4 flex flex-col gap-1 text-slate-400">
                <li>Tipo: não-direcionado e ponderado</li>
                <li>Ordem |V| = 182 títulos (séries/filmes, 2016–2025)</li>
                <li>Tamanho |E| = 615 conexões</li>
                <li>Densidade ≈ 0,037</li>
                <li>Grau médio ≈ 6,76 · grau máximo = 30 · grau mínimo = 0</li>
                <li>24 nós isolados · maior componente conexa com 99 nós</li>
              </ul>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col gap-2">
              <h3 className="font-bold text-rose-400 text-sm">Critério de Conexão e Peso</h3>
              <p className="leading-relaxed">
                Dois títulos são conectados se compartilham pelo menos um <strong>ator</strong>, <strong>diretor</strong> ou <strong>gênero</strong>. O peso da aresta é <code className="text-rose-300">1 / total_compartilhado</code>: quanto mais atributos em comum, menor o peso (maior a similaridade), favorecendo o uso de Dijkstra para encontrar o "caminho de maior afinidade" entre dois títulos.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
