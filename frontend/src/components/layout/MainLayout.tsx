import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projetos' },
  { to: '/tasks', icon: CheckSquare, label: 'Tarefas' },
  { to: '/gamification', icon: Trophy, label: 'Gamificacao' },
];

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 30%, #E0F7FA 60%, #F0FFF0 100%)',
        }}
      />

      {/* Decorative orbs */}
      <div className="orb w-96 h-96 bg-cyan-200/20 -top-32 -left-32 fixed" style={{ animationDelay: '0s' }} />
      <div className="orb w-80 h-80 bg-green-200/20 top-1/2 -right-20 fixed" style={{ animationDelay: '3s' }} />

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl glass-card"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" style={{ color: '#1a365d' }} />
        ) : (
          <Menu className="w-6 h-6" style={{ color: '#1a365d' }} />
        )}
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full z-40 transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div 
          className="h-full m-4 rounded-2xl flex flex-col"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
          }}
        >
          {/* Logo */}
          <div className="p-4 flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shine"
              style={{
                background: 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)',
                boxShadow: '0 4px 15px rgba(2, 136, 209, 0.3)',
              }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#1a365d' }}>
                  TaskFlow
                </h1>
                <p className="text-xs" style={{ color: '#4a6fa5' }}>
                  Aero Edition
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'text-white' 
                    : 'hover:bg-white/40'
                  }
                `}
                style={({ isActive }) => isActive ? {
                  background: 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)',
                  boxShadow: '0 4px 15px rgba(2, 136, 209, 0.3)',
                } : { color: '#1a365d' }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/30">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{
                  background: 'linear-gradient(180deg, #81C784 0%, #388E3C 100%)',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: '#1a365d' }}>
                    {user?.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#4a6fa5' }}>
                    {user?.totalPoints || 0} pontos
                  </p>
                </div>
              )}
            </div>

            <div className={`mt-3 flex ${sidebarOpen ? 'gap-2' : 'flex-col gap-2'}`}>
              <NavLink
                to="/profile"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-white/40 transition-colors"
                style={{ color: '#4a6fa5' }}
              >
                <User className="w-4 h-4" />
                {sidebarOpen && <span className="text-sm">Perfil</span>}
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-red-100/50 transition-colors text-red-600"
              >
                <LogOut className="w-4 h-4" />
                {sidebarOpen && <span className="text-sm">Sair</span>}
              </button>
            </div>
          </div>

          {/* Collapse button (desktop only) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)',
              boxShadow: '0 2px 8px rgba(2, 136, 209, 0.3)',
            }}
          >
            <ChevronLeft className={`w-4 h-4 text-white transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main 
        className={`
          min-h-screen transition-all duration-300 
          ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-28'}
          pt-16 lg:pt-0
        `}
      >
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
