import csv
import itertools
from graph import GrafoGenerico


def _parse_set(texto: str, sep: str = ',') -> set:
    return {item.strip() for item in texto.split(sep) if item.strip()}


def construir_grafo_netflix(caminho_csv: str) -> GrafoGenerico:
    grafo = GrafoGenerico(dirigido=False)

    with open(caminho_csv, newline='', encoding='latin-1') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # Deduplica títulos (mantém primeira ocorrência)
    titulos: dict = {}
    for r in rows:
        titulo = r['Title'].strip()
        if titulo not in titulos:
            titulos[titulo] = {
                'atores':    _parse_set(r['Lead Actors']),
                'diretores': _parse_set(r['Directors/Creators'].replace(',', ';'), sep=';'),
                'generos':   _parse_set(r['Genre'].replace(',', '/'), sep='/'),
                'ano':   r['Year'].strip(),
                'imdb':  r['IMDb'].strip(),
                'pais':  r['Country'].strip(),
            }

    for titulo, dados in titulos.items():
        grafo.adicionar_no(titulo, ano=dados['ano'], imdb=dados['imdb'], pais=dados['pais'])

    # Arestas por atributos compartilhados
    pares = list(titulos.items())
    for (t1, d1), (t2, d2) in itertools.combinations(pares, 2):
        atores_c    = d1['atores']    & d2['atores']
        diretores_c = d1['diretores'] & d2['diretores']
        generos_c   = d1['generos']   & d2['generos']

        total = len(atores_c) + len(diretores_c) + len(generos_c)
        if total == 0:
            continue

        # Peso inversamente proporcional à similaridade: mais em comum = menor custo
        peso = round(1 / total, 4)

        partes = []
        if atores_c:
            partes.append(f"atores: {', '.join(sorted(atores_c))}")
        if diretores_c:
            partes.append(f"diretores: {', '.join(sorted(diretores_c))}")
        if generos_c:
            partes.append(f"generos: {', '.join(sorted(generos_c))}")

        grafo.adicionar_aresta(t1, t2, peso,
                               tipo="similaridade",
                               justificativa="; ".join(partes))

    return grafo
