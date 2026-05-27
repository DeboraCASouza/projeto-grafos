# Documentação Técnica — Parte 2: Dataset Netflix + Comparação de Algoritmos

## 1. Descrição do Dataset

**Dataset:** Netflix Top Shows 2016–2025
**Fonte:** `data/dataset_parte2/01_Netflix_2016_2025.csv`
**Restrição respeitada:** dataset de malha aérea não utilizado nesta parte.

### Campos do CSV

| Campo | Descrição |
|---|---|
| Title | Nome do título (nó do grafo) |
| Year | Ano de lançamento/temporada |
| IMDb | Nota IMDb |
| Viewership | Audiência (streams) |
| Directors/Creators | Criadores/diretores |
| Lead Actors | Atores principais |
| Genre | Gênero(s) |
| Country | País de origem |

---

## 2. Modelagem do Grafo

### Tipo de grafo

**Não-direcionado, ponderado**, sem arestas paralelas.
Implementado em `GrafoGenerico` (lista de adjacência), compatível com os mesmos algoritmos da Parte 1.

### Nós

Cada título Netflix único do CSV é um nó. Títulos duplicados são descartados (mantida a primeira ocorrência).

| Métrica | Valor |
|---|---|
| **\|V\|** | 182 títulos |
| Títulos brutos no CSV | 200 |
| Descartados (duplicatas) | 18 |

### Arestas — Critério de Similaridade

Dois títulos são conectados se compartilham **pelo menos um** dos seguintes atributos:

- Ator principal (`Lead Actors`)
- Diretor/criador (`Directors/Creators`)
- Gênero (`Genre`)

| Métrica | Valor |
|---|---|
| **\|E\|** | 615 arestas |
| Máximo possível | 16.471 |
| **Densidade** | 0,0373 |

O grafo é **esparso** — apenas 3,7% das conexões possíveis existem, o que é esperado dado que a maioria dos títulos tem elencos e gêneros distintos.

### Modelo de Pesos

```
peso = 1 / total_compartilhado
```

Onde `total_compartilhado` = número de atores + diretores + gêneros em comum.

**Interpretação:** quanto mais atributos dois títulos compartilham, **menor o peso** da aresta — favorecendo o Dijkstra a encontrar o "caminho de maior similaridade" (menor custo acumulado).

**Exemplo:** dois títulos que compartilham 3 atores têm peso ≈ 0,333; dois que compartilham apenas 1 gênero têm peso = 1,0.

### Componentes Conexas

| Componente | Tamanho |
|---|---|
| Maior componente conexa | **99 nós** |
| Nós isolados (grau 0) | **24 nós** |
| Outras componentes menores | 59 nós |

Os 24 nós isolados correspondem a títulos que não compartilham nenhum ator, diretor ou gênero com nenhum outro título do dataset — provavelmente conteúdo de nicho muito específico ou produções internacionais sem sobreposição.

### Distribuição de Graus

| Grau | Quantidade de nós |
|---|---|
| 0 | 24 |
| 1 | 29 |
| 2 | 27 |
| 3 | 16 |
| 4 | 4 |
| 5 | 12 |
| 6–10 | 11 |
| 11–19 | 35 |
| 20+ | 24 |

| Estatística | Valor |
|---|---|
| Grau médio | 6,76 |
| Grau máximo | **30** ("3%") |
| Grau mínimo | 0 (nós isolados) |

A distribuição é **assimétrica à direita** — a maioria dos títulos tem poucos vizinhos, enquanto um pequeno grupo de hubs (séries com elenco muito popular, como "3%", "Flaked", "GLOW") concentra muitas conexões. Esse padrão é típico de **redes de mundo pequeno**.

---

## 3. Execução dos Algoritmos

Todos os algoritmos foram implementados do zero em `src/graphs/algorithms.py`, sem uso de networkx, igraph ou graph-tool.

### 3.1 BFS — Busca em Largura

**Implementação:** fila FIFO, visita nós camada por camada a partir da origem.
**Complexidade:** O(V + E)

