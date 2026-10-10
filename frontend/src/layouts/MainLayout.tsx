import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Activity, Database, FileText, ShieldAlert, Users, LayoutDashboard, Terminal, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { DatasetSummary, AgentResponse, SystemModelInfo } from '../types/api';

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

  const [datasetSummary, setDatasetSummary] = useState<DatasetSummary | null>(null);
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [modelInfo, setModelInfo] = useState<SystemModelInfo | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, agentsRes, modelRes] = await Promise.all([
          api.getDatasetSummary(),
          api.getAgents(),
          api.getSystemModelInfo()
        ]);
        setDatasetSummary(summaryRes);
        setAgents(agentsRes);
        setModelInfo(modelRes);
      } catch (err) {
        console.error('Failed to fetch telemetry data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-background font-sans text-text-main antialiased overflow-hidden selection:bg-accent-mint/30">
      
      {/* Technical Top Header */}
      <header className="h-10 border-b border-border bg-surface flex items-center justify-between px-4 text-xs font-mono shrink-0 relative z-50">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-1 text-text-muted hover:text-brand-primary focus:outline-none focus:ring-1 focus:ring-accent-mint"
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
          <span>REC: [{datasetSummary?.total_experiments ?? 0}]</span>
          <span className="hidden sm:inline">AGENTS: [{agents.length}]</span>
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

        {/* Fixed 260px Sidebar */}
        <aside className={`
          w-[260px] flex-shrink-0 border-r border-border bg-surface-alt flex-col
          absolute md:relative z-40 h-full transition-transform duration-200 ease-in-out
          ${isMobileNavOpen ? 'translate-x-0 flex' : '-translate-x-full md:translate-x-0 hidden md:flex'}
        `}>
          {/* Brand/Identity */}
          <div className="p-5 border-b border-border flex justify-between items-center">
            <div>
              <div className="font-mono font-bold text-lg text-brand-primary tracking-tighter mb-1 uppercase">
                AI_Deception_Lab
              </div>
              <div className="text-text-muted text-[10px] font-mono tracking-widest uppercase">
                v2.4.0-stable // TS
              </div>
            </div>
            <button 
              className="md:hidden p-1 text-text-muted hover:text-brand-primary"
              onClick={() => setIsMobileNavOpen(false)}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {navGroups.map((group) => (
              <div key={group.title}>
                <h3 className="px-2 mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted">
                  {group.title}
                </h3>
                <nav className="space-y-[2px]">
                  {group.items.map((link) => {
                    const isActive = location.pathname === link.path;
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={() =>
                          `flex items-center gap-3 px-2 py-1.5 text-sm font-mono transition-colors border border-transparent focus:outline-none focus:ring-1 focus:ring-accent-mint ${
                            isActive
                              ? 'bg-accent-mint/10 text-accent-mint border-accent-mint/20'
                              : 'text-brand-secondary hover:bg-white/5 hover:text-brand-primary hover:border-border'
                          }`
                        }
                      >
                        <Icon size={14} className={isActive ? 'text-accent-mint' : 'text-text-muted'} />
                        <span>{link.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-border bg-surface-alt text-[10px] font-mono text-text-muted space-y-1">
            <div className="flex justify-between">
              <span>DATA_LINK</span>
              <span className="text-accent-mint">CONNECTED</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative z-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
