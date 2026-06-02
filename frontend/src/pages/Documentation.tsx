import React from 'react';
import { BookOpen, AlertTriangle, ShieldCheck, HelpCircle, Code } from 'lucide-react';

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

      </div>
    </div>
  );
};
