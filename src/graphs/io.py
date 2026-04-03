import pandas as pd
from .graph import GrafoAeroportos

def carregar_grafo(caminho_nos, caminho_arestas):

    grafo = GrafoAeroportos()

    df_nos = pd.read_csv(caminho_nos)
    for _, linha in df_nos.iterrows():
        grafo.adicionar_aeroporto(
            iata=linha['iata'], 
            cidade=linha['cidade'], 
            regiao=linha['regiao']
        )


    try:
        df_arestas = pd.read_csv(caminho_arestas)
        for _, linha in df_arestas.iterrows():
            grafo.adicionar_conexao(
                origem=linha['origem'],
                destino=linha['destino'],
                peso=float(linha['peso']),
                tipo=linha['tipo_conexao'],
                justificativa=linha['justificativa']
            )
    except FileNotFoundError:
        print(f"Aviso: Arquivo {caminho_arestas} não encontrado. O grafo iniciará sem arestas.")

    return grafo
