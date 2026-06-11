# Projeto Garotas — Grafos + AVD

Projeto final da disciplina de **Teoria dos Grafos** integrada com **Análise e Visualização de Dados (AVD)**. Modela a malha aérea brasileira (Parte 1) e uma rede de similaridade Netflix (Parte 2) como grafos ponderados, implementando BFS, DFS, Dijkstra e Bellman-Ford do zero. Inclui um dashboard React/TypeScript completo com visualizações Gestalt, storytelling analítico e benchmarks comparativos.

---

## Estrutura do Projeto

```
projeto-garotas/
├── data/
│   ├── aeroportos_data.csv             # 20 aeroportos (IATA, cidade, região)
│   ├── adjacencias_aeroportos.csv      # 115 conexões (peso = distância euclidiana)
│   ├── rotas.csv                       # pares obrigatórios + extras para Dijkstra
│   └── dataset_parte2/
│       └── 01_Netflix_2016_2025.csv    # dataset Netflix (Parte 2)
├── src/
│   ├── cli.py                          # interface de linha de comando
│   ├── solve.py                        # métricas globais e caminhos mínimos (Parte 1)
│   ├── parte2.py                       # análise completa da Parte 2
│   ├── viz.py                          # visualizações estáticas e HTML da Parte 1
│   ├── viz_parte2.py                   # visualizações estáticas e HTML da Parte 2
│   └── graphs/
│       ├── graph.py                    # classe Grafo (lista de adjacência, dirigido/não-dirigido)
│       ├── algorithms.py               # BFS, DFS, Dijkstra, Bellman-Ford (sem bibliotecas externas)
│       ├── io.py                       # leitura do CSV de aeroportos → Grafo
│       └── io_netflix.py              # construção do grafo Netflix a partir do CSV
├── frontend/                           # dashboard React + TypeScript (Vite)
│   └── src/
│       ├── pages/
│       │   ├── DashboardGeneral.tsx    # visão geral com métricas globais
│       │   ├── Parte1Airports.tsx      # mapa Leaflet interativo (sidebar colapsável)
│       │   ├── Parte1Stats.tsx         # estatísticas + visualização Gestalt (SVG geográfico)
│       │   ├── Parte1Narrativa.tsx     # storytelling analítico em 6 seções
│       │   ├── Parte2Netflix.tsx       # grafo Vis.js interativo (sidebar colapsável)
│       │   ├── Parte2Stats.tsx         # estatísticas da rede Netflix
│       │   ├── Parte2Benchmark.tsx     # benchmarks visuais padronizados (tempo, memória, escala)
│       │   ├── Parte2Narrativa.tsx     # narrativa analítica Netflix + limitações do modelo
│       │   └── Documentation.tsx       # documentação técnica do projeto
│       ├── components/
│       │   ├── Navbar.tsx              # navegação em grupos (Parte 1 / Parte 2)
│       │   ├── LeafletMap.tsx          # mapa geográfico com rotas animadas
│       │   ├── NetflixNetwork.tsx      # grafo Vis.js com toggle de física
│       │   ├── RechartsDegreeDist.tsx  # histograma de distribuição de graus
│       │   └── RechartsBenchmark.tsx   # gráficos de benchmark
│       └── data/
│           ├── airportsData.ts         # metadados, arestas e rotas dos aeroportos
│           ├── airportsCoords.ts       # coordenadas lat/lng dos 20 aeroportos
│           └── netflixData.ts          # nós e arestas do grafo Netflix
├── tests/                              # pytest — BFS, DFS, Dijkstra, Bellman-Ford
├── out/                                # artefatos gerados
│   ├── metricas/                       # JSON/CSV com métricas calculadas
│   ├── algoritmos/                     # JSON por execução de algoritmo via CLI
│   ├── visualizacoes/                  # PNGs (exploratória, explanatória, analítica)
│   ├── interativo/                     # HTMLs Pyvis interativos
│   └── parte2_report.json              # relatório completo da Parte 2
├── requisitos/
│   └── avd.md                          # rubrica de avaliação AVD
├── gerar_viz.py                        # atalho para gerar todas as visualizações
└── requirements.txt
```

