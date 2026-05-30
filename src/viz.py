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
  <title>Árvore de Percurso — Caminhos Mínimos</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0F172A; color: #E2E8F0; height: 100vh; overflow: hidden; }
    #map { width: 100vw; height: 100vh; }
    
    /* Painel Flutuante de Título e Legenda */
    #title-panel {
      position: absolute; top: 20px; left: 50px; z-index: 1000;
      background: rgba(30, 41, 59, 0.95); backdrop-filter: blur(8px);
      border: 1px solid #334155; border-radius: 12px; padding: 16px 20px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
    }
    #title-panel h1 { font-size: 16px; font-weight: 700; color: #F1F5F9; margin-bottom: 4px; }
    #title-panel p { font-size: 12px; color: #94A3B8; margin-bottom: 12px; }
    .leg-row { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #CBD5E1; margin-bottom: 6px; }
    .leg-line { width: 24px; height: 4px; border-radius: 2px; }
    
    /* Estilo dos Rótulos dos Aeroportos */
    .leaflet-tooltip {
      background: rgba(15, 23, 42, 0.9) !important;
      border: 1px solid #334155 !important;
      border-radius: 6px !important;
      color: #F1F5F9 !important;
      font-weight: 700; font-size: 11px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
      padding: 4px 8px !important;
    }
    .leaflet-tooltip::before { border-top-color: rgba(15, 23, 42, 0.9) !important; }
    
    /* Animação do Fluxo */
    .flow { stroke-dasharray: 12 8; animation: flow 1.5s linear infinite; }
    @keyframes flow { to { stroke-dashoffset: -20; } }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <div id="title-panel">
    <h1>Árvore de Percurso</h1>
    <p>Subgrafo dos caminhos mínimos obrigatórios</p>
    <div id="legend-container"></div>
  </div>

  <script>
    // Dados dos aeroportos com coordenadas aproximadas
    const AP = {
      REC:{name:"Recife",lat:-8.126,lng:-34.924}, SSA:{name:"Salvador",lat:-12.908,lng:-38.323},
      FOR:{name:"Fortaleza",lat:-3.776,lng:-38.533}, NAT:{name:"Natal",lat:-5.911,lng:-35.248},
      JPA:{name:"João Pessoa",lat:-7.148,lng:-34.951}, GRU:{name:"São Paulo (GRU)",lat:-23.436,lng:-46.473},
      CGH:{name:"São Paulo (CGH)",lat:-23.627,lng:-46.656}, GIG:{name:"Rio de Janeiro",lat:-22.810,lng:-43.251},
      CNF:{name:"Belo Horizonte",lat:-19.624,lng:-43.972}, VIX:{name:"Vitória",lat:-20.258,lng:-40.287},
      BSB:{name:"Brasília",lat:-15.871,lng:-47.919}, GYN:{name:"Goiânia",lat:-16.632,lng:-49.221},
      CWB:{name:"Curitiba",lat:-25.529,lng:-49.176}, FLN:{name:"Florianópolis",lat:-27.670,lng:-48.552},
      POA:{name:"Porto Alegre",lat:-29.994,lng:-51.172}, MAO:{name:"Manaus",lat:-3.039,lng:-60.050},
      BEL:{name:"Belém",lat:-1.379,lng:-48.476}, PVH:{name:"Porto Velho",lat:-8.709,lng:-63.903},
      RBR:{name:"Rio Branco",lat:-9.869,lng:-67.898}, THE:{name:"Teresina",lat:-5.060,lng:-42.823}
    };

    const ROUTES = __ROUTES__;
    
    // Inicialização do Mapa (Fundo escuro via CartoDB)
    const map = L.map('map', {zoomControl: false}).setView([-15, -50], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO', subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    // Função para gerar curvas nas arestas
    function arc(la1, ln1, la2, ln2, n=50) {
      const mla=(la1+la2)/2, mln=(ln1+ln2)/2, dla=la2-la1, dln=ln2-ln1;
      const dist=Math.hypot(dla,dln)||1e-9, k=dist*0.2;
      const cla=mla+(-dln/dist)*k, cln=mln+(dla/dist)*k;
      return Array.from({length:n+1}, (_,i) => {
        const t=i/n, u=1-t;
        return [u*u*la1 + 2*u*t*cla + t*t*la2, u*u*ln1 + 2*u*t*cln + t*t*ln2];
      });
    }

    const bounds = [];
    const legendContainer = document.getElementById('legend-container');

    // Desenha apenas os caminhos obrigatórios (subgrafo)
    ROUTES.forEach(route => {
      // Filtro estrito: Apenas REC-POA e MAO-GRU
      if (route.id !== 'rec-poa' && route.id !== 'mao-gru') return;

      // Adiciona item na legenda
      const legRow = document.createElement('div');
      legRow.className = 'leg-row';
      legRow.innerHTML = `<div class="leg-line" style="background:${route.color}"></div>${route.label} (Custo: ${route.cost})`;
      legendContainer.appendChild(legRow);

      // Traça o percurso
      for(let i = 0; i < route.path.length - 1; i++) {
        const a = AP[route.path[i]], b = AP[route.path[i+1]];
        const pts = arc(a.lat, a.lng, b.lat, b.lng);
        
        // Sombra da linha (Espessura e cor - Requisito obrigatório)
        L.polyline(pts, {color: route.color, weight: 8, opacity: 0.3, smoothFactor: 1}).addTo(map);
        // Linha animada principal
        L.polyline(pts, {color: route.color, weight: 3, opacity: 0.9, smoothFactor: 1, className: 'flow'}).addTo(map);
      }

      // Adiciona os Nós (Rótulos dos aeroportos - Requisito obrigatório)
      route.path.forEach(iata => {
        const a = AP[iata];
        bounds.push([a.lat, a.lng]);
        
        // Marcador circular customizado
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${route.color};border:2px solid #fff;box-shadow:0 0 10px ${route.color};"></div>`,
          iconSize: [12,12], iconAnchor: [6,6]
        });
        
        L.marker([a.lat, a.lng], {icon}).addTo(map)
         .bindTooltip(`${iata} - ${a.name}`, {permanent: true, direction: 'top', offset: [0,-10]});
      });
    });

    // Centraliza o mapa baseado apenas nos aeroportos desenhados
    if (bounds.length > 0) {
      map.fitBounds(bounds, {padding: [100, 100]});
    }
  </script>
