# Documentação Técnica — Parte 1: Rede de Aeroportos do Brasil

## 1. Modelagem do Grafo

### 1.1 Tipo de grafo

O grafo da Parte 1 é **não-direcionado e ponderado**. Cada aeroporto é um nó rotulado pelo seu código IATA. Cada conexão entre dois aeroportos é uma aresta com peso que representa a duração média do voo (em horas).

A estrutura de dados utilizada é uma **lista de adjacência** implementada do zero (`GrafoAeroportos`), sem uso de bibliotecas de algoritmos de grafos. O carregamento dos dados é feito via `pandas`.

### 1.2 Nós — Aeroportos

O grafo contém **20 aeroportos** distribuídos pelas cinco regiões do Brasil:

| Região | Aeroportos (IATA) |
|---|---|
| Norte | MAO, BEL, PVH, RBR |
| Nordeste | REC, SSA, FOR, NAT, JPA, THE |
| Sudeste | GRU, CGH, GIG, CNF, VIX |
| Sul | CWB, FLN, POA |
| Centro-Oeste | BSB, GYN |

### 1.3 Arestas — Critério de Conexão

As arestas foram construídas a partir de dados reais da **VRA (ANAC)**, que contém voos registrados no período. O script `scripts/generate_adjacencies.py` converteu os códigos ICAO para IATA e computou os pesos.

O arquivo `data/adjacencias_aeroportos.csv` tem formato obrigatório:

```
origem,destino,tipo_conexao,justificativa,peso
BSB,MAO,hub,"Fluxo logístico regional",2.57
CGH,CNF,regional,"Acordo de compartilhamento (Codeshare)",0.88
```

**Requisitos respeitados:**
- O grafo é **conectado** — existe caminho entre qualquer par de aeroportos.
- Existem conexões **intra-regionais** (`tipo_conexao = regional`) e **inter-regionais** (`tipo_conexao = hub`).
- O grafo não é trivialmente completo nem excessivamente esparso.

### 1.4 Modelo de Pesos

O peso de cada aresta representa a **duração média do voo** entre os dois aeroportos, em horas. A fórmula usada foi:

```
peso = duração_média_em_minutos / 60
```

Aplicando penalidades adicionais:

| Situação | Penalidade |
|---|---|
| Conexão inter-regional (hub) | +0.5h |
| Conexão regional direta | sem penalidade |

**Restrição respeitada:** nenhum peso é negativo. Bellman-Ford com pesos negativos é exclusivo da Parte 2.

---

## 2. Métricas Globais

Fonte: `out/global.json`

| Métrica | Valor |
|---|---|
| **Ordem** \|V\| | 20 aeroportos |
| **Tamanho** \|E\| | 115 arestas |
| **Densidade** | 0.6053 |

Fórmula de densidade para grafos não-direcionados:

$$d = \frac{2|E|}{|V|(|V|-1)} = \frac{2 \times 115}{20 \times 19} = 0{,}6053$$

O valor de 0,60 indica um grafo **denso** — mais da metade das conexões possíveis existem, refletindo a alta conectividade da malha aérea nacional.

---

## 3. Métricas por Região (Subgrafos Induzidos)

Fonte: `out/regioes.json`

Cada subgrafo induzido considera apenas os aeroportos daquela região e as arestas exclusivamente entre eles.

| Região | \|V\| | \|E\| | Densidade |
|---|---|---|---|
| Norte | 4 | 4 | 0.6667 |
| Nordeste | 6 | 11 | 0.7333 |
| Sudeste | 5 | 10 | **1.0000** |
| Sul | 3 | 3 | **1.0000** |
| Centro-Oeste | 2 | 1 | **1.0000** |

**Interpretação:** Sudeste, Sul e Centro-Oeste têm densidade 1,0 — todos os aeroportos da região são conectados entre si. O Nordeste tem a maior rede regional em número de aeroportos (6) e apresenta boa conectividade (0,73). O Norte é o menos denso, refletindo as dificuldades logísticas da região amazônica.

---

## 4. Ego-Redes por Aeroporto

Fonte: `out/ego_aeroportos.csv`

A ego-rede de um aeroporto v é o subgrafo induzido por `{v} ∪ N(v)` (o aeroporto e todos os seus vizinhos diretos).

