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
