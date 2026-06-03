import React, { useEffect, useRef, useState } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import type { NetflixNode, NetflixEdge } from '../data/netflixData';
import { Activity, Info, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';

interface NetflixNetworkProps {
  nodes: NetflixNode[];
  edges: NetflixEdge[];
  onSelectNode: (node: NetflixNode | null) => void;
  selectedNode: NetflixNode | null;
}

export const NetflixNetwork: React.FC<NetflixNetworkProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);

  const getCountryColor = (paisStr: string) => {
    const COUNTRY_COLORS: Record<string, string> = {
      "USA": "#60a5fa",
      "UK": "#f472b6",
      "South Korea": "#34d399",
      "Brazil": "#fbbf24",
      "Germany": "#a855f7",
      "Canada": "#fb7185",
      "France": "#22d3ee",
      "Japan": "#f87171"
    };

    if (!paisStr || paisStr === '-') return '#94a3b8';
    const parts = paisStr.split(/[\/,]/);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i].trim();
      if (COUNTRY_COLORS[p]) return COUNTRY_COLORS[p];
    }
    return '#94a3b8';
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert data to vis format
    const visNodes = nodes.map((n) => {
      const color = getCountryColor(n.pais);

      // Create DOM element for the tooltip
      const tooltipEl = document.createElement('div');
      tooltipEl.className = 'flex flex-col gap-1';
      tooltipEl.innerHTML = `
        <div style="font-weight: 700; color: #ffffff; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 4px; font-size: 12px; font-family: 'Outfit', sans-serif;">${n.label}</div>
        <div style="color: #94a3b8; font-family: 'Outfit', sans-serif;">IMDb: <strong style="color: #fbbf24;">${n.imdb}</strong></div>
        <div style="color: #94a3b8; font-family: 'Outfit', sans-serif;">Ano: <strong style="color: #f1f5f9;">${n.ano}</strong></div>
        <div style="color: #94a3b8; font-family: 'Outfit', sans-serif;">País: <strong style="color: #60a5fa;">${n.pais}</strong></div>
      `;

      return {
        id: n.id,
        label: n.label,
        value: n.value,
        size: Math.max(10, n.size * 1.05),
        color: {
          background: color,
          border: color,
          highlight: { background: '#f43f5e', border: '#ffffff' },
          hover: { background: color, border: '#ffffff' },
        },
        font: { color: '#f1f5f9', size: 12, face: 'Outfit' },
        title: tooltipEl,
      };
    });

    const visEdges = edges.map((e) => {
      const isHighlighted = selectedNode && (e.from === selectedNode.id || e.to === selectedNode.id);

      // Create DOM element for the edge tooltip
      const tooltipEl = document.createElement('div');
      tooltipEl.className = 'flex flex-col gap-1';
      tooltipEl.innerHTML = `
        <div style="font-weight: 700; color: #ffffff; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 4px; font-size: 11px; font-family: 'Outfit', sans-serif;">Atributos Compartilhados</div>
        <div style="color: #a7f3d0; font-size: 10px; max-width: 220px; white-space: normal; word-wrap: break-word; font-family: 'Outfit', sans-serif; line-height: 1.3;">${e.title}</div>
      `;

      return {
        from: e.from,
        to: e.to,
        width: e.width || 2,
        color: isHighlighted 
          ? { color: '#f43f5e', opacity: 0.9 }
          : { color: e.width >= 8 ? '#cba6f7' : '#334155', opacity: 0.4 },
        title: tooltipEl,
      };
    });

    const data = {
      nodes: new DataSet<any>(visNodes),
      edges: new DataSet<any>(visEdges),
    };

    const options = {
      nodes: {
        shape: 'dot',
        scaling: {
          min: 8,
          max: 30,
        },
        borderWidth: 1.5,
      },
      edges: {
        color: {
          color: '#334155',
          highlight: '#f43f5e',
          hover: '#60a5fa',
        },
        smooth: {
          type: 'continuous',
          forceDirection: 'none',
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        selectable: true,
        selectConnectedEdges: true,
      },
      physics: {
        enabled: physicsEnabled,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.1,
        },
        stabilization: {
          enabled: true,
          iterations: 150,
          fit: true,
        },
      },
    };

    const network = new Network(containerRef.current, data as any, options as any);
    networkRef.current = network;

    // Events
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const clickedId = params.nodes[0];
        const originalNode = nodes.find((n) => n.id === clickedId) || null;
        onSelectNode(originalNode);
      } else {
        onSelectNode(null);
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, edges, physicsEnabled]);

  // Adjust camera to fit content
  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
    }
  };

  // Programmatic movement pan
  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!networkRef.current) return;
    const offset = 100;
    const pos = networkRef.current.getViewPosition();
    let { x, y } = pos;
    if (direction === 'up') y -= offset;
    if (direction === 'down') y += offset;
    if (direction === 'left') x -= offset;
    if (direction === 'right') x += offset;
    networkRef.current.moveTo({
      position: { x, y },
      animation: { duration: 150, easingFunction: 'linear' }
    });
  };

  // Programmatic zoom
  const handleZoom = (type: 'in' | 'out') => {
    if (!networkRef.current) return;
    const scale = networkRef.current.getScale();
    const newScale = type === 'in' ? scale * 1.25 : scale * 0.8;
    networkRef.current.moveTo({
      scale: newScale,
      animation: { duration: 150, easingFunction: 'linear' }
    });
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setPhysicsEnabled(!physicsEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            physicsEnabled
              ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-md'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Alternar simulação física de gravidade/atração"
        >
          <Activity className="w-3.5 h-3.5" />
          {physicsEnabled ? 'Física Ligada' : 'Física Pausada'}
        </button>
      </div>

      {/* Vertical Navigation Bar on the Right */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1 bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-xl p-1 shadow-2xl select-none">
        <button
          onClick={() => handleMove('up')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition-all"
          title="Mover para cima"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleMove('down')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition-all"
          title="Mover para baixo"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleMove('left')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition-all"
          title="Mover para esquerda"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleMove('right')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition-all"
          title="Mover para direita"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('in')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition-all"
          title="Aproximar zoom"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition-all"
          title="Afastar zoom"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 cursor-pointer transition-all"
          title="Enquadrar conteúdo"
        >
          {/* Custom square box matching screenshot */}
          <div className="w-3.5 h-3.5 border-2 border-slate-400 rounded-sm" />
        </button>
      </div>

      {/* Selected Node overlay */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-2xl z-10 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-bold text-white">{selectedNode.label}</h4>
            <button 
              onClick={() => onSelectNode(null)} 
              className="text-slate-500 hover:text-white text-xs cursor-pointer"
            >
              Fechar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>
              <span>IMDb:</span> <strong className="text-amber-400">{selectedNode.imdb}</strong>
            </div>
            <div>
              <span>Ano:</span> <strong className="text-slate-200">{selectedNode.ano}</strong>
            </div>
            <div className="col-span-2">
              <span>País:</span> <strong className="text-sky-400">{selectedNode.pais}</strong>
            </div>
            <div className="col-span-2">
              <span>Grau de Semelhança:</span> <strong className="text-purple-400">{selectedNode.value} conexões</strong>
            </div>
          </div>
        </div>
      )}

      {/* Info indicator */}
      <div className="absolute bottom-4 right-4 bg-slate-900/75 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] text-slate-400">
        <Info className="w-3 h-3 text-sky-400" />
        <span>Arraste para mover • Use scroll para zoom • Clique no nó para ver conexões</span>
      </div>
    </div>
  );
};