Executado a partir de **3 fontes distintas** (os três títulos com maior grau):

| Fonte | Grau | Nós alcançados | Camadas | Tempo |
|---|---|---|---|---|
| "3%" | 30 | 99 | 6 | 0,086 ms |
| "GLOW" | 26 | 99 | 6 | 0,077 ms |
| "Little Women" | 25 | 99 | 6 | 0,073 ms |

**Observações:**
- Os 99 nós alcançados correspondem à maior componente conexa do grafo.
- As **6 camadas** de profundidade revelam o efeito "mundo pequeno": qualquer título conectado está a no máximo 6 graus de separação de qualquer outro dentro da mesma componente.
- Os 83 nós restantes (isolados ou em componentes menores) não são alcançados a partir de nenhuma fonte.

### 3.2 DFS — Busca em Profundidade

**Implementação:** recursiva com coloração (branco → cinza → preto). Detecta ciclos por arestas de retorno, descartando a aresta de volta ao pai imediato (grafo não-direcionado).
**Complexidade:** O(V + E)

Executado a partir das mesmas **3 fontes**:

| Fonte | Nós visitados | Arestas de árvore | Ciclo detectado | Arestas de retorno | Tempo |
|---|---|---|---|---|---|
| "3%" | 99 | 98 | Sim | 456 | 0,127 ms |
| "GLOW" | 99 | 98 | Sim | 456 | 0,116 ms |
| "Little Women" | 99 | 98 | Sim | 456 | 0,118 ms |

**Observações:**
- O **alto número de arestas de retorno (456)** confirma que o grafo é rico em ciclos — esperado, pois muitos títulos compartilham gêneros populares (Drama, Thriller, etc.), criando múltiplos caminhos alternativos.
- As 98 arestas de árvore correspondem à árvore de DFS da componente de 99 nós (|V| − 1 arestas).

### 3.3 Dijkstra — Caminho Mínimo com Pesos ≥ 0

**Implementação:** varredura O(V²) sobre conjunto de não-visitados. Rejeita pesos negativos com `ValueError`.
**Complexidade:** O(V²) — para grafos maiores, recomenda-se heapq para O((V+E) log V).

Executado em **5 pares origem-destino**:

| # | Origem | Destino | Custo | Caminho | Tempo |
|---|---|---|---|---|---|
| 1 | "3%" | "Flaked" | 1,0000 | 3% → Flaked | 0,173 ms |
| 2 | "3%" | "Russian Doll" | 1,0000 | 3% → Russian Doll | 0,327 ms |
| 3 | "Flaked" | "Little Women" | 1,0000 | Flaked → Little Women | 0,306 ms |
| 4 | "GLOW" | "Russian Doll" | 1,0000 | GLOW → Russian Doll | 0,237 ms |
| 5 | "Russian Doll" | "Fake Profile" | 2,0000 | Russian Doll → Flaked → Fake Profile | 0,765 ms |

**Observações:**
- Os pares 1–4 têm custo 1,0 porque os títulos são vizinhos diretos (compartilham pelo menos 1 atributo), tornando o caminho mais curto trivial.
- O par 5 exige um nó intermediário ("Flaked"), com custo 2,0 — "Russian Doll" e "Fake Profile" não compartilham atributos diretamente.
- O custo é interpretado como **inverso da similaridade acumulada**: custo 1,0 = 1 atributo compartilhado; custo 2,0 = dois "saltos" de 1 atributo.

### 3.4 Bellman-Ford — Pesos Negativos e Detecção de Ciclo Negativo

**Implementação:** relaxamento de todas as arestas por |V|−1 iterações, seguido de uma V-ésima iteração para detectar ciclo negativo.
**Complexidade:** O(V · E)

Três casos foram executados:

#### Caso 1 — Grafo Netflix real (pesos positivos)

| Parâmetro | Valor |
|---|---|
| Origem | "3%" |
| Tem ciclo negativo | **Não** |
| Nós alcançados | 99 |
| Tempo | ~1,1 ms |