| Aeroporto | Grau | \|V\| ego | \|E\| ego | Densidade ego |
|---|---|---|---|---|
| REC | 15 | 16 | 88 | 0.7333 |
| SSA | 15 | 16 | 91 | 0.7583 |
| FOR | 11 | 12 | 58 | 0.8788 |
| NAT | 11 | 12 | 61 | 0.9242 |
| JPA | 8 | 9 | 36 | **1.0000** |
| GRU | 19 | 20 | 115 | 0.6053 |
| CGH | 14 | 15 | 81 | 0.7714 |
| GIG | 17 | 18 | 105 | 0.6863 |
| CNF | 19 | 20 | 115 | 0.6053 |
| VIX | 8 | 9 | 34 | 0.9444 |
| BSB | 19 | 20 | 115 | 0.6053 |
| GYN | 8 | 9 | 35 | 0.9722 |
| CWB | 9 | 10 | 42 | 0.9333 |
| FLN | 9 | 10 | 40 | 0.8889 |
| POA | 10 | 11 | 50 | 0.9091 |
| MAO | 13 | 14 | 68 | 0.7473 |
| BEL | 9 | 10 | 45 | **1.0000** |
| PVH | 6 | 7 | 20 | 0.9524 |
| RBR | 5 | 6 | 15 | **1.0000** |
| THE | 5 | 6 | 15 | **1.0000** |

---

## 5. Graus e Rankings

Fonte: `out/graus.csv`

### Ranking completo por grau (decrescente)

| # | Aeroporto | Grau |
|---|---|---|
| 1 | **GRU** (São Paulo/Guarulhos) | **19** |
| 1 | **CNF** (Belo Horizonte/Confins) | **19** |
| 1 | **BSB** (Brasília) | **19** |
| 4 | GIG (Rio de Janeiro/Galeão) | 17 |
| 5 | REC (Recife) | 15 |
| 5 | SSA (Salvador) | 15 |
| 7 | CGH (São Paulo/Congonhas) | 14 |
| 8 | MAO (Manaus) | 13 |
| 9 | POA (Porto Alegre) | 10 |
| 10 | CWB (Curitiba) | 9 |
| 10 | FLN (Florianópolis) | 9 |
| 10 | BEL (Belém) | 9 |
| 13 | FOR (Fortaleza) | 11 |
| 13 | NAT (Natal) | 11 |
| 15 | JPA (João Pessoa) | 8 |
| 15 | VIX (Vitória) | 8 |
| 15 | GYN (Goiânia) | 8 |
| 18 | PVH (Porto Velho) | 6 |
| 19 | RBR (Rio Branco) | 5 |
| 19 | THE (Teresina) | 5 |

**Aeroporto mais conectado:** GRU, CNF e BSB (grau 19 — conectados a todos os outros aeroportos do grafo).

**Aeroporto com maior densidade local (ego-rede):** JPA, BEL, RBR e THE (densidade ego = 1,0 — vizinhança completamente conectada).

---

## 6. Caminhos Mínimos — Dijkstra

Fonte: `out/distancias_rotas.csv`

O algoritmo de Dijkstra foi implementado com varredura O(V²) sobre o conjunto de não-visitados. Pesos negativos são rejeitados com `ValueError`.

### Rotas obrigatórias e adicionais

| Origem | Destino | Custo (h) | Caminho |
|---|---|---|---|
| **REC** | **POA** | **3,62** | **REC → POA** |
| **MAO** | **GRU** | **3,40** | **MAO → GRU** |
| FOR | CGH | 3,12 | FOR → CGH |
| BSB | BEL | 2,27 | BSB → BEL |
| CWB | NAT | 3,68 | CWB → GRU → NAT |
| VIX | MAO | 4,03 | VIX → CNF → MAO |
| SSA | FLN | 2,85 | SSA → GIG → FLN |

As rotas obrigatórias **Recife → Porto Alegre** e **Manaus → São Paulo** estão presentes e calculadas corretamente.

---

## 7. Árvore de Percurso

Arquivo: `out/arvore_percurso.html` e `out/arvore_percurso.png`

A partir dos caminhos obrigatórios (REC → POA e MAO → GRU), foi construída a **árvore de caminho**: um subgrafo com apenas as arestas do percurso, com:

- **Destaque visual** das arestas do caminho (cor e espessura diferenciadas)
- **Rótulos** com os códigos IATA de cada aeroporto
- Versão interativa HTML (vis.js) e estática PNG (matplotlib)

---

## 8. Visualizações Analíticas

Geradas em `out/` com matplotlib. Cada visualização contém título, legenda e identificação dos eixos.

