from src.graphs.graph import GrafoAeroportos
from src.graphs.algorithms import dfs

def test_dfs_grafo_conexo():
    g = GrafoAeroportos()

    for no in ["A", "B", "C", "D"]:
        g.adicionar_aeroporto(no, f"Cidade {no}", "Regiao")

    g.adicionar_conexao("A", "B", 1.0, "t", "j")
    g.adicionar_conexao("A", "C", 1.0, "t", "j")
    g.adicionar_conexao("B", "D", 1.0, "t", "j")
    
    visitados = dfs(g, "A")
    
    assert len(visitados) == 4
    assert set(visitados) == {"A", "B", "C", "D"}
    assert visitados[0] == "A"

def test_dfs_ciclo():
    g = GrafoAeroportos()

    for no in ["A", "B", "C"]:
        g.adicionar_aeroporto(no, f"Cidade {no}", "Regiao")

    g.adicionar_conexao("A", "B", 1.0, "t", "j")
    g.adicionar_conexao("B", "C", 1.0, "t", "j")
    g.adicionar_conexao("C", "A", 1.0, "t", "j")
    
    visitados = dfs(g, "A")
    assert len(visitados) == 3
    assert set(visitados) == {"A", "B", "C"}

def test_dfs_no_inexistente():
    g = GrafoAeroportos()
    assert dfs(g, "X") == []
