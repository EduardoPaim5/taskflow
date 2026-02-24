import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, AlertCircle, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Frutiger Aero Background - Purple/Pink variation */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #E0B0FF 0%, #DDA0DD 25%, #87CEEB 60%, #98FB98 100%)',
        }}
      />

      {/* Decorative floating orbs */}
      <div className="orb w-96 h-96 bg-pink-200/40 -top-20 -right-20" style={{ animationDelay: '0s' }} />
      <div className="orb w-72 h-72 bg-purple-300/30 top-1/3 left-10" style={{ animationDelay: '2s' }} />
      <div className="orb w-80 h-80 bg-cyan-300/30 bottom-20 right-1/4" style={{ animationDelay: '4s' }} />
      <div className="orb w-64 h-64 bg-green-200/30 bottom-1/3 -left-10" style={{ animationDelay: '1s' }} />

      {/* Subtle clouds */}
      <div className="absolute top-16 right-20 w-40 h-20 bg-white/30 rounded-full blur-xl" />
      <div className="absolute top-32 left-16 w-32 h-16 bg-white/25 rounded-full blur-xl" />
      <div className="absolute bottom-40 left-1/3 w-48 h-20 bg-white/20 rounded-full blur-xl" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <div className="text-center mb-6">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shine"
              style={{
                background: 'linear-gradient(180deg, #81C784 0%, #388E3C 100%)',
                boxShadow: '0 8px 32px rgba(56, 142, 60, 0.4), inset 0 2px 0 rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <Rocket className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <h1 
              className="text-4xl font-bold mb-2"
              style={{
                color: '#1a365d',
                textShadow: '0 2px 4px rgba(255,255,255,0.5)',
              }}
            >
              Nexilum
            </h1>
            <p 
              className="text-lg font-medium"
              style={{ color: '#4a3f6b' }}
            >
              Comece sua jornada produtiva
            </p>
          </div>

          {/* Glass Card */}
          <div className="glass-card p-8 relative overflow-hidden">
            {/* Glossy highlight at top */}
            <div className="absolute top-0 left-4 right-4 h-12 bg-gradient-to-b from-white/50 to-transparent rounded-t-3xl pointer-events-none" />
            
            <div className="text-center mb-6 relative z-10">
              <h2 
                className="text-2xl font-bold mb-1"
                style={{ color: '#1a365d' }}
              >
                Criar nova conta
              </h2>
              <p style={{ color: '#5a4a7a' }}>
                Preencha os dados para comecar
              </p>
            </div>

            {error && (
              <div 
                className="mb-5 p-4 rounded-xl flex items-center gap-3 relative z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(254,202,202,0.8) 0%, rgba(254,178,178,0.6) 100%)',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2d5a87' }}
                >
                  Nome completo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="input-aero pr-12"
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nature-600" />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2d5a87' }}
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="input-aero pr-12"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nature-600" />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2d5a87' }}
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="input-aero pr-12"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nature-600" />
                </div>
                <p className="mt-1.5 text-xs font-medium" style={{ color: '#5a4a7a' }}>
                  Minimo de 6 caracteres
                </p>
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#2d5a87' }}
                >
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="input-aero pr-12"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nature-600" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-aero-green w-full text-lg mt-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Criar minha conta</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 text-center relative z-10">
              <span style={{ color: '#5a4a7a' }}>Ja tem uma conta? </span>
              <Link
                to="/login"
                className="font-bold hover:underline"
                style={{ color: '#388E3C' }}
              >
                Entrar
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p 
            className="text-center text-sm mt-6 font-medium"
            style={{ color: 'rgba(74, 63, 107, 0.7)' }}
          >
            2026 Nexilum. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
