import json
import pandas as pd
from src.graphs.io import carregar_grafo

def processar_parte1():
    grafo = carregar_grafo('data/aeroportos_data.csv', 'data/adjacencias_aeroportos.csv')
    
    global_metrics = {
        "ordem": grafo.obter_ordem(),
        "tamanho": grafo.obter_tamanho(),
        "densidade": round(grafo.calcular_densidade(), 6)
    }
    with open('out/global.json', 'w') as f:
        json.dump(global_metrics, f, indent=4)

    regioes_metrics = []
    regioes = ["Norte", "Nordeste", "Sudeste", "Sul", "Centro-Oeste"]
    
    for r in regioes:
        nos_regiao = [iata for iata, dados in grafo.nos.items() if dados['regiao'] == r]
        
        arestas_internas = 0
        for u in nos_regiao:
            for aresta in grafo.obter_vizinhos(u):
                if aresta.destino in nos_regiao:
                    arestas_internas += 1
        
        v_r = len(nos_regiao)
        e_r = arestas_internas // 2
        dens_r = (2 * e_r) / (v_r * (v_r - 1)) if v_r > 1 else 0
        
        regioes_metrics.append({
            "regiao": r,
            "ordem": v_r,
            "tamanho": e_r,
            "densidade": round(dens_r, 6)
        })
    
    with open('out/regioes.json', 'w') as f:
        json.dump(regioes_metrics, f, indent=4)

    ego_data = []
    for v in grafo.adjacencias.keys():
        vizinhos = [a.destino for a in grafo.obter_vizinhos(v)]
        ego_nodes = set([v] + vizinhos)
        
        ego_edges = 0
        for node in ego_nodes:
            for edge in grafo.obter_vizinhos(node):
                if edge.destino in ego_nodes:
                    ego_edges += 1
        
        v_ego = len(ego_nodes)
        e_ego = ego_edges // 2
        dens_ego = (2 * e_ego) / (v_ego * (v_ego - 1)) if v_ego > 1 else 0
        
        ego_data.append({
            "aeroporto": v,
            "grau": grafo.obter_grau(v),
            "ordem_ego": v_ego,
            "tamanho_ego": e_ego,
            "densidade_ego": round(dens_ego, 6)
        })
    
    df_ego = pd.DataFrame(ego_data)
    df_ego.to_csv('out/ego_aeroportos.csv', index=False)
    
    df_ego[['aeroporto', 'grau']].to_csv('out/graus.csv', index=False)

if __name__ == "__main__":
    processar_parte1()