export interface AirportMetadata {
  cidade: string;
  regiao: string;
  grau: number;
  densidade: number;
}

export interface AirportEdge {
  source: string;
  target: string;
}

export interface AirportRoute {
  id: string;
  label: string;
  path: string[];
  cost: number;
  color: string;
}

export const AIRPORTS_METADATA: Record<string, AirportMetadata> = {
  REC: { cidade: "Recife", regiao: "Nordeste", grau: 15, densidade: 0.733333 },
  SSA: { cidade: "Salvador", regiao: "Nordeste", grau: 15, densidade: 0.758333 },
  FOR: { cidade: "Fortaleza", regiao: "Nordeste", grau: 11, densidade: 0.878788 },
  NAT: { cidade: "Natal", regiao: "Nordeste", grau: 11, densidade: 0.924242 },
  JPA: { cidade: "João Pessoa", regiao: "Nordeste", grau: 8, densidade: 1.0 },
  GRU: { cidade: "São Paulo", regiao: "Sudeste", grau: 19, densidade: 0.605263 },
  CGH: { cidade: "São Paulo", regiao: "Sudeste", grau: 14, densidade: 0.771429 },
  GIG: { cidade: "Rio de Janeiro", regiao: "Sudeste", grau: 17, densidade: 0.686275 },
  CNF: { cidade: "Belo Horizonte", regiao: "Sudeste", grau: 19, densidade: 0.605263 },
  VIX: { cidade: "Vitória", regiao: "Sudeste", grau: 8, densidade: 0.944444 },
  BSB: { cidade: "Brasília", regiao: "Centro-Oeste", grau: 19, densidade: 0.605263 },
  GYN: { cidade: "Goiânia", regiao: "Centro-Oeste", grau: 8, densidade: 0.972222 },
  CWB: { cidade: "Curitiba", regiao: "Sul", grau: 9, densidade: 0.933333 },
  FLN: { cidade: "Florianópolis", regiao: "Sul", grau: 9, densidade: 0.888889 },
  POA: { cidade: "Porto Alegre", regiao: "Sul", grau: 10, densidade: 0.909091 },
  MAO: { cidade: "Manaus", regiao: "Norte", grau: 13, densidade: 0.747253 },
  BEL: { cidade: "Belém", regiao: "Norte", grau: 9, densidade: 1.0 },
  PVH: { cidade: "Porto Velho", regiao: "Norte", grau: 6, densidade: 0.952381 },
  RBR: { cidade: "Rio Branco", regiao: "Norte", grau: 5, densidade: 1.0 },
  THE: { cidade: "Teresina", regiao: "Nordeste", grau: 5, densidade: 1.0 }
};