Bellman-Ford converge corretamente no grafo real, produzindo os mesmos caminhos que Dijkstra.

#### Caso 2 — Grafo sintético com peso negativo (sem ciclo negativo)

Grafo dirigido construído para demonstrar funcionamento com pesos negativos:

```
A → B : 4
A → C : 5
B → C : -3      ← peso negativo
C → D : 2
```

| Parâmetro | Valor |
|---|---|
| Tem ciclo negativo | **Não** |
| dist(A) | 0 |
| dist(B) | 4 |
| dist(C) | **1** (via A → B → C = 4 − 3, melhor que A → C = 5) |
| dist(D) | **3** (via A → B → C → D = 1 + 2) |

Bellman-Ford encontrou o caminho ótimo aproveitando a aresta de peso negativo — comportamento **impossível para Dijkstra**.

#### Caso 3 — Grafo sintético com ciclo negativo (detectado)

```
A → B : 1
B → C : 2
C → B : -4      ← cria ciclo B → C → B = 2 + (−4) = −2
C → D : 1
```

| Parâmetro | Valor |
|---|---|
| Ciclo negativo | **Detectado** ✓ |
| Ciclo | B → C → B = −2 |

Quando um ciclo negativo é detectado, as distâncias deixam de ser confiáveis (tendem a −∞). O algoritmo sinaliza `tem_ciclo_negativo = True` e o resultado deve ser descartado.

---

## 4. Métricas de Desempenho

Fonte: chave `metricas_desempenho` em `out/parte2_report.json`

**Configuração do benchmark:** 20 execuções por algoritmo, mesmo grafo Netflix, mesma origem ("3%") para BFS/DFS/BF e mesmo par ("3%" → "Russian Doll") para Dijkstra. Memória medida com `tracemalloc`.

| Algoritmo | Complexidade | Média (ms) | Mín (ms) | Máx (ms) | Desvio (ms) | Pico mem (KB) |
|---|---|---|---|---|---|---|
| **BFS** | O(V+E) | 0,1079 | 0,1041 | 0,1273 | — | 5,78 |
| **DFS** | O(V+E) | 0,5516 | 0,2112 | 2,0226 | — | 45,00 |
| **Dijkstra** | O(V²) | 0,5206 | 0,4796 | 0,7458 | — | 26,45 |
| **Bellman-Ford** | O(V·E) | 3,1061 | 2,9176 | 4,2653 | — | 28,64 |

### Análise dos resultados

**BFS é o mais rápido** (0,11 ms) e o mais eficiente em memória (5,78 KB) — percorre apenas os nós e arestas necessários sem estruturas auxiliares pesadas.

**DFS é nominalmente O(V+E) como BFS**, mas é ~5× mais lento na prática devido à pilha de recursão implícita do Python e ao overhead da coloração de nós. Isso se reflete no **pico de memória de 45 KB** — o maior de todos — causado pela pilha de chamadas recursivas que em grafos densos pode ser longa.

**Dijkstra** tem custo teórico O(V²) mas executa em tempo similar ao DFS (0,52 ms) porque o grafo tem apenas 182 nós — para V pequeno, a varredura O(V²) ainda é rápida.

**Bellman-Ford é o mais lento** (3,1 ms, ~29× mais lento que BFS) — O(V·E) = 182 × 615 = 111.930 operações de relaxamento. Em grafos maiores, essa diferença seria crítica.

---

## 5. Discussão Crítica

### Quando usar cada algoritmo

**BFS**
- Melhor escolha quando todos os pesos são iguais ou quando o objetivo é minimizar o número de saltos.
- No grafo Netflix: ideal para encontrar "quão longe" um título está de outro em graus de separação. BFS em 6 camadas mapeia toda a componente principal.
- Limitação: ignora os pesos das arestas — não distingue "muito similar" de "pouco similar".

