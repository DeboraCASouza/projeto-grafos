import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface AlgoMetric {
  name: string;
  time: number; // ms
  memory: number; // KB
  complexity: string;
  color: string;
}

export const RechartsBenchmark: React.FC = () => {
  const data: AlgoMetric[] = [
    { name: 'BFS', time: 0.1416, memory: 7.45, complexity: 'O(V+E)', color: '#cba6f7' },
    { name: 'DFS', time: 0.2824, memory: 41.47, complexity: 'O(V+E)', color: '#89b4fa' },
    { name: 'Dijkstra', time: 0.4811, memory: 33.27, complexity: 'O(V²)', color: '#f38ba8' },
    { name: 'Bellman-Ford', time: 1.1713, memory: 33.89, complexity: 'O(V·E)', color: '#f9e2af' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
      {/* Time Chart */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          Tempo de Execução Médio (ms)
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  fontFamily: 'Outfit, sans-serif'
                }}
                formatter={(value: any, _: any, props: any) => [
                  `${value} ms (${props.payload.complexity})`,
                  'Tempo Médio'
                ]}
              />
              <Bar dataKey="time" radius={[4, 4, 0, 0]} maxBarSize={45}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
 
      {/* Memory Chart */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          Consumo de Pico de Memória (KB)
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  fontFamily: 'Outfit, sans-serif'
                }}
                formatter={(value: any) => [`${value} KB`, 'Pico de Memória']}
              />
              <Bar dataKey="memory" radius={[4, 4, 0, 0]} maxBarSize={45}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#22d3ee" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
