import React from 'react';
import { BookOpen, AlertTriangle, ShieldCheck, HelpCircle, Code, Plane, BarChart3, Scale, Film } from 'lucide-react';

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