### `viz_analitica_distribuicao_graus.png`
**O que mostra:** histograma da distribuição de graus dos 20 aeroportos.
**Insight:** a distribuição é assimétrica — GRU, CNF e BSB formam um grupo de hubs com grau máximo (19), enquanto RBR e THE têm grau mínimo (5). Evidencia a estrutura hub-and-spoke da malha brasileira.
**Escolha do gráfico:** histograma é o tipo padrão para distribuição de frequências de variável discreta.

### `viz_analitica_ranking_aeroportos.png`
**O que mostra:** gráfico de barras horizontais com os aeroportos ordenados por grau decrescente.
**Insight:** GRU, CNF e BSB dominam como hubs nacionais. A concentração de conexões em poucos aeroportos é característica de redes scale-free.
**Escolha do gráfico:** barras ordenadas são ideais para rankings.

### `viz_analitica_comparacao_regional.png`
**O que mostra:** comparação de densidade entre as cinco regiões.
**Insight:** Sudeste, Sul e Centro-Oeste têm densidades regionais perfeitas (1,0), enquanto Norte (0,67) e Nordeste (0,73) apresentam menor conectividade interna — reflexo da extensão territorial e menor oferta de voos diretos.
**Escolha do gráfico:** barras verticais por categoria discreta (região).

### `viz_analitica_subgrafo_maior_grau.png`
**O que mostra:** subgrafo dos 5 aeroportos de maior grau e suas interconexões.
**Insight:** os hubs principais (GRU, CNF, BSB, GIG, REC/SSA) estão todos diretamente conectados entre si, formando um clique quase completo no núcleo da rede.
**Escolha do gráfico:** visualização de rede em spring-layout para evidenciar estrutura de clique.

---

## 9. Análise Exploratória e Explanatória (AVD)

### Exploratórias

#### `viz_exploratorio_grau_vs_densidade.png`
**O que mostra:** dispersão entre grau do aeroporto e densidade da sua ego-rede.
**Insight:** há correlação negativa — aeroportos com grau muito alto (hubs nacionais como GRU, BSB) têm densidade ego menor porque acumulam muitos vizinhos que não necessariamente se conectam entre si. Aeroportos menores (RBR, THE, JPA) têm ego-redes completamente conectadas.

#### `viz_exploratorio_ego_metricas.png`
**O que mostra:** painel comparativo com grau, tamanho da ego-rede e densidade ego por aeroporto.
**Insight:** permite identificar dois perfis distintos — hubs de escala nacional (alto grau, baixa densidade ego) e aeroportos regionais (baixo grau, alta densidade ego local).

### Explanatórias

#### `viz_explanatorio_rede_completa.png`
**O que mostra:** o grafo completo com 20 aeroportos e 115 arestas, com nós coloridos por região e tamanho proporcional ao grau.
**Mensagem principal:** a rede aérea brasileira tem estrutura hub-and-spoke clara, com hubs nacionais no centro (GRU, BSB, CNF) irradiando conexões para aeroportos periféricos. Interpretável por qualquer leitor sem conhecimento prévio do projeto.

#### `viz_explanatorio_dashboard.png`
**O que mostra:** painel integrado com métricas globais, ranking de graus e mapa esquemático das regiões.
**Mensagem principal:** síntese executiva da estrutura da rede — uma única visualização comunica os achados mais relevantes da análise.

---

## 10. Apresentação Interativa do Grafo

Arquivo: `out/grafo_interativo.html`

Implementado com **plotly** (via vis.js). Funcionalidades:

- **Tooltip por aeroporto:** exibe grau, região e densidade_ego ao passar o mouse
- **Caixa de busca:** permite localizar aeroportos por código IATA
- **Destaque de caminhos:** botão/legenda para realçar os percursos obrigatórios (REC → POA e MAO → GRU) em cor e espessura diferenciadas

---

## 11. Restrições Técnicas Respeitadas

| Restrição | Verificação |
|---|---|
| Python 3.11+ | ✅ |
| Proibido networkx / igraph / graph-tool para algoritmos | ✅ Não utilizados |
| pandas apenas para IO | ✅ Apenas em `io.py` e `solve.py` |
| matplotlib / plotly apenas para visualização | ✅ |
| Sem pesos negativos na Parte 1 | ✅ Verificado em `adjacencias_aeroportos.csv` |
| Bellman-Ford apenas na Parte 2 | ✅ Não chamado em nenhum arquivo da Parte 1 |
| Dijkstra rejeita pesos negativos | ✅ Lança `ValueError` |
| Grafo conectado | ✅ |
| Conexões intra e inter-regionais | ✅ |
