from src.graphs.io import carregar_grafo
from src.graphs.algorithms import dijkstra

def build_graph():
    return carregar_grafo('data/aeroportos_data.csv', 'data/adjacencias_aeroportos.csv')

def test_dijkstra_caminho_direto():
    g = build_graph()
    custo, caminho = dijkstra(g, "PVH", "RBR")
    
    assert round(custo, 2) == 0.88
    assert caminho == ["PVH", "RBR"]

def test_dijkstra_caminho_indireto():
    g = build_graph()
    custo, caminho = dijkstra(g, "PVH", "REC")
    
    assert round(custo, 2) == 4.73
    assert caminho == ["PVH", "MAO", "REC"]

def test_dijkstra_caminho_inexistente():
    g = build_graph()
    g.adicionar_aeroporto("XYZ", "Cidade XYZ", "Regiao")
    
    custo, caminho = dijkstra(g, "PVH", "XYZ")
    assert custo == float('inf')
    assert caminho == []

def test_dijkstra_mesmo_no():
    g = build_graph()
    custo, caminho = dijkstra(g, "PVH", "PVH")
    assert custo == 0.0
    assert caminho == ["PVH"]

def test_dijkstra_nos_invalidos():
    g = build_graph()
    custo, caminho = dijkstra(g, "XYZ", "WYK")
    assert custo == float('inf')
    assert caminho == []
