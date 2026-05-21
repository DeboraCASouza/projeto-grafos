from src.graphs.io import carregar_grafo
from src.graphs.algorithms import bfs

def test_bfs_grafo_desconexo():
    g = carregar_grafo('data/aeroportos_data.csv', 'data/adjacencias_aeroportos.csv')
    
    g.adicionar_aeroporto("XYZ", "Cidade XYZ", "Regiao")
    
    visitados = bfs(g, "PVH")
    assert "XYZ" not in visitados
    assert len(visitados) == 20 
    
    visitados_xyz = bfs(g, "XYZ")
    assert visitados_xyz == ["XYZ"]

def test_bfs_grafo_conexo():
    g = carregar_grafo('data/aeroportos_data.csv', 'data/adjacencias_aeroportos.csv')
    
    visitados = bfs(g, "PVH")
    assert len(visitados) == 20
    assert visitados[0] == "PVH"
    
    codigos_esperados = {
        "REC", "SSA", "FOR", "NAT", "JPA", "GRU", "CGH", "GIG", "CNF", "VIX",
        "BSB", "GYN", "CWB", "FLN", "POA", "MAO", "BEL", "PVH", "RBR", "THE"
    }
    assert set(visitados) == codigos_esperados
    
    for vizinho in ["MAO", "BSB", "CNF", "RBR"]:
        assert vizinho in visitados
        assert visitados.index(vizinho) < 10

def test_bfs_no_inexistente():
    g = carregar_grafo('data/aeroportos_data.csv', 'data/adjacencias_aeroportos.csv')
    assert bfs(g, "XYZ") == []
