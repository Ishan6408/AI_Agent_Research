import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Database, Activity, Search, Users, ShieldAlert, BarChart, Menu, X } from 'lucide-react';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Experiment Analysis',
    items: [
      { name: 'Experiments', path: '/experiments', icon: Activity },
      { name: 'Behavioral Logs', path: '/behavior', icon: Search },
      { name: 'Analytics', path: '/analytics', icon: BarChart },
      { name: 'Agent Directory', path: '/agents', icon: Users },
      { name: 'Auditor Matrix', path: '/auditor', icon: ShieldAlert }
    ]
  },
  {
    title: 'Data & Resources',
    items: [
      { name: 'Raw Dataset', path: '/dataset', icon: Database },
      { name: 'Research Reports', path: '/reports', icon: FileText }
    ]
  }
];

const MainLayout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-surface-alt font-sans text-text-main antialiased overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-surface border-b border-border p-4 z-20">
        <div className="font-serif font-bold text-lg text-brand-primary leading-tight truncate pr-4">
          Do AI Agents Cheat?
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-brand-secondary hover:bg-secondary rounded-md"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${mobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-[280px] h-full flex-shrink-0 border-r border-border bg-surface shadow-sm z-10 absolute md:static top-[65px] bottom-0
      `}>
        {/* Brand */}
        <div className="hidden md:block p-6 border-b border-border">
          <div className="font-serif font-bold text-xl text-brand-primary leading-tight mb-1">
            Do AI Agents Cheat Under Pressure?
          </div>
          <div className="text-text-muted text-xs uppercase tracking-wider font-semibold">
            Emergent Deception Telemetry
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 pb-24 md:pb-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {group.title}
              </h3>
              <nav className="space-y-1">
                {group.items.map((link) => {
                  const isActive = location.pathname === link.path;
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={() =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-accent-blue/10 text-accent-blue'
                            : 'text-brand-secondary hover:bg-secondary hover:text-brand-primary'
                        }`
                      }
                    >
                      <Icon size={18} className={isActive ? 'text-accent-blue' : 'text-text-muted'} />
                      <span>{link.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="hidden md:block p-4 border-t border-border bg-surface text-xs text-text-muted">
          <div className="flex justify-between items-center">
            <span>Research Portal v2.4</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-green"></span>
              Live Data
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-surface-alt relative z-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-4 md:p-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
