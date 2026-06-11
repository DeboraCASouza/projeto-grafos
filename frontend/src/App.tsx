import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardGeneral } from './pages/DashboardGeneral';
import { Parte1Airports } from './pages/Parte1Airports';
import { Parte1Stats } from './pages/Parte1Stats';
import { Parte1Narrativa } from './pages/Parte1Narrativa';
import { Parte2Netflix } from './pages/Parte2Netflix';
import { Parte2Stats } from './pages/Parte2Stats';
import { Parte2Benchmark } from './pages/Parte2Benchmark';
import { Parte2Narrativa } from './pages/Parte2Narrativa';
import { Documentation } from './pages/Documentation';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-sky-600/5 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl opacity-30" />
      </div>

      {/* Navbar — always visible */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      {activeTab === 'parte1' ? (
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <Parte1Airports />
        </div>
      ) : activeTab === 'parte2' ? (
        <div className="flex-1 min-h-0 w-full overflow-hidden">
          <Parte2Netflix />
        </div>
      ) : (
        <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-4 md:px-8 py-6 mb-12">
          {activeTab === 'dashboard'         && <DashboardGeneral onNavigate={setActiveTab} />}
          {activeTab === 'parte1_stats'      && <Parte1Stats />}
          {activeTab === 'parte1_narrativa'  && <Parte1Narrativa />}
          {activeTab === 'parte2_stats'      && <Parte2Stats />}
          {activeTab === 'parte2_benchmark'  && <Parte2Benchmark />}
          {activeTab === 'parte2_narrativa'  && <Parte2Narrativa />}
          {activeTab === 'docs'              && <Documentation />}
        </main>
      )}

      {/* Footer — only on standard pages */}
      {activeTab !== 'parte1' && activeTab !== 'parte2' && (
        <footer className="w-full border-t border-slate-900 bg-slate-950/60 backdrop-blur-md py-4 text-center text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
          © {new Date().getFullYear()} • Projeto de Teoria dos Grafos • React + TypeScript + TailwindCSS v4
        </footer>
      )}
    </div>
  );
}

export default App;
