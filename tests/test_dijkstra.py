from src.graphs.graph import GrafoAeroportos
from src.graphs.algorithms import dijkstra

def build_graph():
    g = GrafoAeroportos()
    for no in ["A", "B", "C", "D", "E"]:
        g.adicionar_aeroporto(no, f"Cidade {no}", "Regiao")
        
    g.adicionar_conexao("A", "B", 4.0, "t", "j")
    g.adicionar_conexao("A", "C", 2.0, "t", "j")
    g.adicionar_conexao("B", "C", 1.0, "t", "j")
    g.adicionar_conexao("B", "D", 5.0, "t", "j")
    g.adicionar_conexao("C", "D", 8.0, "t", "j")
    g.adicionar_conexao("C", "E", 10.0, "t", "j")
    g.adicionar_conexao("D", "E", 2.0, "t", "j")
    return g

def test_dijkstra_caminho_simples():
    g = build_graph()
    custo, caminho = dijkstra(g, "A", "D")
    
    assert custo == 8.0
    assert caminho == ["A", "C", "B", "D"]

def test_dijkstra_caminho_indireto():
    g = build_graph()
    custo, caminho = dijkstra(g, "A", "E")
    
    assert custo == 10.0
    assert caminho == ["A", "C", "B", "D", "E"]

def test_dijkstra_caminho_inexistente():
    g = build_graph()
    g.adicionar_aeroporto("F", "Cidade F", "Regiao")
    
    custo, caminho = dijkstra(g, "A", "F")
    assert custo == float('inf')
    assert caminho == []

def test_dijkstra_mesmo_no():
    g = build_graph()
    custo, caminho = dijkstra(g, "A", "A")
    assert custo == 0.0
    assert caminho == ["A"]

def test_dijkstra_nos_invalidos():
    g = build_graph()
    custo, caminho = dijkstra(g, "X", "Y")
    assert custo == float('inf')
    assert caminho == []
