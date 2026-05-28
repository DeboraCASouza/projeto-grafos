"""
Visualizações da Parte 2 — HTML com navbar navegável entre Parte 1 e Parte 2.
Também gera a galeria de PNGs da Parte 1 e injeta o navbar nos HTMLs existentes.
"""

import json
import os
import re

# ---------------------------------------------------------------------------
# Paleta e navbar compartilhados
# ---------------------------------------------------------------------------

_PALETTE = {
    "bg":        "#11111b",
    "card":      "#1e1e2e",
    "surface":   "#181825",
    "border":    "#313244",
    "text":      "#cdd6f4",
    "muted":     "#a6adc8",
    "purple":    "#cba6f7",
    "purple2":   "#7c3aed",
    "pink":      "#f38ba8",
    "teal":      "#89dceb",
    "green":     "#a6e3a1",
    "yellow":    "#f9e2af",
}

_NAVBAR_CSS = """
<style id="topbar-style">
*,*::before,*::after{box-sizing:border-box}
#topbar{
  position:fixed;top:0;left:0;right:0;height:52px;
  background:#1e1e2e;border-bottom:1px solid #313244;
  display:flex;align-items:center;padding:0 22px;gap:18px;
  z-index:9999;box-shadow:0 2px 16px #0006;
  font-family:'Segoe UI',Arial,sans-serif;
}
.nav-brand{
  color:#cba6f7;font-weight:700;font-size:15px;
  text-decoration:none;white-space:nowrap;letter-spacing:-.3px;
  display:flex;align-items:center;gap:7px;
}
.nav-brand:hover{color:#f5c2e7}
.nav-sep{width:1px;height:28px;background:#313244;flex-shrink:0}
.nav-links{display:flex;gap:6px;align-items:center}
.dropdown{position:relative}
.dropbtn{
  background:transparent;border:1px solid #313244;color:#cdd6f4;
  padding:7px 14px;border-radius:7px;cursor:pointer;font-size:13px;
  transition:background .15s,color .15s;white-space:nowrap;
}
.dropbtn:hover,.dropbtn.active{background:#313244;color:#cba6f7;border-color:#45475a}
.dropdown-content{
  display:none;position:absolute;top:46px;left:0;
  background:#181825;border:1px solid #313244;border-radius:10px;
  min-width:230px;box-shadow:0 12px 32px #0008;
  z-index:10000;overflow:hidden;
}
.dropdown:hover .dropdown-content{display:block}
.dropdown-content a{
  display:flex;align-items:center;gap:10px;
  color:#a6adc8;padding:10px 16px;text-decoration:none;
  font-size:13px;transition:background .1s,color .1s;border-bottom:1px solid #31324430;
}
.dropdown-content a:last-child{border-bottom:none}
.dropdown-content a:hover{background:#31324470;color:#cba6f7}
.dropdown-content a.current{color:#cba6f7;background:#31324450;font-weight:600}
.nav-tag{
  margin-left:auto;background:#31324460;color:#a6adc8;
  font-size:11px;padding:2px 8px;border-radius:99px;
}
</style>
"""

def _navbar(atual: str = "") -> str:
    """Retorna o HTML completo do topbar com a página atual marcada."""
    def _link(href, icon, label):
        cls = ' class="current"' if href == atual else ''
        return f'<a href="{href}"{cls}>{icon} {label}</a>'

    return f"""{_NAVBAR_CSS}
<nav id="topbar">
  <a class="nav-brand" href="index.html">✈ Projeto Grafos</a>
  <div class="nav-sep"></div>
  <div class="nav-links">
    <div class="dropdown">
      <button class="dropbtn{"  active" if atual in ("grafo_interativo.html","arvore_percurso.html","parte1_galeria.html") else ""}">Parte 1 — Aeroportos ▾</button>
      <div class="dropdown-content">
        {_link("grafo_interativo.html",   "🗺",  "Grafo Interativo")}
        {_link("arvore_percurso.html",    "🌳",  "Árvore de Percurso")}
        {_link("parte1_galeria.html",     "📊",  "Galeria de Visualizações")}
      </div>
    </div>
    <div class="dropdown">
      <button class="dropbtn{"  active" if atual.startswith("parte2") else ""}">Parte 2 — Netflix ▾</button>
      <div class="dropdown-content">
        {_link("parte2_grafo_amostra.html",         "🎬",  "Grafo de Similaridade")}
        {_link("parte2_distribuicao_graus.html",     "📈",  "Distribuição de Graus")}
        {_link("parte2_comparacao_algoritmos.html",  "⚡",  "Comparação de Algoritmos")}
      </div>
    </div>
  </div>
</nav>"""


