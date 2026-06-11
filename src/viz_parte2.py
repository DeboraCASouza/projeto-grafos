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
  <a class="nav-brand" href="index.html">✈ Projeto Garotas</a>
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
        {_link("parte2_grafo_amostra.html",         "🎬",  "Dashboard Interativo")}
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
  <title>{titulo} — Projeto Garotas</title>
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

def gerar_grafo_amostra_html(grafo, caminho_saida: str, top_n: int = 9999) -> None:
    por_grau  = sorted(grafo.adjacencias, key=lambda n: grafo.obter_grau(n), reverse=True)
    nos_top   = set(por_grau[:top_n])
    V         = grafo.obter_ordem()
    E         = grafo.obter_tamanho()
    densidade = round(grafo.calcular_densidade(), 4)

    nodes, vistos, edges = [], set(), []
    for no in nos_top:
        grau = grafo.obter_grau(no)
        meta = grafo.nos.get(no, {})
        nodes.append({
            "id": no,
            "label": no,
            "value": grau,
            "size": 10 + grau * 0.85,
            "ano": meta.get('ano', ''),
            "imdb": meta.get('imdb', ''),
            "pais": meta.get('pais', '')
        })
    for u in nos_top:
        for a in grafo.obter_vizinhos(u):
            v = a.destino
            if v in nos_top:
                k = tuple(sorted([u, v]))
                if k not in vistos:
                    vistos.add(k)
                    edges.append({
                        "from": u,
                        "to": v,
                        "title": a.justificativa,
                        "width": max(1, round(2.5 / a.peso))
                    })

    nodes_j = json.dumps(nodes, ensure_ascii=False)
    edges_j = json.dumps(edges, ensure_ascii=False)

    html = f"""<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <title>Dashboard Interativo Netflix — Projeto Garotas</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.2/dist/vis-network.min.js" crossorigin="anonymous"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.2/dist/dist/vis-network.min.css" crossorigin="anonymous"/>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: 'Segoe UI', system-ui, sans-serif; background: #0F172A; color: #E2E8F0; height: 100vh; overflow: hidden; display: flex; flex-direction: column; }}
    
    #app {{ display: flex; flex: 1; height: calc(100vh - 52px); overflow: hidden; }}
    
    /* ── Sidebar ── */
    #sidebar {{
      width: 320px; flex-shrink: 0; background: #1E293B; border-right: 1px solid #334155;
      display: flex; flex-direction: column; overflow-y: auto;
    }}
    #sidebar::-webkit-scrollbar {{ width: 4px; }}
    #sidebar::-webkit-scrollbar-thumb {{ background: #334155; border-radius: 2px; }}
    
    .sb-hdr {{ padding: 16px; border-bottom: 1px solid #334155; }}
    .sb-hdr h1 {{ font-size: 15px; font-weight: 700; color: #F1F5F9; margin-bottom: 2px; }}
    .sb-hdr p {{ font-size: 11px; color: #94A3B8; }}
    
    .sb-sec {{ padding: 12px 16px; border-bottom: 1px solid #2D3F55; }}
    .sb-lbl {{ font-size: 9.5px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }}
    
    /* Search input */
    .search-wrap input {{
      width: 100%; padding: 8px 12px; background: #0F172A; border: 1px solid #334155;
      color: #E2E8F0; border-radius: 6px; outline: none; font-size: 12px; transition: border-color 0.15s;
    }}
    .search-wrap input:focus {{ border-color: #A855F7; }}
    #search-result {{ margin-top: 5px; font-size: 11px; color: #94A3B8; min-height: 20px; }}
    
    /* Country buttons */
    .reg-btns {{ display: flex; flex-direction: column; gap: 4px; }}
    .reg-btn {{
      display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 6px;
      border: 1px solid transparent; cursor: pointer; background: transparent; color: #94A3B8;
      font-size: 11.5px; font-weight: 600; text-align: left; transition: all 0.15s;
    }}
    .reg-btn .dot {{ width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }}
    .reg-btn.active {{ color: #E2E8F0; }}
    .reg-btn:hover {{ background: #0F1E30; }}
    
    /* Sliders */
    .slider-row {{ display: flex; justify-content: space-between; font-size: 11px; color: #94A3B8; margin-bottom: 5px; }}
    .slider-val {{ color: #A855F7; font-weight: 700; font-family: monospace; }}
    input[type="range"] {{ width: 100%; accent-color: #A855F7; cursor: pointer; }}
    
    /* Selected info */
    #sel-info {{ background: #0F172A; border: 1px solid #334155; border-radius: 6px; padding: 10px; min-height: 50px; }}
    .si-empty {{ font-size: 11px; color: #475569; font-style: italic; }}
    .si-title {{ font-size: 14px; font-weight: 700; color: #A855F7; margin-bottom: 4px; }}
    .si-row {{ display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }}
    .si-row span:first-child {{ color: #64748B; }}
    .si-row span:last-child {{ color: #E2E8F0; font-weight: 600; }}
    
    /* Global metrics */
    .metric-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }}
    .mc {{ background: #0F172A; border: 1px solid #2D3F55; border-radius: 6px; padding: 8px; }}
    .mc-val {{ font-size: 16px; font-weight: 700; color: #A855F7; font-family: monospace; }}
    .mc-lbl {{ font-size: 9px; color: #64748B; margin-top: 2px; }}
    
    .sb-foot {{ padding: 12px 16px; margin-top: auto; font-size: 9px; color: #475569; border-top: 1px solid #334155; }}
    
    /* ── Main Area ── */
    #main {{ flex: 1; display: flex; flex-direction: column; min-width: 0; }}
    #net-wrap {{ flex: 1; min-height: 0; background: #0F172A; position: relative; }}
    #net {{ width: 100%; height: 100%; }}
    
    /* Controls at the top right of network map */
    .net-control {{
      position: absolute; top: 16px; right: 16px; z-index: 100;
      background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(8px);
      border: 1px solid #334155; border-radius: 8px; padding: 8px 12px;
      font-size: 11px; color: #94A3B8; display: flex; align-items: center; gap: 8px;
    }}
    .net-control input {{ cursor: pointer; }}
    
    /* ── Chart Strip ── */
    #chart-strip {{
      height: 240px; flex-shrink: 0; display: grid; grid-template-columns: 1fr 1fr 1fr;
      border-top: 1px solid #334155; background: #080F1A;
    }}
    .cp {{ display: flex; flex-direction: column; padding: 8px 12px 6px; border-right: 1px solid #1a2540; overflow: hidden; }}
    .cp:last-child {{ border-right: none; }}
    .cp-title {{ font-size: 9px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }}
    .chart-box {{ flex: 1; min-height: 0; position: relative; }}
    .chart-box canvas {{ display: block; position: absolute; inset: 0; width: 100%; height: 100%; }}
    .cp-note {{ font-size: 8.5px; color: #475569; margin-top: 4px; }}
    
    /* ── Custom Tooltip ── */
    #tooltip {{
      position: fixed; display: none; pointer-events: none;
      background: #1E293B; border: 1px solid #334155; border-radius: 8px;
      padding: 10px 12px; font-size: 11px; color: #E2E8F0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6); z-index: 99999;
      min-width: 180px; max-width: 240px;
    }}
    .tt-name {{ font-size: 12.5px; font-weight: 700; color: #A855F7; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #334155; }}
    .tt-row {{ display: flex; justify-content: space-between; gap: 8px; margin-bottom: 3px; }}
    .tt-lbl {{ color: #64748B; font-size: 10.5px; }}
    .tt-val {{ color: #E2E8F0; font-weight: 600; font-size: 10.5px; text-align: right; }}
    .tt-edge {{ margin-top: 6px; padding-top: 6px; border-top: 1px solid #334155; font-size: 10px; color: #94A3B8; line-height: 1.4; }}
    .tt-tag {{ display: inline-block; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 4px; padding: 1px 4px; margin: 1px 1px 0 0; font-size: 9px; color: #c084fc; }}
    
    /* Override vis.js navigation buttons */
    .vis-navigation {{ display: flex !important; flex-direction: column !important; gap: 4px !important; position: absolute !important; bottom: 16px !important; right: 16px !important; }}
    .vis-button {{
      background-color: #1E293B !important; border: 1px solid #334155 !important; border-radius: 6px !important;
      color: #CBD5E1 !important; width: 28px !important; height: 28px !important; display: flex !important;
      align-items: center; justify-content: center; cursor: pointer !important; background-image: none !important;
      position: static !important; outline: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
    }}
    .vis-button:hover {{ background-color: #334155 !important; color: #FFF !important; }}
    .vis-button::after {{ font-size: 14px; font-weight: bold; }}
    .vis-button.vis-up::after {{ content: "↑"; }}
    .vis-button.vis-down::after {{ content: "↓"; }}
    .vis-button.vis-left::after {{ content: "←"; }}
    .vis-button.vis-right::after {{ content: "→"; }}
    .vis-button.vis-zoomIn::after {{ content: "+"; }}
    .vis-button.vis-zoomOut::after {{ content: "-"; }}
    .vis-button.vis-zoomExtents::after {{ content: "⛶"; }}
  </style>
</head>
<body>
{_navbar("parte2_grafo_amostra.html")}

<div id="app">
  <div id="sidebar">
    <div class="sb-hdr">
      <h1>Dashboard Interativo</h1>
      <p>Netflix Top Shows · Parte 2</p>
    </div>
    
    <div class="sb-sec">
      <div class="sb-lbl">Busca por Título</div>
      <div class="search-wrap">
        <input type="text" id="search-input" placeholder="Digite o título do show...">
      </div>
      <div id="search-result"></div>
    </div>
    
    <div class="sb-sec">
      <div class="sb-lbl">Filtrar por País</div>
      <div class="reg-btns" id="country-btns"></div>
    </div>
    
    <div class="sb-sec">
      <div class="sb-lbl">Filtrar por Grau Mínimo</div>
      <div class="slider-row">
        <span>Grau ≥</span>
        <span class="slider-val" id="deg-val">0</span>
      </div>
      <input type="range" id="deg-slider" min="0" max="30" value="0" step="1">
    </div>

    <div class="sb-sec">
      <div class="sb-lbl">Filtrar por Força de Conexão</div>
      <div class="slider-row">
        <span>Atributos comuns</span>
        <span class="slider-val" id="strength-val">1+ (Tudo)</span>
      </div>
      <input type="range" id="strength-slider" min="1" max="4" value="1" step="1">
    </div>
    
    <div class="sb-sec">
      <div class="sb-lbl">Título Selecionado</div>
      <div id="sel-info">
        <span class="si-empty">Clique em um título no grafo</span>
      </div>
    </div>
    
    <div class="sb-sec">
      <div class="sb-lbl">Métricas Globais</div>
      <div class="metric-grid">
        <div class="mc"><div class="mc-val">{V}</div><div class="mc-lbl">Títulos (|V|)</div></div>
        <div class="mc"><div class="mc-val">{E}</div><div class="mc-lbl">Conexões (|E|)</div></div>
        <div class="mc"><div class="mc-val">{densidade}</div><div class="mc-lbl">Densidade global</div></div>
        <div class="mc"><div class="mc-val" id="m-vis">{V}</div><div class="mc-lbl">Visíveis (filtro)</div></div>
      </div>
    </div>
    
    <div class="sb-foot">
      Grafo de Similaridade Netflix<br>
      {V} títulos · {E} conexões
    </div>
  </div>
  
  <div id="main">
    <div id="net-wrap">
      <div id="net"></div>
      <div class="net-control">
        <input type="checkbox" id="physics-toggle" checked>
        <label for="physics-toggle">Ativar Física</label>
      </div>
    </div>
    
    <div id="chart-strip">
      <div class="cp">
        <div class="cp-title">Distribuição de Graus</div>
        <div class="chart-box"><canvas id="cvs-graus"></canvas></div>
        <div class="cp-note" id="note-graus">Grau dos títulos visíveis com base no filtro atual.</div>
      </div>
      
      <div class="cp">
        <div class="cp-title">IMDb × Grau (Conexões)</div>
        <div class="chart-box"><canvas id="cvs-scatter"></canvas></div>
        <div class="cp-note">Dispersão: relação entre a nota IMDb e o grau do show.</div>
      </div>
      
      <div class="cp">
        <div class="cp-title">Distribuição por País</div>
        <div class="chart-box"><canvas id="cvs-countries"></canvas></div>
        <div class="cp-note">Principais países representados no subgrafo filtrado.</div>
      </div>
    </div>
  </div>
</div>

<div id="tooltip">
  <div class="tt-name" id="tt-name"></div>
  <div class="tt-row"><span class="tt-lbl">Grau</span><span class="tt-val" id="tt-grau"></span></div>
  <div class="tt-row"><span class="tt-lbl">IMDb</span><span class="tt-val" id="tt-imdb"></span></div>
  <div class="tt-row"><span class="tt-lbl">País</span><span class="tt-val" id="tt-pais"></span></div>
  <div class="tt-edge" id="tt-edge" style="display:none"></div>
</div>

<script>
// ── Dados brutos ──
var ALL_NODES = {nodes_j};
var ALL_EDGES = {edges_j};

// ── Pré-processamento e extração de países ──
var NODE_META = {{}};
var COUNTRY_COUNTS = {{}};
ALL_NODES.forEach(function(n) {{
  NODE_META[n.id] = {{
    grau: n.value,
    imdb: n.imdb || '-',
    pais: n.pais || '-',
    ano: n.ano || ''
  }};
  
  if (n.pais && n.pais !== '-') {{
    var parts = n.pais.split(/[\\/,]/);
    parts.forEach(function(p) {{
      p = p.trim();
      if (p) {{
        COUNTRY_COUNTS[p] = (COUNTRY_COUNTS[p] || 0) + 1;
      }}
    }});
  }}
}});

// Mapeamento de cores para países
var COUNTRY_COLORS = {{
  "USA": "#60A5FA",          // Blue
  "UK": "#F472B6",           // Pink
  "South Korea": "#34D399",   // Green
  "Brazil": "#FBBF24",       // Yellow
  "Germany": "#A855F7",      // Purple
  "Canada": "#FB7185",       // Rose
  "France": "#22D3EE",       // Cyan
  "Japan": "#F87171"         // Red
}};

function getCountryColor(paisStr) {{
  if (!paisStr || paisStr === '-') return '#94A3B8';
  var parts = paisStr.split(/[\\/,]/);
  for (var i = 0; i < parts.length; i++) {{
    var p = parts[i].trim();
    if (COUNTRY_COLORS[p]) return COUNTRY_COLORS[p];
  }}
  return '#94A3B8'; // Outros
}}

// Colore nós do grafo
ALL_NODES.forEach(function(n) {{
  var col = getCountryColor(n.pais);
  n.color = {{
    background: col,
    border: col,
    highlight: {{ background: '#f38ba8', border: '#FFF' }},
    hover: {{ background: col, border: '#FFF' }}
  }};
}});

// Colore arestas
var STRENGTH_WIDTH = [1, 2.5, 5, 8];
var STRENGTH_LABEL = ['1+ (Tudo)', '2+ (Média)', '3+ (Forte)', '4+ (Muito forte)'];

ALL_EDGES.forEach(function(e) {{
  var w = e.width || 2;
  var colVal = '#31324490';
  if (w >= 8) colVal = '#cba6f780';
  else if (w >= 4) colVal = '#45475a80';
  e.color = {{ color: colVal, highlight: '#cba6f7', hover: '#89b4fa' }};
}});

// ── Inicializa vis.js DataSets ──
var nodes = new vis.DataSet(ALL_NODES);
var edges = new vis.DataSet(ALL_EDGES);

// ── Estado dos filtros ──
var activeCountry = 'Todos';
var minDeg = 0;
var minStrength = 1;
var searchTerm = '';
var selectedNodeId = null;

var sortedCountries = Object.keys(COUNTRY_COUNTS).sort(function(a, b) {{
  return COUNTRY_COUNTS[b] - COUNTRY_COUNTS[a];
}});
var topCountries = sortedCountries.slice(0, 6);

// ── Popula botões de país ──
var countryContainer = document.getElementById('country-btns');

var btnAll = document.createElement('button');
btnAll.className = 'reg-btn active';
btnAll.innerHTML = '<span class="dot" style="background:#A855F7"></span>Todos os Países';
btnAll.onclick = function() {{ selectCountry('Todos', btnAll); }};
countryContainer.appendChild(btnAll);

topCountries.forEach(function(c) {{
  var col = COUNTRY_COLORS[c] || '#94A3B8';
  var btn = document.createElement('button');
  btn.className = 'reg-btn';
  btn.innerHTML = '<span class="dot" style="background:' + col + '"></span>' + c + ' (' + COUNTRY_COUNTS[c] + ')';
  btn.onclick = function() {{ selectCountry(c, btn); }};
  countryContainer.appendChild(btn);
}});

var btnOthers = document.createElement('button');
btnOthers.className = 'reg-btn';
btnOthers.innerHTML = '<span class="dot" style="background:#94A3B8"></span>Outros países';
btnOthers.onclick = function() {{ selectCountry('Outros', btnOthers); }};
countryContainer.appendChild(btnOthers);

function selectCountry(c, btn) {{
  document.querySelectorAll('.reg-btn').forEach(function(b) {{ b.classList.remove('active'); }});
  btn.classList.add('active');
  activeCountry = c;
  applyFilters();
}}

// ── Lógica de visibilidade ──
function isNodeVisible(id) {{
  var n = ALL_NODES.find(function(x) {{ return x.id === id; }});
  if (!n) return false;
  
  if (searchTerm && !n.id.toLowerCase().includes(searchTerm)) return false;
  if (n.value < minDeg) return false;
  
  if (activeCountry !== 'Todos') {{
    if (activeCountry === 'Outros') {{
      var matchTop = false;
      topCountries.forEach(function(tc) {{
        if (n.pais && n.pais.includes(tc)) matchTop = true;
      }});
      if (matchTop) return false;
    }} else {{
      if (!n.pais || !n.pais.includes(activeCountry)) return false;
    }}
  }}
  return true;
}}

function isEdgeVisible(from, to, width) {{
  if (!isNodeVisible(from) || !isNodeVisible(to)) return false;
  var minW = STRENGTH_WIDTH[minStrength - 1];
  if ((width || 2) < minW) return false;
  return true;
}}

// ── vis.js DataViews para filtragem ──
var nodesView = new vis.DataView(nodes, {{
  filter: function (node) {{ return isNodeVisible(node.id); }}
}});

var edgesView = new vis.DataView(edges, {{
  filter: function (edge) {{ return isEdgeVisible(edge.from, edge.to, edge.width); }}
}});

// ── Sliders ──
document.getElementById('deg-slider').addEventListener('input', function() {{
  minDeg = parseInt(this.value);
  document.getElementById('deg-val').textContent = minDeg;
  applyFilters();
}});

document.getElementById('strength-slider').addEventListener('input', function() {{
  minStrength = parseInt(this.value);
  document.getElementById('strength-val').textContent = STRENGTH_LABEL[minStrength - 1];
  applyFilters();
}});

document.getElementById('search-input').addEventListener('input', function() {{
  searchTerm = this.value.trim().toLowerCase();
  var res = document.getElementById('search-result');
  if (!searchTerm) {{
    res.textContent = '';
  }} else {{
    var visibleCount = ALL_NODES.filter(function(n) {{ return isNodeVisible(n.id); }}).length;
    res.textContent = visibleCount + ' títulos encontrados';
  }}
  applyFilters();
}});

function applyFilters() {{
  if (selectedNodeId && !isNodeVisible(selectedNodeId)) {{
    selectNode(null);
  }}
  nodesView.refresh();
  edgesView.refresh();
  
  var visCount = ALL_NODES.filter(function(n) {{ return isNodeVisible(n.id); }}).length;
  document.getElementById('m-vis').textContent = visCount;
  
  drawCharts();
}}

// ── Painel de Detalhes ──
function selectNode(id) {{
  selectedNodeId = id;
  var el = document.getElementById('sel-info');
  if (!id) {{
    el.innerHTML = '<span class="si-empty">Clique em um título no grafo</span>';
    resetHighlightedEdges();
    return;
  }}
  
  var n = ALL_NODES.find(function(x) {{ return x.id === id; }});
  var col = getCountryColor(n.pais);
  el.innerHTML = `
    <div class="si-title" style="color:${{col}};">${{n.id}}</div>
    <div class="si-row"><span>Grau (Conexões)</span><span>${{n.value}}</span></div>
    <div class="si-row"><span>IMDb</span><span>★ ${{n.imdb || '-'}}</span></div>
    <div class="si-row"><span>País</span><span>${{n.pais || '-'}}</span></div>
    <div class="si-row"><span>Ano</span><span>${{n.ano || '-'}}</span></div>
  `;
  
  highlightEdgesOfNode(id);
  drawCharts();
}}

function highlightEdgesOfNode(nodeId) {{
  var allEdges = edges.get();
  var updatedEdges = allEdges.map(function(e) {{
    var isConnected = (e.from === nodeId || e.to === nodeId);
    if (isConnected) {{
      return {{ id: e.id, color: {{ color: '#A855F7', highlight: '#A855F7', hover: '#A855F7' }}, width: (e.width || 2) + 2 }};
    }} else {{
      return {{ id: e.id, color: {{ color: '#1E293B30' }} }};
    }}
  }});
  edges.update(updatedEdges);
}}

function resetHighlightedEdges() {{
  var allEdges = edges.get();
  var updatedEdges = allEdges.map(function(e) {{
    var w = e.width || 2;
    var colVal = '#31324490';
    if (w >= 8) colVal = '#cba6f780';
    else if (w >= 4) colVal = '#45475a80';
    return {{
      id: e.id,
      color: {{ color: colVal, highlight: '#cba6f7', hover: '#89b4fa' }}
    }};
  }});
  edges.update(updatedEdges);
}}

// ── Inicializa vis.js Network ──
var opts  = {{
  nodes:{{shape:"dot",font:{{color:"#cdd6f4",size:10,face:"'Segoe UI',sans-serif"}},borderWidth:1.5}},
  edges:{{smooth:{{type:"continuous"}}, selectionWidth: 3, hoverWidth: 2}},
  physics:{{
    stabilization:{{iterations:150, fit:true}},
    barnesHut:{{
      gravitationalConstant:-3500,
      centralGravity:0.18,
      springLength:105,
      springConstant:0.02,
      damping:.12,
      avoidOverlap:0.45
    }}
  }},
  interaction:{{hover:true,tooltipDelay:9999999,navigationButtons:true}},
}};

var container = document.getElementById("net");
var network = new vis.Network(container, {{nodes: nodesView, edges: edgesView}}, opts);

network.on('click', function(p) {{
  if (p.nodes.length) {{
    selectNode(p.nodes[0]);
  }} else {{
    selectNode(null);
  }}
}});

document.getElementById('physics-toggle').addEventListener('change', function() {{
  network.setOptions({{ physics: this.checked }});
}});

network.on("stabilized", function () {{
  network.setOptions({{ physics: false }});
  document.getElementById('physics-toggle').checked = false;
}});

// ── Tooltip Customizado ──
var tooltip = document.getElementById('tooltip');
var mouseX = 0, mouseY = 0;

document.getElementById('net').addEventListener('mousemove', function(e) {{
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (tooltip.style.display === 'block') positionTooltip();
}});

function positionTooltip() {{
  var tx = mouseX + 16;
  var ty = mouseY + 16;
  var tw = tooltip.offsetWidth;
  var th = tooltip.offsetHeight;
  if (tx + tw > window.innerWidth  - 8) tx = mouseX - tw - 16;
  if (ty + th > window.innerHeight - 8) ty = mouseY - th - 16;
  tooltip.style.left = tx + 'px';
  tooltip.style.top  = ty + 'px';
}}

network.on('hoverNode', function(p) {{
  var id   = p.node;
  var n = ALL_NODES.find(function(x) {{ return x.id === id; }});
  document.getElementById('tt-name').textContent = id;
  document.getElementById('tt-grau').textContent = n.value + ' conexões';
  document.getElementById('tt-imdb').textContent = '★ ' + (n.imdb || '?');
  document.getElementById('tt-pais').textContent = n.pais || '?';
  document.getElementById('tt-edge').style.display = 'none';
  tooltip.style.display = 'block';
  positionTooltip();
}});

network.on('blurNode', function() {{
  tooltip.style.display = 'none';
}});

network.on('hoverEdge', function(p) {{
  var edgeObj = edgesView.get(p.edge);
  if (!edgeObj) return;
  
  document.getElementById('tt-name').textContent = edgeObj.from + ' ↔ ' + edgeObj.to;
  document.getElementById('tt-grau').textContent = '';
  document.getElementById('tt-imdb').textContent = '';
  document.getElementById('tt-pais').textContent = '';
  
  var parts = edgeObj.title ? edgeObj.title.split(';') : [];
  var html = parts.map(function(item) {{
    item = item.trim();
    var colon = item.indexOf(':');
    var tipo  = colon >= 0 ? item.slice(0, colon).trim() : 'conexão';
    var vals  = colon >= 0 ? item.slice(colon+1).trim() : item;
    var tags  = vals.split(',').map(function(v) {{ return '<span class="tt-tag">' + v.trim() + '</span>'; }}).join('');
    return '<div style="margin-bottom:4px"><span style="color:#64748B;font-size:10px">' + tipo + '</span><br>' + tags + '</div>';
  }}).join('');
  
  var ed = document.getElementById('tt-edge');
  ed.innerHTML = html || edgeObj.title || '';
  ed.style.display = html ? 'block' : 'none';
  
  tooltip.style.display = 'block';
  positionTooltip();
}});

network.on('blurEdge', function() {{
  tooltip.style.display = 'none';
}});

// ── Chart.js Setup ──
Chart.defaults.color          = '#64748B';
Chart.defaults.borderColor    = '#1E293B';
Chart.defaults.font.family    = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size      = 8;

// Chart 1: Distribuição de Graus
var chartGraus = null;
function drawDegreesChart(visNodes) {{
  var freq = {{}};
  visNodes.forEach(function(n) {{ freq[n.value] = (freq[n.value] || 0) + 1; }});
  var degs = Object.keys(freq).map(Number).sort(function(a,b){{return a-b;}});
  var counts = degs.map(function(d){{return freq[d];}});
  
  var selDeg = selectedNodeId ? ALL_NODES.find(function(x){{return x.id === selectedNodeId;}}).value : null;
  
  var bgColors = degs.map(function(d) {{
    if (d === selDeg) return '#FFFFFF';
    return 'rgba(168, 85, 247, 0.7)';
  }});
  
  if (chartGraus) {{
    chartGraus.data.labels = degs.map(String);
    chartGraus.data.datasets[0].data = counts;
    chartGraus.data.datasets[0].backgroundColor = bgColors;
    chartGraus.update();
    return;
  }}
  
  chartGraus = new Chart(document.getElementById('cvs-graus'), {{
    type: 'bar',
    data: {{
      labels: degs.map(String),
      datasets: [{{
        data: counts,
        backgroundColor: bgColors,
        borderRadius: 3
      }}]
    }},
    options: {{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {{ legend: {{ display: false }} }},
      scales: {{
        x: {{ grid: {{ color: '#1E293B' }}, ticks: {{ color: '#64748B', font: {{ size: 8 }} }} }},
        y: {{ grid: {{ color: '#1E293B' }}, ticks: {{ color: '#64748B', font: {{ size: 8 }} }}, min: 0 }}
      }}
    }}
  }});
}}

// Chart 2: IMDb x Grau (Scatter)
var chartScatter = null;
function drawScatterChart(visNodes) {{
  var pts = [];
  visNodes.forEach(function(n) {{
    var rating = parseFloat(n.imdb);
    if (!isNaN(rating)) {{
      pts.push({{ x: n.value, y: rating, label: n.id }});
    }}
  }});
  
  var pointColors = pts.map(function(pt) {{
    if (pt.label === selectedNodeId) return '#FFFFFF';
    return getCountryColor(ALL_NODES.find(function(x){{return x.id === pt.label;}}).pais);
  }});
  
  var pointRadii = pts.map(function(pt) {{
    return pt.label === selectedNodeId ? 7 : 4;
  }});
  
  if (chartScatter) {{
    chartScatter.data.datasets[0].data = pts;
    chartScatter.data.datasets[0].pointBackgroundColor = pointColors;
    chartScatter.data.datasets[0].pointRadius = pointRadii;
    chartScatter.update();
    return;
  }}
  
  chartScatter = new Chart(document.getElementById('cvs-scatter'), {{
    type: 'scatter',
    data: {{
      datasets: [{{
        data: pts,
        pointBackgroundColor: pointColors,
        pointBorderColor: 'transparent',
        pointRadius: pointRadii
      }}]
    }},
    options: {{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {{
        legend: {{ display: false }},
        tooltip: {{
          callbacks: {{
            label: function(ctx) {{
              var pt = ctx.raw;
              return pt.label + ' (Grau: ' + pt.x + ', IMDb: ★' + pt.y + ')';
            }}
          }}
        }}
      }},
      scales: {{
        x: {{ title: {{ display: true, text: 'Grau', color: '#64748B', font: {{ size: 8 }} }}, grid: {{ color: '#1E293B' }}, ticks: {{ color: '#64748B', font: {{ size: 8 }} }} }},
        y: {{ title: {{ display: true, text: 'Nota IMDb', color: '#64748B', font: {{ size: 8 }} }}, grid: {{ color: '#1E293B' }}, ticks: {{ color: '#64748B', font: {{ size: 8 }} }} }}
      }}
    }}
  }});
}}

// Chart 3: Distribuição por País
var chartCountries = null;
function drawCountriesChart(visNodes) {{
  var counts = {{}};
  visNodes.forEach(function(n) {{
    if (n.pais && n.pais !== '-') {{
      var parts = n.pais.split(/[\\/,]/);
      parts.forEach(function(p) {{
        p = p.trim();
        if (p) counts[p] = (counts[p] || 0) + 1;
      }});
    }}
  }});
  
  var labels = Object.keys(counts).sort(function(a,b){{return counts[b]-counts[a];}}).slice(0, 6);
  var dataVals = labels.map(function(l){{return counts[l];}});
  
  var bgColors = labels.map(function(l) {{
    return COUNTRY_COLORS[l] || '#94A3B8';
  }});
  
  if (chartCountries) {{
    chartCountries.data.labels = labels;
    chartCountries.data.datasets[0].data = dataVals;
    chartCountries.data.datasets[0].backgroundColor = bgColors;
    chartCountries.update();
    return;
  }}
  
  chartCountries = new Chart(document.getElementById('cvs-countries'), {{
    type: 'bar',
    data: {{
      labels: labels,
      datasets: [{{
        data: dataVals,
        backgroundColor: bgColors,
        borderRadius: 3
      }}]
    }},
    options: {{
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {{ legend: {{ display: false }} }},
      scales: {{
        x: {{ grid: {{ color: '#1E293B' }}, ticks: {{ color: '#64748B', font: {{ size: 8 }} }}, min: 0 }},
        y: {{ grid: {{ display: false }}, ticks: {{ color: '#E2E8F0', font: {{ size: 8 }} }} }}
      }}
    }}
  }});
}}

function drawCharts() {{
  var visNodes = ALL_NODES.filter(function(n) {{ return isNodeVisible(n.id); }});
  drawDegreesChart(visNodes);
  drawScatterChart(visNodes);
  drawCountriesChart(visNodes);
}}

// ── Inicializa gráficos ──
drawCharts();
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
  <title>Projeto Garotas — Rede de Aeroportos + Netflix</title>
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
  <h1>✈ Projeto Garotas</h1>
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
      <a href="parte2_grafo_amostra.html">🎬 Dashboard Interativo <span class="tag">vis.js + Chart.js</span></a>
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