**DFS**
- Melhor para análise estrutural: detecção de ciclos, componentes conexas, ordenação topológica.
- No grafo Netflix: o alto número de arestas de retorno (456) confirma que a rede tem muitos ciclos — padrão característico de redes com gêneros populares compartilhados.
- Limitação: não garante caminho mais curto e pode ser instável em grafos muito profundos (risco de estouro de pilha em Python).

**Dijkstra**
- Algoritmo de escolha para caminhos mínimos com pesos ≥ 0. A implementação atual é O(V²); com `heapq`, atinge O((V+E) log V).
- No grafo Netflix: encontra o título mais similar (menor custo acumulado) a partir de qualquer origem. Adequado para sistemas de recomendação baseados em caminho.
- Limitação: não suporta pesos negativos. Se o modelo de similaridade incluísse "penalidades" (pesos negativos), Dijkstra falharia silenciosamente — por isso valida e rejeita explicitamente pesos < 0.

**Bellman-Ford**
- Único algoritmo que suporta pesos negativos e detecta ciclos negativos.
- No grafo Netflix: os pesos são sempre positivos (1/similaridade > 0), então BF não oferece vantagem sobre Dijkstra — e é ~29× mais lento.
- Justificativa de uso: demonstrado sobre grafos sintéticos dirigidos com pesos negativos (Caso 2 e Caso 3), onde BF é a única opção correta.

### Limites do design de pesos

O modelo `peso = 1 / total_compartilhado` é simples e consistente, mas tem limitações:

1. **Não pondera o tipo de atributo compartilhado**: compartilhar um ator principal é mais significativo do que compartilhar um gênero genérico ("Drama"), mas o modelo os trata igualmente.
2. **Sensível a atributos muito comuns**: gêneros como "Drama" ou "Thriller" conectam dezenas de títulos com peso 1,0, criando arestas de baixa qualidade semântica.
3. **Pesos positivos apenas**: inviabiliza Bellman-Ford com vantagem real. Um modelo com penalidades (ex.: -0,5 para incompatibilidade de idioma) tornaria BF relevante, mas exigiria redesenho.

**Melhoria proposta:** peso ponderado por tipo de atributo:
```
peso = 1 / (w_ator × |atores_comuns| + w_dir × |diretores_comuns| + w_gen × |generos_comuns|)
```
com w_ator > w_dir > w_gen para refletir a relevância semântica de cada atributo.

---

## 6. Visualizações Geradas

### `out/parte2_distribuicao_graus.html`

**O que mostra:** histograma SVG da distribuição de graus de todos os 182 títulos.
**Insight:** a distribuição é fortemente assimétrica — 24 títulos têm grau 0 (isolados) e poucos hubs concentram graus acima de 20. Padrão consistente com redes de mundo pequeno.
**Escolha do gráfico:** barras verticais são o tipo padrão para distribuição de frequências de variável discreta. Cada barra representa um valor de grau; a altura indica quantos títulos têm aquele grau.

### `out/parte2_comparacao_algoritmos.html`

**O que mostra:** tabela comparativa + dois gráficos SVG — tempo médio de execução e pico de memória por algoritmo.
**Insight:** BFS e DFS têm complexidade igual (O(V+E)), mas DFS usa ~8× mais memória devido à pilha de recursão. Bellman-Ford é 28× mais lento que BFS, tornando visível a diferença de complexidade O(V·E) vs O(V+E).
**Escolha do gráfico:** barras por categoria são ideais para comparar grandezas entre grupos discretos. Dois gráficos separados (tempo e memória) evitam escalas incompatíveis no mesmo eixo.

### `out/parte2_grafo_amostra.html`

**O que mostra:** rede interativa (vis.js) com os 45 títulos de maior grau e as arestas entre eles. Tamanho dos nós proporcional ao grau.
**Insight:** a visualização revela clusters visíveis — séries brasileiras ("3%"), produções norte-americanas de comédia ("GLOW", "Flaked") e dramas de época ("Little Women") formam grupos densos interconectados por gênero.
**Escolha do gráfico:** grafo de força (force-directed layout) é o padrão para redes — nós repulsivos e arestas atrativas posicionam automaticamente clusters próximos.

