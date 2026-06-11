import React, { useState } from 'react';
import { Film, LayoutDashboard, FileText, BookOpen, Cpu, BarChart3, Map } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GROUPS = [
  {
    label: null,
    tabs: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-purple-400' },
    ],
  },
  {
    label: 'Parte 1',
    color: 'text-sky-500',
    tabs: [
      { id: 'parte1',           label: 'Mapa',         icon: Map,       color: 'text-sky-400' },
      { id: 'parte1_stats',     label: 'Estatísticas', icon: BarChart3, color: 'text-emerald-400' },
      { id: 'parte1_narrativa', label: 'Narrativa',    icon: BookOpen,  color: 'text-teal-400' },
    ],
  },
  {
    label: 'Parte 2',
    color: 'text-rose-500',
    tabs: [
      { id: 'parte2',           label: 'Rede',        icon: Film,         color: 'text-rose-400' },
      { id: 'parte2_stats',     label: 'Estatísticas', icon: BarChart3,   color: 'text-pink-400' },
      { id: 'parte2_benchmark', label: 'Benchmark',   icon: Cpu,          color: 'text-amber-400' },
      { id: 'parte2_narrativa', label: 'Narrativa',   icon: BookOpen,      color: 'text-orange-400' },
    ],
  },
  {
    label: null,
    tabs: [
      { id: 'docs', label: 'Docs', icon: FileText, color: 'text-slate-400' },
    ],
  },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-800">
      {/* Main bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <span className="text-base font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-transparent tracking-tight shrink-0">
          Projeto Garotas
        </span>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
          {GROUPS.map((group, gi) => (
            <React.Fragment key={gi}>
              {gi > 0 && <span className="w-px h-5 bg-slate-700 mx-1 shrink-0" />}
              {group.label && (
                <span className={`text-[9px] font-extrabold uppercase tracking-widest ${group.color} px-1 shrink-0`}>
                  {group.label}
                </span>
              )}
              {group.tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? tab.color : 'text-slate-500'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden flex flex-col gap-1 p-2 rounded-lg border border-slate-700 bg-slate-900"
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-slate-300 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block w-5 h-0.5 bg-slate-300 transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-slate-300 transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-3 flex flex-col gap-3">
          {GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className={`text-[9px] font-extrabold uppercase tracking-widest ${group.color} mb-2 mt-1`}>
                  {group.label}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {group.tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setOpen(false); }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 border border-slate-800'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : 'text-slate-500'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};
