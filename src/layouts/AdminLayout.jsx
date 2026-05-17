import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, ShieldAlert, LogOut, Settings, MapPin, User, Mail, Phone, Calendar, Upload, X } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    village: '',
    taluk: '',
    district: '',
    state: '',
    country: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch admin profile', err);
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleProfileUpdate = () => {
      fetchProfile();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        age: profile.age || '',
        village: profile.village || '',
        taluk: profile.taluk || '',
        district: profile.district || '',
        state: profile.state || '',
        country: profile.country || ''
      });
    }
  }, [profile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setIsSettingsOpen(false);
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving profile. Is the server running?');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('photo', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/profile/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({ ...prev, profilePhoto: data.profilePhoto }));
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to upload photo. Please use JPG/PNG.');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading photo. Is the server running?');
    }
  };

  const navItems = [
    { name: 'Dashboard Analysis', path: '/admin/dashboard', icon: Home },
    { name: 'Complaints', path: '/admin/complaints', icon: ShieldAlert },
    { name: 'Reports', path: '/admin/reports', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-gov-blue text-white shadow-xl md:min-h-screen flex flex-col z-20">
        <div className="p-6 border-b border-indigo-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-gov-blue font-bold text-sm shadow-inner overflow-hidden">
            {profile && profile.profilePhoto ? (
              <img src={`http://localhost:5000${profile.profilePhoto}`} alt="GS" className="w-full h-full object-cover" />
            ) : (
              'GS'
            )}
          </div>
          <div>
            <span className="font-bold text-lg leading-tight block">Gram-Suvidha AI</span>
            <span className="text-xs text-indigo-300 font-medium tracking-wide">PANCHAYAT ADMIN</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/10 text-white font-medium border-l-4 border-gov-saffron' 
                    : 'text-indigo-100 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-200 hover:text-white hover:bg-white/5 transition-colors w-full mb-2"
          >
            <Settings size={20} />
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:text-red-100 hover:bg-red-900/40 transition-colors w-full"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl px-4 md:px-8 py-8 h-screen overflow-y-auto bg-slate-50">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Panchayat Operations Center</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
              <span className="text-slate-500">Welcome back, {profile ? profile.name : 'Administrator'}.</span>
              {profile && (profile.village || profile.taluk || profile.district || profile.state || profile.country) ? (
                <div 
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full text-xs border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors"
                >
                  <MapPin size={12} className="text-indigo-500" />
                  <span>Region: {[profile.village, profile.taluk, profile.district, profile.state, profile.country].filter(Boolean).join(', ')}</span>
                </div>
              ) : (
                <div 
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-1.5 bg-amber-50 text-amber-700 font-semibold px-2.5 py-0.5 rounded-full text-xs border border-amber-100 animate-pulse cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <MapPin size={12} className="text-amber-500" />
                  <span>Region: Not Configured (Click to set)</span>
                </div>
              )}
            </div>
          </div>
          <div 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-100"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800">{profile ? profile.name : 'Official XYZ'}</div>
              <div className="text-xs text-slate-500 capitalize">{profile ? profile.role : 'Sarpanch / VDO'}</div>
            </div>
            {profile && profile.profilePhoto ? (
              <img 
                src={`http://localhost:5000${profile.profilePhoto}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-gov-blue/20 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-slate-300 flex items-center justify-center text-gov-blue font-bold text-sm">
                {profile ? profile.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
          </div>
        </header>

        <Outlet />
      </main>

      {/* Profile & Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-100">
            <button 
              onClick={() => setIsSettingsOpen(false)} 
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3">
              <Settings className="text-gov-blue" />
              Administrative Settings
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="relative group w-24 h-24">
                  <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-white shadow-md flex items-center justify-center text-indigo-600 text-3xl font-bold overflow-hidden">
                    {profile && profile.profilePhoto ? (
                      <img src={`http://localhost:5000${profile.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      profile ? profile.name.charAt(0).toUpperCase() : 'A'
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-gov-blue hover:bg-indigo-700 text-white p-2 rounded-full shadow-md border border-white cursor-pointer transition-colors group-hover:scale-105">
                    <Upload size={14} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-slate-800">Administrator Profile Picture</h4>
                  <p className="text-xs text-slate-500 mt-1">Upload a professional portrait (JPEG or PNG, max 5MB). Photo updates automatically.</p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-gov-saffron" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Official Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                      placeholder="e.g. Official XYZ"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                    <input 
                      type="number" 
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                      placeholder="e.g. 45"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Administrative Region Scope */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-gov-saffron" />
                  Administrative Jurisdiction Region Scope
                </h3>
                <p className="text-xs text-slate-500">Configure these properties to customize the analytics dashboard metrics to the region where this site is being used.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Village (Gram Panchayat)</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                      placeholder="e.g. Ramanagar GP"
                      value={formData.village}
                      onChange={e => setFormData({ ...formData, village: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Taluk / Block</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                      placeholder="e.g. Ramanagar Taluk"
                      value={formData.taluk}
                      onChange={e => setFormData({ ...formData, taluk: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                      placeholder="e.g. Ramanagara"
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                      placeholder="e.g. Karnataka"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
                    <input 
                      type="text" 
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                      placeholder="e.g. India"
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-gov-blue hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-55 flex items-center gap-1.5"
                >
                  {isSaving ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
