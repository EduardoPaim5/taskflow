import { useState, useEffect } from 'react';
import { 
  Trophy,
  Zap,
  Award,
  Flame,
  Target,
  Star,
  Medal,
  Crown,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { gamificationService } from '../services';
import type { Badge, RankingEntry, HeatmapEntry, GamificationProfile } from '../types';

const badgeIcons: Record<string, typeof Star> = {
  star: Star,
  flame: Flame,
  zap: Zap,
  message: MessageCircle,
  crown: Crown,
  target: Target,
  trophy: Trophy,
  award: Award,
  medal: Medal,
};

const levelColors: Record<number, { gradient: string; shadow: string }> = {
  1: { gradient: 'linear-gradient(180deg, #90CAF9 0%, #42A5F5 100%)', shadow: 'rgba(66, 165, 245, 0.4)' },
  2: { gradient: 'linear-gradient(180deg, #81C784 0%, #388E3C 100%)', shadow: 'rgba(56, 142, 60, 0.4)' },
  3: { gradient: 'linear-gradient(180deg, #FFD54F 0%, #FF9800 100%)', shadow: 'rgba(255, 152, 0, 0.4)' },
  4: { gradient: 'linear-gradient(180deg, #FF8A65 0%, #E64A19 100%)', shadow: 'rgba(230, 74, 25, 0.4)' },
  5: { gradient: 'linear-gradient(180deg, #BA68C8 0%, #7B1FA2 100%)', shadow: 'rgba(123, 31, 162, 0.4)' },
  6: { gradient: 'linear-gradient(180deg, #FFD700 0%, #FF6B00 100%)', shadow: 'rgba(255, 107, 0, 0.4)' },
};

export function GamificationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'ranking' | 'badges'>('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileData, rankingData, badgesData, heatmapData] = await Promise.all([
        gamificationService.getProfile(),
        gamificationService.getGlobalRanking(10),
        gamificationService.getBadges(),
        gamificationService.getHeatmap(),
      ]);
      setProfile(profileData);
      setRanking(rankingData);
      setBadges(badgesData);
      setHeatmap(heatmapData);
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      setError('Erro ao carregar dados de gamificacao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const userLevel = profile?.level || user?.level || 1;
  const levelConfig = levelColors[Math.min(userLevel, 6)] || levelColors[1];

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'rgba(255,255,255,0.4)';
    if (count <= 2) return 'rgba(129, 199, 132, 0.5)';
    if (count <= 4) return 'rgba(102, 187, 106, 0.7)';
    if (count <= 6) return 'rgba(67, 160, 71, 0.85)';
    return 'rgba(46, 125, 50, 1)';
  };

  // Group heatmap by weeks
  const weeks: HeatmapEntry[][] = [];
  let currentWeek: HeatmapEntry[] = [];
  
  heatmap.forEach((day, index) => {
    const date = new Date(day.date);
    if (date.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
    if (index === heatmap.length - 1) {
      weeks.push(currentWeek);
    }
  });

  // Separate unlocked and locked badges
  const unlockedBadges = badges.filter(b => b.unlockedAt);
  const lockedBadges = badges.filter(b => !b.unlockedAt);
  const allBadges = [...unlockedBadges, ...lockedBadges];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#0288D1' }} />
          <p style={{ color: '#4a6fa5' }}>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center glass-card p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-aero">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1a365d' }}>
          Gamificacao
        </h1>
        <p style={{ color: '#4a6fa5' }}>
          Acompanhe seu progresso e conquistas
        </p>
      </div>

      {/* Tabs */}
      <div className="glass-card p-2 inline-flex gap-2 relative overflow-hidden">
        {/* Glossy reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent h-1/2 pointer-events-none rounded-t-3xl" />
        
        {[
          { id: 'profile', label: 'Perfil', icon: Trophy },
          { id: 'ranking', label: 'Ranking', icon: TrendingUp },
          { id: 'badges', label: 'Badges', icon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all relative ${
              activeTab === tab.id ? 'text-white' : 'hover:bg-white/30'
            }`}
            style={activeTab === tab.id ? {
              background: 'linear-gradient(180deg, #7dd3fc 0%, #38bdf8 30%, #0ea5e9 70%, #0284c7 100%)',
              boxShadow: '0 4px 15px rgba(2, 136, 209, 0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
            } : { color: '#4a6fa5' }}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="glass-card p-6 text-center relative overflow-hidden">
            {/* Decorative background orb */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-cyan-300/30 to-blue-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-green-300/20 to-emerald-400/10 blur-3xl pointer-events-none" />
            
            <div 
              className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shine relative z-10"
              style={{
                background: levelConfig.gradient,
                boxShadow: `0 8px 25px ${levelConfig.shadow}, inset 0 2px 0 rgba(255,255,255,0.4)`,
              }}
            >
              {(profile?.userName || user?.name)?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-2xl font-bold mb-1 relative z-10" style={{ color: '#1a365d' }}>
              {profile?.userName || user?.name}
            </h2>
            <p className="mb-4 relative z-10" style={{ color: '#4a6fa5' }}>{user?.email}</p>
            
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full relative z-10"
              style={{
                background: levelConfig.gradient,
                boxShadow: `0 4px 15px ${levelConfig.shadow}, inset 0 1px 0 rgba(255,255,255,0.4)`,
              }}
            >
              <Zap className="w-5 h-5 text-white" />
              <span className="text-white font-bold">
                Nivel {profile?.level || user?.level} - {profile?.levelName || user?.levelName}
              </span>
            </div>

            {/* Progress to next level */}
            {profile?.pointsToNextLevel && profile.pointsToNextLevel > 0 && (
              <div className="mt-4 relative z-10">
                <p className="text-sm mb-2" style={{ color: '#4a6fa5' }}>
                  {profile.pointsToNextLevel} pontos para o proximo nivel
                </p>
                <div className="progress-aero h-3">
                  <div 
                    className="progress-aero-fill"
                    style={{ width: `${profile.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div className="icon-sphere icon-sphere-orange w-14 h-14 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#4a6fa5' }}>Pontos Totais</p>
                  <p className="text-3xl font-bold" style={{ color: '#1a365d' }}>
                    {(profile?.totalPoints || user?.totalPoints || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div className="icon-sphere icon-sphere-green w-14 h-14 flex items-center justify-center">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#4a6fa5' }}>Tarefas</p>
                  <p className="text-3xl font-bold" style={{ color: '#1a365d' }}>
                    {profile?.tasksCompleted || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div 
                  className="icon-sphere w-14 h-14 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #FF8A65 0%, #E64A19 100%)',
                    boxShadow: '0 4px 15px rgba(230, 74, 25, 0.4), inset 0 2px 0 rgba(255,255,255,0.4)',
                  }}
                >
                  <Flame className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#4a6fa5' }}>Streak Atual</p>
                  <p className="text-3xl font-bold" style={{ color: '#1a365d' }}>
                    {profile?.currentStreak || 0} dias
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-4">
                <div className="icon-sphere icon-sphere-purple w-14 h-14 flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#4a6fa5' }}>Badges</p>
                  <p className="text-3xl font-bold" style={{ color: '#1a365d' }}>
                    {unlockedBadges.length}/{badges.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap */}
          {heatmap.length > 0 && (
            <div className="lg:col-span-3 glass-card p-6 relative overflow-hidden">
              {/* Decorative element */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-green-300/20 to-emerald-400/10 blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="icon-sphere icon-sphere-green w-10 h-10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#1a365d' }}>
                  Atividade no Ultimo Ano
                </h3>
              </div>
              
              <div className="overflow-x-auto pb-2 relative z-10">
                <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
                  {weeks.slice(-52).map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="w-3 h-3 rounded-sm transition-colors"
                          style={{ background: getHeatmapColor(day.count) }}
                          title={`${day.date}: ${day.count} contribuicoes`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 text-sm relative z-10" style={{ color: '#4a6fa5' }}>
                <span>Menos</span>
                {[0, 2, 4, 6, 8].map((count) => (
                  <div
                    key={count}
                    className="w-3 h-3 rounded-sm"
                    style={{ background: getHeatmapColor(count) }}
                  />
                ))}
                <span>Mais</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranking Tab */}
      {activeTab === 'ranking' && (
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/30">
            <h3 className="text-xl font-bold" style={{ color: '#1a365d' }}>
              Ranking Global
            </h3>
            <p style={{ color: '#4a6fa5' }}>Top performers da plataforma</p>
          </div>

          {ranking.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4" style={{ color: '#4a6fa5' }} />
              <p style={{ color: '#4a6fa5' }}>Nenhum usuario no ranking ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/20">
              {ranking.map((entry) => (
                <div 
                  key={entry.position}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-white/30 ${
                    entry.userId === user?.id ? 'bg-aero-100/30' : ''
                  }`}
                >
                  {/* Position */}
                  <div className="w-12 text-center">
                    {entry.position <= 3 ? (
                      <div 
                        className="w-10 h-10 rounded-full mx-auto flex items-center justify-center"
                        style={{
                          background: entry.position === 1 
                            ? 'linear-gradient(180deg, #FFD700 0%, #FF9800 100%)'
                            : entry.position === 2
                            ? 'linear-gradient(180deg, #E0E0E0 0%, #9E9E9E 100%)'
                            : 'linear-gradient(180deg, #FFAB91 0%, #D84315 100%)',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Medal className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <span className="text-2xl font-bold" style={{ color: '#4a6fa5' }}>
                        {entry.position}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                    style={{
                      background: levelColors[Math.min(entry.level, 6)]?.gradient || levelColors[1].gradient,
                    }}
                  >
                    {entry.userName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate" style={{ color: '#1a365d' }}>
                      {entry.userName}
                      {entry.userId === user?.id && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-aero-100 text-aero-700">
                          Voce
                        </span>
                      )}
                    </p>
                    <p className="text-sm" style={{ color: '#4a6fa5' }}>
                      Nivel {entry.level} - {entry.levelName}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: '#1a365d' }}>
                      {entry.totalPoints.toLocaleString()}
                    </p>
                    <p className="text-sm" style={{ color: '#4a6fa5' }}>
                      {entry.tasksCompleted} tarefas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div>
          {badges.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Award className="w-12 h-12 mx-auto mb-4" style={{ color: '#4a6fa5' }} />
              <p style={{ color: '#4a6fa5' }}>Nenhum badge disponivel ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBadges.map((badge) => {
                const Icon = badgeIcons[badge.icon?.toLowerCase()] || Star;
                const isUnlocked = !!badge.unlockedAt;
                return (
                  <div 
                    key={badge.id}
                    className={`glass-card p-6 transition-all relative overflow-hidden ${
                      isUnlocked ? 'hover:scale-105' : 'opacity-60'
                    }`}
                  >
                    {/* Decorative glow for unlocked badges */}
                    {isUnlocked && (
                      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300/30 to-orange-400/20 blur-2xl pointer-events-none" />
                    )}
                    
                    <div className="flex items-start gap-4 relative z-10">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shine"
                        style={{
                          background: isUnlocked 
                            ? 'linear-gradient(180deg, #FFD54F 0%, #FF9800 100%)'
                            : 'linear-gradient(180deg, #E0E0E0 0%, #9E9E9E 100%)',
                          boxShadow: isUnlocked 
                            ? '0 6px 20px rgba(255, 152, 0, 0.4), inset 0 2px 0 rgba(255,255,255,0.4)'
                            : '0 4px 15px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1" style={{ color: '#1a365d' }}>
                          {badge.name}
                        </h3>
                        <p className="text-sm mb-2" style={{ color: '#4a6fa5' }}>
                          {badge.description}
                        </p>
                        {isUnlocked ? (
                          <span 
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                            style={{ 
                              background: 'rgba(56, 142, 60, 0.15)',
                              color: '#388E3C',
                            }}
                          >
                            <Star className="w-3 h-3" />
                            Desbloqueado em {new Date(badge.unlockedAt!).toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span 
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                            style={{ 
                              background: 'rgba(74, 111, 165, 0.15)',
                              color: '#4a6fa5',
                            }}
                          >
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
