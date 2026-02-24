import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Frutiger Aero Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #98E4FF 30%, #B8F4D0 70%, #90EE90 100%)',
        }}
      />

      {/* Decorative floating orbs */}
      <div className="orb w-96 h-96 bg-white/40 -top-20 -left-20" style={{ animationDelay: '0s' }} />
      <div className="orb w-72 h-72 bg-cyan-300/30 top-1/4 right-10" style={{ animationDelay: '2s' }} />
      <div className="orb w-80 h-80 bg-green-300/30 bottom-10 left-1/4" style={{ animationDelay: '4s' }} />
      <div className="orb w-64 h-64 bg-yellow-200/30 top-1/2 -right-20" style={{ animationDelay: '1s' }} />

      {/* Subtle clouds/bubbles */}
      <div className="absolute top-20 left-10 w-32 h-16 bg-white/30 rounded-full blur-xl" />
      <div className="absolute top-40 right-20 w-48 h-20 bg-white/25 rounded-full blur-xl" />
      <div className="absolute bottom-32 right-1/3 w-40 h-16 bg-white/20 rounded-full blur-xl" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shine"
              style={{
                background: 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 100%)',
                boxShadow: '0 8px 32px rgba(2, 136, 209, 0.4), inset 0 2px 0 rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <Sparkles className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <h1 
              className="text-4xl font-bold mb-2"
              style={{
                color: '#1a365d',
                textShadow: '0 2px 4px rgba(255,255,255,0.5)',
              }}
            >
              TaskFlow
            </h1>
            <p 
              className="text-lg font-medium"
              style={{ color: '#2d5a87' }}
            >
              Gestao de Projetos com Gamificacao
            </p>
          </div>

          {/* Glass Card */}
          <div className="glass-card p-8">
            <div className="text-center mb-6">
              <h2 
                className="text-2xl font-bold mb-1"
                style={{ color: '#1a365d' }}
              >
                Bem-vindo de volta!
              </h2>
              <p style={{ color: '#4a6fa5' }}>
                Entre na sua conta para continuar
              </p>
            </div>

            {error && (
              <div 
                className="mb-6 p-4 rounded-xl flex items-center gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(254,202,202,0.8) 0%, rgba(254,178,178,0.6) 100%)',
                  border: '1px solid rgba(239,68,68,0.3)',
                }}
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aero-600" />
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
                    autoComplete="current-password"
                    className="input-aero pr-12"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aero-600" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-2 border-aero-400 text-aero-600 focus:ring-aero-400 focus:ring-offset-0"
                  />
                  <span className="text-sm font-medium" style={{ color: '#4a6fa5' }}>
                    Lembrar de mim
                  </span>
                </label>
                <a 
                  href="#" 
                  className="text-sm font-semibold hover:underline"
                  style={{ color: '#0288D1' }}
                >
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-aero w-full text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-5 h-5" />
                    <span>Entrar</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <span style={{ color: '#4a6fa5' }}>Nao tem uma conta? </span>
              <Link
                to="/register"
                className="font-bold hover:underline"
                style={{ color: '#0288D1' }}
              >
                Cadastre-se gratuitamente
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p 
            className="text-center text-sm mt-8 font-medium"
            style={{ color: 'rgba(45, 90, 135, 0.7)' }}
          >
            2026 TaskFlow. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
