import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, ClipboardList, Clock, CheckCircle, XCircle, MapPin, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({ name: '', age: '', gender: '', village: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

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
          setEditData({
            name: data.user.name || '',
            age: data.user.age || '',
            gender: data.user.gender || '',
            village: data.user.village || ''
          });
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

  const { user, admin, applications } = profileData || { user: { name: 'John Doe', email: 'john@example.com', phone: '1234567890', age: 30, role: 'citizen' }, admin: null, applications: [] };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="text-green-500" size={14} />;
      case 'Rejected': return <XCircle className="text-red-500" size={14} />;
      case 'Too Late': return <XCircle className="text-rose-500" size={14} />;
      case 'In Progress': return <Clock className="text-blue-500" size={14} />;
      default: return <Clock className="text-yellow-500" size={14} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-50 text-green-700 border border-green-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border border-red-200';
      case 'Too Late': return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    }
  };

  const saveProfile = async () => {
    setStatusMessage('Saving...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editData.name,
          age: editData.age,
          gender: editData.gender,
          village: editData.village
        })
      });

      const result = await res.json();
      if (res.ok) {
        setProfileData((prev) => ({ ...prev, user: result.user || { ...prev.user, ...editData } }));
        setIsEditing(false);
        setStatusMessage('Profile updated successfully.');
      } else {
        setStatusMessage(result.message || 'Update failed.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Update failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <User className="text-primary" size={32} />
          Citizen Profile
        </h1>
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setStatusMessage('');
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all hover:-translate-y-0.5"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Top Banner Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Identity Banner */}
        <div className={`rounded-2xl p-8 text-white shadow-lg flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden ${user.role === 'citizen' ? 'lg:col-span-2 bg-gradient-to-r from-blue-700 via-primary to-blue-500' : 'lg:col-span-3 bg-gradient-to-r from-slate-800 to-slate-600'}`}>
          <div className="absolute -top-10 -right-10 p-8 opacity-10 pointer-events-none transform rotate-12">
             <User size={180} />
          </div>
          
          <div className="relative w-32 h-32 shrink-0">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white/30 overflow-hidden shadow-xl">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-lg border border-slate-100 cursor-pointer hover:scale-110 transition-transform text-primary">
              <User size={18} />
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
                      const res = await fetch('/api/auth/profile/photo', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                      });
                      if (res.ok) window.location.reload(); 
                      else alert("Failed to upload photo.");
                    } catch (err) { alert("Error uploading photo."); }
                  }
                }}
              />
            </label>
          </div>
          
          <div className="text-center sm:text-left relative z-10 pt-2">
            <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
            <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start justify-center sm:justify-start gap-x-6 gap-y-3 text-blue-100 text-sm font-medium">
              <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg"><MapPin size={16}/> {user.village || 'No Village Assigned'}</span>
              <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg"><Phone size={16}/> {user.phone || 'No Phone'}</span>
              <span className="bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Handling Administrator Card */}
        {user.role === 'citizen' && (
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <h3 className="font-bold text-slate-800 mb-5 text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" /> Handling Administrator
            </h3>
            
            {admin ? (
              <div className="flex flex-col h-[calc(100%-2rem)] justify-between">
                <div className="flex items-center gap-4 text-slate-600 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{admin.name}</p>
                    <p className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-0.5">Panchayat Admin</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone size={16} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">{admin.phone || 'Not available'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={16} className="text-slate-400" />
                    <span className="font-semibold text-slate-700 truncate">{admin.email || 'Not available'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 bg-slate-50 p-6 rounded-xl border border-slate-100 text-center h-[calc(100%-2rem)] flex flex-col justify-center items-center gap-2">
                <ShieldCheck size={32} className="text-slate-300" />
                <div>
                  <p className="font-semibold text-slate-700">No administrator found</p>
                  <p className="text-xs mt-1 text-slate-400">Ensure your Village ID is correct.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Details (Left col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <User size={14} className="text-primary"/> Basic Details
              </h3>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setStatusMessage('');
                      setEditData({ name: user.name || '', age: user.age || '', gender: user.gender || '', village: user.village || '' });
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-dark transition-colors shadow-sm"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Full Name</p>
                {isEditing ? (
                  <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                ) : (
                  <p className="font-bold text-slate-800 text-sm">{user.name || 'Not set'}</p>
                )}
              </div>
              
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Age</p>
                {isEditing ? (
                  <input type="number" value={editData.age} onChange={(e) => setEditData({ ...editData, age: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                ) : (
                  <p className="font-bold text-slate-800 text-sm">{user.age || 'Not set'}</p>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Gender</p>
                {isEditing ? (
                  <select value={editData.gender} onChange={(e) => setEditData({ ...editData, gender: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="font-bold text-slate-800 text-sm capitalize">{user.gender || 'Not set'}</p>
                )}
              </div>

              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Village</p>
                {isEditing ? (
                  <input type="text" value={editData.village} onChange={(e) => setEditData({ ...editData, village: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                ) : (
                  <p className="font-bold text-slate-800 text-sm">{user.village || 'Not set'}</p>
                )}
              </div>
            </div>

            {statusMessage && (
              <p className="text-sm font-semibold text-primary bg-primary/5 p-2 rounded-lg border border-primary/10 text-center">{statusMessage}</p>
            )}
          </div>
        </div>

        {/* Applied Schemes Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2 mb-1">
                <ClipboardList className="text-primary" />
                My Applied Schemes
              </h3>
              <p className="text-sm text-slate-500">Track the approval and eligibility of your submitted scheme applications.</p>
            </div>

            {applications && applications.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {applications.map((app) => (
                  <div key={app._id} className="py-5 first:pt-0 last:pb-0 flex flex-col gap-3 group">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-base group-hover:text-primary transition-colors">{app.schemeName}</h4>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusClass(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div><span className="text-slate-400 font-semibold">Applicant:</span> <span className="font-bold text-slate-700">{app.applicantName}</span> ({app.relationship})</div>
                      <div><span className="text-slate-400 font-semibold">ID Number:</span> <span className="font-bold text-slate-700">{app.idNumber ? `xxxx-xxxx-${app.idNumber.slice(-4)}` : 'N/A'}</span></div>
                      <div><span className="text-slate-400 font-semibold">Applied On:</span> <span className="font-bold text-slate-700">{new Date(app.createdAt).toLocaleDateString()}</span></div>
                      {app.idProofPath && (
                        <div>
                          <span className="text-slate-400 font-semibold">ID Proof:</span>{' '}
                          <a href={app.idProofPath} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold bg-primary/5 px-2 py-0.5 rounded">
                            View Document
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {(app.availableFrom || app.expiresAt) && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-50/30 rounded-xl p-3 border border-blue-100 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700 mt-1 shadow-inner">
                        {app.availableFrom && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-500"/>
                            <span className="font-semibold text-blue-900">Benefit Start:</span>{' '}
                            <span className="font-bold">{new Date(app.availableFrom).toLocaleDateString()}</span>
                          </div>
                        )}
                        {app.expiresAt && (
                          <div className="flex items-center gap-2">
                            <XCircle size={16} className="text-rose-500"/>
                            <span className="font-semibold text-blue-900">Benefit Expiry:</span>{' '}
                            <span className="font-bold">{new Date(app.expiresAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-slate-200 border-dashed">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                   <ClipboardList className="text-slate-300" size={40} />
                </div>
                <p className="text-slate-700 font-bold text-lg mb-1">No schemes applied yet</p>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">Visit the Schemes section to check your eligibility for government welfare programs and register online.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
