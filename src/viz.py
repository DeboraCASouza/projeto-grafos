import json
import math
import os
import random
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec

REGION_COLORS = {
    "Norte":        "#7C3AED",
    "Nordeste":     "#A855F7",
    "Sudeste":      "#D946EF",
    "Sul":          "#F472B6",
    "Centro-Oeste": "#FB7185",
}

def _spring_layout(adjacencias, seed=42, iterations=250):
    random.seed(seed)
    nodes = list(adjacencias.keys())
    n = len(nodes)
    k = 1.0 / math.sqrt(max(n, 1))
    pos = {node: [random.uniform(-1, 1), random.uniform(-1, 1)] for node in nodes}
    t = 0.15

    for _ in range(iterations):
        disp = {node: [0.0, 0.0] for node in nodes}

        for i in range(len(nodes)):
            for j in range(i + 1, len(nodes)):
                u, v = nodes[i], nodes[j]
                dx = pos[u][0] - pos[v][0]
                dy = pos[u][1] - pos[v][1]
                dist = max(math.sqrt(dx * dx + dy * dy), 0.001)
                rep = k * k / dist
                disp[u][0] += (dx / dist) * rep
                disp[u][1] += (dy / dist) * rep
                disp[v][0] -= (dx / dist) * rep
                disp[v][1] -= (dy / dist) * rep

        for u in nodes:
            seen = set()
            for aresta in adjacencias[u]:
                v = aresta.destino
                if v not in pos or v in seen:
                    continue
                seen.add(v)
                dx = pos[u][0] - pos[v][0]
                dy = pos[u][1] - pos[v][1]
                dist = max(math.sqrt(dx * dx + dy * dy), 0.001)
                attr = dist * dist / k
                disp[u][0] -= (dx / dist) * attr
                disp[u][1] -= (dy / dist) * attr

        for node in nodes:
            dx, dy = disp[node]
            dist = max(math.sqrt(dx * dx + dy * dy), 0.001)
            pos[node][0] += (dx / dist) * min(dist, t)
            pos[node][1] += (dy / dist) * min(dist, t)

        t *= 0.95

    return pos


def _style_ax_light(ax):
    ax.set_facecolor("#F8FAFC")
    ax.tick_params(colors="#374151")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#CBD5E1")
    ax.spines["bottom"].set_color("#CBD5E1")


def _style_ax_dark(ax):
    ax.set_facecolor("#1E293B")
    ax.tick_params(colors="#CBD5E1")
    for spine in ax.spines.values():
        spine.set_color("#334155")
    ax.grid(True, alpha=0.15, color="#334155")

# Visualização analítica:

def plot_distribuicao_graus(df_graus, output_path="out/visualizacoes/analitica/viz_analitica_distribuicao_graus.png"):
    fig, ax = plt.subplots(figsize=(9, 5))
    fig.patch.set_facecolor("#F8FAFC")
    _style_ax_light(ax)

    graus = df_graus["grau"]
    bins = list(range(min(graus), max(graus) + 2))
    n_vals, _, patches = ax.hist(graus, bins=bins, align="left", color="#A855F7",
                                  edgecolor="white", linewidth=1.5)

    for patch, val in zip(patches, n_vals):
        if val > 0:
            ax.text(patch.get_x() + patch.get_width() / 2, val + 0.05, int(val),
                    ha="center", va="bottom", fontsize=9, color="#1E3A5F", fontweight="bold")

    media = graus.mean()
    ax.axvline(media, color="#FB7185", linestyle="--", linewidth=1.8, label=f"Média: {media:.1f}")
    ax.legend(fontsize=10, framealpha=0.6)

    ax.set_xlabel("Grau (número de conexões)", fontsize=12, color="#374151")
    ax.set_ylabel("Número de aeroportos", fontsize=12, color="#374151")
    ax.set_title("Distribuição de Graus da Rede Aeroportuária", fontsize=14,
                 fontweight="bold", color="#111827", pad=14)
    ax.yaxis.set_major_locator(plt.MaxNLocator(integer=True))

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Salvo: {output_path}")


def plot_ranking_aeroportos(df_graus, df_nos, output_path="out/visualizacoes/analitica/viz_analitica_ranking_aeroportos.png"):
    df = df_graus.merge(df_nos[["iata", "regiao"]], left_on="aeroporto", right_on="iata", how="left")
    df_sorted = df.sort_values("grau", ascending=True)

    fig, ax = plt.subplots(figsize=(10, 8))
    fig.patch.set_facecolor("#F8FAFC")
    _style_ax_light(ax)

    bar_colors = [REGION_COLORS.get(r, "#94A3B8") for r in df_sorted["regiao"]]
    bars = ax.barh(df_sorted["aeroporto"], df_sorted["grau"], color=bar_colors,
                   edgecolor="white", linewidth=0.8, height=0.65)

    for bar, val in zip(bars, df_sorted["grau"]):
        ax.text(bar.get_width() + 0.2, bar.get_y() + bar.get_height() / 2,
                str(val), va="center", ha="left", fontsize=10, color="#374151", fontweight="bold")

    patches = [mpatches.Patch(color=c, label=r) for r, c in REGION_COLORS.items()]
    ax.legend(handles=patches, title="Região", fontsize=9, title_fontsize=9, loc="lower right")

    ax.set_xlabel("Grau (número de conexões)", fontsize=12, color="#374151")
    ax.set_title("Ranking de Aeroportos por Conectividade", fontsize=14,
                 fontweight="bold", color="#111827", pad=14)
    ax.set_xlim(0, df_sorted["grau"].max() + 3)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Salvo: {output_path}")


def plot_comparacao_regional(regioes_data, output_path="out/visualizacoes/analitica/viz_analitica_comparacao_regional.png"):
    df = pd.DataFrame(regioes_data)
    regioes = df["regiao"].tolist()
    colors = [REGION_COLORS.get(r, "#94A3B8") for r in regioes]

    fig, axes = plt.subplots(1, 3, figsize=(14, 6))
    fig.patch.set_facecolor("#F8FAFC")
    fig.suptitle("Comparação Regional da Rede Aeroportuária", fontsize=15,
                 fontweight="bold", color="#111827", y=1.01)

    metrics = [
        ("ordem",    "Aeroportos (|V|)",  "Nós"),
        ("tamanho",  "Conexões (|E|)",     "Arestas"),
        ("densidade","Densidade do Grafo", "Densidade"),
    ]

    for ax, (col, title, ylabel) in zip(axes, metrics):
        _style_ax_light(ax)
        bars = ax.bar(regioes, df[col], color=colors, edgecolor="white", width=0.6)

        for bar, val in zip(bars, df[col]):
            label = f"{val:.2f}" if col == "densidade" else str(int(val))
            ax.text(bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + 0.015 * (df[col].max() or 1),
                    label, ha="center", va="bottom", fontsize=9,
                    fontweight="bold", color="#374151")

        ax.set_title(title, fontsize=11, fontweight="bold", color="#374151", pad=10)
        ax.set_ylabel(ylabel, fontsize=10, color="#374151")
        ax.tick_params(axis="x", rotation=28, labelsize=9)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Salvo: {output_path}")


def plot_subgrafo_maior_grau(grafo, df_graus, output_path="out/visualizacoes/analitica/viz_analitica_subgrafo_maior_grau.png", top_n=8):
    top_set = set(df_graus.nlargest(top_n, "grau")["aeroporto"].tolist())
    grau_dict = dict(zip(df_graus["aeroporto"], df_graus["grau"]))

    sub_adj = {ap: [] for ap in top_set}
    for ap in top_set:
        for aresta in grafo.obter_vizinhos(ap):
            if aresta.destino in top_set:
                sub_adj[ap].append(aresta)

    pos = _spring_layout(sub_adj, seed=7, iterations=300)

    fig, ax = plt.subplots(figsize=(10, 8))
    fig.patch.set_facecolor("#0F172A")
    ax.set_facecolor("#0F172A")

    seen = set()
    for u in top_set:
        for aresta in sub_adj[u]:
            v = aresta.destino
            edge = tuple(sorted([u, v]))
            if edge in seen:
                continue
            seen.add(edge)
            ax.plot([pos[u][0], pos[v][0]], [pos[u][1], pos[v][1]],
                    color="#475569", linewidth=1.5, alpha=0.55, zorder=1)

    for ap in top_set:
        grau = grau_dict.get(ap, 1)
        regiao = grafo.nos.get(ap, {}).get("regiao", "")
        color = REGION_COLORS.get(regiao, "#94A3B8")
        x, y = pos[ap]
        ax.scatter(x, y, s=150 + grau * 22, color=color, zorder=3,
                   edgecolors="white", linewidths=1.8, alpha=0.95)
        ax.text(x, y + 0.07, ap, ha="center", va="bottom", fontsize=10,
                color="white", fontweight="bold", zorder=4)
        ax.text(x, y - 0.08, f"grau {grau}", ha="center", va="top", fontsize=7.5,
                color="#94A3B8", zorder=4)

    patches = [mpatches.Patch(color=c, label=r) for r, c in REGION_COLORS.items()]
    leg = ax.legend(handles=patches, loc="lower right", framealpha=0.3,
                    facecolor="#1E293B", edgecolor="#475569", fontsize=9)
    for text in leg.get_texts():
        text.set_color("white")

    ax.set_title(f"Subgrafo dos {top_n} Aeroportos de Maior Grau",
                 fontsize=13, fontweight="bold", color="white", pad=14)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Salvo: {output_path}")


