import pandas as pd
import random
from datetime import datetime
import os

MAPPING = {
    'REC': 'SBRF', 'SSA': 'SBSV', 'FOR': 'SBFZ', 'NAT': 'SBSG',
    'JPA': 'SBJP', 'GRU': 'SBGR', 'CGH': 'SBSP', 'GIG': 'SBGL',
    'CNF': 'SBCF', 'VIX': 'SBVT', 'BSB': 'SBBR', 'GYN': 'SBGO',
    'CWB': 'SBCT', 'FLN': 'SBFL', 'POA': 'SBPA', 'MAO': 'SBEG',
    'BEL': 'SBBE', 'PVH': 'SBPV', 'RBR': 'SBRB', 'THE': 'SBTE'
}
ICAO_TO_IATA = {v: k for k, v in MAPPING.items()}

def carregar_dados():
    df_aeroportos = pd.read_csv('data/aeroportos_data.csv')
    mapa_regioes = dict(zip(df_aeroportos['iata'], df_aeroportos['regiao']))
    

    try:
        df_vra = pd.read_csv('scripts/VRA_20255.csv', sep=';', quotechar='"', encoding='utf-8', low_memory=False)
    except:
        df_vra = pd.read_csv('scripts/VRA_20255.csv', sep=';', quotechar='"', encoding='latin-1', low_memory=False)

    df_vra.columns = df_vra.columns.str.strip()
    
    print("Colunas encontradas no VRA:", df_vra.columns.tolist())
    
    return df_vra, mapa_regioes

def gerar_adjacencias():
    df_vra, mapa_regioes = carregar_dados()
    if df_vra is None: return

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

        if icao_orig in ICAO_TO_IATA and icao_dest in ICAO_TO_IATA:
            iata_orig = ICAO_TO_IATA[icao_orig]
            iata_dest = ICAO_TO_IATA[icao_dest]

            if iata_orig == iata_dest:
                continue

            par = tuple(sorted((iata_orig, iata_dest)))

            try:
                fmt = "%Y-%m-%d %H:%M:%S"
                partida = datetime.strptime(str(linha['Partida Real']), fmt)
                chegada = datetime.strptime(str(linha['Chegada Real']), fmt)
                duracao = (chegada - partida).total_seconds() / 3600
                
                peso = max(0.5, round(duracao, 2))
            except:
                peso = 1.0 

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