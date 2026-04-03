from dataclasses import dataclass, field
from typing import Dict, List, Set

@dataclass
class Aresta:
    destino: str
    peso: float
    tipo: str
    justificativa: str

class GrafoAeroportos:
    def __init__(self):
        # A lista de adjacência mapeia o código IATA para uma lista de objetos Aresta
        self.adjacencias: Dict[str, List[Aresta]] = {}
        # Dicionário opcional para guardar metadados do nó (cidade, região)
        self.nos: Dict[str, dict] = {}

    def adicionar_aeroporto(self, iata: str, cidade: str, regiao: str):
        if iata not in self.adjacencias:
            self.adjacencias[iata] = []
            self.nos[iata] = {"cidade": cidade, "regiao": regiao}

    def adicionar_conexao(self, origem: str, destino: str, peso: float, tipo: str, justificativa: str):
        # Como o grafo é não-direcionado, adicionamos nos dois sentidos [cite: 60]
        nova_aresta_ida = Aresta(destino, peso, tipo, justificativa)
        nova_aresta_volta = Aresta(origem, peso, tipo, justificativa)
        
        self.adjacencias[origem].append(nova_aresta_ida)
        self.adjacencias[destino].append(nova_aresta_volta)

    def obter_vizinhos(self, iata: str) -> List[Aresta]:
        return self.adjacencias.get(iata, [])