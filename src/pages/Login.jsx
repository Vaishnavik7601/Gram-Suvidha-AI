import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserCircle, ShieldCheck, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('citizen'); // 'citizen' or 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.role !== role) {
          setError('Invalid email or password for selected role');
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('user', JSON.stringify({
          name: data.name,
          email: data.email,
          _id: data._id,
          villageId: data.villageId || '',
          village: data.village || ''
        }));

        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Formal Government-style background with gradient overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/village-bg.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/75 via-white/80 to-blue-50/75 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center gap-2 text-3xl font-extrabold text-slate-900 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Activity className="text-primary" />
          </div>
          GramSuvidha
        </div>
        <p className="text-sm text-slate-600">{t('loginTitle')}</p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-md py-8 px-4 shadow-2xl rounded-2xl border border-white/50 sm:px-10">
          <div className="flex justify-center mb-6 space-x-2 border-b border-slate-200 pb-4">
            <button
              type="button"
              onClick={() => setRole('citizen')}
              className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2 transition-colors ${
                role === 'citizen'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent'
              }`}
            >
              <UserCircle size={18} />
              {t('citizen')} {t('login')}
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2 transition-colors ${
                role === 'admin'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-slate-500 hover:text-slate-700 border-b-2 border-transparent'
              }`}
            >
              <ShieldCheck size={18} />
              {t('pAdmin')} {t('login')}
            </button>
          </div>
          
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-semibold">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {role === 'citizen' ? t('email') : t('email')}
              </label>
              <input
                id="identifier"
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-slate-600 text-xs font-medium">
                  {t('rememberMe')}
                </label>
              </div>

              <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                {t('forgotPass')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-sm flex justify-center items-center gap-2 mt-6 transition-colors disabled:opacity-50"
            >
              <LogIn size={20} />
              {loading ? t('loginBtn') + '...' : t('loginBtn')}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            {t('newToGram')}{' '}
            <Link to="/signup" className="font-bold text-primary hover:underline">
              {t('registerHere')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