# Visualização exploratória:

def plot_exploratorio_grau_vs_densidade(df_ego, df_nos, output_path="out/visualizacoes/exploratoria/viz_exploratorio_grau_vs_densidade.png"):
    df = df_ego.merge(df_nos[["iata", "regiao"]], left_on="aeroporto", right_on="iata", how="left")

    fig, ax = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor("#F8FAFC")
    _style_ax_light(ax)
    ax.grid(True, alpha=0.35, color="#E2E8F0")

    for regiao, group in df.groupby("regiao"):
        color = REGION_COLORS.get(regiao, "#94A3B8")
        ax.scatter(group["grau"], group["densidade_ego"],
                   color=color, s=group["grau"] * 14, label=regiao,
                   alpha=0.85, edgecolors="white", linewidths=1.2, zorder=3)
        for _, row in group.iterrows():
            ax.annotate(row["aeroporto"], (row["grau"], row["densidade_ego"]),
                        textcoords="offset points", xytext=(7, 3),
                        fontsize=8.5, color="#374151")

    ax.set_xlabel("Grau do aeroporto", fontsize=12, color="#374151")
    ax.set_ylabel("Densidade do ego network", fontsize=12, color="#374151")
    ax.set_title("Exploratório — Grau × Densidade do Ego Network",
                 fontsize=13, fontweight="bold", color="#111827", pad=14)
    ax.legend(title="Região", fontsize=9, title_fontsize=10, framealpha=0.7)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Salvo: {output_path}")


def plot_exploratorio_ego_metricas(df_ego, df_nos, output_path="out/visualizacoes/exploratoria/viz_exploratorio_ego_metricas.png"):
    df = df_ego.merge(df_nos[["iata", "regiao"]], left_on="aeroporto", right_on="iata", how="left")
    colors = [REGION_COLORS.get(r, "#94A3B8") for r in df["regiao"]]

    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    fig.patch.set_facecolor("#F8FAFC")
    fig.suptitle("Exploratório — Estrutura dos Ego Networks por Aeroporto",
                 fontsize=13, fontweight="bold", color="#111827", y=1.01)

    for ax in axes:
        _style_ax_light(ax)
        ax.grid(True, alpha=0.35, color="#E2E8F0")

    for ax, y_col, y_label, title in [
        (axes[0], "tamanho_ego",  "Arestas no ego network", "Grau × Arestas do Ego Network"),
        (axes[1], "ordem_ego",    "Nós no ego network",     "Grau × Nós do Ego Network"),
    ]:
        ax.scatter(df["grau"], df[y_col], c=colors, s=80,
                   edgecolors="white", linewidths=1, alpha=0.9, zorder=3)
        for _, row in df.iterrows():
            ax.annotate(row["aeroporto"], (row["grau"], row[y_col]),
                        textcoords="offset points", xytext=(5, 3),
                        fontsize=7.5, color="#4B5563")
        ax.set_xlabel("Grau", fontsize=11, color="#374151")
        ax.set_ylabel(y_label, fontsize=11, color="#374151")
        ax.set_title(title, fontsize=11, color="#374151", fontweight="bold")

    patches = [mpatches.Patch(color=c, label=r) for r, c in REGION_COLORS.items()]
    fig.legend(handles=patches, loc="lower center", ncol=5, fontsize=9,
               framealpha=0.6, bbox_to_anchor=(0.5, -0.05), title="Região", title_fontsize=9)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Salvo: {output_path}")


# Visualização explanatória:

def plot_explanatorio_rede_completa(grafo, df_nos, df_graus,
                                    output_path="out/visualizacoes/explanatoria/viz_explanatorio_rede_completa.png"):
    pos = _spring_layout(grafo.adjacencias, seed=11, iterations=350)
    grau_dict = dict(zip(df_graus["aeroporto"], df_graus["grau"]))

    fig, ax = plt.subplots(figsize=(13, 10))
    fig.patch.set_facecolor("#0F172A")
    ax.set_facecolor("#0F172A")

    seen = set()
    for u in grafo.adjacencias:
        for aresta in grafo.obter_vizinhos(u):
            v = aresta.destino
            edge = tuple(sorted([u, v]))
            if edge in seen:
                continue
            seen.add(edge)
            reg_u = grafo.nos.get(u, {}).get("regiao", "")
            reg_v = grafo.nos.get(v, {}).get("regiao", "")
            intra = reg_u == reg_v
            ax.plot([pos[u][0], pos[v][0]], [pos[u][1], pos[v][1]],
                    color="#6D28D9" if intra else "#F472B6",
                    linewidth=1.0 if intra else 0.7,
                    alpha=0.5 if intra else 0.3, zorder=1)

    for _, row in df_nos.iterrows():
        node = row["iata"]
        if node not in pos:
            continue
        grau = grau_dict.get(node, 1)
        color = REGION_COLORS.get(row["regiao"], "#94A3B8")
        x, y = pos[node]
        ax.scatter(x, y, s=120 + grau * 24, color=color, zorder=3,
                   edgecolors="white", linewidths=1.5, alpha=0.95)
        ax.text(x, y + 0.05, node, ha="center", va="bottom", fontsize=8.5,
                color="white", fontweight="bold", zorder=4)

    region_patches = [mpatches.Patch(color=c, label=r) for r, c in REGION_COLORS.items()]
    intra_line = plt.Line2D([0], [0], color="#6D28D9", lw=2, label="Conexão intrarregional")
    inter_line = plt.Line2D([0], [0], color="#F472B6", lw=2, label="Conexão inter-regional")

    leg1 = ax.legend(handles=region_patches, title="Região", loc="lower left",
                     framealpha=0.3, facecolor="#1E293B", edgecolor="#475569", fontsize=9)
    for t in leg1.get_texts(): t.set_color("white")
    leg1.get_title().set_color("white")
    ax.add_artist(leg1)

    leg2 = ax.legend(handles=[intra_line, inter_line], loc="lower right",
                     framealpha=0.3, facecolor="#1E293B", edgecolor="#475569", fontsize=9)
    for t in leg2.get_texts(): t.set_color("white")

    ax.set_title("Rede de Aeroportos Brasileiros\n(tamanho proporcional ao grau · amarelo = conexão inter-regional)",
                 fontsize=13, fontweight="bold", color="white", pad=15)
    ax.set_xticks([])
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Salvo: {output_path}")


