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
      gradient: 'linear-gradient(180deg, #FFD54F 0%, #FF9800 100%)',
      shadowColor: 'rgba(255, 152, 0, 0.4)',
    },
    {
      label: 'Nivel',
      value: profile?.levelName || user?.levelName || 'Iniciante',
      icon: Zap,
      gradient: 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)',
      shadowColor: 'rgba(2, 136, 209, 0.4)',
    },
    {
      label: 'Tarefas',
      value: profile?.tasksCompleted || taskStats.done,
      icon: Target,
      gradient: 'linear-gradient(180deg, #81C784 0%, #388E3C 100%)',
      shadowColor: 'rgba(56, 142, 60, 0.4)',
    },
    {
      label: 'Streak',
      value: `${profile?.currentStreak || 0} dias`,
      icon: Flame,
      gradient: 'linear-gradient(180deg, #FF8A65 0%, #E64A19 100%)',
      shadowColor: 'rgba(230, 74, 25, 0.4)',
    },
  ];

  const quickActions = [
    { 
      icon: FolderKanban, 
      label: 'Projetos', 
      description: `${recentProjects.length} projeto${recentProjects.length !== 1 ? 's' : ''}`,
      to: '/projects',
      gradient: 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)',
    },
    { 
      icon: CheckCircle2, 
      label: 'Tarefas', 
      description: `${taskStats.doing} em progresso`,
      to: '/tasks',
      gradient: 'linear-gradient(180deg, #81C784 0%, #388E3C 100%)',
    },
    { 
      icon: TrendingUp, 
      label: 'Ranking', 
      description: 'Ver posicao no ranking',
      to: '/gamification',
      gradient: 'linear-gradient(180deg, #FFD54F 0%, #FF9800 100%)',
    },
    { 
      icon: Calendar, 
      label: 'Atividade', 
      description: 'Ver heatmap',
      to: '/gamification',
      gradient: 'linear-gradient(180deg, #E879F9 0%, #A855F7 100%)',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#0288D1' }} />
          <p style={{ color: '#4a6fa5' }}>Carregando dashboard...</p>
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
        <h1 className="text-3xl font-bold" style={{ color: '#1a365d' }}>
          Dashboard
        </h1>
        <p style={{ color: '#4a6fa5' }}>
          Bem-vindo de volta, {user?.name?.split(' ')[0]}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="glass-card p-5 lg:p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div 
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: stat.gradient,
                  boxShadow: `0 6px 20px ${stat.shadowColor}`,
                }}
              >
                <stat.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium mb-1 truncate" style={{ color: '#4a6fa5' }}>
                  {stat.label}
                </p>
                <p className="text-xl lg:text-2xl font-bold truncate" style={{ color: '#1a365d' }}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Banner */}
      <div 
        className="rounded-3xl p-6 lg:p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0288D1 0%, #00ACC1 50%, #26A69A 100%)',
          boxShadow: '0 12px 40px rgba(2, 136, 209, 0.3)',
        }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-1/2 opacity-20"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
          }}
        />
        
        <div className="absolute top-4 right-8 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute bottom-4 right-24 w-12 h-12 rounded-full bg-white/10" />

        <div className="relative z-10">
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
            Continue sua jornada!
          </h2>
          <p className="text-white/90 max-w-2xl mb-4 text-sm lg:text-base">
            Voce esta no nivel {userLevel} ({profile?.levelName || user?.levelName || 'Iniciante'}). 
            Continue completando tarefas para subir de nivel e desbloquear badges!
          </p>
          
          {/* Progress bar */}
          <div className="max-w-md">
            <div className="flex justify-between text-sm text-white/80 mb-1">
              <span>{(profile?.totalPoints || user?.totalPoints || 0).toLocaleString()} pontos</span>
              <span>{profile?.pointsToNextLevel ? `${profile.pointsToNextLevel} para proximo nivel` : 'Proximo nivel'}</span>
            </div>
            <div className="h-3 rounded-full bg-white/20 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pointsProgress}%`,
                  background: 'linear-gradient(90deg, #FFD54F 0%, #FF9800 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#4a6fa5' }}>A Fazer</p>
              <p className="text-3xl font-bold" style={{ color: '#1a365d' }}>{taskStats.todo}</p>
            </div>
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #90CAF9 0%, #42A5F5 100%)',
              }}
            >
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#4a6fa5' }}>Em Progresso</p>
              <p className="text-3xl font-bold" style={{ color: '#FF9800' }}>{taskStats.doing}</p>
            </div>
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #FFD54F 0%, #FF9800 100%)',
              }}
            >
              <Loader2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#4a6fa5' }}>Concluidas</p>
              <p className="text-3xl font-bold" style={{ color: '#4CAF50' }}>{taskStats.done}</p>
            </div>
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #81C784 0%, #388E3C 100%)',
              }}
            >
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: '#1a365d' }}>
          Acesso Rapido
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.to}
              className="glass-card p-5 hover:scale-105 transition-all duration-300 group"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: action.gradient,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                }}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-1" style={{ color: '#1a365d' }}>
                {action.label}
              </h3>
              <p className="text-sm mb-2" style={{ color: '#4a6fa5' }}>
                {action.description}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: '#0288D1' }}>
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
            <h2 className="text-xl font-bold" style={{ color: '#1a365d' }}>
              Tarefas Recentes
            </h2>
            <Link 
              to="/tasks" 
              className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: '#0288D1' }}
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="glass-card divide-y divide-white/20">
            {recentTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center gap-4">
                <div 
                  className={`w-3 h-3 rounded-full flex-shrink-0`}
                  style={{
                    background: task.status === 'DONE' 
                      ? '#4CAF50' 
                      : task.status === 'DOING' 
                      ? '#FF9800' 
                      : '#4a6fa5',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: '#1a365d' }}>
                    {task.title}
                  </p>
                  <p className="text-sm truncate" style={{ color: '#4a6fa5' }}>
                    {task.project.name}
                  </p>
                </div>
                <span 
                  className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: task.status === 'DONE' 
                      ? 'rgba(76, 175, 80, 0.15)' 
                      : task.status === 'DOING' 
                      ? 'rgba(255, 152, 0, 0.15)' 
                      : 'rgba(74, 111, 165, 0.15)',
                    color: task.status === 'DONE' 
                      ? '#4CAF50' 
                      : task.status === 'DOING' 
                      ? '#FF9800' 
                      : '#4a6fa5',
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
