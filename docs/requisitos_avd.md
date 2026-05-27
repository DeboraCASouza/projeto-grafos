# Requisitos do Projeto — Integração entre Grafos e AVD

## Visão Geral

O projeto tem como objetivo integrar conceitos de **Teoria dos Grafos** com princípios de **Análise e Visualização de Dados (AVD)**, focando não apenas no cálculo e processamento de algoritmos, mas também na capacidade de comunicar insights de forma visual e analítica. 

O sistema deve permitir análise de redes complexas utilizando visualizações claras, organizadas e orientadas à experiência do usuário.

---

# Requisitos Funcionais

## RF01 — Modelagem do Grafo

O sistema deve permitir a modelagem de um grafo representando conexões entre aeroportos.

### Critérios:

* Os pesos das arestas devem considerar:

  * distância;
  * custo;
  * variáveis visuais/cognitivas. 
* O sistema deve utilizar:

  * cores para representar regiões;
  * espessura das arestas para representar pesos/conectividade. 

---

## RF02 — Execução de Algoritmos de Grafos

O sistema deve executar algoritmos clássicos de grafos para análise de caminhos e conectividade.

### Algoritmos obrigatórios:

* BFS;
* DFS;
* Dijkstra;
* Bellman-Ford. 

---

## RF03 — Benchmark de Performance

O sistema deve comparar o desempenho dos algoritmos executados.

### Critérios:

* Comparações devem ser apresentadas por:

  * gráficos de barras;
  * gráficos de linhas. 
* Os gráficos devem possuir:

  * eixos padronizados;
  * legendas explicativas;
  * cores consistentes entre algoritmos. 

---

## RF04 — Dashboard Analítico

O sistema deve fornecer dashboards exploratórios e explanatórios contendo métricas da rede.

### Visualizações obrigatórias:

* histogramas de distribuição de graus;
* heatmaps de densidade regional;
* mapas de rotas otimizadas;
* gráficos de dispersão entre ordem do grafo e tempo de execução. 

---

## RF05 — Aplicação de Princípios da Gestalt

O sistema deve aplicar princípios visuais da Gestalt na construção das visualizações.

### Requisitos:

* Utilizar similaridade por cores;
* Utilizar conectividade visual entre nós;
* Aplicar figura-fundo para destaque de caminhos;
* Organizar clusters por proximidade e fechamento.  

---

## RF06 — Destaque de Caminhos Críticos

O sistema deve destacar visualmente:

* hubs principais;
* caminhos mínimos;
* caminhos críticos da malha aérea. 

---

## RF07 — Recursos Interativos

O sistema deve possuir funcionalidades interativas para exploração dos dados.

### Funcionalidades:

* filtros dinâmicos por região;
* filtros por grau do aeroporto;
* destaque visual de rotas;
* busca preditiva por código IATA;
* exibição dinâmica de métricas em tempo real. 

---

## RF08 — Storytelling Analítico

O sistema deve apresentar os resultados em formato narrativo, guiando o usuário pelos insights encontrados.

### Estrutura sugerida:

1. Contexto;
2. Exploração;
3. Modelagem;
4. Resultados;
5. Limitações;
6. Conclusão. 

---

# Requisitos Não Funcionais

## RNF01 — Clareza Visual

As visualizações devem reduzir a carga cognitiva do usuário por meio de:

* agrupamentos visuais;
* uso consistente de cores;
* hierarquia visual adequada. 

---

## RNF02 — Experiência do Usuário (UX)

O sistema deve possuir:

* interface intuitiva;
* navegação clara;
* interatividade fluida;
* tooltips explicativos. 

---

## RNF03 — Escalabilidade Visual

As visualizações devem continuar compreensíveis mesmo em grafos grandes.

O projeto deve discutir:

* limitações da visualização;
* problemas de escalabilidade;
* possíveis falhas na representação gráfica. 

---

## RNF04 — Consistência Visual

O sistema deve manter:

* escalas consistentes;
* paleta de cores padronizada;
* legendas uniformes;
* identidade visual coerente. 

---

# Critérios de Avaliação

| Critério               | Peso | Descrição                                   |   |
| ---------------------- | ---- | ------------------------------------------- | - |
| Aplicação de Gestalt   | 0,5  | Uso correto de cores, formas e agrupamentos |   |
| Storytelling Analítico | 0,4  | Clareza na comunicação dos insights         |   |
| Hierarquia Visual      | 0,3  | Destaque adequado para hubs e caminhos      |   |
| Interatividade & UX    | 0,3  | Uso de filtros e interações no dashboard    |   |

---

# Entregáveis Esperados

## Entrega Técnica

* Implementação dos algoritmos de grafos;
* Geração de métricas;
* Comparações de performance;
* Dashboards analíticos.

## Entrega Visual

* Visualizações interativas;
* Aplicação de Gestalt;
* Storytelling visual;
* Interface orientada ao usuário.

## Entrega Documental

* PDF técnico explicando:

  * modelagem;
  * análises;
  * resultados;
  * limitações;
  * conclusões. 