def plot_explanatorio_dashboard(df_graus, df_ego, regioes_data, df_nos,
                                 output_path="out/visualizacoes/explanatoria/viz_explanatorio_dashboard.png"):
    df_reg = pd.DataFrame(regioes_data)
    df_ego_m = df_ego.merge(df_nos[["iata", "regiao"]], left_on="aeroporto", right_on="iata", how="left")
    df_ranked = df_graus.merge(df_nos[["iata", "regiao"]], left_on="aeroporto", right_on="iata", how="left")
    df_ranked = df_ranked.sort_values("grau", ascending=True)

    DARK = "#0F172A"
    PANEL = "#1E293B"
    BORDER = "#334155"
    TEXT = "#E2E8F0"
    SUBTEXT = "#94A3B8"

    fig = plt.figure(figsize=(16, 10), facecolor=DARK)
    gs = GridSpec(2, 3, figure=fig, hspace=0.5, wspace=0.38,
                  top=0.88, bottom=0.08, left=0.06, right=0.97)

    ax1 = fig.add_subplot(gs[0, 0])
    ax2 = fig.add_subplot(gs[0, 1])
    ax3 = fig.add_subplot(gs[0, 2])
    ax4 = fig.add_subplot(gs[1, :])

    for ax in [ax1, ax2, ax3, ax4]:
        ax.set_facecolor(PANEL)
        ax.tick_params(colors=TEXT, labelsize=8)
        for spine in ax.spines.values():
            spine.set_color(BORDER)

    # ax1
    regioes_labels = df_reg["regiao"].tolist()
    c_reg = [REGION_COLORS.get(r, "#94A3B8") for r in regioes_labels]
    bars1 = ax1.bar(regioes_labels, df_reg["densidade"], color=c_reg, width=0.6, edgecolor=DARK)
    for bar, val in zip(bars1, df_reg["densidade"]):
        ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.02,
                 f"{val:.2f}", ha="center", fontsize=8, color=TEXT, fontweight="bold")
    ax1.set_title("Densidade por Região", fontsize=10, color=TEXT, fontweight="bold", pad=8)
    ax1.set_ylabel("Densidade", fontsize=8, color=SUBTEXT)
    ax1.set_ylim(0, 1.25)
    ax1.tick_params(axis="x", rotation=30)
    ax1.grid(axis="y", alpha=0.15, color=BORDER)

    # ax2
    bars2 = ax2.bar(regioes_labels, df_reg["tamanho"], color=c_reg, width=0.6, edgecolor=DARK)
    for bar, val in zip(bars2, df_reg["tamanho"]):
        ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3,
                 str(int(val)), ha="center", fontsize=8, color=TEXT, fontweight="bold")
    ax2.set_title("Conexões por Região (|E|)", fontsize=10, color=TEXT, fontweight="bold", pad=8)
    ax2.set_ylabel("Nº de Arestas", fontsize=8, color=SUBTEXT)
    ax2.tick_params(axis="x", rotation=30)
    ax2.grid(axis="y", alpha=0.15, color=BORDER)

    # ax3
    graus = df_graus["grau"]
    ax3.hist(graus, bins=range(min(graus), max(graus) + 2), align="left",
             color="#A855F7", edgecolor=DARK, linewidth=0.8)
    ax3.axvline(graus.mean(), color="#FB7185", linestyle="--", linewidth=1.8,
                label=f"Média: {graus.mean():.1f}")
    ax3.set_title("Distribuição de Graus", fontsize=10, color=TEXT, fontweight="bold", pad=8)
    ax3.set_xlabel("Grau", fontsize=8, color=SUBTEXT)
    ax3.set_ylabel("Frequência", fontsize=8, color=SUBTEXT)
    ax3.legend(fontsize=8, facecolor=PANEL, edgecolor=BORDER, labelcolor=TEXT)
    ax3.grid(axis="y", alpha=0.15, color=BORDER)

    # ax4
    bar_colors4 = [REGION_COLORS.get(r, "#94A3B8") for r in df_ranked["regiao"]]
    bars4 = ax4.barh(df_ranked["aeroporto"], df_ranked["grau"],
                     color=bar_colors4, edgecolor=DARK, height=0.65)
    for bar, val in zip(bars4, df_ranked["grau"]):
        ax4.text(bar.get_width() + 0.2, bar.get_y() + bar.get_height() / 2,
                 str(int(val)), va="center", fontsize=8.5, color=TEXT, fontweight="bold")
    ax4.set_title("Ranking de Conectividade por Aeroporto", fontsize=10, color=TEXT,
                  fontweight="bold", pad=8)
    ax4.set_xlabel("Grau", fontsize=8, color=SUBTEXT)
    ax4.set_xlim(0, df_ranked["grau"].max() + 3)
    ax4.grid(axis="x", alpha=0.15, color=BORDER)

    patches = [mpatches.Patch(color=c, label=r) for r, c in REGION_COLORS.items()]
    leg = fig.legend(handles=patches, loc="upper right", bbox_to_anchor=(0.98, 0.96),
                     facecolor=PANEL, edgecolor=BORDER, fontsize=9,
                     title="Região", title_fontsize=9, ncol=1)
    for t in leg.get_texts(): t.set_color(TEXT)
    leg.get_title().set_color(TEXT)

    fig.suptitle("Dashboard: Análise da Rede Aeroportuária Brasileira",
                 fontsize=16, fontweight="bold", color=TEXT, y=0.95)

    plt.savefig(output_path, dpi=150, bbox_inches="tight", facecolor=DARK)
    plt.close()
    print(f"Salvo: {output_path}")



_ARVORE_COLORS = ["#A855F7","#F472B6","#34D399","#60A5FA","#FBBF24","#F87171","#67E8F9"]

