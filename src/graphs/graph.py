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
        nova_aresta_ida = Aresta(destino, peso, tipo, justificativa)
        nova_aresta_volta = Aresta(origem, peso, tipo, justificativa)
        
        self.adjacencias[origem].append(nova_aresta_ida)
        self.adjacencias[destino].append(nova_aresta_volta)

    def obter_vizinhos(self, iata: str) -> List[Aresta]:
        return self.adjacencias.get(iata, [])
    
    def obter_ordem(self) -> int:
        """Retorna o número de nós |V|."""
        return len(self.adjacencias)

    def obter_tamanho(self) -> int:
        """Retorna o número de arestas |E|."""
        total_arestas = sum(len(v) for v in self.adjacencias.values())
        return total_arestas // 2

    def calcular_densidade(self) -> float:
        """Calcula a densidade do grafo (não-direcionado)."""
        v = self.obter_ordem()
        e = self.obter_tamanho()
        
        if v < 2:
            return 0.0
        
        return (2 * e) / (v * (v - 1)) 

    def obter_grau(self, iata: str) -> int:
        """Retorna o grau de um aeroporto específico (número de conexões)."""
        return len(self.adjacencias.get(iata, []))