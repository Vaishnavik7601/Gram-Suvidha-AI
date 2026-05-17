import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    aadhaar: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    gender: '',
    villageId: '',
  });
  const [error, setError] = useState('');

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

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
          villageId: formData.villageId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Store token and navigate based on role
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/citizen/dashboard');
        }
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    }
  };

  return (
    <div className="card w-full shadow-xl">
      <h3 className="text-xl font-semibold text-center text-gov-text mb-6 border-b pb-4">Gram Suvidha Registration</h3>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gov-text mb-2">Select Registration Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg w-full justify-center transition-colors hover:bg-slate-50 aria-selected:border-gov-primary aria-selected:bg-blue-50" aria-selected={formData.role === 'citizen'}>
              <input type="radio" name="role" value="citizen" className="text-gov-primary focus:ring-gov-primary" checked={formData.role === 'citizen'} onChange={handleChange} />
              <span className="font-semibold text-slate-700">Citizen</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg w-full justify-center transition-colors hover:bg-slate-50 aria-selected:border-gov-primary aria-selected:bg-blue-50" aria-selected={formData.role === 'admin'}>
              <input type="radio" name="role" value="admin" className="text-gov-primary focus:ring-gov-primary" checked={formData.role === 'admin'} onChange={handleChange} />
              <span className="font-semibold text-slate-700">Panchayat Admin</span>
            </label>
          </div>
        </div>

        {formData.role === 'admin' && (
          <div className="mb-4 bg-orange-50 border border-orange-200 p-4 rounded-xl">
            <label className="block text-sm font-medium text-slate-800 mb-1">Official Panchayat / Village ID</label>
            <input type="text" name="villageId" required className="input-field bg-white" placeholder="e.g. VIL-10293" onChange={handleChange} value={formData.villageId} />
            <p className="text-xs text-slate-500 mt-2">Required for administrative verification.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gov-text">First Name</label>
            <input type="text" name="firstName" required className="input-field" placeholder="Raj" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gov-text">Last Name</label>
            <input type="text" name="lastName" required className="input-field" placeholder="Kumar" onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gov-text">Age</label>
            <input type="number" name="age" required min="1" className="input-field w-full" placeholder="e.g. 30" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gov-text">Mobile Number</label>
            <input type="tel" name="phone" required className="input-field w-full" placeholder="10 Digit Number" onChange={handleChange} maxLength="10" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gov-text">Email Address</label>
            <input type="email" name="email" required className="input-field w-full" placeholder="raj.kumar@example.com" onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gov-text">Gender</label>
            <select name="gender" required className="input-field w-full" onChange={handleChange} value={formData.gender}>
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gov-text">Password</label>
          <input type="password" name="password" required className="input-field w-full" placeholder="Create a secure password" onChange={handleChange} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gov-text">Confirm Password</label>
          <input type="password" name="confirmPassword" required className="input-field w-full" placeholder="Confirm your password" onChange={handleChange} />
        </div>

        <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 mt-6 py-3">
          <UserPlus size={20} />
          Register Now
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gov-muted">Already registered? </span>
        <Link to="/login" className="font-medium text-gov-primary hover:text-gov-blue underline">
          Login Here
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
