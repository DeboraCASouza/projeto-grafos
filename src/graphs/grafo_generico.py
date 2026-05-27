from dataclasses import dataclass
from typing import Dict, List


@dataclass
class Aresta:
    destino: str
    peso: float
    tipo: str = ""
    justificativa: str = ""


class GrafoGenerico:
    def __init__(self, dirigido: bool = False):
        self.dirigido = dirigido
        self.adjacencias: Dict[str, List[Aresta]] = {}
        self.nos: Dict[str, dict] = {}

    def adicionar_no(self, id: str, **metadados):
        if id not in self.adjacencias:
            self.adjacencias[id] = []
            self.nos[id] = metadados

    def adicionar_aresta(self, origem: str, destino: str, peso: float,
                         tipo: str = "", justificativa: str = ""):
        if origem not in self.adjacencias:
            self.adicionar_no(origem)
        if destino not in self.adjacencias:
            self.adicionar_no(destino)

        self.adjacencias[origem].append(Aresta(destino, peso, tipo, justificativa))
        if not self.dirigido:
            self.adjacencias[destino].append(Aresta(origem, peso, tipo, justificativa))

    def obter_vizinhos(self, id: str) -> List[Aresta]:
        return self.adjacencias.get(id, [])

    def obter_ordem(self) -> int:
        return len(self.adjacencias)

    def obter_tamanho(self) -> int:
        total = sum(len(v) for v in self.adjacencias.values())
        return total if self.dirigido else total // 2

    def calcular_densidade(self) -> float:
        v = self.obter_ordem()
        e = self.obter_tamanho()
        if v < 2:
            return 0.0
        if self.dirigido:
            return e / (v * (v - 1))
        return (2 * e) / (v * (v - 1))

    def obter_grau(self, id: str) -> int:
        return len(self.adjacencias.get(id, []))

    def distribuicao_graus(self) -> Dict[int, int]:
        dist: Dict[int, int] = {}
        for no in self.adjacencias:
            grau = self.obter_grau(no)
            dist[grau] = dist.get(grau, 0) + 1
        return dict(sorted(dist.items()))