_ARVORE_HTML_TEMPLATE = """\
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Árvore de Percurso — Rede Aeroportuária Brasileira</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Segoe UI',system-ui,sans-serif;background:#0F172A;color:#E2E8F0;height:100vh;overflow:hidden;}
    #app{display:flex;height:100vh;}
    #sidebar{width:292px;flex-shrink:0;background:#1E293B;border-right:1px solid #334155;display:flex;flex-direction:column;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#334155 transparent;}
    #sidebar::-webkit-scrollbar{width:4px;}
    #sidebar::-webkit-scrollbar-thumb{background:#334155;border-radius:2px;}
    .sb-hdr{padding:16px 15px 12px;border-bottom:1px solid #334155;}
    .sb-hdr h1{font-size:15px;font-weight:700;color:#F1F5F9;letter-spacing:-.02em;margin-bottom:2px;}
    .sb-hdr p{font-size:11px;color:#64748B;}
    .sb-lbl{padding:10px 14px 5px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#475569;}
    .sb-routes{padding:0 8px;display:flex;flex-direction:column;gap:5px;}
    .route-card{padding:10px 12px;border:1.5px solid #2D3F55;border-radius:9px;cursor:pointer;background:#0F172A;transition:border-color .15s,background .15s;user-select:none;}
    .route-card:hover{border-color:var(--c);}
    .route-card.active{border-color:var(--c);background:var(--cb);}
    .rc-head{display:flex;align-items:center;gap:7px;margin-bottom:4px;}
    .rc-dot{width:9px;height:9px;border-radius:50%;background:var(--c);flex-shrink:0;}
    .rc-name{font-size:12px;font-weight:700;color:#E2E8F0;line-height:1.3;}
    .rc-path{font-size:10.5px;color:#64748B;font-family:ui-monospace,monospace;padding-left:16px;margin-bottom:4px;}
    .rc-foot{display:flex;justify-content:space-between;align-items:center;padding-left:16px;}
    .rc-cost{font-size:11px;font-weight:700;color:var(--c);}
    .rc-stops{font-size:10px;color:#475569;}
    .sb-act{padding:8px 8px 2px;}
    .btn-all{width:100%;padding:9px 12px;background:#334155;border:1.5px solid #475569;border-radius:9px;color:#CBD5E1;font-size:12px;font-weight:600;cursor:pointer;text-align:left;display:flex;align-items:center;gap:7px;transition:background .15s;}
    .btn-all:hover{background:#475569;}
    .btn-all.active{background:#1D4ED8;border-color:#3B82F6;color:#E0F2FE;}
    .sb-leg{margin:8px 8px 0;padding:10px 11px;background:#0F172A;border:1px solid #2D3F55;border-radius:8px;}
    .sb-leg h3{font-size:9.5px;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin-bottom:7px;font-weight:700;}
    .leg-row{display:flex;align-items:center;gap:7px;font-size:10.5px;color:#94A3B8;margin-bottom:5px;}
    .leg-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
    .leg-line{width:20px;height:2.5px;border-radius:2px;flex-shrink:0;}
    .sb-foot{padding:8px 14px;border-top:1px solid #2D3748;margin-top:auto;font-size:9.5px;color:#3D4F63;line-height:1.6;}
    #map{flex:1;position:relative;}
    #info-panel{position:absolute;bottom:20px;right:20px;z-index:500;background:rgba(30,41,59,.96);backdrop-filter:blur(8px);border:1px solid #334155;border-radius:11px;padding:13px 15px;min-width:200px;max-width:280px;display:none;box-shadow:0 4px 24px rgba(0,0,0,.7);}
    #info-panel.show{display:block;}
    #info-title{font-size:13px;font-weight:700;margin-bottom:9px;line-height:1.3;}
    .info-row{display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:4px;color:#64748B;}
    .info-val{color:#CBD5E1;font-weight:600;font-family:ui-monospace,monospace;text-align:right;max-width:170px;}
    .flow{stroke-dasharray:12 7;animation:flow 1.4s linear infinite;}
    @keyframes flow{to{stroke-dashoffset:-19;}}
    .leaflet-popup-content-wrapper{background:#1E293B!important;border:1px solid #334155!important;border-radius:9px!important;color:#E2E8F0!important;box-shadow:0 4px 20px rgba(0,0,0,.6)!important;font-family:'Segoe UI',sans-serif!important;font-size:12px!important;}
    .leaflet-popup-tip{background:#1E293B!important;}
    .leaflet-popup-close-button{color:#94A3B8!important;font-size:16px!important;}
    .leaflet-tooltip{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important;}
    .leaflet-tooltip::before{display:none!important;}
    .leaflet-control-zoom a{background:#1E293B!important;color:#CBD5E1!important;border-color:#334155!important;}
    .leaflet-control-zoom a:hover{background:#2D3748!important;}
    .leaflet-bar{border:1px solid #334155!important;border-radius:7px!important;overflow:hidden;}
    .ap-lbl{font-size:10px;font-weight:700;color:#94A3B8;background:rgba(15,23,42,.85);border:1px solid #2D3F55;border-radius:3px;padding:1px 4px;white-space:nowrap;pointer-events:none;}
    .ap-lbl-hi{color:#F1F5F9;}
  </style>
</head>
<body>
<div id="app">
  <div id="sidebar">
    <div class="sb-hdr">
      <h1>Árvore de Percurso</h1>
      <p>Caminhos mínimos · Algoritmo de Dijkstra</p>
    </div>
    <div class="sb-act">
      <button class="btn-all" id="btn-all">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="flex-shrink:0;"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M1 6.5h11M6.5 1a8 8 0 0 1 0 11M6.5 1a8 8 0 0 0 0 11" stroke="currentColor" stroke-width="1.2"/></svg>
        Mostrar Todas as Rotas
      </button>
    </div>
    <div class="sb-lbl">Rotas Calculadas</div>
    <div class="sb-routes" id="sb-routes"></div>
    <div style="height:8px;"></div>
    <div class="sb-leg">
      <h3>Legenda</h3>
      <div class="leg-row"><div class="leg-dot" style="background:#2D3F55;border:1px solid #3D4F63;"></div>Aeroporto (fora da rota)</div>
      <div class="leg-row"><div class="leg-dot" style="background:white;box-shadow:0 0 5px rgba(255,255,255,.5);"></div>Origem / Destino</div>
      <div class="leg-row"><div class="leg-dot" style="background:#CBD5E1;border:2px solid white;"></div>Escala / Conexão</div>
      <div class="leg-row"><div class="leg-line" style="background:linear-gradient(90deg,#A855F7,#67E8F9);"></div>Caminho mínimo (animado)</div>
    </div>
    <div style="height:8px;"></div>
    <div class="sb-foot">Algoritmo: Dijkstra<br>Grafo: não-direcionado ponderado<br>20 aeroportos · 116 arestas</div>
  </div>
  <div id="map">
    <div id="info-panel">
      <div id="info-title"></div>
      <div class="info-row"><span>Caminho</span><span class="info-val" id="ip-path"></span></div>
      <div class="info-row"><span>Custo</span><span class="info-val" id="ip-cost"></span></div>
      <div class="info-row"><span>Escalas</span><span class="info-val" id="ip-stops"></span></div>
      <div class="info-row" id="ip-via-row" style="display:none;"><span>Via</span><span class="info-val" id="ip-via"></span></div>
    </div>
  </div>
</div>
<script>
const AP={REC:{name:"Recife",reg:"Nordeste",lat:-8.126,lng:-34.924},SSA:{name:"Salvador",reg:"Nordeste",lat:-12.908,lng:-38.323},FOR:{name:"Fortaleza",reg:"Nordeste",lat:-3.776,lng:-38.533},NAT:{name:"Natal",reg:"Nordeste",lat:-5.911,lng:-35.248},JPA:{name:"João Pessoa",reg:"Nordeste",lat:-7.148,lng:-34.951},GRU:{name:"São Paulo (GRU)",reg:"Sudeste",lat:-23.436,lng:-46.473},CGH:{name:"São Paulo (CGH)",reg:"Sudeste",lat:-23.627,lng:-46.656},GIG:{name:"Rio de Janeiro",reg:"Sudeste",lat:-22.810,lng:-43.251},CNF:{name:"Belo Horizonte",reg:"Sudeste",lat:-19.624,lng:-43.972},VIX:{name:"Vitória",reg:"Sudeste",lat:-20.258,lng:-40.287},BSB:{name:"Brasília",reg:"Centro-Oeste",lat:-15.871,lng:-47.919},GYN:{name:"Goiânia",reg:"Centro-Oeste",lat:-16.632,lng:-49.221},CWB:{name:"Curitiba",reg:"Sul",lat:-25.529,lng:-49.176},FLN:{name:"Florianópolis",reg:"Sul",lat:-27.670,lng:-48.552},POA:{name:"Porto Alegre",reg:"Sul",lat:-29.994,lng:-51.172},MAO:{name:"Manaus",reg:"Norte",lat:-3.039,lng:-60.050},BEL:{name:"Belém",reg:"Norte",lat:-1.379,lng:-48.476},PVH:{name:"Porto Velho",reg:"Norte",lat:-8.709,lng:-63.903},RBR:{name:"Rio Branco",reg:"Norte",lat:-9.869,lng:-67.898},THE:{name:"Teresina",reg:"Nordeste",lat:-5.060,lng:-42.823}};
const REG_COLOR={"Norte":"#34D399","Nordeste":"#FBBF24","Centro-Oeste":"#A78BFA","Sudeste":"#60A5FA","Sul":"#F472B6"};
const ROUTES=__ROUTES__;
const map=L.map('map',{center:[-14,-52],zoom:4,zoomControl:true,minZoom:3,maxZoom:10});
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors © <a href="https://carto.com">CARTO</a>',subdomains:'abcd',maxZoom:19}).addTo(map);
function arc(la1,ln1,la2,ln2,n=60){const mla=(la1+la2)/2,mln=(ln1+ln2)/2,dla=la2-la1,dln=ln2-ln1,dist=Math.hypot(dla,dln)||1e-9,k=dist*.22,cla=mla+(-dln/dist)*k,cln=mln+(dla/dist)*k;return Array.from({length:n+1},(_,i)=>{const t=i/n,u=1-t;return[u*u*la1+2*u*t*cla+t*t*la2,u*u*ln1+2*u*t*cln+t*t*ln2];});}
function hexRgba(h,a){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return `rgba(${r},${g},${b},${a})`;}
function mkIcon(c,sz){return L.divIcon({className:'',html:`<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${c};border:2px solid rgba(255,255,255,.85);box-shadow:0 0 ${sz+2}px ${hexRgba(c,.5)};"></div>`,iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]});}
function mkDimIcon(sz){return L.divIcon({className:'',html:`<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:#2D3F55;border:2px solid #3D4F63;"></div>`,iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]});}
function popupHtml(iata,route){const a=AP[iata]||{name:iata,reg:''},rc=REG_COLOR[a.reg]||'#94A3B8';return `<div style="font-family:sans-serif;min-width:145px;"><b style="font-size:14px;color:#F1F5F9;">${iata}</b><br><span style="color:#94A3B8;font-size:11px;">${a.name}</span><br><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${rc};margin:4px 4px 0 0;vertical-align:middle;"></span><span style="color:#CBD5E1;font-size:11px;">${a.reg}</span>${route?`<div style="margin-top:5px;font-size:11px;font-weight:700;color:${route.color};">${route.label}</div>`:''}</div>`;}
let groups={};
const bgGroup=L.layerGroup().addTo(map);
function clearGroups(){Object.values(groups).forEach(g=>map.removeLayer(g));groups={};}
function renderBg(skip){bgGroup.clearLayers();Object.entries(AP).forEach(([iata,a])=>{if(skip.has(iata))return;const icon=L.divIcon({className:'',html:'<div style="width:6px;height:6px;border-radius:50%;background:#2D3F55;border:1px solid #3D4F63;"></div>',iconSize:[6,6],iconAnchor:[3,3]});const m=L.marker([a.lat,a.lng],{icon}).bindPopup(popupHtml(iata,null));m.bindTooltip(L.tooltip({permanent:true,direction:'top',offset:[0,-8],className:''}).setContent(`<span class="ap-lbl" style="opacity:.4;">${iata}</span>`));bgGroup.addLayer(m);});}
function renderRoute(route,animated){const g=L.layerGroup();for(let i=0;i<route.path.length-1;i++){const a=AP[route.path[i]],b=AP[route.path[i+1]];const pts=arc(a.lat,a.lng,b.lat,b.lng);L.polyline(pts,{color:route.color,weight:10,opacity:.1,smoothFactor:1}).addTo(g);L.polyline(pts,{color:route.color,weight:animated?2.5:1.5,opacity:animated?.85:.2,smoothFactor:1,className:animated?'flow':''}).addTo(g);}route.path.forEach((iata,idx)=>{const isEnd=idx===0||idx===route.path.length-1,sz=isEnd?14:10;const icon=animated?mkIcon(route.color,sz):mkDimIcon(sz);const m=L.marker([AP[iata].lat,AP[iata].lng],{icon}).bindPopup(popupHtml(iata,route));if(animated){const lc=isEnd?route.color:'#CBD5E1';m.bindTooltip(L.tooltip({permanent:true,direction:'top',offset:[0,-(sz/2+7)],className:''}).setContent(`<span class="ap-lbl ap-lbl-hi" style="color:${lc};border-color:${route.color}55;">${iata}</span>`));}g.addLayer(m);});return g;}
let activeId=null,allActive=false;
function selectRoute(id){clearGroups();const panel=document.getElementById('info-panel');if(activeId===id){activeId=null;allActive=false;setCardActive(null);panel.classList.remove('show');renderBg(new Set());return;}activeId=id;allActive=false;setCardActive(id);document.getElementById('btn-all').classList.remove('active');const route=ROUTES.find(r=>r.id===id);const activeAPs=new Set(route.path);ROUTES.filter(r=>r.id!==id).forEach(r=>{const g=renderRoute(r,false);g.addTo(map);groups[r.id+'_dim']=g;});const g=renderRoute(route,true);g.addTo(map);groups[id]=g;renderBg(activeAPs);const bounds=route.path.map(iata=>[AP[iata].lat,AP[iata].lng]);map.flyToBounds(bounds,{padding:[80,80],maxZoom:7,duration:.8});const stops=route.path.length-2;document.getElementById('info-title').textContent=route.label;document.getElementById('info-title').style.color=route.color;document.getElementById('ip-path').textContent=route.path.join(' → ');document.getElementById('ip-cost').textContent=route.cost.toFixed(2);document.getElementById('ip-stops').textContent=stops===0?'Voo direto':`${stops} escala${stops>1?'s':''}`;const vr=document.getElementById('ip-via-row');if(stops>0){document.getElementById('ip-via').textContent=route.path.slice(1,-1).join(', ');vr.style.display='flex';}else{vr.style.display='none';}panel.classList.add('show');}
function toggleAll(){if(allActive){clearGroups();allActive=false;activeId=null;setCardActive(null);document.getElementById('btn-all').classList.remove('active');document.getElementById('info-panel').classList.remove('show');renderBg(new Set());return;}clearGroups();allActive=true;activeId=null;setCardActive(null);document.getElementById('btn-all').classList.add('active');document.getElementById('info-panel').classList.remove('show');const allAPs=new Set(ROUTES.flatMap(r=>r.path));ROUTES.forEach(r=>{const g=renderRoute(r,true);g.addTo(map);groups[r.id]=g;});renderBg(allAPs);map.flyToBounds([[-34,-74],[6,-28]],{padding:[20,20],duration:.8});}
function setCardActive(id){document.querySelectorAll('.route-card').forEach(el=>el.classList.toggle('active',el.dataset.id===id));}
const sbRoutes=document.getElementById('sb-routes');
ROUTES.forEach(route=>{const stops=route.path.length-2;const sl=stops===0?'Voo direto':`${stops} escala${stops>1?'s':''}`;const el=document.createElement('div');el.className='route-card';el.dataset.id=route.id;el.style.setProperty('--c',route.color);const r=parseInt(route.color.slice(1,3),16),gr=parseInt(route.color.slice(3,5),16),b=parseInt(route.color.slice(5,7),16);el.style.setProperty('--cb',`rgba(${r},${gr},${b},.08)`);el.innerHTML=`<div class="rc-head"><div class="rc-dot"></div><div class="rc-name">${route.label}</div></div><div class="rc-path">${route.path.join(' → ')}</div><div class="rc-foot"><span class="rc-cost">Custo: ${route.cost.toFixed(2)}</span><span class="rc-stops">${sl}</span></div>`;el.addEventListener('click',()=>selectRoute(route.id));sbRoutes.appendChild(el);});
document.getElementById('btn-all').addEventListener('click',toggleAll);
renderBg(new Set());
</script>
</body>
</html>"""


