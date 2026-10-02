import { Outlet, NavLink } from 'react-router-dom';

const MainLayout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Experiments', path: '/experiments' },
    { name: 'Agents', path: '/agents' },
    { name: 'Behavior', path: '/behavior' },
    { name: 'Auditor', path: '/auditor' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Dataset', path: '/dataset' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-slate-800">
          AI Agent Research
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-4 py-2 hover:bg-slate-800 transition-colors ${
                      isActive ? 'bg-slate-800 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b flex items-center px-6 shadow-sm">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
