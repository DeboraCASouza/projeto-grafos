import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AIRPORT_COORDS } from '../data/airportsCoords';
import { AIRPORTS_METADATA, AIRPORTS_EDGES, AIRPORT_ROUTES } from '../data/airportsData';
import { Info } from 'lucide-react';

interface LeafletMapProps {
  viewMode: 'complete' | 'shortest' | 'simulation';
  searchQuery: string;
  activeRegs: Set<string>;
  minDegree: number;
  selectedIata: string | null;
  onSelectIata: (iata: string | null) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  viewMode,
  searchQuery,
  activeRegs,
  minDegree,
  selectedIata,
  onSelectIata,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  // local active route for Dijkstra simulation (e.g. REC -> POA)
  const [activeRouteId, setActiveRouteId] = useState<string>('');

  const getRegionColor = (regiao: string) => {
    switch (regiao) {
      case 'Norte': return '#7C3AED'; // Purple
      case 'Nordeste': return '#A855F7'; // Light Purple
      case 'Sudeste': return '#D946EF'; // Fuchsia
      case 'Sul': return '#F472B6'; // Pink
      case 'Centro-Oeste': return '#FB7185'; // Rose
      default: return '#94a3b8';
    }
  };

  // Helper to generate bezier curves for route arcs
  const getArcPoints = (lat1: number, lng1: number, lat2: number, lng2: number, numPoints = 50) => {
    const mlat = (lat1 + lat2) / 2;
    const mlng = (lng1 + lng2) / 2;
    const dlat = lat2 - lat1;
    const dlng = lng2 - lng1;
    const dist = Math.hypot(dlat, dlng) || 1e-9;
    const k = dist * 0.15;
    const clat = mlat + (-dlng / dist) * k;
    const clng = mlng + (dlat / dist) * k;

    const points: [number, number][] = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const u = 1 - t;
      const lat = u * u * lat1 + 2 * u * t * clat + t * t * lat2;
      const lng = u * u * lng1 + 2 * u * t * clng + t * t * lng2;
      points.push([lat, lng]);
    }
    return points;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-15.7801, -47.9292],
      zoom: 4,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark-themed tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    const layersGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layersRef.current = layersGroup;

    return () => {
      map.remove();
    };
  }, []);

  // Effect to fly/zoom to selected node (only in complete/simulation mode)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedIata || viewMode === 'shortest') return;
    const coord = AIRPORT_COORDS[selectedIata];
    if (coord) {
      map.flyTo([coord.lat, coord.lng], 6, { animate: true, duration: 0.8 });
    }
  }, [selectedIata, viewMode]);

  // Effect to fit map bounds to shortest path tree (REC, POA, MAO, GRU)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (viewMode === 'shortest') {
      const bounds: [number, number][] = [
        [AIRPORT_COORDS['REC'].lat, AIRPORT_COORDS['REC'].lng],
        [AIRPORT_COORDS['POA'].lat, AIRPORT_COORDS['POA'].lng],
        [AIRPORT_COORDS['MAO'].lat, AIRPORT_COORDS['MAO'].lng],
        [AIRPORT_COORDS['GRU'].lat, AIRPORT_COORDS['GRU'].lng],
      ];
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (viewMode === 'simulation' && activeRouteId) {
      // Zoom to fit current simulated route
      const route = AIRPORT_ROUTES.find(r => r.id === activeRouteId);
      if (route) {
        const bounds = route.path.map(iata => {
          const coord = AIRPORT_COORDS[iata];
          return coord ? [coord.lat, coord.lng] as [number, number] : null;
        }).filter(b => b !== null) as [number, number][];

        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [80, 80] });
        }
      }
    }
  }, [viewMode, activeRouteId]);

  // Update map layers dynamically when filters or selections change
  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // Check if an IATA code is visible under current filters
    const isNodeVisible = (iata: string) => {
      const meta = AIRPORTS_METADATA[iata];
      if (!meta) return false;
      const matchesSearch = searchQuery
        ? iata.toLowerCase().includes(searchQuery.toLowerCase()) ||
          AIRPORT_COORDS[iata]?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meta.cidade.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesRegion = activeRegs.has(meta.regiao);
      const matchesDegree = meta.grau >= minDegree;
      return matchesSearch && matchesRegion && matchesDegree;
    };

    // MODE 1: SHORTEST PATH TREE (Árvore de Percurso)
    if (viewMode === 'shortest') {
      // Draw REC-POA and MAO-GRU routes
      AIRPORT_ROUTES.forEach((route) => {
        if (route.id !== 'rec-poa' && route.id !== 'mao-gru') return;

        // Trace paths with curves
        for (let i = 0; i < route.path.length - 1; i++) {
          const src = route.path[i];
          const dest = route.path[i + 1];
          const c1 = AIRPORT_COORDS[src];
          const c2 = AIRPORT_COORDS[dest];

          if (c1 && c2) {
            const arcPoints = getArcPoints(c1.lat, c1.lng, c2.lat, c2.lng);
            // Shadow thick route line
            L.polyline(arcPoints, {
              color: route.color,
              weight: 8,
              opacity: 0.3,
            }).addTo(layers);

            // Glowing main flow line
            L.polyline(arcPoints, {
              color: route.color,
              weight: 3,
              opacity: 0.9,
              className: 'flow',
            }).addTo(layers);
          }
        }

        // Draw only nodes in the path tree
        route.path.forEach((iata) => {
          const coord = AIRPORT_COORDS[iata];
          const meta = AIRPORTS_METADATA[iata];
          if (!coord || !meta) return;

          const size = 12;
          const html = `<div style="width:${size}px; height:${size}px; border-radius:50%; background-color:${route.color}; border:2px solid #fff; box-shadow:0 0 10px ${route.color};"></div>`;

          const customIcon = L.divIcon({
            html,
            className: '',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          const marker = L.marker([coord.lat, coord.lng], { icon: customIcon }).addTo(layers);
          
          const tooltipContent = `
            <div class="font-bold text-[10px] text-white">${iata} - ${coord.name}</div>
            <div class="text-[9px] text-slate-400">Região: <span style="color: ${getRegionColor(meta.regiao)}; font-weight:700;">${meta.regiao}</span></div>
          `;

          marker.bindTooltip(tooltipContent, {
            permanent: true,
            direction: 'top',
            offset: [0, -10],
            className: 'custom-path-tooltip',
          });
        });
      });
      return;
    }

    // MODE 2 & 3: COMPLETE NETWORK & ROUTE SIMULATION
    // 1. Draw Network Edges
    AIRPORTS_EDGES.forEach((edge) => {
      const srcVis = isNodeVisible(edge.source);
      const destVis = isNodeVisible(edge.target);

      if (srcVis && destVis) {
        const coord1 = AIRPORT_COORDS[edge.source];
        const coord2 = AIRPORT_COORDS[edge.target];

        if (coord1 && coord2) {
          const isHighlighted = selectedIata === edge.source || selectedIata === edge.target;
          
          let color = '#475569';
          let weight = 0.8;
          let opacity = viewMode === 'simulation' ? 0.08 : 0.22; // dim background for simulation

          if (viewMode === 'complete' && selectedIata) {
            if (isHighlighted) {
              const other = edge.source === selectedIata ? edge.target : edge.source;
              const otherMeta = AIRPORTS_METADATA[other];
              color = getRegionColor(otherMeta.regiao);
              weight = 2.0;
              opacity = 0.75;
            } else {
              opacity = 0.04;
            }
          }

          L.polyline([[coord1.lat, coord1.lng], [coord2.lat, coord2.lng]], {
            color,
            weight,
            opacity,
          }).addTo(layers);
        }
      }
    });

    // 2. Draw Dijkstra simulated flight path (Bezier arcs)
    if (viewMode === 'simulation' && activeRouteId) {
      const route = AIRPORT_ROUTES.find((r) => r.id === activeRouteId);
      if (route) {
        for (let i = 0; i < route.path.length - 1; i++) {
          const src = route.path[i];
          const dest = route.path[i + 1];
          const c1 = AIRPORT_COORDS[src];
          const c2 = AIRPORT_COORDS[dest];

          if (c1 && c2) {
            const arcPoints = getArcPoints(c1.lat, c1.lng, c2.lat, c2.lng);
            // Thick background glowing path
            L.polyline(arcPoints, {
              color: route.color,
              weight: 8,
              opacity: 0.3,
            }).addTo(layers);

            // Flow line
            L.polyline(arcPoints, {
              color: route.color,
              weight: 3.5,
              opacity: 0.95,
              className: 'flow',
            }).addTo(layers);
          }
        }
      }
    }

    // 3. Render Node Markers
    Object.keys(AIRPORTS_METADATA).forEach((iata) => {
      const coord = AIRPORT_COORDS[iata];
      const meta = AIRPORTS_METADATA[iata];
      if (!coord || !meta) return;

      const isVis = isNodeVisible(iata);
      const color = getRegionColor(meta.regiao);
      const size = Math.max(12, 6 + meta.grau * 0.9);
      const isSel = selectedIata === iata;

      // In simulation mode, dim non-active route nodes
      let isRouteNode = true;
      if (viewMode === 'simulation' && activeRouteId) {
        const route = AIRPORT_ROUTES.find(r => r.id === activeRouteId);
        isRouteNode = route ? route.path.includes(iata) : true;
      }

      const html = isVis
        ? `<div class="airport-node transition-all duration-200" style="width: ${size}px; height: ${size}px; background-color: ${color}; box-shadow: 0 0 ${size / 2}px ${color}; border: ${isSel ? '2px solid white' : 'none'}; opacity: ${isRouteNode ? 1 : 0.25};"></div>`
        : `<div class="airport-node opacity-[0.15]" style="width: 8px; height: 8px; background-color: #475569;"></div>`;

      const customIcon = L.divIcon({
        html,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([coord.lat, coord.lng], {
        icon: customIcon,
        zIndexOffset: isVis ? (isRouteNode ? meta.grau * 10 + 100 : meta.grau * 10) : 0,
      }).addTo(layers);

      const tooltipContent = `
        <div class="tt-title font-bold text-xs text-white">${coord.name} (${iata})</div>
        <div class="text-[10px] text-slate-400 mt-1">Cidade: <span style="color: #cbd5e1">${meta.cidade}</span></div>
        <div class="text-[10px] text-slate-400">Região: <span style="color: ${color}; font-weight: 700;">${meta.regiao}</span></div>
        <div class="text-[10px] text-slate-400">Grau de Conectividade: <span style="color: #a855f7; font-weight: 700;">${meta.grau}</span></div>
        <div class="text-[10px] text-slate-400">Densidade Local (Ego): <span style="color: #34d399; font-weight: 700;">${meta.densidade.toFixed(4)}</span></div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        opacity: 0.95,
        offset: [0, -10],
      });

      marker.on('click', () => {
        if (viewMode === 'simulation' && activeRouteId) return; // ignore selection during simulation
        if (selectedIata === iata) {
          onSelectIata(null);
        } else {
          onSelectIata(iata);
        }
      });
    });
  }, [searchQuery, activeRegs, minDegree, selectedIata, activeRouteId, viewMode]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Embedded Route Highlight Sidebar inside Map area (Simulation mode only) */}
      {viewMode === 'simulation' && (
        <div className="absolute bottom-4 left-4 z-[999] bg-slate-950/85 backdrop-blur-md border border-slate-800 p-3 rounded-xl max-w-[240px] flex flex-col gap-2 shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Simulador de Rotas
            </span>
            {activeRouteId && (
              <button
                onClick={() => setActiveRouteId('')}
                className="text-[9px] text-pink-400 hover:underline font-semibold cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto scrollbar-thin">
            {AIRPORT_ROUTES.map((route) => {
              const isActive = activeRouteId === route.id;
              return (
                <button
                  key={route.id}
                  onClick={() => setActiveRouteId(isActive ? '' : route.id)}
                  className={`w-full text-left p-1.5 rounded border text-[9px] cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-900 border-sky-500 text-sky-400 font-bold'
                      : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{route.label}</span>
                    <span className="font-mono text-slate-500 font-medium">Custo: {route.cost.toFixed(2)}h</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating map info legend */}
      <div className="absolute bottom-4 right-4 z-[999] bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[9px] text-slate-400 shadow-xl max-w-[280px]">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span>
          {viewMode === 'shortest'
            ? 'Visualizando a Árvore de Percursos obrigatórios REC→POA e MAO→GRU.'
            : 'Use o scroll para zoom. Clique nos aeroportos para ver suas conexões.'}
        </span>
      </div>
    </div>
  );
};

