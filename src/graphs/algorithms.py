from src.graphs.graph import GrafoAeroportos

def bfs(grafo: GrafoAeroportos, origem: str):
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

def dfs(grafo: GrafoAeroportos, origem: str):
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


def dijkstra(grafo: GrafoAeroportos, origem: str, destino: str):
    if origem not in grafo.adjacencias or destino not in grafo.adjacencias:
        return float('inf'), []
        
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