# ---------------------------------------------------------------------------
# SVG dark-theme com gradiente e animação
# ---------------------------------------------------------------------------

def _svg_barras(dados: list, titulo: str, xlabel: str, ylabel: str,
                grad_from: str = "#a78bfa", grad_to: str = "#7c3aed",
                largura: int = 860, altura: int = 440) -> str:
    ml, mr, mt, mb = 72, 28, 52, 108
    pw = largura - ml - mr
    ph = altura - mt - mb

    if not dados:
        return f'<svg width="{largura}" height="{altura}"><text x="50%" y="50%" text-anchor="middle" fill="#cdd6f4">Sem dados</text></svg>'

    max_val = max(v for _, v in dados) or 1
    n = len(dados)
    gap = max(4, min(10, pw // (n * 4)))
    bw  = max(6, (pw - gap * (n + 1)) // n)
    grad_id = f"g{abs(hash(titulo)) % 9999}"

    lines = [
        f'<svg width="{largura}" height="{altura}" xmlns="http://www.w3.org/2000/svg" '
        f'style="font-family:\'Segoe UI\',Arial,sans-serif;background:#1e1e2e;border-radius:12px">',
        # gradiente
        f'<defs><linearGradient id="{grad_id}" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0%" stop-color="{grad_from}"/>'
        f'<stop offset="100%" stop-color="{grad_to}"/></linearGradient></defs>',
        # fundo do plot
        f'<rect x="{ml}" y="{mt}" width="{pw}" height="{ph}" fill="#11111b" rx="6"/>',
        # título
        f'<text x="{largura//2}" y="30" text-anchor="middle" font-size="14" '
        f'font-weight="600" fill="#cdd6f4">{titulo}</text>',
        # eixos
        f'<line x1="{ml}" y1="{mt}" x2="{ml}" y2="{mt+ph}" stroke="#45475a" stroke-width="1.5"/>',
        f'<line x1="{ml}" y1="{mt+ph}" x2="{ml+pw}" y2="{mt+ph}" stroke="#45475a" stroke-width="1.5"/>',
        # label eixos
        f'<text x="{ml+pw//2}" y="{altura-6}" text-anchor="middle" font-size="11" fill="#6c7086">{xlabel}</text>',
        f'<text x="13" y="{mt+ph//2}" text-anchor="middle" font-size="11" fill="#6c7086" '
        f'transform="rotate(-90,13,{mt+ph//2})">{ylabel}</text>',
    ]

    # gridlines + labels Y
    for i in range(6):
        val = max_val * i / 5
        y   = mt + ph - int(ph * i / 5)
        lines.append(f'<line x1="{ml}" y1="{y}" x2="{ml+pw}" y2="{y}" stroke="#313244" stroke-dasharray="4,3"/>')
        lbl = f"{val:.2f}" if max_val < 5 else f"{val:.1f}" if max_val < 50 else f"{int(val)}"
        lines.append(f'<text x="{ml-7}" y="{y+4}" text-anchor="end" font-size="10" fill="#6c7086">{lbl}</text>')

    # barras + labels X
    for i, (label, val) in enumerate(dados):
        bh  = max(2, int(ph * val / max_val))
        x   = ml + gap * (i + 1) + bw * i
        y   = mt + ph - bh
        cx  = x + bw // 2

        lines.append(
            f'<rect x="{x}" y="{y}" width="{bw}" height="{bh}" '
            f'fill="url(#{grad_id})" rx="3" opacity=".9">'
            f'<title>{label}: {val}</title></rect>'
        )
        # valor acima da barra (só se couber)
        if bh > 16:
            fmt = f"{val:.3f}" if max_val < 2 else f"{val:.2f}" if max_val < 10 else f"{val:.1f}" if max_val < 100 else str(int(val))
            lines.append(f'<text x="{cx}" y="{y-4}" text-anchor="middle" font-size="9" fill="#a6adc8">{fmt}</text>')
        # label X rotacionado
        lines.append(
            f'<text transform="rotate(-38,{cx},{mt+ph+10})" x="{cx}" y="{mt+ph+10}" '
            f'text-anchor="end" font-size="10" fill="#6c7086">{str(label)[:24]}</text>'
        )

    lines.append('</svg>')
    return '\n'.join(lines)


# ---------------------------------------------------------------------------
# Template de página HTML completa
# ---------------------------------------------------------------------------

def _page(titulo: str, corpo: str, pagina_atual: str = "", nota: str = "") -> str:
    nota_html = f'<p class="nota">{nota}</p>' if nota else ""
    return f"""<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{titulo} — Projeto Grafos</title>
  <style>
    body{{margin:0;padding:52px 0 0;background:#11111b;color:#cdd6f4;
         font-family:'Segoe UI',Arial,sans-serif;min-height:100vh}}
    .page-wrap{{max-width:1080px;margin:0 auto;padding:32px 24px 56px}}
    h1{{font-size:22px;font-weight:700;color:#cdd6f4;margin:0 0 6px}}
    .subtitle{{color:#6c7086;font-size:13px;margin:0 0 28px}}
    .card{{background:#1e1e2e;border:1px solid #313244;border-radius:12px;
           padding:28px;margin-bottom:24px}}
    .nota{{color:#6c7086;font-size:12.5px;margin-top:18px;line-height:1.7;
           background:#181825;border-left:3px solid #313244;padding:12px 16px;border-radius:0 6px 6px 0}}
    .nota b{{color:#a6adc8}}
    .chips{{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}}
    .chip{{background:#313244;color:#cdd6f4;border-radius:99px;
           padding:5px 14px;font-size:12px;white-space:nowrap}}
    .chip b{{color:#cba6f7}}
  </style>
</head>
<body>
{_navbar(pagina_atual)}
<div class="page-wrap">
  <h1>{titulo}</h1>
  {corpo}
</div>
</body>
</html>"""


# ---------------------------------------------------------------------------
# Item 4 — Distribuição de graus (Parte 2)
# ---------------------------------------------------------------------------

def gerar_distribuicao_graus_html(grafo, caminho_saida: str) -> None:
    dist   = grafo.distribuicao_graus()
    dados  = [(str(g), c) for g, c in sorted(dist.items())]
    graus  = [grafo.obter_grau(n) for n in grafo.adjacencias]
    V      = grafo.obter_ordem()
    E      = grafo.obter_tamanho()
    g_med  = round(sum(graus) / len(graus), 2) if graus else 0
    g_max  = max(graus) if graus else 0
    isolad = sum(1 for g in graus if g == 0)

    svg = _svg_barras(
        dados,
        titulo="Distribuição de Graus — Grafo Netflix (Parte 2)",
        xlabel="Grau (nº de títulos similares)",
        ylabel="Quantidade de títulos",
        grad_from="#89b4fa", grad_to="#7c3aed",
        largura=900, altura=440,
    )

    chips = f"""<div class="chips">
      <div class="chip">Nós <b>{V}</b></div>
      <div class="chip">Arestas <b>{E}</b></div>
      <div class="chip">Grau médio <b>{g_med}</b></div>
      <div class="chip">Grau máximo <b>{g_max}</b></div>
      <div class="chip">Nós isolados <b>{isolad}</b></div>
    </div>"""

    corpo = f"""{chips}
    <div class="card" style="overflow-x:auto">{svg}</div>"""

    nota = ("<b>O que mostra:</b> quantos títulos têm cada valor de grau. "
            "<b>Insight:</b> distribuição assimétrica à direita — a maioria dos títulos tem poucos vizinhos "
            "(graus 0–5), enquanto poucos hubs concentram graus acima de 20. Padrão de rede de mundo pequeno. "
            "<b>Escolha:</b> barras verticais são ideais para comparar frequências de uma variável discreta.")

    html = _page("Distribuição de Graus — Netflix", corpo,
                 pagina_atual="parte2_distribuicao_graus.html", nota=nota)

    os.makedirs(os.path.dirname(caminho_saida), exist_ok=True)
    with open(caminho_saida, "w", encoding="utf-8") as f:
        f.write(html)


# ---------------------------------------------------------------------------
# Item 6 — Comparação de algoritmos (Parte 2)
# ---------------------------------------------------------------------------

def gerar_comparacao_algoritmos_html(metricas: dict, caminho_saida: str) -> None:
    tabela = metricas.get("tabela_comparativa", [])
    if not tabela:
        return

    # Stat cards
    COLORS = ["#cba6f7", "#89b4fa", "#f38ba8", "#f9e2af"]
    cards_html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px">'
    for r, cor in zip(tabela, COLORS):
        cards_html += f"""<div class="card" style="padding:18px;text-align:center;border-top:3px solid {cor}">
          <div style="font-size:11px;color:#6c7086;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">{r['algoritmo']}</div>
          <div style="font-size:28px;font-weight:700;color:{cor}">{r['media_ms']}<span style="font-size:13px;color:#6c7086">ms</span></div>
          <div style="font-size:11px;color:#6c7086;margin-top:4px">{r['complexidade']}</div>
        </div>"""
    cards_html += '</div>'

    # Tabela
    COLS = ["Algoritmo", "Complexidade", "Média (ms)", "Mín (ms)", "Máx (ms)", "Desvio (ms)", "Pico Mem (KB)"]
    thead = "".join(f"<th>{c}</th>" for c in COLS)
    tbody = ""
    for i, r in enumerate(tabela):
        cor = COLORS[i]
        tbody += (f'<tr><td><b style="color:{cor}">{r["algoritmo"]}</b></td>'
                  f'<td style="font-family:monospace;color:#89b4fa">{r["complexidade"]}</td>'
                  f'<td><b>{r["media_ms"]}</b></td><td>{r["min_ms"]}</td>'
                  f'<td>{r["max_ms"]}</td><td>{r["desvio_ms"]}</td>'
                  f'<td>{r["pico_kb"]}</td></tr>')

    tabela_html = f"""<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:28px">
      <thead><tr style="background:#313244;color:#cdd6f4;text-align:left">
        {''.join(f'<th style="padding:11px 14px;font-weight:600">{c}</th>' for c in COLS)}
      </tr></thead>
      <tbody style="color:#cdd6f4">
        {''.join(f'<tr style="border-bottom:1px solid #31324450">{r}</tr>' for r in tbody.split('</tr>') if r.strip())}
      </tbody>
    </table>"""

    # Charts
    dados_tempo = [(r["algoritmo"], r["media_ms"]) for r in tabela]
    dados_mem   = [(r["algoritmo"], r["pico_kb"]) for r in tabela]

    svg_t = _svg_barras(dados_tempo, "Tempo Médio de Execução (ms)", "Algoritmo", "Tempo (ms)",
                        grad_from="#f5c2e7", grad_to="#db2777", largura=480, altura=340)
    svg_m = _svg_barras(dados_mem,   "Pico de Memória (KB)",         "Algoritmo", "KB",
                        grad_from="#89dceb", grad_to="#0891b2", largura=480, altura=340)

    charts = f'<div style="display:flex;gap:20px;flex-wrap:wrap">{svg_t}{svg_m}</div>'

    nota = ("<b>O que mostra:</b> tempo médio e pico de memória de BFS, DFS, Dijkstra e Bellman-Ford "
            f"sobre o grafo Netflix ({metricas.get('runs',0)} execuções, mesma fonte). "
            "<b>Insight:</b> BFS é o mais rápido e eficiente. DFS usa ~8× mais memória por causa da pilha de recursão. "
            "Bellman-Ford é ~28× mais lento que BFS — diferença de complexidade O(V·E) vs O(V+E) claramente visível. "
            "<b>Escolha:</b> barras por categoria para comparação direta; dois gráficos separados evitam escalas incompatíveis.")

    corpo = f"""{cards_html}
    <div class="card" style="overflow-x:auto">{tabela_html}{charts}</div>"""

    html = _page("Comparação de Algoritmos — Parte 2", corpo,
                 pagina_atual="parte2_comparacao_algoritmos.html", nota=nota)

    os.makedirs(os.path.dirname(caminho_saida), exist_ok=True)
    with open(caminho_saida, "w", encoding="utf-8") as f:
        f.write(html)


# ---------------------------------------------------------------------------
# Item 4 — Grafo interativo Netflix (vis.js CDN)
# ---------------------------------------------------------------------------

def gerar_grafo_amostra_html(grafo, caminho_saida: str, top_n: int = 45) -> None:
    por_grau  = sorted(grafo.adjacencias, key=lambda n: grafo.obter_grau(n), reverse=True)
    nos_top   = set(por_grau[:top_n])
    V         = grafo.obter_ordem()
    E         = grafo.obter_tamanho()
    densidade = round(grafo.calcular_densidade(), 4)

    nodes, vistos, edges = [], set(), []
    for no in nos_top:
        grau = grafo.obter_grau(no)
        meta = grafo.nos.get(no, {})
        nodes.append({"id": no, "label": no,
                      "title": f"<b>{no}</b><br>Grau: {grau}<br>IMDb: {meta.get('imdb','?')}<br>País: {meta.get('pais','?')}",
                      "value": grau, "size": 10 + grau * 0.85})
    for u in nos_top:
        for a in grafo.obter_vizinhos(u):
            v = a.destino
            if v in nos_top:
                k = tuple(sorted([u, v]))
                if k not in vistos:
                    vistos.add(k)
                    edges.append({"from": u, "to": v,
                                  "title": a.justificativa[:80],
                                  "width": max(1, round(2.5 / a.peso))})

    nodes_j = json.dumps(nodes, ensure_ascii=False)
    edges_j = json.dumps(edges, ensure_ascii=False)

    html = f"""<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <title>Grafo de Similaridade Netflix — Projeto Grafos</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.2/dist/vis-network.min.js" crossorigin="anonymous"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.2/dist/dist/vis-network.min.css" crossorigin="anonymous"/>
  <style>
    *{{box-sizing:border-box;margin:0;padding:0}}
    body{{background:#11111b;color:#cdd6f4;font-family:'Segoe UI',Arial,sans-serif;overflow:hidden}}
    #net{{width:100vw;height:100vh;background:#11111b}}
    /* ── topbar ── */
    {_NAVBAR_CSS.replace('<style id="topbar-style">','').replace('</style>','')}
    body{{padding-top:52px}}
    #net{{height:calc(100vh - 52px)}}
    /* ── legenda ── */
    #legend{{
      position:fixed;bottom:20px;right:20px;
      background:#1e1e2e;border:1px solid #313244;border-radius:10px;
      padding:14px 18px;font-size:12px;color:#a6adc8;
      z-index:100;line-height:1.9;
    }}
    #legend b{{color:#cdd6f4}}
    /* ── stats ── */
    #stats{{
      position:fixed;top:66px;left:16px;
      background:#1e1e2eb0;backdrop-filter:blur(8px);
      border:1px solid #313244;border-radius:8px;
      padding:10px 16px;font-size:12px;color:#6c7086;
      z-index:100;line-height:1.8;
    }}
    #stats b{{color:#cba6f7}}
  </style>
</head>
<body>
{_navbar("parte2_grafo_amostra.html")}
<div id="stats">
  <b>{top_n}</b> títulos · <b>{len(edges)}</b> arestas visíveis<br>
  Grafo completo: <b>{V}</b> nós · <b>{E}</b> arestas · densidade <b>{densidade}</b>
</div>
<div id="net"></div>
<div id="legend">
  <b>Tamanho do nó</b> = grau (nº de similares)<br>
  <b>Espessura da aresta</b> = similaridade<br>
  <span style="color:#6c7086">Passe o mouse para detalhes</span>
</div>
<script>
var nodes = new vis.DataSet({nodes_j});
var edges = new vis.DataSet({edges_j});
var opts  = {{
  nodes:{{shape:"dot",font:{{color:"#cdd6f4",size:11}},borderWidth:1.5,
          color:{{background:"#7c3aed",border:"#cba6f7",
                 highlight:{{background:"#f38ba8",border:"#f5c2e7"}},
                 hover:{{background:"#a78bfa",border:"#cba6f7"}}}}}},
  edges:{{color:{{color:"#31324490",highlight:"#cba6f7",hover:"#89b4fa"}},
          smooth:{{type:"continuous"}}}},
  physics:{{stabilization:{{iterations:220}},
            barnesHut:{{gravitationalConstant:-9000,springLength:130,damping:.12}}}},
  interaction:{{hover:true,tooltipDelay:80,navigationButtons:true}},
}};
new vis.Network(document.getElementById("net"),{{nodes,edges}},opts);
</script>
</body>
</html>"""

    os.makedirs(os.path.dirname(caminho_saida), exist_ok=True)
    with open(caminho_saida, "w", encoding="utf-8") as f:
        f.write(html)


# ---------------------------------------------------------------------------
# Galeria da Parte 1 (PNGs)
# ---------------------------------------------------------------------------

_PARTE1_IMGS = [
    ("viz_analitica_distribuicao_graus.png",  "Distribuição de Graus",
     "Histograma dos graus dos 20 aeroportos. Evidencia a estrutura hub-and-spoke: GRU, CNF e BSB dominam com grau 19."),
    ("viz_analitica_ranking_aeroportos.png",  "Ranking de Aeroportos",
     "Barras ordenadas por grau decrescente. Permite identificar rapidamente os hubs nacionais e regionais."),
    ("viz_analitica_comparacao_regional.png", "Comparação Regional",
     "Densidade por região. Sudeste, Sul e Centro-Oeste têm densidade 1,0; Norte é o menos denso (0,67)."),
    ("viz_analitica_subgrafo_maior_grau.png", "Subgrafo dos Hubs",
     "Os 5 aeroportos de maior grau e suas interconexões. Formam um clique quase completo no núcleo da rede."),
    ("viz_exploratorio_grau_vs_densidade.png","Grau vs Densidade Ego",
     "Dispersão: aeroportos com alto grau (hubs) têm menor densidade ego; aeroportos pequenos têm ego-redes completas."),
    ("viz_exploratorio_ego_metricas.png",     "Métricas de Ego-Redes",
     "Painel comparativo com grau, tamanho e densidade da ego-rede por aeroporto."),
    ("viz_explanatorio_rede_completa.png",    "Rede Completa",
     "Grafo completo com 20 nós e 115 arestas. Nós coloridos por região, tamanho proporcional ao grau."),
    ("viz_explanatorio_dashboard.png",        "Dashboard Executivo",
     "Síntese dos principais achados da Parte 1 em um único painel."),
    ("arvore_percurso.png",                   "Árvore de Percurso",
     "Caminhos obrigatórios REC→POA e MAO→GRU destacados sobre o grafo de aeroportos."),
]

def gerar_galeria_parte1_html(caminho_saida: str) -> None:
    cards = ""
    for img, titulo, descricao in _PARTE1_IMGS:
        cards += f"""
        <div class="card">
          <img src="{img}" alt="{titulo}"
               style="width:100%;border-radius:8px;display:block;margin-bottom:14px;
                      border:1px solid #313244;cursor:zoom-in"
               onclick="this.style.maxWidth=this.style.maxWidth?'':'none';this.style.width=this.style.width=='100%'?'auto':'100%'"/>
          <h3 style="font-size:14px;color:#cba6f7;margin:0 0 6px">{titulo}</h3>
          <p style="font-size:12.5px;color:#6c7086;margin:0;line-height:1.6">{descricao}</p>
        </div>"""

    corpo = f"""
    <p class="subtitle">Clique em qualquer imagem para ampliar. Gerado com matplotlib.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px">
      {cards}
    </div>"""

    html = _page("Galeria de Visualizações — Parte 1", corpo,
                 pagina_atual="parte1_galeria.html")

    os.makedirs(os.path.dirname(caminho_saida), exist_ok=True)
    with open(caminho_saida, "w", encoding="utf-8") as f:
        f.write(html)


# ---------------------------------------------------------------------------
# Index / Landing page
# ---------------------------------------------------------------------------

def gerar_index_html(caminho_saida: str) -> None:
    html = f"""<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Projeto Grafos — Rede de Aeroportos + Netflix</title>
  <style>
    *{{box-sizing:border-box;margin:0;padding:0}}
    body{{background:#11111b;color:#cdd6f4;font-family:'Segoe UI',Arial,sans-serif;
         padding-top:52px;min-height:100vh}}
    {_NAVBAR_CSS.replace('<style id="topbar-style">','').replace('</style>','')}
    .hero{{text-align:center;padding:64px 24px 48px}}
    .hero h1{{font-size:32px;font-weight:800;color:#cba6f7;margin-bottom:10px}}
    .hero p{{font-size:15px;color:#6c7086;max-width:560px;margin:0 auto;line-height:1.7}}
    .grid{{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:860px;margin:0 auto;padding:0 24px 64px}}
    @media(max-width:640px){{.grid{{grid-template-columns:1fr}}}}
    .section-card{{background:#1e1e2e;border:1px solid #313244;border-radius:14px;padding:28px;}}
    .section-card h2{{font-size:16px;font-weight:700;margin-bottom:6px}}
    .section-card p{{font-size:13px;color:#6c7086;margin-bottom:18px;line-height:1.6}}
    .link-list a{{display:flex;align-items:center;gap:10px;color:#a6adc8;
                  text-decoration:none;padding:9px 12px;border-radius:7px;
                  font-size:13px;transition:.12s;border:1px solid transparent}}
    .link-list a:hover{{background:#313244;color:#cba6f7;border-color:#45475a}}
    .tag{{background:#31324460;color:#6c7086;font-size:10px;
          padding:2px 8px;border-radius:99px;margin-left:auto}}
  </style>
</head>
<body>
{_navbar("index.html")}
<div class="hero">
  <h1>✈ Projeto Grafos</h1>
  <p>Teoria dos Grafos + Análise e Visualização de Dados<br>
     Rede de Aeroportos Brasileira (Parte 1) · Similaridade Netflix (Parte 2)</p>
</div>
<div class="grid">
  <div class="section-card">
    <h2 style="color:#cba6f7">Parte 1 — Aeroportos do Brasil</h2>
    <p>20 aeroportos · 115 conexões · densidade 0,60<br>Algoritmos: BFS, DFS, Dijkstra</p>
    <div class="link-list">
      <a href="grafo_interativo.html">🗺 Grafo Interativo <span class="tag">vis.js</span></a>
      <a href="arvore_percurso.html">🌳 Árvore de Percurso <span class="tag">interactive</span></a>
      <a href="parte1_galeria.html">📊 Galeria de Visualizações <span class="tag">9 PNGs</span></a>
    </div>
  </div>
  <div class="section-card">
    <h2 style="color:#89b4fa">Parte 2 — Netflix Top Shows</h2>
    <p>182 títulos · 615 arestas · densidade 0,037<br>Algoritmos: BFS, DFS, Dijkstra, Bellman-Ford</p>
    <div class="link-list">
      <a href="parte2_grafo_amostra.html">🎬 Grafo de Similaridade <span class="tag">vis.js</span></a>
      <a href="parte2_distribuicao_graus.html">📈 Distribuição de Graus <span class="tag">SVG</span></a>
      <a href="parte2_comparacao_algoritmos.html">⚡ Comparação de Algoritmos <span class="tag">SVG</span></a>
    </div>
  </div>
</div>
</body>
</html>"""

    os.makedirs(os.path.dirname(caminho_saida), exist_ok=True)
    with open(caminho_saida, "w", encoding="utf-8") as f:
        f.write(html)


# ---------------------------------------------------------------------------
# Injeção de navbar nos HTMLs existentes da Parte 1
# ---------------------------------------------------------------------------

def _injetar_navbar_em(caminho: str, pagina_atual: str) -> None:
    """Lê um HTML existente e injeta o topbar após a tag <body>."""
    with open(caminho, encoding="utf-8", errors="replace") as f:
        html = f.read()

    # Evita injetar duas vezes
    if 'id="topbar"' in html:
        return

    navbar_bloco = _navbar(pagina_atual)

    # Insere o padding-top no body via CSS inline
    padding_css = '<style>body{padding-top:52px!important}</style>\n'

    # Para grafo_interativo.html (Leaflet): também corrige a altura do mapa
    if "grafo_interativo" in caminho:
        padding_css = '<style>body{padding-top:52px!important}#map{height:calc(100vh - 52px)!important}</style>\n'

    # Para arvore_percurso.html: ajusta heights que usam 100vh
    if "arvore_percurso" in caminho:
        html = html.replace("height: 100vh", "height: calc(100vh - 52px)")
        html = html.replace("height:100vh",  "height:calc(100vh - 52px)")

    # Injeta depois de <body...>
    html = re.sub(r'(<body[^>]*>)', r'\1\n' + padding_css + navbar_bloco + '\n', html, count=1)

    with open(caminho, "w", encoding="utf-8") as f:
        f.write(html)


def injetar_navbars_parte1(pasta: str) -> None:
    alvos = {
        "grafo_interativo.html": "grafo_interativo.html",
        "arvore_percurso.html":  "arvore_percurso.html",
    }
    for nome, pagina_atual in alvos.items():
        caminho = os.path.join(pasta, nome)
        if os.path.exists(caminho):
            _injetar_navbar_em(caminho, pagina_atual)


# ---------------------------------------------------------------------------
# Ponto de entrada
# ---------------------------------------------------------------------------

def gerar_todas_visualizacoes(grafo, metricas: dict, pasta_saida: str) -> list:
    arquivos = []

    p = lambda nome: os.path.join(pasta_saida, nome)

    gerar_distribuicao_graus_html(grafo,    p("parte2_distribuicao_graus.html"))
    arquivos.append(p("parte2_distribuicao_graus.html"))

    gerar_comparacao_algoritmos_html(metricas, p("parte2_comparacao_algoritmos.html"))
    arquivos.append(p("parte2_comparacao_algoritmos.html"))

    gerar_grafo_amostra_html(grafo, p("parte2_grafo_amostra.html"))
    arquivos.append(p("parte2_grafo_amostra.html"))

    gerar_galeria_parte1_html(p("parte1_galeria.html"))
    arquivos.append(p("parte1_galeria.html"))

    gerar_index_html(p("index.html"))
    arquivos.append(p("index.html"))

    injetar_navbars_parte1(pasta_saida)

    return arquivos
