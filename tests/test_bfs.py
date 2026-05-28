from src.graphs.graph import Grafo
from src.graphs.algorithms import bfs

def test_bfs_grafo_desconexo():
    g = Grafo(dirigido=False)

    g.adicionar_no("A", cidade="Cidade A", regiao="Regiao")
    g.adicionar_no("B", cidade="Cidade B", regiao="Regiao")
    g.adicionar_no("C", cidade="Cidade C", regiao="Regiao")
    g.adicionar_aresta("A", "B", 1.0, "tipo", "justificativa")
    
    visitados = bfs(g, "A")
    assert visitados == ["A", "B"]
    
    visitados_c = bfs(g, "C")
    assert visitados_c == ["C"]

def test_bfs_grafo_conexo():
    g = Grafo(dirigido=False)

    for no in ["A", "B", "C", "D"]:
        g.adicionar_no(no, cidade=f"Cidade {no}", regiao="Regiao")
        
    g.adicionar_aresta("A", "B", 1.0, "t", "j")
    g.adicionar_aresta("A", "C", 1.0, "t", "j")
    g.adicionar_aresta("B", "D", 1.0, "t", "j")
    
    visitados = bfs(g, "A")
    assert set(visitados) == {"A", "B", "C", "D"}
    assert visitados[0] == "A"

    assert visitados.index("D") > visitados.index("B")

def test_bfs_no_inexistente():
    g = Grafo(dirigido=False)
    assert bfs(g, "X") == []