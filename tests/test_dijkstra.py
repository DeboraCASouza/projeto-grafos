from src.graphs.graph import Grafo
from src.graphs.algorithms import dijkstra
import pytest

def build_graph():
    g = Grafo(dirigido=False)
    for no in ["A", "B", "C", "D", "E"]:
        g.adicionar_no(no, cidade=f"Cidade {no}", regiao="Regiao")
        
    g.adicionar_aresta("A", "B", 4.0, "t", "j")
    g.adicionar_aresta("A", "C", 2.0, "t", "j")
    g.adicionar_aresta("B", "C", 1.0, "t", "j")
    g.adicionar_aresta("B", "D", 5.0, "t", "j")
    g.adicionar_aresta("C", "D", 8.0, "t", "j")
    g.adicionar_aresta("C", "E", 10.0, "t", "j")
    g.adicionar_aresta("D", "E", 2.0, "t", "j")
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
    g.adicionar_no("F", cidade="Cidade F", regiao="Regiao")
    
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

def test_dijkstra_rejeita_peso_negativo():
    g = Grafo(dirigido=False)
    for no in ["A", "B", "C"]:
        g.adicionar_no(no, cidade=f"Cidade {no}", regiao="Regiao")
    g.adicionar_aresta("A", "B",  2.0, "t", "j")
    g.adicionar_aresta("B", "C", -1.0, "t", "j")   # peso negativo

    with pytest.raises(ValueError):
        dijkstra(g, "A", "C")