def plot_arvore_percurso(grafo, caminho_rec_poa, caminho_mao_gru,
                         out_png="out/interativo/arvore_percurso.png",
                         out_html="out/interativo/arvore_percurso.html",
                         rotas_df=None):
    COR_PATH1  = "#A855F7"
    COR_PATH2  = "#F472B6"
    COR_SHARED = "#FBBF24"

    set1 = set(caminho_rec_poa)
    set2 = set(caminho_mao_gru)
    shared = set1 & set2

    def edge_peso(u, v):
        for a in grafo.obter_vizinhos(u):
            if a.destino == v:
                return a.peso
        return 1.0

    path_edges1 = [(caminho_rec_poa[i], caminho_rec_poa[i + 1],
                    edge_peso(caminho_rec_poa[i], caminho_rec_poa[i + 1]))
                   for i in range(len(caminho_rec_poa) - 1)]
    path_edges2 = [(caminho_mao_gru[i], caminho_mao_gru[i + 1],
                    edge_peso(caminho_mao_gru[i], caminho_mao_gru[i + 1]))
                   for i in range(len(caminho_mao_gru) - 1)]

    # ── PNG ──────────────────────────────────────────────────────────────────
    n1, n2 = len(caminho_rec_poa), len(caminho_mao_gru)
    x_scale = 4.0
    pos = {}
    for i, node in enumerate(caminho_rec_poa):
        x = i * x_scale / max(n1 - 1, 1)
        pos[node] = (x, 1.5)
    for i, node in enumerate(caminho_mao_gru):
        x = i * x_scale / max(n2 - 1, 1)
        if node in pos:
            pos[node] = (pos[node][0], 0.75)
        else:
            pos[node] = (x, 0.0)

    fig, ax = plt.subplots(figsize=(max(12, max(n1, n2) * 3), 7))
    fig.patch.set_facecolor("#0F172A")
    ax.set_facecolor("#0F172A")
    ax.set_xlim(-0.6, x_scale + 0.6)
    ax.set_ylim(-0.9, 2.4)

    def draw_edges(edges, color):
        for u, v, peso in edges:
            xu, yu = pos[u]
            xv, yv = pos[v]
            ax.annotate("", xy=(xv, yv), xytext=(xu, yu),
                        arrowprops=dict(arrowstyle="-|>", color=color, lw=3.5, mutation_scale=22))
            mx, my = (xu + xv) / 2, (yu + yv) / 2 + 0.14
            ax.text(mx, my, f"peso: {peso:.2f}", color=color, fontsize=9, ha="center",
                    fontweight="bold",
                    bbox=dict(facecolor="#0F172A", edgecolor="none", alpha=0.75, pad=2))

    draw_edges(path_edges1, COR_PATH1)
    draw_edges(path_edges2, COR_PATH2)

    all_nodes = set1 | set2
    custo1 = sum(p for _, _, p in path_edges1)
    custo2 = sum(p for _, _, p in path_edges2)

    for node in all_nodes:
        x, y = pos[node]
        color = COR_SHARED if node in shared else (COR_PATH1 if node in set1 else COR_PATH2)
        ax.scatter(x, y, s=600, color=color, zorder=5, edgecolors="white", linewidths=2.5)
        cidade = grafo.nos.get(node, {}).get("cidade", "")
        regiao = grafo.nos.get(node, {}).get("regiao", "")
        ax.text(x, y + 0.22, node, ha="center", va="bottom",
                color="white", fontsize=13, fontweight="bold", zorder=6)
        ax.text(x, y - 0.22, f"{cidade}\n{regiao}", ha="center", va="top",
                color="#94A3B8", fontsize=8.5, zorder=6, linespacing=1.4)

    handles = [
        plt.Line2D([0], [0], color=COR_PATH1, lw=3,
                   label=f"REC → POA  (custo: {custo1:.2f})"),
        plt.Line2D([0], [0], color=COR_PATH2, lw=3,
                   label=f"MAO → GRU  (custo: {custo2:.2f})"),
    ]
    if shared:
        handles.append(mpatches.Patch(color=COR_SHARED, label="Aeroporto compartilhado"))
    leg = ax.legend(handles=handles, loc="upper center", ncol=len(handles),
                    bbox_to_anchor=(0.5, -0.08),
                    framealpha=0.3, facecolor="#1E293B", edgecolor="#475569", fontsize=10)
    for t in leg.get_texts():
        t.set_color("white")

    ax.set_title("Árvore de Percurso — Caminhos Mínimos Obrigatórios",
                 fontsize=14, fontweight="bold", color="white", pad=16)
    ax.axis("off")
    plt.tight_layout()
    plt.savefig(out_png, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"Salvo: {out_png}")

    # ── HTML (Leaflet) ────────────────────────────────────────────────────────
    if rotas_df is not None:
        route_entries = []
        for i, (_, row) in enumerate(rotas_df.iterrows()):
            raw = str(row["caminho"]).strip()
            if not raw or raw == "nan":
                continue
            path = [p.strip() for p in raw.split("→")]
            origem  = str(row["origem"]).strip()
            destino = str(row["destino"]).strip()
            origem_city  = grafo.nos.get(origem,  {}).get("cidade", origem)
            destino_city = grafo.nos.get(destino, {}).get("cidade", destino)
            try:
                cost = float(row["custo"])
            except (ValueError, TypeError):
                cost = 0.0
            route_entries.append({
                "id":    f"{origem.lower()}-{destino.lower()}",
                "label": f"{origem_city} → {destino_city}",
                "path":  path,
                "cost":  round(cost, 2),
                "color": _ARVORE_COLORS[i % len(_ARVORE_COLORS)],
            })
    else:
        route_entries = [
            {"id": "rec-poa", "label": "Recife → Porto Alegre",
             "path": caminho_rec_poa, "cost": round(custo1, 2), "color": _ARVORE_COLORS[0]},
            {"id": "mao-gru", "label": "Manaus → São Paulo",
             "path": caminho_mao_gru, "cost": round(custo2, 2), "color": _ARVORE_COLORS[1]},
        ]

    routes_js = json.dumps(route_entries, ensure_ascii=False, indent=2)
    html_out  = _ARVORE_HTML_TEMPLATE.replace("__ROUTES__", routes_js)
    with open(out_html, "w", encoding="utf-8") as f:
        f.write(html_out)
    print(f"Salvo: {out_html}")