export const AIRPORTS_EDGES: AirportEdge[] = [
  { source: "REC", target: "CGH" }, { source: "REC", target: "NAT" }, { source: "REC", target: "SSA" },
  { source: "REC", target: "BSB" }, { source: "REC", target: "GRU" }, { source: "REC", target: "CNF" },
  { source: "REC", target: "POA" }, { source: "REC", target: "GIG" }, { source: "REC", target: "GYN" },
  { source: "REC", target: "FOR" }, { source: "REC", target: "JPA" }, { source: "REC", target: "MAO" },
  { source: "REC", target: "BEL" }, { source: "REC", target: "THE" }, { source: "REC", target: "VIX" },
  { source: "SSA", target: "BSB" }, { source: "SSA", target: "JPA" }, { source: "SSA", target: "MAO" },
  { source: "SSA", target: "GIG" }, { source: "SSA", target: "BEL" }, { source: "SSA", target: "GRU" },
  { source: "SSA", target: "POA" }, { source: "SSA", target: "CNF" }, { source: "SSA", target: "CGH" },
  { source: "SSA", target: "VIX" }, { source: "SSA", target: "FOR" }, { source: "SSA", target: "NAT" },
  { source: "SSA", target: "CWB" }, { source: "SSA", target: "GYN" }, { source: "FOR", target: "CNF" },
  { source: "FOR", target: "CGH" }, { source: "FOR", target: "BSB" }, { source: "FOR", target: "GIG" },
  { source: "FOR", target: "GRU" }, { source: "FOR", target: "BEL" }, { source: "FOR", target: "THE" },
  { source: "FOR", target: "NAT" }, { source: "FOR", target: "MAO" }, { source: "NAT", target: "BSB" },
  { source: "NAT", target: "GIG" }, { source: "NAT", target: "GRU" }, { source: "NAT", target: "CNF" },
  { source: "NAT", target: "CGH" }, { source: "NAT", target: "BEL" }, { source: "NAT", target: "MAO" },
  { source: "NAT", target: "JPA" }, { source: "JPA", target: "BSB" }, { source: "JPA", target: "CGH" },
  { source: "JPA", target: "GRU" }, { source: "JPA", target: "GIG" }, { source: "JPA", target: "CNF" },
  { source: "GRU", target: "BSB" }, { source: "GRU", target: "VIX" }, { source: "GRU", target: "CNF" },
  { source: "GRU", target: "POA" }, { source: "GRU", target: "CWB" }, { source: "GRU", target: "GIG" },
  { source: "GRU", target: "MAO" }, { source: "GRU", target: "GYN" }, { source: "GRU", target: "THE" },
  { source: "GRU", target: "BEL" }, { source: "GRU", target: "FLN" }, { source: "GRU", target: "PVH" },
  { source: "GRU", target: "RBR" }, { source: "GRU", target: "CGH" }, { source: "CGH", target: "CNF" },
  { source: "CGH", target: "VIX" }, { source: "CGH", target: "FLN" }, { source: "CGH", target: "BSB" },
  { source: "CGH", target: "GYN" }, { source: "CGH", target: "POA" }, { source: "CGH", target: "GIG" },
  { source: "CGH", target: "CWB" }, { source: "GIG", target: "MAO" }, { source: "GIG", target: "POA" },
  { source: "GIG", target: "VIX" }, { source: "GIG", target: "BSB" }, { source: "GIG", target: "CWB" },
  { source: "GIG", target: "FLN" }, { source: "GIG", target: "CNF" }, { source: "GIG", target: "GYN" },
  { source: "GIG", target: "BEL" }, { source: "GIG", target: "PVH" }, { source: "CNF", target: "BSB" },
  { source: "CNF", target: "VIX" }, { source: "CNF", target: "MAO" }, { source: "CNF", target: "GYN" },
  { source: "CNF", target: "POA" }, { source: "CNF", target: "FLN" }, { source: "CNF", target: "CWB" },
  { source: "CNF", target: "PVH" }, { source: "CNF", target: "RBR" }, { source: "CNF", target: "BEL" },
  { source: "CNF", target: "THE" }, { source: "VIX", target: "BSB" }, { source: "VIX", target: "FLN" },
  { source: "BSB", target: "MAO" }, { source: "BSB", target: "POA" }, { source: "BSB", target: "GYN" },
  { source: "BSB", target: "BEL" }, { source: "BSB", target: "FLN" }, { source: "BSB", target: "CWB" },
  { source: "BSB", target: "PVH" }, { source: "BSB", target: "THE" }, { source: "BSB", target: "RBR" },
  { source: "GYN", target: "CWB" }, { source: "CWB", target: "FLN" }, { source: "CWB", target: "POA" },
  { source: "FLN", target: "MAO" }, { source: "FLN", target: "POA" }, { source: "POA", target: "MAO" },
  { source: "MAO", target: "PVH" }, { source: "MAO", target: "BEL" }, { source: "MAO", target: "RBR" },
  { source: "PVH", target: "RBR" }
];

export const AIRPORT_ROUTES: AirportRoute[] = [
  { id: "rec-poa", label: "⭐ REC → POA", path: ["REC", "POA"], cost: 3.62, color: "#A855F7" },
  { id: "mao-gru", label: "⭐ MAO → GRU", path: ["MAO", "GRU"], cost: 3.4, color: "#F472B6" },
  { id: "for-cgh", label: "FOR → CGH", path: ["FOR", "CGH"], cost: 3.12, color: "#34D399" },
  { id: "bsb-bel", label: "BSB → BEL", path: ["BSB", "BEL"], cost: 2.27, color: "#60A5FA" },
  { id: "cwb-nat", label: "CWB → NAT", path: ["CWB", "GRU", "NAT"], cost: 3.68, color: "#FBBF24" },
  { id: "vix-mao", label: "VIX → MAO", path: ["VIX", "CNF", "MAO"], cost: 4.03, color: "#F87171" },
  { id: "ssa-fln", label: "SSA → FLN", path: ["SSA", "GIG", "FLN"], cost: 2.85, color: "#67E8F9" }
];
