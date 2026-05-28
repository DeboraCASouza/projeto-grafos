"""
Parte 2 — Dataset maior: Netflix Top Shows 2016-2025
Itens 1–6 do enunciado da Parte 2.
"""

import json
import os
import statistics
import time
import tracemalloc

from src.graphs.graph import Grafo
from src.graphs.io_netflix import construir_grafo_netflix
from src.graphs.algorithms import bfs_camadas, dfs_ciclos, dijkstra, bellman_ford
from src.viz_parte2 import gerar_todas_visualizacoes


# ---------------------------------------------------------------------------
# Item 1 — Descrição do dataset
# ---------------------------------------------------------------------------

def descrever_dataset(grafo: Grafo, nome: str, fonte: str) -> dict:
    grau_valores = [grafo.obter_grau(n) for n in grafo.adjacencias]
    dist_graus = grafo.distribuicao_graus()

    return {
        "nome": nome,
        "fonte": fonte,
        "tipo": "nao-direcionado, ponderado",
        "V": grafo.obter_ordem(),
        "E": grafo.obter_tamanho(),
        "densidade": round(grafo.calcular_densidade(), 6),
        "grau_medio": round(sum(grau_valores) / len(grau_valores), 4) if grau_valores else 0,
        "grau_maximo": max(grau_valores) if grau_valores else 0,
        "grau_minimo": min(grau_valores) if grau_valores else 0,
        "distribuicao_graus": {str(k): v for k, v in dist_graus.items()},
        "criterio_arestas": (
            "Dois títulos são conectados se compartilham pelo menos um ator, "
            "diretor ou gênero. Peso = 1 / total_compartilhado (menor peso = "
            "mais similar, favorece Dijkstra para 'caminho mais próximo')."
        ),
    }


# ---------------------------------------------------------------------------
# Item 2 — Execução dos algoritmos
# ---------------------------------------------------------------------------

def _nos_por_grau(grafo: Grafo, excluir_isolados: bool = True) -> list:
    nos = list(grafo.adjacencias.keys())
    if excluir_isolados:
        nos = [n for n in nos if grafo.obter_grau(n) > 0]
    return sorted(nos, key=lambda n: grafo.obter_grau(n), reverse=True)


def _executar_bfs(grafo: Grafo, fontes: list) -> dict:
    resultados = {}
    for src in fontes:
        t0 = time.perf_counter()
        res = bfs_camadas(grafo, src)
        res["tempo_ms"] = round((time.perf_counter() - t0) * 1000, 4)
        resultados[src] = res
    return resultados


def _executar_dfs(grafo: Grafo, fontes: list) -> dict:
    resultados = {}
    for src in fontes:
        t0 = time.perf_counter()
        res = dfs_ciclos(grafo, src)
        res["tempo_ms"] = round((time.perf_counter() - t0) * 1000, 4)
        resultados[src] = res
    return resultados


def _executar_dijkstra(grafo: Grafo, pares: list) -> list:
    resultados = []
    for origem, destino in pares:
        t0 = time.perf_counter()
        custo, caminho = dijkstra(grafo, origem, destino)
        tempo_ms = round((time.perf_counter() - t0) * 1000, 4)
        resultados.append({
            "origem": origem,
            "destino": destino,
            "custo": round(custo, 4) if custo != float("inf") else None,
            "comprimento_caminho": len(caminho),
            "caminho": caminho,
            "tempo_ms": tempo_ms,
        })
    return resultados


def _grafo_sintetico_pesos_negativos() -> Grafo:
    """
    Grafo dirigido com aresta de peso negativo, sem ciclo negativo.
    A→B:4, A→C:5, B→C:-3, C→D:2
    Distâncias de A: B=4, C=1 (via B), D=3
    """
    g = Grafo(dirigido=True)
    for no in ["A", "B", "C", "D"]:
        g.adicionar_no(no)
    g.adicionar_aresta("A", "B",  4.0)
    g.adicionar_aresta("A", "C",  5.0)
    g.adicionar_aresta("B", "C", -3.0)
    g.adicionar_aresta("C", "D",  2.0)
    return g


def _grafo_sintetico_ciclo_negativo() -> Grafo:
    """
    Grafo dirigido com ciclo negativo: B→C→B = 2 + (−4) = −2.
    A→B:1, B→C:2, C→B:-4, C→D:1
    """
    g = Grafo(dirigido=True)
    for no in ["A", "B", "C", "D"]:
        g.adicionar_no(no)
    g.adicionar_aresta("A", "B",  1.0)
    g.adicionar_aresta("B", "C",  2.0)
    g.adicionar_aresta("C", "B", -4.0)
    g.adicionar_aresta("C", "D",  1.0)
    return g