#### Interface e decisões de design

**Problema central:** com 45 nós e 333 arestas (densidade interna ≈ 0,34), o layout force-directed produzia um emaranhado visual ilegível quando todos os atributos de similaridade geravam arestas com o mesmo peso visual.

**Soluções implementadas:**

| Elemento | Decisão | Justificativa |
|---|---|---|
| `gravitationalConstant: -20000` | Repulsão muito mais forte entre nós | Força os nós a se distribuírem pelo espaço em vez de colapsarem no centro |
| `springLength: 230` | Comprimento de repouso das arestas aumentado (era 130) | Mais espaço entre nós conectados, reduz sobreposição de rótulos |
| `avoidOverlap: 0.7` | Evita sobreposição de nós | Impede que nós de mesmo tamanho se sobreponham na estabilização |
| Tooltip customizado | Div HTML com `hoverNode`/`blurNode` em vez do tooltip nativo do vis.js | O tooltip nativo renderizava as tags HTML como texto literal (`<b>`, `<br>`); a substituição por um div com `innerHTML` resolve o problema |
| `.vis-tooltip { display: none !important }` | Desabilita o tooltip padrão | Remove a camada nativa antes de injetar o tooltip customizado |
| Coloração de arestas por força | Fraca `#31324450`, média `#45475a80`, forte `#cba6f780` | Arestas de 1 atributo (gênero genérico como "Drama") ficam quase invisíveis; conexões por ator/diretor se destacam visualmente |
| Sidebar lateral com controles | Ocupa 300 px à esquerda | Separa os controles do canvas, evitando sobreposição e mantendo o grafo em tela cheia |

**Tooltip customizado — campos exibidos por nó:**
- Nome do título (destaque em roxo)
- Grau (número de conexões neste subgrafo)
- Nota IMDb
- País de origem

**Tooltip customizado — campos exibidos por aresta:**
- Par de títulos conectados
- Atributos compartilhados (atores, diretores, gêneros) renderizados como tags coloridas, separados por categoria

**Filtro de força de conexão (slider):**

O slider percorre 4 níveis de atributos compartilhados mínimos:

| Nível | Atributos mínimos | Arestas visíveis (aprox.) | Uso |
|---|---|---|---|
| 1 (padrão) | 1+ | 333 | Visão geral completa |
| 2 | 2+ | ~60 | Clusters por gênero duplo |
| 3 | 3+ | ~20 | Franquias e elencos compartilhados |
| 4 | 4+ | ~5 | Apenas conexões mais fortes (mesma franquia) |

Reduzir o filtro elimina progressivamente as arestas de menor similaridade semântica (gêneros genéricos como "Drama" e "Sci-Fi"), revelando a estrutura de cluster subjacente.

**Campo de busca:** filtra e foca qualquer título digitado, centralizando o nó no canvas com animação.

---

## 7. Restrições Técnicas Respeitadas

| Restrição | Status |
|---|---|
| Dataset não é de malha aérea | ✅ Netflix (filmes e séries) |
| Algoritmos implementados do zero | ✅ Sem networkx / igraph / graph-tool |
| BFS/DFS a partir de ≥ 3 fontes distintas | ✅ "3%", "GLOW", "Little Women" |
| Dijkstra com ≥ 5 pares | ✅ 5 pares executados |
| Bellman-Ford com peso negativo sem ciclo | ✅ Caso 2 — distâncias corretas |
| Bellman-Ford com ciclo negativo detectado | ✅ Caso 3 — flag `True` |
| Métricas de tempo e memória | ✅ 20 execuções, `tracemalloc` |
| Pelo menos 1 visualização | ✅ 3 visualizações HTML geradas + galeria da Parte 1 + index |
| Discussão crítica | ✅ Seção 5 deste documento |
| Navegação entre visualizações | ✅ Topbar fixo em todos os HTMLs com dropdowns para Parte 1 e Parte 2 |
