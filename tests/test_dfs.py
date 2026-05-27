from src.graphs.io import carregar_grafo
from src.graphs.algorithms import dfs

def test_dfs_grafo_conexo():
    g = carregar_grafo('data/aeroportos_data.csv', 'data/adjacencias_aeroportos.csv')
    
    visitados = dfs(g, "PVH")
    
    assert len(visitados) == 20
    assert visitados[0] == "PVH"
    
    codigos_esperados = {
        "REC", "SSA", "FOR", "NAT", "JPA", "GRU", "CGH", "GIG", "CNF", "VIX",
        "BSB", "GYN", "CWB", "FLN", "POA", "MAO", "BEL", "PVH", "RBR", "THE"
    }
    assert set(visitados) == codigos_esperados

def test_dfs_ciclo():
    g = carregar_grafo('data/aeroportos_data.csv', 'data/adjacencias_aeroportos.csv')
    
    visitados = dfs(g, "PVH")
    
    assert len(visitados) == 20
    assert len(set(visitados)) == 20

def test_dfs_no_inexistente():
    g = carregar_grafo('data/aeroportos_data.csv', 'data/adjacencias_aeroportos.csv')
    assert dfs(g, "XYZ") == []
