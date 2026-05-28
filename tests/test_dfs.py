from src.graphs.graph import Grafo
from src.graphs.algorithms import dfs

def test_dfs_grafo_conexo():
    g = Grafo(dirigido=False)

    for no in ["A", "B", "C", "D"]:
        g.adicionar_no(no, cidade=f"Cidade {no}", regiao="Regiao")

    g.adicionar_aresta("A", "B", 1.0, "t", "j")
    g.adicionar_aresta("A", "C", 1.0, "t", "j")
    g.adicionar_aresta("B", "D", 1.0, "t", "j")
    
    visitados = dfs(g, "A")
    
    assert len(visitados) == 4
    assert set(visitados) == {"A", "B", "C", "D"}
    assert visitados[0] == "A"

def test_dfs_ciclo():
    g = Grafo(dirigido=False)

    for no in ["A", "B", "C"]:
        g.adicionar_no(no, cidade=f"Cidade {no}", regiao="Regiao")

    g.adicionar_aresta("A", "B", 1.0, "t", "j")
    g.adicionar_aresta("B", "C", 1.0, "t", "j")
    g.adicionar_aresta("C", "A", 1.0, "t", "j")
    
    visitados = dfs(g, "A")
    assert len(visitados) == 3
    assert set(visitados) == {"A", "B", "C"}

def test_dfs_no_inexistente():
    g = Grafo(dirigido=False)
    assert dfs(g, "X") == []