def _executar_bellman_ford(grafo: Grafo) -> dict:
    nos = _nos_por_grau(grafo)
    fonte = nos[0]

    t0 = time.perf_counter()
    dist1, _, ciclo1 = bellman_ford(grafo, fonte)
    tempo1 = round((time.perf_counter() - t0) * 1000, 4)

    g2 = _grafo_sintetico_pesos_negativos()
    t0 = time.perf_counter()
    dist2, _, ciclo2 = bellman_ford(g2, "A")
    tempo2 = round((time.perf_counter() - t0) * 1000, 4)

    g3 = _grafo_sintetico_ciclo_negativo()
    t0 = time.perf_counter()
    _, _, ciclo3 = bellman_ford(g3, "A")
    tempo3 = round((time.perf_counter() - t0) * 1000, 4)

    return {
        "caso1_pesos_positivos": {
            "descricao": "Grafo Netflix real — todos os pesos positivos (1/similaridade). "
                         "BF deve convergir igual ao Dijkstra.",
            "origem": fonte,
            "tem_ciclo_negativo": ciclo1,
            "nos_alcancados": sum(1 for d in dist1.values() if d != float("inf")),
            "tempo_ms": tempo1,
        },
        "caso2_peso_negativo_sem_ciclo": {
            "descricao": "Grafo sintético dirigido: A→B:4, A→C:5, B→C:-3, C→D:2. "
                         "Sem ciclo negativo; BF deve encontrar distâncias corretas.",
            "grafo_arestas": "A→B:4, A→C:5, B→C:-3, C→D:2",
            "origem": "A",
            "tem_ciclo_negativo": ciclo2,
            "distancias_de_A": {k: (round(v, 2) if v != float("inf") else None)
                                for k, v in dist2.items()},
            "distancias_esperadas": {"A": 0, "B": 4, "C": 1, "D": 3},
            "tempo_ms": tempo2,
        },
        "caso3_ciclo_negativo": {
            "descricao": "Grafo sintético dirigido: A→B:1, B→C:2, C→B:-4, C→D:1. "
                         "Ciclo negativo B→C→B = -2; BF deve detectar e sinalizar.",
            "grafo_arestas": "A→B:1, B→C:2, C→B:-4, C→D:1",
            "ciclo_negativo_exemplo": "B→C→B = 2 + (-4) = -2",
            "origem": "A",
            "tem_ciclo_negativo": ciclo3,
            "tempo_ms": tempo3,
        },
    }


def executar_item2(grafo: Grafo) -> dict:
    """Executa BFS, DFS, Dijkstra e Bellman-Ford; registra tempos por execução."""
    nos = _nos_por_grau(grafo)
    fontes = [nos[0], nos[2], nos[4]]
    pares = [
        (nos[0], nos[1]),
        (nos[0], nos[3]),
        (nos[1], nos[4]),
        (nos[2], nos[3]),
        (nos[3], nos[5]),
    ]
    return {
        "bfs":  {"fontes_usadas": fontes, "resultados": _executar_bfs(grafo, fontes)},
        "dfs":  {"fontes_usadas": fontes, "resultados": _executar_dfs(grafo, fontes)},
        "dijkstra": {"pares_usados": [[o, d] for o, d in pares],
                     "resultados": _executar_dijkstra(grafo, pares)},
        "bellman_ford": _executar_bellman_ford(grafo),
    }


# ---------------------------------------------------------------------------
# Item 3 — Métricas de desempenho (benchmark com múltiplas execuções + memória)
# ---------------------------------------------------------------------------

def _benchmark(fn, *args, runs: int = 20) -> tuple:
    """Executa fn(*args) `runs` vezes; retorna (resultado, stats_dict)."""
    tempos = []
    memorias = []
    resultado = None

    for _ in range(runs):
        tracemalloc.start()
        t0 = time.perf_counter()
        resultado = fn(*args)
        tempos.append((time.perf_counter() - t0) * 1000)
        _, pico = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        memorias.append(pico / 1024)

    return resultado, {
        "media_ms":  round(statistics.mean(tempos), 4),
        "min_ms":    round(min(tempos), 4),
        "max_ms":    round(max(tempos), 4),
        "desvio_ms": round(statistics.stdev(tempos), 4),
        "media_kb":  round(statistics.mean(memorias), 2),
        "pico_kb":   round(max(memorias), 2),
    }


