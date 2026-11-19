import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const rememberedEmail = localStorage.getItem('rememberedEmail') || '';
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const normalizedEmail = email.trim();
      const result = await login(normalizedEmail, password, rememberMe);
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', normalizedEmail);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (loginError) {
      console.error('Erreur lors de la connexion:', loginError);
      setError('La connexion est momentanément indisponible. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <h1 className="text-3xl font-bold text-accent mb-2">SETIC</h1>
          <p className="text-blue-100">Gestion des Marchés Publics</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Connexion</h2>
          
          {error && (
            <div role="alert" aria-live="assertive" className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400"
                    placeholder="votre@email.com"
                  />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
              </div>
            </div>

            <label htmlFor="remember-me" className="flex items-center gap-2 text-sm text-gray-600">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              Se souvenir de moi
            </label>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