def gerar_grafo_interativo(grafo, df_graus, df_ego, caminho_rec_poa, caminho_mao_gru,
                            output_path="out/grafo_interativo.html"):
    import plotly.graph_objects as go

<<<<<<< HEAD
=======
    h1 { font-size: 18px; color: #F1F5F9; margin-bottom: 5px; }
    p.sub { font-size: 12px; color: #94A3B8; margin-bottom: 20px; }
    
    .control-group { margin-bottom: 20px; }
    label { font-size: 11px; font-weight: bold; color: #94A3B8; text-transform: uppercase; margin-bottom: 8px; display: block; }
    
    input[type="text"] {
      width: 100%; padding: 10px; background: #0F172A; border: 1px solid #334155;
      color: #F1F5F9; border-radius: 6px; outline: none; margin-bottom: 10px;
    }
    input[type="text"]:focus { border-color: #3B82F6; }
    
    .filter-btn {
      display: block; width: 100%; padding: 8px; margin-bottom: 6px;
      background: #0F172A; border: 1px solid #334155; color: #CBD5E1;
      border-radius: 6px; cursor: pointer; text-align: left; font-size: 13px;
      transition: all 0.2s;
    }
    .filter-btn:hover { background: #334155; }
    .filter-btn.active { background: #3B82F6; border-color: #2563EB; color: #FFF; font-weight: bold; }
    
    .route-btn {
      display: flex; justify-content: space-between; align-items: center; width: 100%; 
      padding: 10px; margin-bottom: 6px; background: #0F172A; border: 1px solid #334155; 
      border-radius: 6px; color: #F1F5F9; cursor: pointer; font-size: 12px; font-weight: bold;
      transition: all 0.2s;
    }
    .route-btn:hover { border-color: #94A3B8; }
    
    #map { flex: 1; height: 100vh; }
    
    /* Estilos Customizados para os Nós (Aeroportos) */
    .airport-node {
      border-radius: 50%;
      border: 1.5px solid rgba(255, 255, 255, 0.85);
      transition: transform 0.2s ease-out, border-color 0.2s;
    }
    .airport-node:hover {
      transform: scale(1.35);
      border-color: #FFF;
      z-index: 9999 !important;
    }

    /* Tooltips e Animações */
    .leaflet-tooltip {
      background: rgba(15, 23, 42, 0.95) !important; border: 1px solid #334155 !important;
      color: #F1F5F9 !important; border-radius: 8px !important; padding: 10px !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
    }
    .leaflet-tooltip::before { display: none !important; }
    .tt-title { font-size: 14px; font-weight: bold; color: #FFF; margin-bottom: 5px; border-bottom: 1px solid #334155; padding-bottom: 3px; }
    .tt-stat { font-size: 11px; color: #94A3B8; margin-bottom: 2px; }
    .tt-stat span { color: #34D399; font-weight: bold; }
    
    .flow { stroke-dasharray: 12 8; animation: flow 1.5s linear infinite; }
    @keyframes flow { to { stroke-dashoffset: -20; } }
  </style>
</head>
<body>

  <div id="sidebar">
    <h1>Rede Aeroportuária</h1>
    <p class="sub">Painel de Exploração Interativa</p>

    <div class="control-group">
      <label>Buscar Aeroporto</label>
      <input type="text" id="searchInput" placeholder="Digite IATA ou Cidade..." onkeyup="applyFilters()">
    </div>

    <div class="control-group">
      <label>Filtrar por Região</label>
      <button class="filter-btn active" data-region="Todas" onclick="toggleRegion(this)">Todas as Regiões</button>
      <button class="filter-btn" data-region="Norte" onclick="toggleRegion(this)">Norte</button>
      <button class="filter-btn" data-region="Nordeste" onclick="toggleRegion(this)">Nordeste</button>
      <button class="filter-btn" data-region="Centro-Oeste" onclick="toggleRegion(this)">Centro-Oeste</button>
      <button class="filter-btn" data-region="Sudeste" onclick="toggleRegion(this)">Sudeste</button>
      <button class="filter-btn" data-region="Sul" onclick="toggleRegion(this)">Sul</button>
    </div>

    <div class="control-group">
      <label>Destacar Rotas (Animadas)</label>
      <div id="routes-container"></div>
    </div>
  </div>

  <div id="map"></div>

  <script>
    const data = __DATA__;
    const REGION_COLORS = { "Norte": "#34D399", "Nordeste": "#FBBF24", "Sudeste": "#60A5FA", "Sul": "#F472B6", "Centro-Oeste": "#A855F7" };
    
    const map = L.map('map', {zoomControl: true}).setView([-15, -50], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap', subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    let nodeLayers = [];
    let edgeLayers = [];
    let currentRegion = 'Todas';
    let activeRoutes = new Set();
    
    const routesGroup = L.layerGroup().addTo(map);

    const routesContainer = document.getElementById('routes-container');
    data.routes.forEach(route => {
      const btn = document.createElement('button');
      btn.className = 'route-btn';
      btn.innerHTML = `<span>${route.label}</span> <span style="color:${route.color}">■</span>`;
      btn.onclick = () => toggleRoute(route, btn);
      routesContainer.appendChild(btn);
    });

    function arc(la1, ln1, la2, ln2, n=50) {
      const mla=(la1+la2)/2, mln=(ln1+ln2)/2, dla=la2-la1, dln=ln2-ln1;
      const dist=Math.hypot(dla,dln)||1e-9, k=dist*0.2;
      const cla=mla+(-dln/dist)*k, cln=mln+(dla/dist)*k;
      return Array.from({length:n+1}, (_,i) => {
        const t=i/n, u=1-t;
        return [u*u*la1 + 2*u*t*cla + t*t*la2, u*u*ln1 + 2*u*t*cln + t*t*ln2];
      });
    }

    // Arestas Base (Fundo)
    data.edges.forEach(edge => {
      const p1 = [data.nodes[edge.source].lat, data.nodes[edge.source].lng];
      const p2 = [data.nodes[edge.target].lat, data.nodes[edge.target].lng];
      const line = L.polyline([p1, p2], { color: '#475569', weight: 1, opacity: 0.3 }).addTo(map);
      edgeLayers.push({ source: edge.source, target: edge.target, layer: line });
    });

    // Nós Customizados (Aeroportos) com Glow
    Object.keys(data.nodes).forEach(iata => {
      const n = data.nodes[iata];
      const color = REGION_COLORS[n.regiao] || '#FFF';
      const size = 10 + (n.grau * 1.5); // Tamanho dinâmico pelo grau
      
      const iconHTML = `<div class="airport-node" style="
        width: 100%; height: 100%; 
        background: ${color}; 
        box-shadow: 0 0 ${size/1.5}px ${color};
      "></div>`;

      const customIcon = L.divIcon({
        className: '', // Limpa a classe padrão do leaflet
        html: iconHTML,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
      });

      const marker = L.marker([n.lat, n.lng], { icon: customIcon }).addTo(map);

      const tooltipHTML = `
        <div class="tt-title">${iata} - ${n.cidade}</div>
        <div class="tt-stat">Região: <span>${n.regiao}</span></div>
        <div class="tt-stat">Grau: <span>${n.grau} conexões</span></div>
        <div class="tt-stat">Densidade Ego: <span>${n.densidade.toFixed(4)}</span></div>
      `;
      marker.bindTooltip(tooltipHTML, { direction: 'top', offset: [0, -(size/2)] });
      nodeLayers.push({ iata: iata, data: n, layer: marker });
    });

    function applyFilters() {
      const term = document.getElementById('searchInput').value.toLowerCase();
      nodeLayers.forEach(node => {
        const matchSearch = node.iata.toLowerCase().includes(term) || node.data.cidade.toLowerCase().includes(term);
        const matchRegion = currentRegion === 'Todas' || node.data.regiao === currentRegion;
        if (matchSearch && matchRegion) { map.addLayer(node.layer); } 
        else { map.removeLayer(node.layer); }
      });
      updateEdgesVisibility();
    }

    function updateEdgesVisibility() {
      edgeLayers.forEach(edge => {
        const sourceVisible = map.hasLayer(nodeLayers.find(n => n.iata === edge.source).layer);
        const targetVisible = map.hasLayer(nodeLayers.find(n => n.iata === edge.target).layer);
        if (sourceVisible && targetVisible) { map.addLayer(edge.layer); } 
        else { map.removeLayer(edge.layer); }
      });
    }

    window.toggleRegion = function(btn) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRegion = btn.getAttribute('data-region');
      applyFilters();
    };

    window.toggleRoute = function(route, btn) {
      if (activeRoutes.has(route.id)) {
        activeRoutes.delete(route.id);
        btn.style.backgroundColor = '#0F172A';
        btn.style.borderColor = '#334155';
      } else {
        activeRoutes.add(route.id);
        btn.style.backgroundColor = 'rgba(255,255,255,0.1)';
        btn.style.borderColor = route.color;
      }
      renderActiveRoutes();
    };

    function renderActiveRoutes() {
      routesGroup.clearLayers();
      activeRoutes.forEach(routeId => {
        const route = data.routes.find(r => r.id === routeId);
        for(let i = 0; i < route.path.length - 1; i++) {
          const a = data.nodes[route.path[i]], b = data.nodes[route.path[i+1]];
          const pts = arc(a.lat, a.lng, b.lat, b.lng);
          L.polyline(pts, {color: route.color, weight: 8, opacity: 0.3, smoothFactor: 1}).addTo(routesGroup);
          L.polyline(pts, {color: route.color, weight: 3, opacity: 0.9, className: 'flow'}).addTo(routesGroup);
        }
      });
    }
  </script>
</body>
</html>
"""

def gerar_grafo_interativo(grafo, df_graus, df_ego, df_rotas=None, output_path="out/interativo/grafo_interativo.html"):
    import json
    
>>>>>>> 00c1248 (feat: organização dos arquivos, aumento dos graficos|fix: navbar)
    COORDS = {
        "REC": (-8.13,  -34.92), "SSA": (-12.91, -38.32),
        "FOR": (-3.78,  -38.53), "NAT": (-5.91,  -35.25),
        "JPA": (-7.15,  -34.95), "GRU": (-23.44, -46.47),
        "CGH": (-23.63, -46.66), "GIG": (-22.81, -43.25),
        "CNF": (-19.62, -43.97), "VIX": (-20.26, -40.29),
        "BSB": (-15.87, -47.92), "GYN": (-16.63, -49.22),
        "CWB": (-25.53, -49.18), "FLN": (-27.67, -48.55),
        "POA": (-29.99, -51.17), "MAO": (-3.04,  -60.05),
        "BEL": (-1.38,  -48.48), "PVH": (-8.71,  -63.90),
        "RBR": (-9.87,  -67.90), "THE": (-5.06,  -42.82),
    }

    grau_dict = dict(zip(df_graus["aeroporto"], df_graus["grau"]))
    dens_dict = dict(zip(df_ego["aeroporto"],   df_ego["densidade_ego"]))

    set1   = set(caminho_rec_poa)
    set2   = set(caminho_mao_gru)
    edges1 = {tuple(sorted([caminho_rec_poa[i], caminho_rec_poa[i + 1]]))
              for i in range(len(caminho_rec_poa) - 1)}
    edges2 = {tuple(sorted([caminho_mao_gru[i],  caminho_mao_gru[i + 1]]))
              for i in range(len(caminho_mao_gru) - 1)}

    # ── Trace 0: background edges ────────────────────────────────────────────
    bg_lat, bg_lon = [], []
    seen = set()
    for u in grafo.adjacencias:
        for a in grafo.obter_vizinhos(u):
            v = a.destino
            k = tuple(sorted([u, v]))
            if k in seen or k in edges1 or k in edges2:
                continue
            seen.add(k)
            if u in COORDS and v in COORDS:
                bg_lat += [COORDS[u][0], COORDS[v][0], None]
                bg_lon += [COORDS[u][1], COORDS[v][1], None]

    t_bg = go.Scattergeo(
        lat=bg_lat, lon=bg_lon, mode="lines",
        line=dict(width=0.7, color="#475569"),
        hoverinfo="skip", name="Conexões", showlegend=True,
    )

    # ── Trace 1: REC→POA path edges ──────────────────────────────────────────
    p1_lat, p1_lon = [], []
    for i in range(len(caminho_rec_poa) - 1):
        u, v = caminho_rec_poa[i], caminho_rec_poa[i + 1]
        if u in COORDS and v in COORDS:
            p1_lat += [COORDS[u][0], COORDS[v][0], None]
            p1_lon += [COORDS[u][1], COORDS[v][1], None]

    t_p1_edge = go.Scattergeo(
        lat=p1_lat, lon=p1_lon, mode="lines",
        line=dict(width=4, color="#A855F7"),
        hoverinfo="skip", name="REC → POA", showlegend=True,
    )

    # ── Trace 2: MAO→GRU path edges ──────────────────────────────────────────
    p2_lat, p2_lon = [], []
    for i in range(len(caminho_mao_gru) - 1):
        u, v = caminho_mao_gru[i], caminho_mao_gru[i + 1]
        if u in COORDS and v in COORDS:
            p2_lat += [COORDS[u][0], COORDS[v][0], None]
            p2_lon += [COORDS[u][1], COORDS[v][1], None]

    t_p2_edge = go.Scattergeo(
        lat=p2_lat, lon=p2_lon, mode="lines",
        line=dict(width=4, color="#F472B6"),
        hoverinfo="skip", name="MAO → GRU", showlegend=True,
    )

    # ── Traces 3-4: glow halos behind path nodes ─────────────────────────────
    def halo_trace(node_set, color):
        lats = [COORDS[n][0] for n in node_set if n in COORDS]
        lons = [COORDS[n][1] for n in node_set if n in COORDS]
        return go.Scattergeo(
            lat=lats, lon=lons, mode="markers",
            marker=dict(size=32, color=color, opacity=0.20,
                        line=dict(width=0)),
            hoverinfo="skip", showlegend=False,
        )

    t_h1 = halo_trace(set1, "#A855F7")
    t_h2 = halo_trace(set2, "#F472B6")

    # ── Traces 5+: airport nodes, one trace per region ───────────────────────
    node_traces = []
    for regiao, color in REGION_COLORS.items():
        lats, lons, hover, sizes, labels = [], [], [], [], []
        for iata, dados in grafo.nos.items():
            if dados.get("regiao") != regiao or iata not in COORDS:
                continue
            grau  = grau_dict.get(iata, 0)
            dens  = dens_dict.get(iata, 0.0)
            cidade = dados.get("cidade", "")
            in1, in2 = iata in set1, iata in set2
            rota = ("<br><b>Ambas as rotas</b>" if in1 and in2
                    else ("<br><b>REC → POA</b>" if in1
                    else ("<br><b>MAO → GRU</b>" if in2 else "")))
            lats.append(COORDS[iata][0])
            lons.append(COORDS[iata][1])
            hover.append(f"<b>{iata}</b> – {cidade}<br>Região: {regiao}<br>"
                         f"Grau: {grau}<br>Densidade ego: {dens:.4f}{rota}")
            sizes.append(10 + grau * 2)
            labels.append(iata)
        if lats:
            node_traces.append(go.Scattergeo(
                lat=lats, lon=lons, mode="markers+text",
                marker=dict(size=sizes, color=color, opacity=0.95,
                            line=dict(width=1.5, color="white")),
                text=labels, textposition="top center",
                textfont=dict(size=10, color="white", family="monospace"),
                hovertext=hover, hoverinfo="text",
                name=regiao, showlegend=True,
            ))

    # ── Assemble all traces and build visibility arrays ───────────────────────
    # Order: 0=bg, 1=p1edge, 2=p2edge, 3=h1, 4=h2, 5..=nodes
    all_traces = [t_bg, t_p1_edge, t_p2_edge, t_h1, t_h2] + node_traces
    n_nodes = len(node_traces)
    nodes_vis = [True] * n_nodes

    def vis(bg=True, p1=True, p2=True, h1=True, h2=True):
        return [bg, p1, p2, h1, h2] + nodes_vis

    buttons = [
        dict(label="Todos os caminhos", method="restyle",
             args=[{"visible": vis(True,  True,  True,  True,  True)}]),
        dict(label="REC → POA",         method="restyle",
             args=[{"visible": vis(True,  True,  False, True,  False)}]),
        dict(label="MAO → GRU",         method="restyle",
             args=[{"visible": vis(True,  False, True,  False, True)}]),
        dict(label="Grafo completo",    method="restyle",
             args=[{"visible": vis(True,  False, False, False, False)}]),
    ]

    layout = go.Layout(
        title=dict(
            text="Rede de Aeroportos Brasileiros",
            font=dict(color="white", size=20, family="sans-serif"),
            x=0.5, xanchor="center", y=0.97,
        ),
        paper_bgcolor="#0F172A",
        font=dict(color="#E2E8F0"),
        geo=dict(
            scope="south america",
            projection_type="mercator",
            showland=True,      landcolor="#1E293B",
            showocean=True,     oceancolor="#0A1628",
            showlakes=True,     lakecolor="#0A1628",
            showcountries=True, countrycolor="#334155",
            showcoastlines=True, coastlinecolor="#475569",
            showframe=False,
            lataxis=dict(range=[-34, 6]),
            lonaxis=dict(range=[-74, -30]),
            bgcolor="#0F172A",
        ),
        legend=dict(
            bgcolor="#1E293B", bordercolor="#334155", borderwidth=1,
            font=dict(color="white", size=12),
            x=0.01, y=0.01, xanchor="left", yanchor="bottom",
        ),
        updatemenus=[dict(
            type="buttons", direction="right",
            active=0,
            x=0.5, xanchor="center", y=1.06, yanchor="top",
            bgcolor="#1E293B", bordercolor="#475569", borderwidth=1,
            font=dict(color="white", size=12),
            buttons=buttons,
            showactive=True,
            pad=dict(r=8, t=4, b=4),
        )],
        annotations=[dict(
            text="Passe o mouse sobre os aeroportos para ver detalhes",
            showarrow=False, x=0.5, y=-0.02,
            xref="paper", yref="paper", xanchor="center",
            font=dict(color="#64748B", size=11),
        )],
        margin=dict(l=0, r=0, t=60, b=20),
        height=820,
    )

    fig = go.Figure(data=all_traces, layout=layout)
    fig.write_html(output_path, include_plotlyjs="cdn")
    print(f"Salvo: {output_path}")


# Entrypoint

def gerar_todas(grafo,
                path_nos="data/aeroportos_data.csv",
                path_ego="out/metricas/ego_aeroportos.csv",
                path_graus="out/metricas/graus.csv",
                path_regioes="out/metricas/regioes.json",
                path_rotas="out/metricas/distancias_rotas.csv",
                out_dir="out"):
    ana_dir  = os.path.join(out_dir, "visualizacoes", "analitica")
    exp_dir  = os.path.join(out_dir, "visualizacoes", "exploratoria")
    expl_dir = os.path.join(out_dir, "visualizacoes", "explanatoria")
    int_dir  = os.path.join(out_dir, "interativo")
    for d in (ana_dir, exp_dir, expl_dir, int_dir):
        os.makedirs(d, exist_ok=True)

    df_nos = pd.read_csv(path_nos)
    df_ego = pd.read_csv(path_ego)
    df_graus = pd.read_csv(path_graus)
    with open(path_regioes) as f:
        regioes_data = json.load(f)

    caminho_rec_poa = []
    caminho_mao_gru = []
    df_rotas_out = None
    if os.path.exists(path_rotas):
        df_rotas_out = pd.read_csv(path_rotas)
        for _, row in df_rotas_out.iterrows():
            raw = str(row["caminho"]).strip()
            if not raw or raw == "nan":
                continue
            if str(row["origem"]) == "REC" and str(row["destino"]) == "POA":
                caminho_rec_poa = raw.split("→")
            if str(row["origem"]) == "MAO" and str(row["destino"]) == "GRU":
                caminho_mao_gru = raw.split("→")

    print("Analíticas")
    plot_distribuicao_graus(df_graus, os.path.join(ana_dir, "viz_analitica_distribuicao_graus.png"))
    plot_ranking_aeroportos(df_graus, df_nos, os.path.join(ana_dir, "viz_analitica_ranking_aeroportos.png"))
    plot_comparacao_regional(regioes_data, os.path.join(ana_dir, "viz_analitica_comparacao_regional.png"))
    plot_subgrafo_maior_grau(grafo, df_graus, os.path.join(ana_dir, "viz_analitica_subgrafo_maior_grau.png"))

    print("Exploratórias")
    plot_exploratorio_grau_vs_densidade(df_ego, df_nos, os.path.join(exp_dir, "viz_exploratorio_grau_vs_densidade.png"))
    plot_exploratorio_ego_metricas(df_ego, df_nos, os.path.join(exp_dir, "viz_exploratorio_ego_metricas.png"))

    print("Explanatórias")
    plot_explanatorio_rede_completa(grafo, df_nos, df_graus, os.path.join(expl_dir, "viz_explanatorio_rede_completa.png"))
    plot_explanatorio_dashboard(df_graus, df_ego, regioes_data, df_nos, os.path.join(expl_dir, "viz_explanatorio_dashboard.png"))

    if caminho_rec_poa and caminho_mao_gru:
        print("Árvore de percurso")
        plot_arvore_percurso(grafo, caminho_rec_poa, caminho_mao_gru,
                             out_png=os.path.join(int_dir, "arvore_percurso.png"),
                             out_html=os.path.join(int_dir, "arvore_percurso.html"),
                             rotas_df=df_rotas_out)
        print("Grafo interativo")
        gerar_grafo_interativo(grafo, df_graus, df_ego, df_rotas_out,
                               output_path=os.path.join(int_dir, "grafo_interativo.html"))
    else:
        print("Aviso: caminhos obrigatórios não encontrados em distancias_rotas.csv; "
              "pulando árvore de percurso e grafointerativo.")

    print(f"Todas as visualizações geradas em {out_dir}/")