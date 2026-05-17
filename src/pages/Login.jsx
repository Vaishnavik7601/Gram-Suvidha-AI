import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserCircle, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('citizen'); // 'citizen' or 'admin'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }), // Assuming email is used as identifier
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        
        if (role === 'admin' || data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/citizen/dashboard');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    }
  };

  return (
    <div className="card w-full shadow-xl">
      <div className="flex justify-center mb-6 space-x-2 border-b pb-4">
        <button
          type="button"
          onClick={() => setRole('citizen')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2 transition-colors ${
            role === 'citizen'
              ? 'text-gov-primary border-b-2 border-gov-primary bg-blue-50'
              : 'text-gov-muted hover:text-gov-text border-b-2 border-transparent'
          }`}
        >
          <UserCircle size={18} />
          Citizen Login
        </button>
        <button
          type="button"
          onClick={() => setRole('admin')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2 transition-colors ${
            role === 'admin'
              ? 'text-gov-primary border-b-2 border-gov-primary bg-blue-50'
              : 'text-gov-muted hover:text-gov-text border-b-2 border-transparent'
          }`}
        >
          <ShieldCheck size={18} />
          Admin Login
        </button>
      </div>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gov-text">
            {role === 'citizen' ? 'Aadhaar Number / Email ID' : 'Official ID / Email ID'}
          </label>
          <input
            id="identifier"
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="input-field mt-1 w-full p-2 border rounded-md focus:ring-2"
            placeholder={`Enter your ${role === 'citizen' ? 'identifier' : 'official ID'}`}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gov-text">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full p-2 border rounded-md pr-10 focus:ring-2"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gov-primary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-gov-primary border-gray-300 rounded focus:ring-0"
            />
            <label htmlFor="remember-me" className="ml-2 block text-gov-text">
              Remember me
            </label>
          </div>

          <Link to="/forgot-password" className="font-medium text-gov-primary hover:text-gov-blue">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex justify-center items-center gap-2 mt-6 py-3"
        >
          <LogIn size={20} />
          Sign In
        </button>
      </form>

      {role === 'citizen' && (
        <div className="mt-6 text-center text-sm">
          <span className="text-gov-muted">New to Gram-Suvidha AI? </span>
          <Link to="/signup" className="font-medium text-gov-primary hover:text-gov-blue underline">
            Register Here
          </Link>
        </div>
      )}
    </div>
  );
};

export default Login;
