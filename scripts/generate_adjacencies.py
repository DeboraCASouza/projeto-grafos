import pandas as pd
import random
from datetime import datetime
import os

# Mapeamento manual IATA <-> ICAO para os aeroportos do seu dataset
MAPPING = {
    'REC': 'SBRF', 'SSA': 'SBSV', 'FOR': 'SBFZ', 'NAT': 'SBSG',
    'JPA': 'SBJP', 'GRU': 'SBGR', 'CGH': 'SBSP', 'GIG': 'SBGL',
    'CNF': 'SBCF', 'VIX': 'SBVT', 'BSB': 'SBBR', 'GYN': 'SBGO',
    'CWB': 'SBCT', 'FLN': 'SBFL', 'POA': 'SBPA', 'MAO': 'SBEG',
    'BEL': 'SBBE', 'PVH': 'SBPV', 'RBR': 'SBRB', 'THE': 'SBTE'
}
# Inverter para busca por ICAO
ICAO_TO_IATA = {v: k for k, v in MAPPING.items()}

def carregar_dados():
    # Carrega seus aeroportos
    df_aeroportos = pd.read_csv('data/aeroportos_data.csv')
    mapa_regioes = dict(zip(df_aeroportos['iata'], df_aeroportos['regiao']))
    
    # Tenta ler com UTF-8 primeiro, se falhar usa latin-1
    # low_memory=False resolve o DtypeWarning
    try:
        df_vra = pd.read_csv('scripts/VRA_20255.csv', sep=';', quotechar='"', encoding='utf-8', low_memory=False)
    except:
        df_vra = pd.read_csv('scripts/VRA_20255.csv', sep=';', quotechar='"', encoding='latin-1', low_memory=False)

    # Limpa os nomes das colunas (remove espaços extras ou caracteres invisíveis)
    df_vra.columns = df_vra.columns.str.strip()
    
    # Mostra as colunas detectadas para você conferir se o erro persistir
    print("Colunas encontradas no VRA:", df_vra.columns.tolist())
    
    return df_vra, mapa_regioes

def gerar_adjacencias():
    df_vra, mapa_regioes = carregar_dados()
    if df_vra is None: return

    # Filtrar voos REALIZADOS
    df_realizados = df_vra[df_vra['Situação Voo'] == 'REALIZADO'].copy()

    conexoes = {}
    justificativas_base = [
        "Rota comercial de alta demanda",
        "Conexão estratégica de malha aérea",
        "Fluxo logístico regional",
        "Acordo de compartilhamento (Codeshare)",
        "Demanda sazonal identificada",
        "Conectividade entre centros urbanos"
    ]

    for _, linha in df_realizados.iterrows():
        icao_orig = str(linha['ICAO Aeródromo Origem'])
        icao_dest = str(linha['ICAO Aeródromo Destino'])

        # Verifica se ambos os aeroportos estão no seu dataset de 20 nós
        if icao_orig in ICAO_TO_IATA and icao_dest in ICAO_TO_IATA:
            iata_orig = ICAO_TO_IATA[icao_orig]
            iata_dest = ICAO_TO_IATA[icao_dest]

            # Ignorar self-loops
            if iata_orig == iata_dest:
                continue

            # Grafo Não-Direcionado: Trata (A,B) e (B,A) como o mesmo par
            par = tuple(sorted((iata_orig, iata_dest)))

            # Cálculo do Peso: Diferença entre Chegada Real e Partida Real em horas
            try:
                fmt = "%Y-%m-%d %H:%M:%S"
                partida = datetime.strptime(str(linha['Partida Real']), fmt)
                chegada = datetime.strptime(str(linha['Chegada Real']), fmt)
                duracao = (chegada - partida).total_seconds() / 3600
                
                # Peso mínimo de 0.5 para voos muito curtos ou erros de log
                peso = max(0.5, round(duracao, 2))
            except:
                peso = 1.0 # Valor padrão se a data estiver corrompida

            # Se já existe essa conexão, mantemos a de menor peso (mais rápida)
            if par in conexoes:
                if peso < conexoes[par]['peso']:
                    conexoes[par]['peso'] = peso
            else:
                # Definir Tipo de Conexão
                reg_orig = mapa_regioes[iata_orig]
                reg_dest = mapa_regioes[iata_dest]
                tipo = "regional" if reg_orig == reg_dest else "hub"

                conexoes[par] = {
                    'origem': iata_orig,
                    'destino': iata_dest,
                    'tipo_conexao': tipo,
                    'justificativa': random.choice(justificativas_base),
                    'peso': peso
                }

    # Converter dicionário para DataFrame
    df_final = pd.DataFrame(conexoes.values())
    
    # Garantir que a pasta data/ existe
    if not os.path.exists('data'):
        os.makedirs('data')
        
    df_final.to_csv('data/adjacencias_aeroportos.csv', index=False)
    print(f"Sucesso! {len(df_final)} conexões únicas criadas.")
    print("Arquivo salvo em: data/adjacencias_aeroportos.csv")

if __name__ == "__main__":
    gerar_adjacencias()