---

## Instalação e Execução

### Python (backend / análise)

```bash
# 1. Criar e ativar ambiente virtual
python -m venv venv
source venv/bin/activate          # macOS / Linux
# venv\Scripts\activate           # Windows

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Gerar métricas da Parte 1
python -m src.solve

# 4. Gerar todas as visualizações (PNGs + HTMLs interativos)
python gerar_viz.py

# 5. Executar análise completa da Parte 2 (Netflix)
python -m src.parte2

# 6. Rodar os testes
python -m pytest tests/ -v
```

#### CLI — algoritmos individuais

```bash
# BFS a partir de Recife
python -m src.cli --dataset data/aeroportos_data.csv --alg BFS --source REC --out out/

# DFS a partir de Manaus
python -m src.cli --dataset data/aeroportos_data.csv --alg DFS --source MAO --out out/

# Dijkstra de Recife a Porto Alegre
python -m src.cli --dataset data/aeroportos_data.csv --alg DIJKSTRA --source REC --target POA --out out/

# Solver completo (métricas + rotas)
python -m src.cli --dataset data/aeroportos_data.csv --solve --out out/

# Todas as visualizações
python -m src.cli --dataset data/aeroportos_data.csv --viz --out out/
```

### Frontend (React + TypeScript)

```bash
cd frontend
npm install          # apenas na primeira vez
npm run dev          # servidor de desenvolvimento em http://localhost:5173
npm run build        # build de produção
npm run lint         # ESLint
```

---

## Artefatos Gerados

| Arquivo | Descrição |
|---|---|
| `out/metricas/global.json` | Ordem, tamanho e densidade do grafo de aeroportos |
| `out/metricas/regioes.json` | Métricas por região (Norte, Nordeste, Sudeste, Sul, Centro-Oeste) |
| `out/metricas/ego_aeroportos.csv` | Grau, ordem, tamanho e densidade da rede ego por aeroporto |
| `out/metricas/graus.csv` | Ranking dos aeroportos por grau de centralidade |
| `out/metricas/distancias_rotas.csv` | Custo e caminho Dijkstra para cada rota obrigatória |
| `out/interativo/arvore_percurso.html` | Árvore interativa dos caminhos REC→POA e MAO→GRU |
| `out/interativo/grafo_interativo.html` | Grafo completo interativo com filtros por região |
| `out/parte2_report.json` | Relatório completo: dataset, algoritmos, benchmark, discussão |

---

## Modelos de Grafos

### Parte 1 — Rede Aérea Brasileira

- **Vértices**: 20 aeroportos (IATA, cidade, região)
- **Arestas**: 115 conexões de rotas comerciais regulares
- **Peso**: distância euclidiana entre as coordenadas geográficas (lat/lng) de cada par de aeroportos, normalizada em unidades de custo relativo. Pesos sempre positivos — compatível com Dijkstra.
- **Estrutura**: grafo dirigido no backend (`dirigido=True`), com rotas simétricas no dataset; tratado como não-dirigido nas métricas de densidade.
- **Regiões**: Norte, Nordeste, Sudeste, Sul, Centro-Oeste — usadas como canal visual (cor) nas visualizações Gestalt.

### Parte 2 — Rede Netflix

- **Vértices**: 182 títulos únicos de séries/filmes (Netflix Top Shows 2016–2025)
- **Arestas**: dois títulos são conectados se compartilharem ≥ 1 ator principal, diretor/criador ou gênero
- **Peso**: `1 / total_compartilhado` — quanto mais atributos em comum, menor o peso (maior similaridade). Otimizado para Dijkstra encontrar o "caminho mais similar" entre dois shows.
- **Estrutura**: grafo não-dirigido, ponderado; 25 componentes desconexas (24 nós isolados + componente principal com 99 nós)

---

## Dashboard React — Páginas