</body>
</html>
"""

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

_GRAFO_INTERATIVO_TEMPLATE = """\
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Grafo Interativo — Rede Aeroportuária</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
    body { display: flex; height: 100vh; background: #0F172A; color: #E2E8F0; overflow: hidden; }
    
    #sidebar {
      width: 340px; background: #1E293B; border-right: 1px solid #334155;
      display: flex; flex-direction: column; padding: 20px; z-index: 1000;
      overflow-y: auto;
    }
    #sidebar::-webkit-scrollbar { width: 6px; }
    #sidebar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }

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

def gerar_grafo_interativo(grafo, df_graus, df_ego, df_rotas=None, output_path="out/grafo_interativo.html"):
    import json
    
    COORDS = {
        "REC": (-8.13, -34.92), "SSA": (-12.91, -38.32), "FOR": (-3.78, -38.53),
        "NAT": (-5.91, -35.25), "JPA": (-7.15, -34.95), "GRU": (-23.44, -46.47),
        "CGH": (-23.63, -46.66), "GIG": (-22.81, -43.25), "CNF": (-19.62, -43.97),
        "VIX": (-20.26, -40.29), "BSB": (-15.87, -47.92), "GYN": (-16.63, -49.22),
        "CWB": (-25.53, -49.18), "FLN": (-27.67, -48.55), "POA": (-29.99, -51.17),
        "MAO": (-3.04, -60.05), "BEL": (-1.38, -48.48), "PVH": (-8.71, -63.90),
        "RBR": (-9.87, -67.90), "THE": (-5.06, -42.82),
    }

    _COLORS = ["#A855F7", "#F472B6", "#34D399", "#60A5FA", "#FBBF24", "#F87171", "#67E8F9"]

    nodes_data = {}
    for iata, dados in grafo.nos.items():
        if iata in COORDS:
            grau = int(df_graus[df_graus['aeroporto'] == iata]['grau'].values[0]) if iata in df_graus['aeroporto'].values else 0
            dens = float(df_ego[df_ego['aeroporto'] == iata]['densidade_ego'].values[0]) if iata in df_ego['aeroporto'].values else 0.0
            nodes_data[iata] = {
                "cidade": dados['cidade'], "regiao": dados['regiao'],
                "lat": COORDS[iata][0], "lng": COORDS[iata][1],
                "grau": grau, "densidade": dens
            }

    edges_data = []
    seen = set()
    for u in grafo.adjacencias:
        for aresta in grafo.obter_vizinhos(u):
            v = aresta.destino
            k = tuple(sorted([u, v]))
            if k not in seen and u in COORDS and v in COORDS:
                seen.add(k)
                edges_data.append({"source": u, "target": v})

    routes_data = []
    if df_rotas is not None:
        for i, (_, row) in enumerate(df_rotas.iterrows()):
            raw = str(row["caminho"]).strip()
            if not raw or raw == "nan": continue
            path = [p.strip() for p in raw.split("→")]
            origem, destino = str(row["origem"]).strip(), str(row["destino"]).strip()
            
            # Etiqueta especial se for rota obrigatória
            label = f"{origem} → {destino}"
            if (origem == "REC" and destino == "POA") or (origem == "MAO" and destino == "GRU"):
                label = f"⭐ {label}"
                
            routes_data.append({
                "id": f"{origem.lower()}-{destino.lower()}",
                "label": label,
                "path": path,
                "color": _COLORS[i % len(_COLORS)]
            })

    js_data = {"nodes": nodes_data, "edges": edges_data, "routes": routes_data}
    html_out = _GRAFO_INTERATIVO_TEMPLATE.replace("__DATA__", json.dumps(js_data, ensure_ascii=False))

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_out)
        
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
        gerar_grafo_interativo(grafo, df_graus, df_ego, df_rotas_out)
    else:
        print("Aviso: caminhos obrigatórios não encontrados em distancias_rotas.csv; "
              "pulando árvore de percurso e grafointerativo.")

    print(f"Todas as visualizações geradas em {out_dir}/")