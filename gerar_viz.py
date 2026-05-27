from src.graphs.io import carregar_grafo
from src.viz import gerar_todas

grafo = carregar_grafo('data/aeroportos_data.csv', 'data/adjacencias_aeroportos.csv')
gerar_todas(grafo)
