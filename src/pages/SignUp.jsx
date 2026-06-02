import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Activity } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    gender: '',
    village: '',
    villageId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    // > 6 characters, numbers, special characters, underscore, one capital letter
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+_]).{7,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (formData.phone.length !== 10 || isNaN(formData.phone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (!formData.age || isNaN(formData.age) || Number(formData.age) <= 0) {
      setError('Please enter a valid age.');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be >6 chars, include a number, special character, underscore, and one capital letter.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          age: Number(formData.age),
          role: formData.role,
          gender: formData.gender,
          village: formData.village,
          villageId: formData.villageId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
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
        setError(data.message || 'Registration failed.');
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
        <p className="text-sm text-slate-600">Register a new citizen or admin account</p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-md py-8 px-4 shadow-2xl rounded-2xl border border-white/50 sm:px-10">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm font-semibold">{error}</div>}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registration Type</label>
              <div className="flex gap-4">
                <label className={`flex items-center gap-2 cursor-pointer border p-3 rounded-lg w-full justify-center transition-colors ${
                  formData.role === 'citizen' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-250 text-slate-700 hover:bg-slate-50'
                }`}>
                  <input type="radio" name="role" value="citizen" className="text-primary focus:ring-primary hidden" checked={formData.role === 'citizen'} onChange={handleChange} />
                  <span className="font-semibold text-sm">Citizen</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer border p-3 rounded-lg w-full justify-center transition-colors ${
                  formData.role === 'admin' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-250 text-slate-700 hover:bg-slate-50'
                }`}>
                  <input type="radio" name="role" value="admin" className="text-primary focus:ring-primary hidden" checked={formData.role === 'admin'} onChange={handleChange} />
                  <span className="font-semibold text-sm">Panchayat Admin</span>
                </label>
              </div>
            </div>

            {formData.role === 'admin' && (
              <div className="mb-4 bg-orange-50 border border-orange-100 p-4 rounded-xl">
                <label className="block text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">Official Panchayat / Village ID</label>
                <input 
                  type="text" 
                  name="villageId" 
                  required 
                  className="w-full border border-orange-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white" 
                  placeholder="e.g. VIL-10293" 
                  onChange={handleChange} 
                  value={formData.villageId} 
                />
                <p className="text-[10px] text-orange-600 font-medium mt-2">Required for administrative verification.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
                  placeholder="Raj" 
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
                  placeholder="Kumar" 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
                <input 
                  type="number" 
                  name="age" 
                  required 
                  min="1" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
                  placeholder="30" 
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
                  placeholder="10 digit number" 
                  onChange={handleChange} 
                  maxLength="10" 
                />
              </div>
            </div>
            {formData.role === 'citizen' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Village Name</label>
                  <input
                    type="text"
                    name="village"
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                    placeholder="Your village name"
                    onChange={handleChange}
                    value={formData.village}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                  <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Village / Panchayat ID</label>
                  <input
                    type="text"
                    name="villageId"
                    required
                    className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    placeholder="e.g. VIL-10293 (get from your Panchayat admin)"
                    onChange={handleChange}
                    value={formData.villageId}
                  />
                  <p className="text-[10px] text-blue-600 font-medium mt-2">⚠ You must enter the same Village ID your Panchayat Admin used during registration. This links you to the correct admin.</p>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
                  placeholder="raj.kumar@example.com" 
                  onChange={handleChange} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                <select 
                  name="gender" 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
                  onChange={handleChange} 
                  value={formData.gender}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
                placeholder="Create secure password" 
                onChange={handleChange} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                required 
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
                placeholder="Confirm password" 
                onChange={handleChange} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-sm flex justify-center items-center gap-2 mt-6 transition-colors disabled:opacity-50"
            >
              <UserPlus size={20} />
              {loading ? 'Registering...' : 'Register Now'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Login Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
