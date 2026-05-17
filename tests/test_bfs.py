from src.graphs.graph import GrafoAeroportos
from src.graphs.algorithms import bfs

def test_bfs_grafo_desconexo():
    g = GrafoAeroportos()

    g.adicionar_aeroporto("A", "Cidade A", "Regiao")
    g.adicionar_aeroporto("B", "Cidade B", "Regiao")
    g.adicionar_aeroporto("C", "Cidade C", "Regiao")
    g.adicionar_conexao("A", "B", 1.0, "tipo", "justificativa")
    
    visitados = bfs(g, "A")
    assert visitados == ["A", "B"]
    
    visitados_c = bfs(g, "C")
    assert visitados_c == ["C"]

def test_bfs_grafo_conexo():
    g = GrafoAeroportos()

    for no in ["A", "B", "C", "D"]:
        g.adicionar_aeroporto(no, f"Cidade {no}", "Regiao")
        
    g.adicionar_conexao("A", "B", 1.0, "t", "j")
    g.adicionar_conexao("A", "C", 1.0, "t", "j")
    g.adicionar_conexao("B", "D", 1.0, "t", "j")
    
    visitados = bfs(g, "A")
    assert set(visitados) == {"A", "B", "C", "D"}
    assert visitados[0] == "A"

    assert visitados.index("D") > visitados.index("B")

def test_bfs_no_inexistente():
    g = GrafoAeroportos()
    assert bfs(g, "X") == []
