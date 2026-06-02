# Rede de Aeroportos do Brasil + Comparação de Algoritmos (Netflix)

Projeto final da disciplina de Teoria dos Grafos (e AVD). Modela a malha aérea brasileira como um grafo ponderado não-direcionado e compara quatro algoritmos de grafo (BFS, DFS, Dijkstra e Bellman-Ford) em corretude e desempenho — inclusive sobre um dataset maior (Netflix, Parte 2).

---

## 📂 Estrutura do Projeto

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

---

## 🛠️ Instalação e Configuração

O projeto inclui um ambiente virtual (`venv`) pré-configurado. Para ativá-lo e instalar as dependências:

1. **Ative o ambiente virtual:**
   ```bash
   # No macOS / Linux:
   source venv/bin/activate

   # No Windows:
   venv\Scripts\activate
   ```

2. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

---

## 🚀 Como Executar o Projeto

Todos os comandos a seguir devem ser executados a partir da raiz do projeto.

### Parte 1 — Rede de Aeroportos (Brasil)

#### Executar o Solver (Cálculo de Métricas e Rotas)
Este script computa as métricas globais, métricas por região, métricas de redes ego e calcula o caminho mínimo para a lista de rotas pré-definidas em `data/rotas.csv`:
```bash
python -m src.solve
```
As saídas serão salvas diretamente em `out/` (ou em `out/metricas/` caso rode via CLI).

#### Gerar Visualizações
Gera gráficos analíticos, exploratórios, explanatórios, a árvore de percurso e o grafo interativo:
```bash
python gerar_viz.py
```
As saídas serão salvas em `out/` e `out/interativo/`.

#### Executar Algoritmos Individuais via CLI
* **BFS (Busca em Largura) a partir de Recife (REC):**
  ```bash
  python -m src.cli --dataset data/aeroportos_data.csv --alg BFS --source REC --out out/
  ```
* **Dijkstra (Caminho Mínimo) de Recife (REC) a Porto Alegre (POA):**
  ```bash
  python -m src.cli --dataset data/aeroportos_data.csv --alg DIJKSTRA --source REC --target POA --out out/
  ```
* **Todas as Métricas + Caminhos Mínimos via CLI:**
  ```bash
  python -m src.cli --dataset data/aeroportos_data.csv --solve --out out/
  ```
* **Todas as Visualizações via CLI:**
  ```bash
  python -m src.cli --dataset data/aeroportos_data.csv --viz --out out/
  ```

---

### Parte 2 — Dataset Netflix + Comparação de Algoritmos

Gera a descrição do dataset, executa benchmarks de desempenho (tempo e consumo de memória) comparando **BFS**, **DFS**, **Dijkstra** e **Bellman-Ford**, além de gerar visualizações interativas específicas para essa parte:
```bash
python -m src.parte2
```

Isso gerará:
- `out/parte2_report.json` — Descrição do dataset, resultados dos algoritmos, benchmark e discussão crítica.
- `out/parte2_distribuicao_graus.html` — Histograma interativo de distribuição de graus.
- `out/parte2_comparacao_algoritmos.html` — Gráficos comparativos de tempo e memória.
- `out/parte2_grafo_amostra.html` — Subgrafo interativo dos 45 títulos mais conectados do catálogo.

---

## 🧪 Executando os Testes

O projeto utiliza `pytest` para testar os algoritmos de grafos. Para executá-los:

```bash
# Executar todos os testes
python -m pytest tests/ -v

# Executar um arquivo de teste específico
python -m pytest tests/test_bellman_ford.py -v
```

---

## 📊 Saídas Obrigatórias

Ao executar o projeto, os seguintes artefatos são gerados na pasta `out/`:

| Arquivo | Descrição |
|---|---|
| `out/global.json` | Ordem, tamanho e densidade do grafo completo de aeroportos. |
| `out/regioes.json` | Métricas por região (Norte, Nordeste, Sudeste, Sul, Centro-Oeste). |
| `out/ego_aeroportos.csv` | Grau, ordem, tamanho e densidade da rede ego por aeroporto. |
| `out/graus.csv` | Ranking dos aeroportos por grau. |
| `out/distancias_rotas.csv` | Custo e caminho Dijkstra para cada rota (ex: REC→POA, MAO→GRU). |
| `out/arvore_percurso.html` | Árvore interativa dos caminhos obrigatórios. |
| `out/grafo_interativo.html` | Grafo completo interativo com busca e destaque de caminhos. |
| `out/parte2_report.json` | Relatório detalhado dos algoritmos e benchmarks da Parte 2. |

---

## 🧠 Modelos de Grafos

### Modelo de Pesos (Parte 1 — Aeroportos)
As arestas representam voos reais extraídos do VRA (ANAC) e são classificadas como:
- `regional` — conexões dentro da mesma região geográfica.
- `hub` — conexões inter-regionais que envolvem aeroportos hubs.

O **peso** de cada aresta representa a duração média do voo em horas. Como os pesos são sempre positivos, são ideais para o algoritmo de Dijkstra.

### Modelo de Grafo Netflix (Parte 2)
- **Nós**: 182 títulos únicos de séries/filmes da Netflix (2016–2025).
- **Arestas**: dois títulos são conectados se compartilharem pelo menos 1 ator, diretor ou gênero.
- **Peso**: `1 / total_compartilhado` — quanto mais atributos em comum, menor é o peso da aresta (maior a similaridade). Ideal para caminhos mais curtos por afinidade.
- **Estrutura**: Grafo não-direcionado, ponderado, contendo 24 nós isolados e a maior componente conexa com 99 nós.
