import pytest
from src.graphs.grafo_generico import GrafoGenerico
from src.graphs.graph import GrafoAeroportos
from src.graphs.algorithms import bellman_ford


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def grafo_positivo():
    """Grafo não-direcionado com pesos positivos (mesmo usado em test_dijkstra)."""
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


def grafo_peso_negativo_sem_ciclo():
    """
    Grafo dirigido com aresta de peso negativo, mas sem ciclo negativo.
    Arestas: A->B:4, A->C:5, B->C:-3, C->D:2
    Distancias de A: B=4, C=1 (via B), D=3
    """
    g = GrafoGenerico(dirigido=True)
    for no in ["A", "B", "C", "D"]:
        g.adicionar_no(no)
    g.adicionar_aresta("A", "B",  4.0)
    g.adicionar_aresta("A", "C",  5.0)
    g.adicionar_aresta("B", "C", -3.0)
    g.adicionar_aresta("C", "D",  2.0)
    return g


def grafo_ciclo_negativo():
    """
    Grafo dirigido com ciclo negativo: B->C->B = 2 + (-4) = -2.
    Arestas: A->B:1, B->C:2, C->B:-4, C->D:1
    """
    g = GrafoGenerico(dirigido=True)
    for no in ["A", "B", "C", "D"]:
        g.adicionar_no(no)
    g.adicionar_aresta("A", "B",  1.0)
    g.adicionar_aresta("B", "C",  2.0)
    g.adicionar_aresta("C", "B", -4.0)
    g.adicionar_aresta("C", "D",  1.0)
    return g


# ---------------------------------------------------------------------------
# Testes com pesos positivos (deve funcionar como Dijkstra)
# ---------------------------------------------------------------------------

def test_bf_pesos_positivos_distancias_corretas():
    g = grafo_positivo()
    dist, _, ciclo = bellman_ford(g, "A")

    assert not ciclo, "Nao deve detectar ciclo negativo em grafo com pesos positivos"
    assert dist["A"] == 0.0
    assert dist["C"] == 2.0      # A->C direto
    assert dist["B"] == 3.0      # A->C->B = 2+1
    assert dist["D"] == 8.0      # A->C->B->D = 3+5
    assert dist["E"] == 10.0     # A->C->B->D->E = 8+2


def test_bf_no_inalcancavel_retorna_inf():
    g = GrafoAeroportos()
    for no in ["A", "B", "X"]:
        g.adicionar_aeroporto(no, f"Cidade {no}", "Regiao")
    g.adicionar_conexao("A", "B", 1.0, "t", "j")

    dist, _, ciclo = bellman_ford(g, "A")

    assert dist["X"] == float("inf")
    assert not ciclo


# ---------------------------------------------------------------------------
# Teste (i): pesos negativos sem ciclo negativo -> distancias corretas
# ---------------------------------------------------------------------------

def test_bf_peso_negativo_sem_ciclo_distancias_corretas():
    g = grafo_peso_negativo_sem_ciclo()
    dist, _, ciclo = bellman_ford(g, "A")

    assert not ciclo, "Nao deve detectar ciclo negativo — este grafo nao tem ciclos"
    assert dist["A"] == 0.0
    assert dist["B"] == 4.0
    assert dist["C"] == 1.0   # A->B->C = 4 + (-3) = 1, melhor que A->C = 5
    assert dist["D"] == 3.0   # A->B->C->D = 1 + 2


def test_bf_peso_negativo_caminho_reconstruido():
    g = grafo_peso_negativo_sem_ciclo()
    dist, ante, _ = bellman_ford(g, "A")

    caminho = []
    no = "C"
    while no is not None:
        caminho.append(no)
        no = ante[no]
    caminho.reverse()

    assert caminho == ["A", "B", "C"], f"Caminho esperado A->B->C, obtido: {caminho}"


# ---------------------------------------------------------------------------
# Teste (ii): ciclo negativo -> flag True
# ---------------------------------------------------------------------------

def test_bf_detecta_ciclo_negativo():
    g = grafo_ciclo_negativo()
    _, _, ciclo = bellman_ford(g, "A")

    assert ciclo, "Deve detectar o ciclo negativo B->C->B = 2 + (-4) = -2"


def test_bf_ciclo_negativo_flag_independente_do_no_origem():
    """O ciclo negativo deve ser detectado independentemente de onde a BFS parte."""
    g = grafo_ciclo_negativo()
    _, _, ciclo_de_a = bellman_ford(g, "A")
    _, _, ciclo_de_b = bellman_ford(g, "B")

    assert ciclo_de_a, "Ciclo detectado partindo de A"
    assert ciclo_de_b, "Ciclo detectado partindo de B (no proprio ciclo)"