| Aba | Página | Conteúdo |
|---|---|---|
| Dashboard | `DashboardGeneral` | Métricas globais de ambas as partes |
| Parte 1 › Mapa | `Parte1Airports` | Mapa Leaflet com filtros por região/grau, simulador de rotas e árvore de percurso. Sidebar colapsável. |
| Parte 1 › Estatísticas | `Parte1Stats` | Distribuição de graus, ego-rede, benchmark scatter + **Gestalt SVG** com coordenadas geográficas reais (Similaridade, Região Comum, Conectividade, Figura-Fundo) |
| Parte 1 › Narrativa | `Parte1Narrativa` | Storytelling em 6 seções: Contexto → Exploração → Modelagem → Resultados → Limitações → Conclusão |
| Parte 2 › Rede | `Parte2Netflix` | Grafo Vis.js interativo com toggle de física, filtros por país/grau/similaridade. Sidebar colapsável. |
| Parte 2 › Estatísticas | `Parte2Stats` | Distribuição de graus, IMDb × Grau, distribuição por país, benchmark |
| Parte 2 › Benchmark | `Parte2Benchmark` | Gráficos padronizados de tempo, memória, escala e radar comparativo — eixos e cores consistentes entre algoritmos |
| Parte 2 › Narrativa | `Parte2Narrativa` | Storytelling em 6 seções (mesmo padrão da Parte 1) com limitações do modelo na seção 5 |
| Docs | `Documentation` | Documentação técnica: modelagem, algoritmos, referências |

---

## Requisitos AVD Atendidos

| Critério | Onde está implementado |
|---|---|
| **Gestalt — Similaridade** | Cores por região no SVG geográfico (`Parte1Stats`) |
| **Gestalt — Região Comum** | Áreas tracejadas em volta de cada cluster regional (`Parte1Stats`) |
| **Gestalt — Conectividade** | Espessura de aresta ∝ média dos graus dos nós conectados (`Parte1Stats`) |
| **Gestalt — Figura-Fundo** | Tamanho dos nós ∝ grau; hubs nacionais com halo de destaque (`Parte1Stats`) |
| **Lei da Proximidade** | Agrupamento de aeroportos por hierarquia de hubs (`Parte1Stats`) |
| **Storytelling Analítico** | Navegação em 6 seções com contexto → conclusão (`Parte1Narrativa`, `Parte2Narrativa`) |
| **Benchmarking Visual** | Gráficos de barras/linhas padronizados, eixos rotulados, cores consistentes (`Parte2Benchmark`) |
| **Discussão Crítica (AVD)** | Limitações do modelo + scorecard na seção 5 da Parte 2 Narrativa (`Parte2Narrativa`) |
| **Filtros Dinâmicos** | Filtro por região, grau mínimo, país, força de conexão — com métricas em tempo real |
| **Interatividade & UX** | Tooltips, hover nos nós, sidebar colapsável, toggle de física no grafo |
| **Hierarquia Visual** | Hubs nacionais (GRU/BSB/GIG/CNF) visualmente distintos em todas as visualizações |
| **Pesos como variável AVD** | Distância euclidiana encoda custo cognitivo como canal pré-atentivo (espessura de aresta) |

---

## Algoritmos Implementados

Todos os algoritmos estão em `src/graphs/algorithms.py`, sem uso de NetworkX ou bibliotecas similares.

| Algoritmo | Complexidade | Caso de uso no projeto |
|---|---|---|
| BFS | O(V+E) | Ordem de visita, camadas de distância (`bfs_camadas`) |
| DFS | O(V+E) | Detecção de ciclos e arestas de retorno (`dfs_ciclos`) |
| Dijkstra | O(V²) | Caminhos mínimos ponderados (pesos ≥ 0) — rotas aéreas e recomendação Netflix |
| Bellman-Ford | O(V·E) | Suporte a pesos negativos, detecção de ciclos negativos |

---

## Testes

```bash
python -m pytest tests/ -v
# 18 testes — BFS (3), DFS (3), Dijkstra (6), Bellman-Ford (6)
```
