export interface AirportCoord {
  name: string;
  lat: number;
  lng: number;
}

export const AIRPORT_COORDS: Record<string, AirportCoord> = {
  REC: { name: "Recife", lat: -8.126, lng: -34.924 },
  SSA: { name: "Salvador", lat: -12.908, lng: -38.323 },
  FOR: { name: "Fortaleza", lat: -3.776, lng: -38.533 },
  NAT: { name: "Natal", lat: -5.911, lng: -35.248 },
  JPA: { name: "João Pessoa", lat: -7.148, lng: -34.951 },
  GRU: { name: "São Paulo (GRU)", lat: -23.436, lng: -46.473 },
  CGH: { name: "São Paulo (CGH)", lat: -23.627, lng: -46.656 },
  GIG: { name: "Rio de Janeiro", lat: -22.810, lng: -43.251 },
  CNF: { name: "Belo Horizonte", lat: -19.624, lng: -43.972 },
  VIX: { name: "Vitória", lat: -20.258, lng: -40.287 },
  BSB: { name: "Brasília", lat: -15.871, lng: -47.919 },
  GYN: { name: "Goiânia", lat: -16.632, lng: -49.221 },
  CWB: { name: "Curitiba", lat: -25.529, lng: -49.176 },
  FLN: { name: "Florianópolis", lat: -27.670, lng: -48.552 },
  POA: { name: "Porto Alegre", lat: -29.994, lng: -51.172 },
  MAO: { name: "Manaus", lat: -3.039, lng: -60.050 },
  BEL: { name: "Belém", lat: -1.379, lng: -48.476 },
  PVH: { name: "Porto Velho", lat: -8.709, lng: -63.903 },
  RBR: { name: "Rio Branco", lat: -9.869, lng: -67.898 },
  THE: { name: "Teresina", lat: -5.060, lng: -42.823 }
};