def executar_metricas_desempenho(grafo: Grafo, runs: int = 20) -> dict:
    """Item 3: benchmark dos 4 algoritmos com média, mín, máx, desvio e memória."""
    nos = _nos_por_grau(grafo)
    fonte = nos[0]
    par   = (nos[0], nos[3])

    _, s_bfs  = _benchmark(bfs_camadas, grafo, fonte, runs=runs)
    _, s_dfs  = _benchmark(dfs_ciclos,  grafo, fonte, runs=runs)
    _, s_dijk = _benchmark(dijkstra,    grafo, *par,  runs=runs)
    _, s_bf   = _benchmark(bellman_ford, grafo, fonte, runs=runs)

    tabela = [
        {"algoritmo": "BFS",          "complexidade": "O(V+E)",  **s_bfs},
        {"algoritmo": "DFS",          "complexidade": "O(V+E)",  **s_dfs},
        {"algoritmo": "Dijkstra",     "complexidade": "O(V²)",   **s_dijk},
        {"algoritmo": "Bellman-Ford", "complexidade": "O(V·E)",  **s_bf},
    ]

    return {
        "fonte_benchmark": fonte,
        "par_benchmark":   list(par),
        "runs":            runs,
        "nota": (
            "Todos os algoritmos rodados sobre o mesmo grafo Netflix "
            f"({grafo.obter_ordem()} nós, {grafo.obter_tamanho()} arestas). "
            "BFS e DFS partem do mesmo nó fonte; Dijkstra e BF usam o mesmo par origem-destino."
        ),
        "tabela_comparativa": tabela,
    }


# ---------------------------------------------------------------------------
# Item 5 — Discussão crítica
# ---------------------------------------------------------------------------

def _discussao_critica() -> dict:
    return {
        "bfs": (
            "Ideal para encontrar o caminho com menor número de saltos (grafo não-ponderado) "
            "e para explorar títulos a N graus de similaridade. Complexidade O(V+E). "
            "No grafo Netflix, BFS revela que qualquer título conectado está a no máximo "
            "6 camadas de qualquer outro — efeito 'mundo pequeno'."
        ),
        "dfs": (
            "Útil para detectar ciclos e explorar componentes de forma exaustiva. "
            "O alto número de arestas de retorno (456 em 99 nós) confirma que o grafo "
            "é denso em ciclos — esperado, pois muitos títulos compartilham gêneros populares. "
            "DFS é menos intuitivo para recomendações, mas valioso para análise estrutural."
        ),
        "dijkstra": (
            "Algoritmo de escolha para caminhos mínimos com pesos não-negativos. "
            "Com peso = 1/similaridade, Dijkstra encontra o caminho de maior similaridade "
            "acumulada entre dois títulos. A implementação atual é O(V²) — para grafos "
            "maiores, recomenda-se usar heapq para atingir O((V+E)log V)."
        ),
        "bellman_ford": (
            "Suporta pesos negativos e detecta ciclos negativos, mas é O(V·E) — "
            "notavelmente mais lento que Dijkstra no benchmark. No grafo Netflix, "
            "pesos negativos não são naturais (similaridade ≥ 0), por isso BF não "
            "oferece vantagem sobre Dijkstra neste dataset. "
            "BF se justificaria se o modelo incluísse 'penalidades' (ex.: incompatibilidade "
            "de gênero = peso negativo), mas isso exigiria redesenho do modelo de arestas."
        ),
        "design_de_pesos": (
            "O modelo peso = 1/total_compartilhado é consistente e interpretável: "
            "quanto mais atributos compartilhados, menor o custo (maior similaridade). "
            "Limitação: não diferencia o 'valor' de compartilhar um ator vs. um gênero. "
            "Uma melhoria seria peso ponderado: peso_ator > peso_diretor > peso_genero."
        ),
        "componentes_desconexas": (
            "O grafo possui 24 nós isolados e a maior componente conexa tem 99 nós. "
            "Títulos isolados não compartilham nenhum ator, diretor ou gênero com os demais "
            "neste dataset — provavelmente por serem de nichos muito específicos ou "
            "conteúdo internacional sem sobreposição com o restante."
        ),
    }


# ---------------------------------------------------------------------------
# Entrada principal — gera out/parte2_report.json e visualizações
# ---------------------------------------------------------------------------

def gerar_relatorio(caminho_csv: str, caminho_saida: str,
                    pasta_viz: str = "out") -> tuple:
    grafo = construir_grafo_netflix(caminho_csv)

    print("  [1/4] Descrevendo dataset...")
    dataset_info = descrever_dataset(
        grafo, nome="Netflix Top Shows 2016-2025",
        fonte=os.path.basename(caminho_csv),
    )

    print("  [2/4] Executando algoritmos (BFS, DFS, Dijkstra, Bellman-Ford)...")
    algoritmos = executar_item2(grafo)

    print("  [3/4] Benchmark de desempenho (20 execuções cada)...")
    metricas = executar_metricas_desempenho(grafo, runs=20)

    print("  [4/4] Gerando visualizações HTML...")
    arquivos_viz = gerar_todas_visualizacoes(grafo, metricas, pasta_viz)

    relatorio: dict = {
        "dataset":           dataset_info,
        "algoritmos":        algoritmos,
        "metricas_desempenho": metricas,
        "discussao_critica": _discussao_critica(),
        "visualizacoes_geradas": [os.path.basename(a) for a in arquivos_viz],
    }

    os.makedirs(os.path.dirname(caminho_saida), exist_ok=True)
    with open(caminho_saida, "w", encoding="utf-8") as f:
        json.dump(relatorio, f, ensure_ascii=False, indent=2)

    return grafo, relatorio
