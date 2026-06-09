Projeto Final  : Rede De Aeroportos Do 

# Brasil + Comparação De Algoritmos 

Python 3.11+ . Proibido usar libs que já implementem os algoritmos (ex.: networkx ,

igraph , graph-tool ) para BFS/DFS/Dijkstra/Bellman-Ford . Pode usar pandas (IO), 

argparse , heapq , dataclasses , typing , matplotlib/plotly/pyvis/streamlit 

apenas para visualização/UX. 

# Entrega (GitHub obrigatório) 

 Subam todo o projeto em um repositório GitHub e entreguem apenas o link no Classroom. 

 Incluam: código, datasets, README com instruções e PDF (manual + técnica). 

# Estrutura de pastas (obrigatória) 

projeto-grafos/ 

├─ README.md 

├─ requirements.txt (ou pyproject.toml) 

├─ data/ 

│ ├─ aeroportos_data.csv # (arquivo enviado) 

│ ├─ adjacencias_aeroportos.csv # vocês constroem (ver Parte 1) 

│ ├─ rotas.csv # vocês constroem (Parte 1) 

│ └─ dataset_parte2/ # dataset maior (Parte 2) 

├─ out/ # saídas (.json/.html/.png) 

│ └─ .gitkeep 

├─ src/ 

│ ├─ cli.py 

│ ├─ solve.py 

│ ├─ graphs/ 

│ │ ├─ io.py # carregar/validar o CSV fornecido 

│ │ ├─ graph.py # estrutura: lista de adjacência 

│ │ └─ algorithms .py # BFS, DFS, Dijkstra, Bellman –Ford (implementação própria) 

│ └─ viz.py # (bônus) visualizações/UX 

└─ tests/ # (obrigatórios, mínimos) 

├─ test_bfs.py 

├─ test_dfs.py 

├─ test_dijkstra.py 

└─ test_bellman_ford.py PARTE 1 

# Grafo de Aeroportos do Brasil 

# (MODELAGEM) 

O que há no CSV 

O arquivo contém uma lista de aeroportos com: 

 Código IATA 

 Cidade 

 Região do Brasil 

O CSV não traz as conexões explícitas entre os aeroportos. Cada grupo deve definir e construir as arestas do grafo com base em um modelo próprio. 

Resultado esperado deste passo: 

 Lista de nós (aeroportos) normalizada 

 Estrutura de grafo construída a partir de regras definidas pelo grupo 

1) NÓS: aeroportos do Brasil 

 Crie um grafo rotulado onde cada nó é um aeroporto. 

 O rótulo do nó é o código IATA (ex.: REC, GRU, GIG, etc.). 

2) ARESTAS (interconexões): vocês constroem 

O CSV não traz as conexões explícitas. Cada grupo deve criar um arquivo: 

data/adjacencias_aeroportos.csv 

com as arestas entre aeroportos, baseado em critérios definidos pelo próprio grupo. 

Formato obrigatório de adjacencias_aeroportos.csv: 

origem,destino,tipo_conexao,justificativa,peso 

REC,SSA,regional,"mesma região",1.0 

REC,GRU,hub,"conexão via hub nacional",2.0  

> 

Grafo não-direcionado (salvem apenas uma linha por par; o sistema espelha).  

> 

tipo_conexao e justificativa são obrigatórios e serão considerados na avaliação.  

> 

peso: ver Seção 5 (definam e documentem sua régua de pesos). REQUISITOS OBRIGATÓRIOS: 

 O grafo deve ser conectado. 

 Deve existir conexão entre aeroportos da mesma região. 

 Deve existir conexão entre diferentes regiões. 

 Evitar grafos triviais (ex.: totalmente completo ou extremamente esparso sem justificativa). 

3) Métricas globais e por grupo 

Calculem (sempre com base no grafo construído ): 

Definições:  

> 

Ordem = |V| (número de nós/aeroportos)  

> 

Tamanho = |E| (número de arestas/interconexões)  

> 

Densidade (grafo não-direcionado ): 

𝑑𝑒𝑛𝑠𝑖𝑑𝑎𝑑𝑒 = 2 ∣ 𝐸 ∣ ∣ 𝑉 ∣ (∣ 𝑉 ∣ −1) 

Se |V| < 2, densidade = 0. 

Peçam e entreguem: 

