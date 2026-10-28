import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Activity, Database, FileText, ShieldAlert, Users, LayoutDashboard, Terminal, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api';
import type { DatasetSummary, AgentResponse, SystemModelInfo } from '../types/api';
import { useApiData } from '../hooks/useApiData';

const navGroups = [
  {
    title: 'SYS.NAV',
    items: [
      { name: 'Telemetry', path: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'EXP.VECTORS',
    items: [
      { name: 'Active Matrix', path: '/experiments', icon: Activity },
      { name: 'Log Stream', path: '/behavior', icon: Terminal },
      { name: 'Analytics', path: '/analytics', icon: Activity },
      { name: 'Entity Profiles', path: '/agents', icon: Users },
      { name: 'Auditor State', path: '/auditor', icon: ShieldAlert }
    ]
  },
  {
    title: 'DATA.ARCHIVE',
    items: [
      { name: 'Raw Output', path: '/dataset', icon: Database },
      { name: 'Synthesized', path: '/reports', icon: FileText }
    ]
  }
];

const MainLayout = () => {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const { data: datasetSummary } = useApiData<DatasetSummary>('dataset/summary', api.getDatasetSummary);
  const { data: agentsData } = useApiData<AgentResponse[]>('agents/list', api.getAgents);
  const { data: modelInfo } = useApiData<SystemModelInfo>('system/model', api.getSystemModelInfo);

  const agents = agentsData || [];

  return (
    <div className="h-screen w-screen flex flex-col bg-background font-sans text-text-main antialiased overflow-hidden selection:bg-accent-mint/30">
      
      {/* Technical Top Header */}
      <header className="h-10 border-b border-border bg-surface flex items-center justify-between px-4 text-xs font-mono shrink-0 relative z-50">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-1 text-text-muted hover:text-brand-primary focus:outline-none focus:ring-1 focus:ring-accent-mint cursor-pointer"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <span className="text-accent-mint flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent-mint rounded-full animate-pulse"></span>
            <span className="hidden sm:inline">[ACTIVE]</span>
          </span>
          {modelInfo && (
            <span className="text-text-muted hidden md:inline-block space-x-6">
              <span>MODEL: {modelInfo.name}</span>
              <span>RUNTIME: {modelInfo.runtime}</span>
              {modelInfo.params && <span>PARAMS: {modelInfo.params}</span>}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-text-muted">
          <span className="tabular-nums font-mono">REC: [{datasetSummary?.total_experiments ?? 0}]</span>
          <span className="hidden sm:inline tabular-nums font-mono">AGENTS: [{agents.length}]</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlay for mobile */}
        {isMobileNavOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside 
          aria-label="Sidebar navigation"
          className={`
            w-64 border-r border-border bg-surface flex flex-col justify-between shrink-0
            fixed md:static inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out
            ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            mt-10 md:mt-0 h-[calc(100vh-2.5rem)] md:h-auto
          `}
        >
          <div className="p-4 space-y-6 overflow-y-auto">
            {/* Branding / Identity */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded bg-surface-alt border border-border flex items-center justify-center font-mono font-bold text-accent-mint text-sm shadow-inner">
                V
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-sm font-bold tracking-wider text-brand-primary">PROJECT_VEIL</span>
                <span className="text-[10px] text-text-muted font-mono tracking-widest uppercase">TELEMETRY SYSTEM</span>
              </div>
            </div>

            {/* Navigation Groups */}
            <nav className="space-y-6">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="px-2 text-[10px] font-mono tracking-widest text-text-muted uppercase mb-2">
                    {group.title}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname.startsWith(item.path);
                      
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileNavOpen(false)}
                          className={({ isActive: linkActive }) => `
                            flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-wide rounded-md transition-all
                            ${linkActive || isActive 
                              ? 'bg-surface-alt text-brand-primary border border-border shadow-xs' 
                              : 'text-text-muted hover:text-brand-primary hover:bg-surface-alt/50 border border-transparent'}
                          `}
                        >
                          <Icon size={14} className={isActive ? 'text-accent-mint' : 'text-text-muted'} />
                          <span>{item.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* System Footer Metadata */}
          <div className="p-4 border-t border-border bg-surface-alt/30 text-[10px] font-mono text-text-muted space-y-2">
            <div className="flex justify-between">
              <span>LATENCY:</span>
              <span className="text-accent-mint tabular-nums">0.04ms</span>
            </div>
            <div className="flex justify-between">
              <span>SECURITY_GATE:</span>
              <span className="text-brand-primary">VERIFIED</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default MainLayout;
