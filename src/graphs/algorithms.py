from .graph import Grafo

def bfs(grafo: Grafo, origem: str):
    if origem not in grafo.adjacencias:
        return []
    
    visitados = set()
    fila = [origem]

    visitados.add(origem)
    ordem_visita = []

    while fila:
        atual = fila.pop(0)
        ordem_visita.append(atual)
        
        for aresta in grafo.obter_vizinhos(atual):
            if aresta.destino not in visitados:
                visitados.add(aresta.destino)
                fila.append(aresta.destino)
                
    return ordem_visita

def dfs(grafo: Grafo, origem: str):
    if origem not in grafo.adjacencias:
        return []
        
    visitados = set()
    ordem_visita = []
    
    def explorar(no: str):
        visitados.add(no)
        ordem_visita.append(no)
        
        for aresta in grafo.obter_vizinhos(no):
            vizinho = aresta.destino
            if vizinho not in visitados:
                explorar(vizinho)
                
    explorar(origem)
    return ordem_visita


def dijkstra(grafo: Grafo, origem: str, destino: str):
    if origem not in grafo.adjacencias or destino not in grafo.adjacencias:
        return float('inf'), []

    for no in grafo.adjacencias:
        for aresta in grafo.obter_vizinhos(no):
            if aresta.peso < 0:
                raise ValueError(
                    f"Dijkstra não suporta pesos negativos: "
                    f"aresta {no}→{aresta.destino} tem peso {aresta.peso}"
                )

    distancia_minima = {no: float('inf') for no in grafo.adjacencias}
    distancia_minima[origem] = 0.0
    
    nao_visitados = set(grafo.adjacencias.keys())
    
    antecessores = {no: None for no in grafo.adjacencias}
    
    while nao_visitados:
        no_atual = min(nao_visitados, key=lambda no: distancia_minima[no])
        
        if distancia_minima[no_atual] == float('inf'):
            break
            
        if no_atual == destino:
            break
            
        nao_visitados.remove(no_atual)
        
        for aresta in grafo.obter_vizinhos(no_atual):
            vizinho = aresta.destino
            if vizinho in nao_visitados:
                peso_aresta = aresta.peso
                nova_distancia = distancia_minima[no_atual] + peso_aresta
                
                if nova_distancia < distancia_minima[vizinho]:
                    distancia_minima[vizinho] = nova_distancia
                    antecessores[vizinho] = no_atual
                    
    if distancia_minima[destino] == float('inf'):
        return float('inf'), []
        
    caminho_final = []
    passo = destino
    while passo is not None:
        caminho_final.append(passo)
        passo = antecessores[passo]
        
    caminho_final.reverse()
    
    return distancia_minima[destino], caminho_final


def bfs_camadas(grafo: Grafo, origem: str) -> dict:
    """BFS retornando camadas de distância a partir da origem."""
    if origem not in grafo.adjacencias:
        return {}

    camada: dict = {origem: 0}
    fila = [origem]
    ordem: list = []

    while fila:
        atual = fila.pop(0)
        ordem.append(atual)
        for aresta in grafo.obter_vizinhos(atual):
            v = aresta.destino
            if v not in camada:
                camada[v] = camada[atual] + 1
                fila.append(v)

    por_camada: dict = {}
    for no, c in camada.items():
        por_camada.setdefault(c, []).append(no)

    return {
        "origem": origem,
        "nos_alcancados": len(camada),
        "num_camadas": max(camada.values()) + 1,
        "tamanho_por_camada": {c: len(nos) for c, nos in sorted(por_camada.items())},
        "ordem_visita": ordem,
    }


def dfs_ciclos(grafo: Grafo, origem: str) -> dict:
    """DFS com detecção de ciclos e classificação de arestas (grafo não-direcionado)."""
    if origem not in grafo.adjacencias:
        return {}

    cor: dict = {}
    arestas_arvore: list = []
    arestas_retorno: list = []
    ordem: list = []

    def visitar(u: str, pai) -> None:
        cor[u] = "cinza"
        ordem.append(u)
        for aresta in grafo.obter_vizinhos(u):
            v = aresta.destino
            if v not in cor:
                arestas_arvore.append((u, v))
                visitar(v, u)
            elif cor[v] == "cinza" and v != pai:
                arestas_retorno.append((u, v))
        cor[u] = "preto"

    visitar(origem, None)

    return {
        "origem": origem,
        "nos_visitados": len(cor),
        "arestas_arvore": len(arestas_arvore),
        "ciclo_detectado": len(arestas_retorno) > 0,
        "num_arestas_retorno": len(arestas_retorno),
        "exemplos_arestas_retorno": [f"{u}→{v}" for u, v in arestas_retorno[:3]],
        "ordem_visita": ordem,
    }


def bellman_ford(grafo: Grafo, origem: str) -> tuple:
    """
    Bellman-Ford: caminhos mínimos com suporte a pesos negativos.
    Detecta ciclos negativos na V-ésima iteração.
    """
    nos = list(grafo.adjacencias.keys())
    dist: dict = {no: float("inf") for no in nos}
    dist[origem] = 0.0
    ante: dict = {no: None for no in nos}

    arestas = [
        (u, aresta.destino, aresta.peso)
        for u in grafo.adjacencias
        for aresta in grafo.obter_vizinhos(u)
    ]

    for _ in range(len(nos) - 1):
        atualizado = False
        for u, v, w in arestas:
            if dist[u] != float("inf") and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                ante[v] = u
                atualizado = True
        if not atualizado:
            break

    tem_ciclo_negativo = any(
        dist[u] != float("inf") and dist[u] + w < dist[v]
        for u, v, w in arestas
    )

    return dist, ante, tem_ciclo_negativo