1. Grafo completo: ordem, tamanho, densidade. 

2. Regiões (subgrafos induzidos): para cada região (Norte, Nordeste, Sudeste, Sul, Centro-Oeste), calculem ordem, tamanho e densidade considerando apenas os aeroportos daquela região e as arestas entre eles. 

3. Ego-subrede por aeroporto: para cada aeroporto v, considerem a ego-network v 

∪ N(v) e calculem ordem, tamanho e densidade. 

Entreguem uma tabela com: 

aeroporto, grau, ordem_ego, tamanho_ego, densidade_ego 

Arquivos de saída (obrigatórios):   

> out/global.json

(ordem, tamanho, densidade)   

> out/regioes.json

(lista com métricas por região)   

> out/ego_aeroportos.csv

(tabela completa por aeroporto) 

4) Graus e rankings  

> 

Lista de graus : out/graus.csv → aeroporto, grau (grau = nº de interconexões).  

> 

Aeroporto mais conectado : maior grau  

> 

Aeroporto com maior densidade local : maior densidade_ego 5) Pesos das arestas (definição criativa e consistente) 

Para calcular distância (Seção 6) com Dijkstra , definam pesos para as arestas do grafo. Exemplos (escolham, combinem e documentem no PDF): 

 Peso uniforme (todas as conexões iguais) 

 Penalidade por mudança de região 

 Penalidade por ausência de hub 

 Modelo híbrido com múltiplos critérios 

Exemplo de fórmula: 

> peso = 1 + penalidade_regiao + penalidade_hub

Gravem esses pesos em adjacencias_aeroportos.csv (coluna peso). 

Não usem pesos negativos aqui; Bellman-Ford fica para a Parte 2. 

6) Distância entre aeroportos X e Y 

1. Criem data/rotas.csv com pelo menos 5 pares de aeroportos. 

2. Para cada par (X,Y), calculem custo e percurso no grafo usando Dijkstra 

(pesos da Seção 5). 

3. Gerem:    

> oout/distancias_rotas.csv :origem,destino,custo,caminho
> o

Para pares obrigatórios :

Manaus → São Paulo 

7) Transforme o percurso em árvore e mostre  

> 

A partir dos caminhos obrigatórios “Recife → Porto Alegre” e “Manaus → 

São Paulo ” construam a árvore de caminho (um subgrafo com as arestas do percurso) e exportem uma visualização:   

> oout/arvore_percurso.html

(interativa , ex.: pyvis /plotly ) ou   

> oout/arvore_percurso.png

(estática , ex.: matplotlib ). 

Requisito : destacar o caminho (cor, espessura) e mostrar rótulos dos aeroportos .

8) Explorações e visualizações analíticas 

Usem os conceitos de aula para criar no mínimo 4 visualizações/insights adicionais (salvem em out/ ). 

As visualizações devem seguir princípios da disciplina de Análise e Visualização de Dados (AVD), contemplando:  Organização visual clara (hierarquia, legibilidade, uso adequado de cores) 

 Escolha adequada do tipo de gráfico para o dado apresentado 

 Evitar distorções visuais ou gráficos inadequados 

Exemplos: 

 Distribuição de graus (histograma) 

 Ranking de aeroportos mais conectados (barra ordenada) 

 Comparação entre regiões (barra ou mapa conceitual) 

 Subgrafo dos aeroportos com maior grau 

 Visualização de camadas via BFS 

Requisitos obrigatórios: 

 Cada visualização deve conter título, legenda e identificação dos eixos 

 Deve haver coerência entre o dado e o tipo de gráfico escolhido 

 Não utilizar gráficos sem justificativa 

Entreguem as imagens/HTML + uma nota analítica curta justificando o que cada visualização revela. 

Exemplo: 

 O que está sendo mostrado 

 Qual insight pode ser extraído 

 Por que aquele tipo de visualização foi escolhido 

9) Apresentação interativa do grafo  

> 

Entreguem um HTML interativo (ex.: pyvis ) com:  

> o

Tooltip por aeroporto (grau, região, densidade_ego),  

> o

Caixa de busca,  

> o

Botão/legenda para realçar os caminhos obrigatórios 

Arquivo: out/grafo_interativo.html .

10) Análise exploratória e explanatória dos dados (AVD) 

