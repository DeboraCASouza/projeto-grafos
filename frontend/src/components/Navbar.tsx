import React from 'react';
import { Plane, Film, LayoutDashboard, FileText } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard, color: 'text-purple-400' },
    { id: 'parte1', label: 'Parte 1 — Mapa', icon: Plane, color: 'text-sky-400' },
    { id: 'parte1_stats', label: 'Parte 1 — Estatísticas', icon: FileText, color: 'text-emerald-400' },
    { id: 'parte2', label: 'Parte 2 — Netflix', icon: Film, color: 'text-rose-400' },
    { id: 'docs', label: 'Documentação', icon: FileText, color: 'text-amber-400' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-transparent tracking-tight">
          Projeto Garotas
        </span>
      </div>

      <div className="flex items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                ? 'bg-slate-800 text-white shadow-md shadow-slate-900 border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
            >
              <Icon className={`w-4 h-4 ${tab.color}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
