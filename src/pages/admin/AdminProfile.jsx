import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';

const AdminProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          setError('Failed to fetch profile data. Please log in again.');
        }
      } catch (err) {
        setError('Network error. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  const { user } = profileData || { user: { name: 'Admin User', email: '', phone: '', age: '', role: 'admin', village: '', taluk: '', district: '', state: '', pincode: '' } };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 mb-6">
        <User className="text-primary" />
        Admin Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-50 overflow-hidden shadow-inner">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name ? user.name.charAt(0) : 'A'
              )}
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
          <p className="text-slate-500 text-sm capitalize">{user.role}</p>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={18} className="text-primary" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admin Email</p>
                <p className="font-semibold text-slate-800">{user.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone size={18} className="text-primary" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Number</p>
                <p className="font-semibold text-slate-800">{user.phone || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <User size={18} className="text-primary" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admin ID</p>
                <p className="font-semibold text-slate-800">{user._id || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin size={18} className="text-primary" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Access Role</p>
                <p className="font-semibold text-slate-800">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Administrative Details</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span className="font-semibold">Registered Name:</span>
                <span>{user.name || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span className="font-semibold">Registered On:</span>
                <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span className="font-semibold">Department:</span>
                <span>{user.department || 'Administration'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