Com base no grafo construído, realizem uma análise exploratória e explanatória dos dados gerados. 

A análise deve incluir: 

 Exploração das métricas do grafo (graus, densidade, centralidade implícita) 

 Comparações entre regiões 

 Identificação de padrões (ex.: hubs, concentração de conexões) 

Além disso, devem produzir pelo menos:  2 visualizações exploratórias (entendimento do comportamento dos dados) 

 2 visualizações explanatórias (com foco em comunicação de insights) 

As visualizações explanatórias devem: 

 Ser interpretáveis por alguém que não conhece o projeto 

 Destacar claramente a mensagem principal 

 Utilizar boas práticas de design analítico 

A análise deve ser descrita no PDF com interpretação dos resultados. 

# PARTE 2 

# Dataset Maior e  Comparação de 

# Algoritmos 

Escolham um dataset maior de grafos (rede de transporte, coautoria, dependências, etc.). 

Restrição importante: Não é permitido utilizar datasets de malha aérea nesta parte. 

Construam o grafo sem libs de algoritmos prontos e comparem BFS, DFS, Dijkstra e Bellman –Ford em corretude e desempenho . Dataset Parte 2 preferencial: até ~200k arestas . Se maior, justifiquem e mostrem amostragens/estratégias 

Obrigatório: 

1. Descrever o dataset (|V|, |E|, tipo: dirigido/ponderado, distribuição de graus). 

2. Implementar e rodar : 

> o

BFS/DFS a partir de ≥ 3 fontes distintas (relatar ordem/camadas/ciclos).  

> o

Dijkstra com pesos ≥ 0 (≥ 5 pares origem -destino).  

> o

Bellman –Ford com ao menos um caso com peso negativo (e sem ciclo negativo) e um com ciclo negativo (detectado). 

3. Métricas de desempenho : tempo e (opcional) memória por algoritmo/tarefa (tabela out/parte2_report.json ). 

4. Visualização: pelo menos uma (ex.: amostra do grafo, distribuição de graus, heatmap de distâncias). 

5. Discussão crítica: quando/por que cada algoritmo é mais adequado; limites do seu design de pesos. 

6. Análise visual dos resultados: 

 Apresentar visualizações que comparem os algoritmos (tempo, comportamento,caminhos) 

 Utilizar gráficos adequados para comparação (ex.: barras, linhas) 

 Garantir clareza e legibilidade Como executar 

Exemplos: 

# PARTE 1

python -m src.cli --dataset ./data/aeroportos_data.csv --alg BFS --source REC --out ./out/ 

python -m src.cli --dataset ./data/aeroportos_data.csv --alg DIJKSTRA --source REC --target POA --out ./out/ 

# PARTE 2 (dataset maior) 

python -m src.cli --dataset ./data/dataset_parte2/ --alg DIJKSTRA --source A --target B --out ./out/ 

# Saídas obrigatórias (resumo) 

 out/global.json, out/regioes.json, out/ego_aeroportos.csv, out/graus.csv 

 out/distancias_rotas.csv 

 out/arvore_percurso.html|png 

 out/grafo_interativo.html 

 out/parte2_report.json 

 Visualizações adicionais em out/ (+ notas analíticas no PDF) 

# Testes mínimos (pytest) 

 BFS : níveis corretos em grafo pequeno. 

 DFS : detecção de ciclo e classificação de arestas. 

 Dijkstra : caminhos corretos com pesos ≥ 0; recusar dado com peso negativo. 

 Bellman –Ford : (i) com pesos negativos sem ciclo negativo → distâncias 

corretas; (ii) com ciclo negativo → flag. 

# O que vai ser avaliado (10,0 pts + bônus) 

1. Parte 1 : Modelagem e análise do grafo (qualidade técnica e completude) : 3,0 PONTOS 

o Nós/arestas, métricas. 

o Definição de pesos 

o Métricas e rankings 

o Caminhos mínimos 

o Análise crítica 

2. Parte 2 : Dataset maior e comparação : 3,0 PONTOS 

o Execução correta dos 4 algoritmos; casos cobrindo pesos negativos e ciclo negativo (BF). 

o Métricas de desempenho + discussão crítica. 3. Apresentação: Participação nas reuniões de acompanhamento, apresentação e comprometimento com o projeto : 2,0 PONTOS 

