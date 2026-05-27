# Rede de Aeroportos do Brasil + Comparação de Algoritmos

Projeto final da disciplina de Teoria dos Grafos (e AVD). Modela a malha aérea brasileira como um grafo ponderado não-direcionado e compara quatro algoritmos de grafo (BFS, DFS, Dijkstra e Bellman-Ford) em corretude e desempenho — inclusive sobre um dataset maior (Netflix, Parte 2).

## Estrutura

```
projeto-grafos/
├── data/
│   ├── aeroportos_data.csv          # 20 aeroportos (IATA, cidade, região)
│   ├── adjacencias_aeroportos.csv   # 115 conexões construídas (peso = duração do voo)
│   ├── rotas.csv                    # pares obrigatórios + extras para Dijkstra
│   └── dataset_parte2/
│       └── 01_Netflix_2016_2025.csv # dataset Netflix (Parte 2)
├── src/
│   ├── cli.py                       # interface de linha de comando
│   ├── solve.py                     # métricas globais e caminhos mínimos (Parte 1)
│   ├── parte2.py                    # análise completa da Parte 2
│   ├── viz.py                       # visualizações da Parte 1
│   ├── viz_parte2.py                # visualizações da Parte 2
│   └── graphs/
│       ├── graph.py                 # GrafoAeroportos (lista de adjacência)
│       ├── grafo_generico.py        # GrafoGenerico (dirigido/não-dirigido)
│       ├── algorithms.py            # BFS, DFS, Dijkstra, Bellman-Ford
│       ├── io.py                    # leitura do CSV de aeroportos
│       └── io_netflix.py            # construção do grafo Netflix
├── tests/                           # pytest
├── out/                             # saídas geradas (.json, .csv, .html, .png)
└── requirements.txt
```

## Instalação

```bash
pip install -r requirements.txt
```

## Como executar

### Parte 1 — Rede de Aeroportos

```bash
# BFS a partir de Recife
python -m src.cli --dataset data/aeroportos_data.csv --alg BFS --source REC --out out/

# Dijkstra de Recife a Porto Alegre
python -m src.cli --dataset data/aeroportos_data.csv --alg DIJKSTRA --source REC --target POA --out out/

# Todas as métricas + caminhos mínimos (gera global.json, regioes.json, ego_aeroportos.csv, distancias_rotas.csv)
python -m src.cli --dataset data/aeroportos_data.csv --solve --out out/

# Todas as visualizações (gera HTMLs e PNGs em out/)
python -m src.cli --dataset data/aeroportos_data.csv --viz --out out/

# Atalho rápido para visualizações
python gerar_viz.py
```

### Parte 2 — Dataset Netflix + Comparação de Algoritmos

```bash
python -c "
from src.parte2 import gerar_relatorio
gerar_relatorio('data/dataset_parte2/01_Netflix_2016_2025.csv', 'out/parte2_report.json', pasta_viz='out')
"
```

Isso gera:
- `out/parte2_report.json` — descrição do dataset, resultados de BFS/DFS/Dijkstra/BF, benchmark e discussão crítica
- `out/parte2_distribuicao_graus.html` — histograma de graus
- `out/parte2_comparacao_algoritmos.html` — comparação de tempo e memória dos algoritmos
- `out/parte2_grafo_amostra.html` — rede interativa dos 45 títulos mais conectados

### Testes

```bash
# Todos os testes
python -m pytest tests/ -v

# Um arquivo específico
python -m pytest tests/test_bellman_ford.py -v
```

## Saídas obrigatórias

| Arquivo | Descrição |
|---|---|
| `out/global.json` | Ordem, tamanho e densidade do grafo completo |
| `out/regioes.json` | Métricas por região (Norte, Nordeste, Sudeste, Sul, Centro-Oeste) |
| `out/ego_aeroportos.csv` | Grau, ordem, tamanho e densidade da ego-rede por aeroporto |
| `out/graus.csv` | Ranking de aeroportos por grau |
| `out/distancias_rotas.csv` | Custo e caminho Dijkstra para cada rota (incl. REC→POA e MAO→GRU) |
| `out/arvore_percurso.html` | Árvore interativa dos caminhos obrigatórios |
| `out/grafo_interativo.html` | Grafo completo interativo com busca e destaque de caminhos |
| `out/parte2_report.json` | Relatório completo da Parte 2 |

## Modelo de pesos (Parte 1)

As arestas foram construídas a partir de dados reais de voos VRA (ANAC) e classificadas como:
- `regional` — conexão entre aeroportos da mesma região
- `hub` — conexão inter-regional via aeroporto hub

O peso representa a duração média do voo em horas. Pesos negativos são rejeitados por Dijkstra (`ValueError`). Nenhum peso é negativo na Parte 1; Bellman-Ford com pesos negativos é exclusivo da Parte 2.

## Modelo de grafo Netflix (Parte 2)

- **Nós**: 182 títulos únicos (2016–2025)
- **Arestas**: dois títulos são conectados se compartilham >= 1 ator, diretor ou gênero
- **Peso**: `1 / total_compartilhado` — quanto mais em comum, menor o custo (maior similaridade)
- **Tipo**: não-direcionado, ponderado, com 24 nós isolados e maior componente de 99 nós
