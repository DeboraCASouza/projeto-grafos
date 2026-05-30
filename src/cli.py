import argparse
import json
import os
import sys


def _adjacencias_path(dataset_path: str) -> str:
    directory = os.path.dirname(dataset_path)
    return os.path.join(directory, "adjacencias_aeroportos.csv")


def _load_graph(dataset: str, adjacencias: str):
    from src.graphs.io import carregar_grafo
    return carregar_grafo(dataset, adjacencias)


def _ensure_out(out: str):
    os.makedirs(out, exist_ok=True)


def cmd_alg(args):
    from src.graphs.algorithms import bfs, dfs, dijkstra

    adj_path = args.adjacencias or _adjacencias_path(args.dataset)
    grafo = _load_graph(args.dataset, adj_path)
    _ensure_out(args.out)

    alg = args.alg.upper()

    alg_dir = os.path.join(args.out, "algoritmos")
    os.makedirs(alg_dir, exist_ok=True)

    if alg == "BFS":
        resultado = bfs(grafo, args.source)
        print(f"BFS a partir de {args.source}: {' → '.join(resultado)}")
        out_file = os.path.join(alg_dir, f"bfs_{args.source}.json")
        with open(out_file, "w") as f:
            json.dump({"algoritmo": "BFS", "origem": args.source, "ordem_visita": resultado}, f, indent=2)
        print(f"Salvo: {out_file}")

    elif alg == "DFS":
        resultado = dfs(grafo, args.source)
        print(f"DFS a partir de {args.source}: {' → '.join(resultado)}")
        out_file = os.path.join(alg_dir, f"dfs_{args.source}.json")
        with open(out_file, "w") as f:
            json.dump({"algoritmo": "DFS", "origem": args.source, "ordem_visita": resultado}, f, indent=2)
        print(f"Salvo: {out_file}")

    elif alg == "DIJKSTRA":
        if not args.target:
            print("Erro: --target é obrigatório para DIJKSTRA.", file=sys.stderr)
            sys.exit(1)
        custo, caminho = dijkstra(grafo, args.source, args.target)
        if custo == float("inf"):
            print(f"Sem caminho de {args.source} para {args.target}.")
        else:
            print(f"Custo: {round(custo, 4)}  |  Caminho: {' → '.join(caminho)}")
        out_file = os.path.join(alg_dir, f"dijkstra_{args.source}_{args.target}.json")
        with open(out_file, "w") as f:
            json.dump({
                "algoritmo": "DIJKSTRA",
                "origem": args.source,
                "destino": args.target,
                "custo": round(custo, 4) if custo != float("inf") else None,
                "caminho": caminho,
            }, f, indent=2)
        print(f"Salvo: {out_file}")

    else:
        print(f"Algoritmo desconhecido: {args.alg}. Use BFS, DFS ou DIJKSTRA.", file=sys.stderr)
        sys.exit(1)


def cmd_solve(args):
    from src.solve import processar_parte1, processar_rotas
    metricas_dir = os.path.join(args.out, "metricas")
    _ensure_out(metricas_dir)
    print("Executando solver (parte 1)…")
    processar_parte1(metricas_dir)
    print("Computando rotas (Dijkstra)…")
    processar_rotas(metricas_dir)
    print(f"Concluído. Saídas em {args.out}/")


def cmd_viz(args):
    from src.graphs.io import carregar_grafo
    from src.viz import gerar_todas
    adj_path = args.adjacencias or _adjacencias_path(args.dataset)
    grafo = carregar_grafo(args.dataset, adj_path)
    metricas_dir = os.path.join(args.out, "metricas")
    _ensure_out(metricas_dir)
    gerar_todas(
        grafo,
        path_nos=args.dataset,
        path_ego=os.path.join(metricas_dir, "ego_aeroportos.csv"),
        path_graus=os.path.join(metricas_dir, "graus.csv"),
        path_regioes=os.path.join(metricas_dir, "regioes.json"),
        path_rotas=os.path.join(metricas_dir, "distancias_rotas.csv"),
        out_dir=args.out,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m src.cli",
        description="CLI para a rede de aeroportos do Brasil.",
    )
    parser.add_argument("--dataset", required=True, metavar="CSV",
                        help="Caminho para aeroportos_data.csv")
    parser.add_argument("--adjacencias", default=None, metavar="CSV",
                        help="Caminho para adjacencias_aeroportos.csv (padrão: mesmo diretório de --dataset)")
    parser.add_argument("--out", default="./out", metavar="DIR",
                        help="Diretório de saída (padrão: ./out)")

    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--alg", choices=["BFS", "DFS", "DIJKSTRA"],
                      metavar="ALG", help="Algoritmo a executar: BFS, DFS ou DIJKSTRA")
    mode.add_argument("--solve", action="store_true",
                      help="Rodar o solver completo (métricas + rotas)")
    mode.add_argument("--viz", action="store_true",
                      help="Gerar todas as visualizações em --out")

    parser.add_argument("--source", metavar="IATA",
                        help="Aeroporto de origem (obrigatório para BFS/DFS/DIJKSTRA)")
    parser.add_argument("--target", metavar="IATA",
                        help="Aeroporto de destino (obrigatório para DIJKSTRA)")
    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    if args.alg and not args.source:
        parser.error("--source é obrigatório quando --alg é especificado.")

    if args.alg:
        cmd_alg(args)
    elif args.solve:
        cmd_solve(args)
    elif args.viz:
        cmd_viz(args)


if __name__ == "__main__":
    main()