4. Qualidade do código, organização, testes, README e PDF - 2,0 PONTOS 

Bônus Visual/UX : até +1,0 (sem ultrapassar 10) por experiência interativa caprichada (filtros, busca, destaque de caminhos, etc.). 

# Observações e dicas importantes  

> 

Não existe uma única resposta correta para a modelagem do grafo.  

> 

Pesos : escolham uma régua clara e mantenham consistência ; evitem pesos negativos na Parte 1.  

> 

Documentem tudo no PDF: como obtiveram as interconexões (fontes/justificativas), fórmula de peso, limitações.  

> 

Interatividade : pyvis é simples para HTML; streamlit é ótimo para appzinho (carregar dataset, escolher algoritmo, ver resultados).  

> 

Sem libs de algoritmo : toda lógica de BFS/DFS/Dijkstra/BF deve ser 

implementação própria (ok usar heapq em Dijkstra). 

AVISO FINAL: 

Este projeto é interdisciplinar e será utilizado também na disciplina de Análise eVisualização de Dados (AVD). 

Os elementos relacionados à análise exploratória, visualização e comunicação de dados serão avaliados pelo docente da disciplina de AVD, conforme critérios próprios. 

# ALGU MAS SUGESTÕES DE DATA SET S QUE 

# PODEM SER USADO NA PARTE 2: 

O dataset escolhido deve permitir a construção de um grafo não trivial e possibilitar a aplicação significativa dos quatro algoritmos estudados. 

## Dataset de Música 

Spotify Tracks Dataset (Kaggle) 

• Link:  https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset 

• Nós: músicas ou artistas 

• Arestas: similaridade baseada em atributos (gênero, energia, danceability, valence etc.) 

• Peso: distância entre vetores de atributos (ex.: distância euclidiana ou cosseno) Last.fm Social Network Dataset (SNAP) 

• Link:  https://snap.stanford.edu/data/feather-lastfm-social.html 

• Nós: usuários 

• Arestas: amizades (grafo não -direcionado) 

• Peso: quantidade de artistas em comum 

## Dataset de Filmes e Conteúdo 

Netflix Movies and TV Shows (Kaggle) 

• Link:  https://www.kaggle.com/datasets/shivamb/netflix-shows 

• Nós: filmes/séries 

• Arestas: compartilhamento de atores, diretores ou gêneros 

• Peso: grau de similaridade 

IMDb Dataset (recomendado – mais rico) 

• Link: https://datasets.imdbws.com/ 

• Nós: filmes ou atores 

• Arestas: participação conjunta ou similaridade temática 

• Peso: frequência de colaboração ou similaridade 

YouTube Video Dataset 

• Link:  https://www.kaggle.com/datasets/datasnaek/youtube-new 

• Nós: vídeos 

• Arestas: co -ocorrência em recomendações 

• Peso: frequência de recomendação 

## Redes Sociais e Interação 

Facebook Social Network (SNAP) 

• Link:  https://snap.stanford.edu/data/ego-Facebook.html 

• Nós: usuários 

• Arestas: amizades 

• Peso: opcional (interação, mensagens, etc.) 

Twitter Interaction Dataset 

• Nós: usuários 

• Arestas: menções, retweets ou respostas 

• Peso: frequência de interação Redes de Conhecimento 

Wikipedia Hyperlink Graph 

• Link:  https://snap.stanford.edu/data/wiki-Vote.html  (ou versões similares) 

• Nós: páginas 

• Arestas: hyperlinks 

DBLP Co-authorship Dataset 

• Link:  https://dblp.org/xml/ 

• Nós: autores 

• Arestas: coautoria 

• Peso: número de publicações em conjunto 

## Redes de Produtos e Negócios 

Online Retail Dataset (UCI) 

• Link: https://archive.ics.uci.edu/ml/datasets/online+retail 

• Nós: produtos 

• Arestas: comprados juntos 

• Peso: frequência de co -compra 

Amazon Product Co-purchasing Network 

• Link:  https://snap.stanford.edu/data/amazon0302.html 

• Nós: produtos 

• Arestas: comprados juntos 

## Redes Urbanas / Logística 

Road Network (SNAP) 

• Link:  https://snap.stanford.edu/data/roadNet-CA.html 

• Nós: interseções 

• Arestas: ruas 

• Peso: distância