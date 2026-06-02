import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DegreeDataPoint {
  degree: number;
  count: number;
}

interface RechartsDegreeDistProps {
  data: DegreeDataPoint[];
}

export const RechartsDegreeDist: React.FC<RechartsDegreeDistProps> = ({ data }) => {
  // Sort by degree value
  const sortedData = [...data].sort((a, b) => a.degree - b.degree);

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="degree"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '12px',
              fontFamily: 'Outfit, sans-serif'
            }}
            cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
            labelFormatter={(label) => `Grau: ${label} conexões`}
          />
          <Bar
            dataKey="count"
            fill="#a855f7"
            radius={[4, 4, 0, 0]}
            name="Número de Shows"
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
