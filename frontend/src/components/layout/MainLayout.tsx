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
import { NotificationBell } from '../ui/NotificationBell';

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
      {/* Frutiger Aero Background - Sky gradient with nature feel */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            linear-gradient(
              180deg, 
              #4aa8d8 0%, 
              #6ec6e6 15%,
              #8ad4ef 30%,
              #a8e4f8 50%,
              #c5eefa 70%,
              #e0f5fc 85%,
              #f0faff 100%
            )
          `,
        }}
      />

      {/* Cloud-like decorative elements */}
      <div 
        className="fixed top-10 left-1/4 w-64 h-32 rounded-full opacity-40 blur-3xl"
        style={{ background: 'rgba(255, 255, 255, 0.8)' }}
      />
      <div 
        className="fixed top-20 right-1/3 w-48 h-24 rounded-full opacity-30 blur-2xl"
        style={{ background: 'rgba(255, 255, 255, 0.9)' }}
      />
      <div 
        className="fixed bottom-20 left-1/3 w-80 h-40 rounded-full opacity-20 blur-3xl"
        style={{ background: 'rgba(255, 255, 255, 0.7)' }}
      />

      {/* Floating orbs - Aero style */}
      <div className="orb orb-cyan w-80 h-80 -top-20 -left-20 fixed" style={{ animationDelay: '0s' }} />
      <div className="orb orb-blue w-96 h-96 top-1/3 -right-32 fixed" style={{ animationDelay: '2s' }} />
      <div className="orb orb-green w-64 h-64 bottom-20 left-1/4 fixed" style={{ animationDelay: '4s' }} />

      {/* Decorative bubbles */}
      <div className="bubble w-8 h-8 fixed top-32 right-1/4 opacity-60" style={{ animationDelay: '1s' }} />
      <div className="bubble w-5 h-5 fixed top-48 right-1/3 opacity-50" style={{ animationDelay: '2s' }} />
      <div className="bubble w-6 h-6 fixed bottom-40 right-1/4 opacity-40" style={{ animationDelay: '3s' }} />

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-2xl glass-card"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6 text-sky-800" />
        ) : (
          <Menu className="w-6 h-6 text-sky-800" />
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
        <div className="h-full m-3 flex flex-col aero-sidebar relative">
          {/* Logo */}
          <div className={`p-4 flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} relative z-10`}>
            <div className="icon-sphere w-12 h-12 flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white relative z-10" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-sky-900">
                  TaskFlow
                </h1>
                <p className="text-xs text-sky-700">
                  Aero Edition
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 relative z-10">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center rounded-2xl transition-all duration-200
                  ${sidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'}
                  ${isActive 
                    ? 'text-white nav-item-active' 
                    : 'text-sky-800 hover:bg-white/30'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-semibold">{item.label}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/40 relative z-10">
            <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
              <div className="icon-sphere-green w-10 h-10 flex-shrink-0 text-sm font-bold text-white flex items-center justify-center">
                <span className="relative z-10">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sky-900">
                    {user?.name}
                  </p>
                  <p className="text-xs truncate text-sky-700">
                    {user?.totalPoints || 0} pontos
                  </p>
                </div>
              )}
            </div>

            <div className={`mt-3 flex ${sidebarOpen ? 'gap-2' : 'flex-col gap-2 items-center'}`}>
              <NavLink
                to="/profile"
                className={`flex items-center justify-center gap-2 rounded-xl hover:bg-white/30 transition-colors text-sky-700 ${sidebarOpen ? 'flex-1 px-3 py-2' : 'p-2'}`}
              >
                <User className="w-4 h-4" />
                {sidebarOpen && <span className="text-sm font-medium">Perfil</span>}
              </NavLink>
              <button
                onClick={handleLogout}
                className={`flex items-center justify-center gap-2 rounded-xl hover:bg-red-200/50 transition-colors text-red-600 ${sidebarOpen ? 'flex-1 px-3 py-2' : 'p-2'}`}
              >
                <LogOut className="w-4 h-4" />
                {sidebarOpen && <span className="text-sm font-medium">Sair</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Collapse button (desktop only) - Outside the overflow container */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full items-center justify-center icon-sphere z-50"
        >
          <ChevronLeft className={`w-4 h-4 text-white transition-transform relative z-10 ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-sky-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main 
        className={`
          min-h-screen transition-all duration-300 
          ${sidebarOpen ? 'lg:ml-[272px]' : 'lg:ml-[88px]'}
          pt-16 lg:pt-0
        `}
      >
        {/* Top bar with notifications */}
        <div className="hidden lg:flex items-center justify-end p-4 lg:p-6 lg:pb-0">
          <NotificationBell />
        </div>

        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-3 right-4 z-40">
          <NotificationBell />
        </div>

        <div className="p-4 lg:p-8 lg:pt-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
