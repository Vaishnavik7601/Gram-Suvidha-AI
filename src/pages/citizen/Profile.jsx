import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, ClipboardList, Clock, CheckCircle, XCircle } from 'lucide-react';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          setError('Failed to fetch profile data');
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gov-saffron"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  const { user, applications } = profileData;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="text-green-500" size={18} />;
      case 'Rejected': return <XCircle className="text-red-500" size={18} />;
      default: return <Clock className="text-yellow-500" size={18} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
        <User className="text-gov-saffron" />
        My Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center group">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-32 h-32 bg-gov-saffron rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-orange-50 overflow-hidden shadow-inner">
                {user.profilePhoto ? (
                  <img src={`http://localhost:5000${user.profilePhoto}`} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors group-hover:scale-110">
                <User size={16} className="text-gov-saffron" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png"
                  onChange={async (e) => {
                    if (e.target.files[0]) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append('photo', file);
                      
                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch('http://localhost:5000/api/auth/profile/photo', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` },
                          body: formData
                        });
                        
                        if (res.ok) {
                          const data = await res.json();
                          window.location.reload(); 
                        } else {
                          const errorData = await res.json();
                          alert(errorData.message || "Failed to upload photo. Please ensure it's a valid image (JPG, PNG).");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Error uploading photo. Is the server running?");
                      }
                    }
                  }}
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
            <p className="text-slate-500 text-sm capitalize">{user.role}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2 text-sm uppercase tracking-wider">Basic Information</h3>
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={18} className="text-gov-saffron" />
              <div className="text-sm">
                <p className="text-xs text-slate-400">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone size={18} className="text-gov-saffron" />
              <div className="text-sm">
                <p className="text-xs text-slate-400">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Calendar size={18} className="text-gov-saffron" />
              <div className="text-sm">
                <p className="text-xs text-slate-400">Age</p>
                <p className="font-medium">{user.age || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="text-gov-saffron" size={20} />
                My Scheme Applications
              </h3>
              <span className="text-xs font-bold px-2 py-1 bg-gov-saffron/10 text-gov-saffron rounded-full">
                {applications.length} Total
              </span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {applications.length > 0 ? (
                applications.map((app) => (
                  <div key={app._id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{app.schemeName}</h4>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <p>Applied on: {new Date(app.createdAt).toLocaleDateString()}</p>
                      <p>Applicant: {app.applicantName}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                  <p>You haven't applied for any schemes yet.</p>
                  <button 
                    onClick={() => window.location.href = '/citizen/schemes'}
                    className="mt-4 text-gov-saffron font-bold hover:underline"
                  >
                    Browse Available Schemes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
