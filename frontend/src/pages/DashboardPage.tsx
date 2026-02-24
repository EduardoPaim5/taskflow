import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Zap,
  FolderKanban,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2,
  Target,
  Flame
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gamificationService, projectService, taskService } from '../services';
import type { GamificationProfile, Project, Task } from '../types';

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState({ todo: 0, doing: 0, done: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileData, projectsData, tasksData] = await Promise.all([
        gamificationService.getProfile().catch(() => null),
        projectService.getAll(0, 5).catch(() => ({ content: [] })),
        taskService.getAll({ size: 100 }).catch(() => ({ content: [] })),
      ]);
      
      setProfile(profileData);
      setRecentProjects(projectsData.content);
      setRecentTasks(tasksData.content.slice(0, 5));
      
      // Calculate task stats
      const stats = { todo: 0, doing: 0, done: 0 };
      tasksData.content.forEach((task: Task) => {
        if (task.status === 'TODO') stats.todo++;
        else if (task.status === 'DOING') stats.doing++;
        else if (task.status === 'DONE') stats.done++;
      });
      setTaskStats(stats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Pontos',
      value: profile?.totalPoints || user?.totalPoints || 0,
      icon: Trophy,
      sphereClass: 'icon-sphere-orange',
    },
    {
      label: 'Nivel',
      value: profile?.levelName || user?.levelName || 'Iniciante',
      icon: Zap,
      sphereClass: 'icon-sphere',
    },
    {
      label: 'Tarefas',
      value: profile?.tasksCompleted || taskStats.done,
      icon: Target,
      sphereClass: 'icon-sphere-green',
    },
    {
      label: 'Streak',
      value: `${profile?.currentStreak || 0} dias`,
      icon: Flame,
      sphereClass: 'icon-sphere-orange',
    },
  ];

  const quickActions = [
    { 
      icon: FolderKanban, 
      label: 'Projetos', 
      description: `${recentProjects.length} projeto${recentProjects.length !== 1 ? 's' : ''}`,
      to: '/projects',
      sphereClass: 'icon-sphere',
    },
    { 
      icon: CheckCircle2, 
      label: 'Tarefas', 
      description: `${taskStats.doing} em progresso`,
      to: '/tasks',
      sphereClass: 'icon-sphere-green',
    },
    { 
      icon: TrendingUp, 
      label: 'Ranking', 
      description: 'Ver posicao no ranking',
      to: '/gamification',
      sphereClass: 'icon-sphere-orange',
    },
    { 
      icon: Calendar, 
      label: 'Atividade', 
      description: 'Ver heatmap',
      to: '/gamification',
      sphereClass: 'icon-sphere-purple',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="icon-sphere w-16 h-16 mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-white relative z-10" />
          </div>
          <p className="text-sky-700 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const userLevel = profile?.level || user?.level || 1;
  const pointsProgress = profile?.pointsToNextLevel 
    ? (profile.totalPoints / (profile.totalPoints + profile.pointsToNextLevel)) * 100 
    : 45;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-sky-900">
          Dashboard
        </h1>
        <p className="text-sky-700">
          Bem-vindo de volta, {user?.name?.split(' ')[0]}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="stat-card hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div className={`${stat.sphereClass} w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0`}>
                <stat.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white relative z-10" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium mb-1 truncate text-sky-600">
                  {stat.label}
                </p>
                <p className="text-xl lg:text-2xl font-bold truncate text-sky-900">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Banner - Glossy Aero style */}
      <div 
        className="rounded-3xl p-6 lg:p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 30%, #0284c7 70%, #0369a1 100%)',
          boxShadow: '0 12px 40px rgba(14, 165, 233, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        {/* Glossy overlay */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
            borderRadius: '24px 24px 50% 50%',
          }}
        />
        
        {/* Decorative bubbles */}
        <div className="absolute top-6 right-12 w-16 h-16 rounded-full bg-white/15" />
        <div className="absolute bottom-6 right-32 w-10 h-10 rounded-full bg-white/10" />
        <div className="absolute top-1/2 right-48 w-6 h-6 rounded-full bg-white/20" />

        <div className="relative z-10">
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Continue sua jornada!
          </h2>
          <p className="text-white/90 max-w-2xl mb-4 text-sm lg:text-base">
            Voce esta no nivel {userLevel} ({profile?.levelName || user?.levelName || 'Iniciante'}). 
            Continue completando tarefas para subir de nivel e desbloquear badges!
          </p>
          
          {/* Progress bar - Aero style */}
          <div className="max-w-md">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span className="font-medium">{(profile?.totalPoints || user?.totalPoints || 0).toLocaleString()} pontos</span>
              <span>{profile?.pointsToNextLevel ? `${profile.pointsToNextLevel} para proximo nivel` : 'Proximo nivel'}</span>
            </div>
            <div className="progress-aero h-4">
              <div 
                className="progress-aero-fill transition-all duration-500"
                style={{ width: `${pointsProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-sky-600">A Fazer</p>
              <p className="text-3xl font-bold text-sky-900">{taskStats.todo}</p>
            </div>
            <div className="icon-sphere w-12 h-12">
              <CheckCircle2 className="w-6 h-6 text-white relative z-10" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-sky-600">Em Progresso</p>
              <p className="text-3xl font-bold text-amber-500">{taskStats.doing}</p>
            </div>
            <div className="icon-sphere-orange w-12 h-12">
              <Loader2 className="w-6 h-6 text-white relative z-10" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-sky-600">Concluidas</p>
              <p className="text-3xl font-bold text-emerald-500">{taskStats.done}</p>
            </div>
            <div className="icon-sphere-green w-12 h-12">
              <CheckCircle2 className="w-6 h-6 text-white relative z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-sky-900">
          Acesso Rapido
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.to}
              className="stat-card hover:scale-105 transition-all duration-300 group"
            >
              <div className={`${action.sphereClass} w-12 h-12 mb-3`}>
                <action.icon className="w-6 h-6 text-white relative z-10" />
              </div>
              <h3 className="font-bold mb-1 text-sky-900">
                {action.label}
              </h3>
              <p className="text-sm mb-2 text-sky-600">
                {action.description}
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all text-sky-500">
                <span>Acessar</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-sky-900">
              Tarefas Recentes
            </h2>
            <Link 
              to="/tasks" 
              className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all text-sky-500"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="glass-card divide-y divide-sky-200/50">
            {recentTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center gap-4">
                <div 
                  className={`w-3 h-3 rounded-full flex-shrink-0`}
                  style={{
                    background: task.status === 'DONE' 
                      ? 'linear-gradient(180deg, #4ade80 0%, #22c55e 100%)' 
                      : task.status === 'DOING' 
                      ? 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)' 
                      : 'linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%)',
                    boxShadow: task.status === 'DONE' 
                      ? '0 2px 8px rgba(34, 197, 94, 0.5)' 
                      : task.status === 'DOING' 
                      ? '0 2px 8px rgba(245, 158, 11, 0.5)' 
                      : '0 2px 8px rgba(14, 165, 233, 0.5)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sky-900">
                    {task.title}
                  </p>
                  <p className="text-sm truncate text-sky-600">
                    {task.project.name}
                  </p>
                </div>
                <span 
                  className="badge-aero flex-shrink-0"
                  style={{
                    background: task.status === 'DONE' 
                      ? 'linear-gradient(180deg, rgba(74, 222, 128, 0.3) 0%, rgba(34, 197, 94, 0.2) 100%)' 
                      : task.status === 'DOING' 
                      ? 'linear-gradient(180deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%)' 
                      : 'linear-gradient(180deg, rgba(56, 189, 248, 0.3) 0%, rgba(14, 165, 233, 0.2) 100%)',
                    color: task.status === 'DONE' 
                      ? '#16a34a' 
                      : task.status === 'DOING' 
                      ? '#d97706' 
                      : '#0284c7',
                    border: task.status === 'DONE' 
                      ? '1px solid rgba(34, 197, 94, 0.4)' 
                      : task.status === 'DOING' 
                      ? '1px solid rgba(245, 158, 11, 0.4)' 
                      : '1px solid rgba(14, 165, 233, 0.4)',
                  }}
                >
                  {task.status === 'DONE' ? 'Concluido' : task.status === 'DOING' ? 'Em Progresso' : 'A Fazer'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
