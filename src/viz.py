import json
import math
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

def plot_distribuicao_graus(df_graus, output_path="out/viz_analitica_distribuicao_graus.png"):
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


def plot_ranking_aeroportos(df_graus, df_nos, output_path="out/viz_analitica_ranking_aeroportos.png"):
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


def plot_comparacao_regional(regioes_data, output_path="out/viz_analitica_comparacao_regional.png"):
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


def plot_subgrafo_maior_grau(grafo, df_graus, output_path="out/viz_analitica_subgrafo_maior_grau.png", top_n=8):
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

def plot_exploratorio_grau_vs_densidade(df_ego, df_nos, output_path="out/viz_exploratorio_grau_vs_densidade.png"):
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


def plot_exploratorio_ego_metricas(df_ego, df_nos, output_path="out/viz_exploratorio_ego_metricas.png"):
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
                                    output_path="out/viz_explanatorio_rede_completa.png"):
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
                                 output_path="out/viz_explanatorio_dashboard.png"):
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


# Entrypoint

def gerar_todas(grafo,
                path_nos="data/aeroportos_data.csv",
                path_ego="out/ego_aeroportos.csv",
                path_graus="out/graus.csv",
                path_regioes="out/regioes.json"):
    df_nos = pd.read_csv(path_nos)
    df_ego = pd.read_csv(path_ego)
    df_graus = pd.read_csv(path_graus)
    with open(path_regioes) as f:
        regioes_data = json.load(f)

    print("Analíticas")
    plot_distribuicao_graus(df_graus)
    plot_ranking_aeroportos(df_graus, df_nos)
    plot_comparacao_regional(regioes_data)
    plot_subgrafo_maior_grau(grafo, df_graus)

    print("Exploratórias")
    plot_exploratorio_grau_vs_densidade(df_ego, df_nos)
    plot_exploratorio_ego_metricas(df_ego, df_nos)

    print("Explanatórias")
    plot_explanatorio_rede_completa(grafo, df_nos, df_graus)
    plot_explanatorio_dashboard(df_graus, df_ego, regioes_data, df_nos)

    print("Todas as visualizações geradas em out/")