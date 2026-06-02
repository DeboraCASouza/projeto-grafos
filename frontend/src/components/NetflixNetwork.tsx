import React, { useEffect, useRef, useState } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import type { NetflixNode, NetflixEdge } from '../data/netflixData';
import { Activity, Minimize2, Info } from 'lucide-react';

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
        title: `<b>${n.label}</b><br/>IMDb: ${n.imdb}<br/>Ano: ${n.ano}<br/>País: ${n.pais}`,
      };
    });

    const visEdges = edges.map((e) => {
      const isHighlighted = selectedNode && (e.from === selectedNode.id || e.to === selectedNode.id);
      return {
        from: e.from,
        to: e.to,
        width: e.width || 2,
        color: isHighlighted 
          ? { color: '#f43f5e', opacity: 0.9 }
          : { color: e.width >= 8 ? '#cba6f7' : '#334155', opacity: 0.4 },
        title: e.title,
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
      networkRef.current.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
    }
  };

  return (
    <div className="relative w-full h-[550px] bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden shadow-inner">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setPhysicsEnabled(!physicsEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            physicsEnabled
              ? 'bg-purple-500/10 border-purple-500 text-purple-400'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Alternar simulação física de gravidade/atração"
        >
          <Activity className="w-3.5 h-3.5" />
          {physicsEnabled ? 'Física Ligada' : 'Física Pausada'}
        </button>

        <button
          onClick={handleFit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          Enquadrar
        </button>
      </div>

      {/* Selected Node overlay */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-2xl z-10 flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-bold text-white">{selectedNode.label}</h4>
            <button 
              onClick={() => onSelectNode(null)} 
              className="text-slate-500 hover:text-white text-xs"
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
