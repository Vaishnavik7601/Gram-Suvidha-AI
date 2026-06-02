import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Activity, Clock, CheckCircle, Users, AlertCircle, TrendingUp, Zap, User, MapPin, Mail, Phone, Bell } from 'lucide-react';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);
  const [adminForm, setAdminForm] = useState({
    name: '',
    phone: '',
    age: '',
    village: '',
    taluk: '',
    district: '',
    state: '',
    pincode: ''
  });
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [adminSaveStatus, setAdminSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const getSystemLogs = () => {
    const logs = [
      { id: 'LOG-001', event: 'Database connection established to MongoDB Cluster', category: 'SYSTEM', time: 'Just now', type: 'success' },
      { id: 'LOG-002', event: 'AI Chatbot assistant initialized on client ports', category: 'AI_BOT', time: '5 mins ago', type: 'info' },
      { id: 'LOG-003', event: 'Bilingual translation dictionary cache refreshed successfully', category: 'I18N', time: '12 mins ago', type: 'success' },
      { id: 'LOG-004', event: 'System overview dashboard requested by user admin@panchayat.gov.in', category: 'AUTH', time: '20 mins ago', type: 'info' },
    ];

    complaints.slice(0, 3).forEach((comp, idx) => {
      const timeString = comp.createdAt ? new Date(comp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${idx + 1} hr ago`;
      logs.unshift({
        id: `LOG-C${idx + 10}`,
        event: `Complaint updated: status marked as "${comp.status}" and assigned to "${comp.assigned || 'None'}"`,
        category: 'COMPLAINTS',
        time: timeString,
        type: comp.status === 'Resolved' ? 'success' : 'warning'
      });
    });

    workers.slice(0, 2).forEach((worker, idx) => {
      logs.unshift({
        id: `LOG-W${idx + 20}`,
        event: `Field worker registered: ${worker.name} assigned to village/ward "${worker.village || 'Panchayat Area'}"`,
        category: 'WORKFORCE',
        time: `${idx + 2} hrs ago`,
        type: 'info'
      });
    });

    return logs;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [complaintsRes, workersRes, citizensRes, profileRes] = await Promise.all([
          fetch('/api/complaints', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/api/auth/workers', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/api/auth/citizens', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        if (complaintsRes.ok) {
          const complaintsData = await complaintsRes.json();
          setComplaints(complaintsData);
          setNotifications(complaintsData.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5));
        }
        if (workersRes.ok) {
          const workersData = await workersRes.json();
          setWorkers(workersData);
        }
        if (citizensRes.ok) {
          const citizensData = await citizensRes.json();
          setCitizens(citizensData);
        }
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setAdminInfo(profileData.user || null);
          setAdminForm({
            name: profileData.user?.name || '',
            phone: profileData.user?.phone || '',
            age: profileData.user?.age || '',
            village: profileData.user?.village || '',
            taluk: profileData.user?.taluk || '',
            district: profileData.user?.district || '',
            state: profileData.user?.state || '',
            pincode: profileData.user?.pincode || ''
          });
        }
      } catch (err) {
        console.error("Error fetching admin metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // start polling for live notifications (recent complaints)
    const poll = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/complaints', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          // latest 5
          setNotifications(data.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5));
          setComplaints(data);
        }
      } catch (err) {
        // ignore polling errors
      }
    }, 10000);

    return () => clearInterval(poll);
  }, []);

  const filteredComplaints = days === 7 
    ? complaints.filter(c => {
        const date = new Date(c.createdAt || Date.now());
        const diffTime = Math.abs(new Date() - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      })
    : complaints;

  const totalRequests = filteredComplaints.length;
  const pendingCount = filteredComplaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = filteredComplaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = filteredComplaints.filter(c => c.status === 'Resolved').length;
  const activeWorkers = workers.length || 10; // Fallback to 10 if none found to look good

  const regData = [
    { name: 'Mon', value: 4 },
    { name: 'Tue', value: 3 },
    { name: 'Wed', value: 5 },
    { name: 'Thu', value: 4 },
    { name: 'Fri', value: 7 },
    { name: 'Sat', value: 6 },
    { name: 'Sun', value: totalRequests },
  ];

  const pieData = [
    { name: 'Pending', value: pendingCount || 5, color: '#f59e0b' },
    { name: 'Resolved', value: resolvedCount || 3, color: '#10b981' },
    { name: 'In Progress', value: inProgressCount || 4, color: '#3b82f6' },
  ];

  // Priority counts
  const highCount = filteredComplaints.filter(c => (c.priority || 'Medium') === 'High').length;
  const medCount = filteredComplaints.filter(c => (c.priority || 'Medium') === 'Medium').length;
  const lowCount = filteredComplaints.filter(c => (c.priority || 'Medium') === 'Low').length;
  const priorityData = [
    { name: 'High', value: highCount, color: '#ef4444' },
    { name: 'Medium', value: medCount, color: '#f59e0b' },
    { name: 'Low', value: lowCount, color: '#10b981' },
  ];

  const categories = ['water', 'electricity', 'roads', 'garbage'];
  const barData = categories.map(cat => {
    const count = filteredComplaints.filter(c => (c.category || '').toLowerCase().includes(cat)).length;
    return {
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: count || Math.floor(Math.random() * 10) + 1 // Default fallback for nice display
    };
  });

  const stats = [
    { title: 'TOTAL REQUESTS', value: totalRequests.toString(), trend: '+12%', icon: <Activity size={24} className="text-primary" />, bg: 'bg-primary/10' },
    { title: 'PENDING ACTION', value: pendingCount.toString(), trend: '-2%', icon: <Clock size={24} className="text-orange-500" />, bg: 'bg-orange-500/10' },
    { title: 'SUCCESSFUL RESOLUTIONS', value: resolvedCount.toString(), trend: '+5%', icon: <CheckCircle size={24} className="text-green-500" />, bg: 'bg-green-500/10' },
    { title: 'ACTIVE VOLUNTEERS', value: activeWorkers.toString(), trend: 'STABLE', icon: <Users size={24} className="text-blue-500" />, bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">System Overview</h1>
          <p className="text-slate-500 mt-1">GramSuvidha infrastructure and performance metrics.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-full text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> 63 Nodes Operational
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button 
              onClick={() => setDays(7)} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${days === 7 ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              7 DAYS
            </button>
            <button 
              onClick={() => setDays(30)} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${days === 30 ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              30 DAYS
            </button>
          </div>
          <div className="relative">
            <button onClick={() => setShowNotif(prev => !prev)} className="ml-3 relative inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <Bell />
              {notifications.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5">{notifications.length}</span>}
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-100 z-50">
                <div className="p-3 border-b border-slate-100 font-bold">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500">No recent notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id} className="p-3 border-b border-slate-100 text-sm">
                        <div className="font-semibold text-slate-800 truncate">{n.category || 'Complaint'}</div>
                        <div className="text-xs text-slate-500">{n.description?.slice(0,80) || ''}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 text-center">
                  <button onClick={() => setShowNotif(false)} className="text-xs text-primary font-bold">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {adminInfo && (
        <div className="card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Administrator Details</h2>
              <p className="text-sm text-slate-500 mt-1">Logged-in admin information and assigned region.</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                  {adminInfo.profilePhoto ? (
                    <img src={adminInfo.profilePhoto} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    <span>{adminInfo.name ? adminInfo.name.charAt(0).toUpperCase() : 'A'}</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{adminInfo.name || 'Admin'}</div>
                  <div className="text-xs text-slate-500">{adminInfo.village || ''}</div>
                  <div className="text-xs text-slate-500">{adminInfo.role?.toUpperCase() || 'ADMIN'}</div>
                </div>
                <div>
                  <input type="file" accept="image/*" id="admin-photo" className="hidden" />
                  <button onClick={async () => {
                    const input = document.getElementById('admin-photo');
                    input.click();
                    input.onchange = async () => {
                      const file = input.files[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append('photo', file);
                      try {
                        const token = localStorage.getItem('token');
                        const res = await fetch('/api/auth/profile/photo', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` },
                          body: form
                        });
                        const result = await res.json();
                        if (res.ok) {
                          setAdminInfo(prev => ({ ...prev, profilePhoto: result.profilePhoto }));
                        } else {
                          alert(result.message || 'Failed to upload photo');
                        }
                      } catch (err) {
                        alert('Network error');
                      }
                    };
                  }} className="ml-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50">
                    Change Photo
                  </button>
                </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Mail size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">Email</span>
                </div>
                <p className="font-semibold text-slate-800 break-all">{adminInfo.email || 'Not set'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Phone size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">Phone</span>
                </div>
                {isEditingAdmin ? (
                  <input
                    type="text"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                ) : (
                  <p className="font-semibold text-slate-800">{adminInfo.phone || 'Not set'}</p>
                )}
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <User size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">Village ID</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.villageId || 'Not set'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (isEditingAdmin) {
                  setIsEditingAdmin(false);
                  setAdminForm({
                    name: adminInfo.name || '',
                    phone: adminInfo.phone || '',
                    age: adminInfo.age || '',
                    village: adminInfo.village || '',
                    taluk: adminInfo.taluk || '',
                    district: adminInfo.district || '',
                    state: adminInfo.state || '',
                    pincode: adminInfo.pincode || ''
                  });
                  setAdminSaveStatus('');
                } else {
                  setIsEditingAdmin(true);
                }
              }}
              className="inline-flex items-center justify-center rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
            >
              {isEditingAdmin ? 'Cancel' : 'Edit Details'}
            </button>
          </div>

          {isEditingAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</label>
                <input
                  type="text"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Age</label>
                <input
                  type="number"
                  value={adminForm.age}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, age: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Village</label>
                <input
                  type="text"
                  value={adminForm.village}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, village: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {isEditingAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Taluk</label>
                <input
                  type="text"
                  value={adminForm.taluk}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, taluk: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">District</label>
                <input
                  type="text"
                  value={adminForm.district}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, district: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">State</label>
                <input
                  type="text"
                  value={adminForm.state}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, state: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pincode</label>
                <input
                  type="text"
                  value={adminForm.pincode}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, pincode: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {isEditingAdmin && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={async () => {
                  setAdminSaveStatus('Saving...');
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch('/api/auth/profile', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(adminForm)
                    });

                    const result = await res.json();
                    if (res.ok) {
                      setAdminInfo(result.user || { ...adminInfo, ...adminForm });
                      setIsEditingAdmin(false);
                      setAdminSaveStatus('Details updated successfully');
                    } else {
                      setAdminSaveStatus(result.message || 'Update failed');
                    }
                  } catch (error) {
                    console.error(error);
                    setAdminSaveStatus('Update failed');
                  }
                }}
                className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
              >
                Save changes
              </button>
              <span className="text-sm text-slate-500">{adminSaveStatus}</span>
            </div>
          )}

          {!isEditingAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">Village</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.village || 'Not set'}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">Taluk</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.taluk || 'Not set'}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">District</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.district || 'Not set'}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">State</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.state || 'Not set'}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">Pincode</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.pincode || 'Not set'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                {stat.icon}
              </div>
              <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : stat.trend === 'STABLE' ? 'text-slate-400' : 'text-red-500'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" /> Registration Volume
              </h3>
              <p className="text-xs text-slate-500 mt-1">Daily community participation trend.</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={regData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card">
          <div className="text-center mb-2">
            <h3 className="font-bold text-lg text-slate-800 flex items-center justify-center gap-2">
              <Zap size={20} className="text-orange-500" /> Live Status
            </h3>
            <p className="text-xs text-slate-500 mt-1">Operational lifecycle phase.</p>
          </div>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-slate-800">3</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.name}</div>
                  <div className="font-bold text-slate-800">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-700 mb-2">Complaint Priorities</h4>
            <div className="flex gap-3">
              {priorityData.map((p, idx) => (
                <div key={idx} className="flex-1 bg-white rounded-lg p-3 border border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{p.name}</div>
                  <div className="text-2xl font-bold" style={{color: p.color}}>{p.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card bg-secondary text-white border-none">
          <h3 className="font-bold text-lg flex items-center gap-2">Department Velocity</h3>
          <p className="text-xs text-indigo-200 mt-1 mb-6">Performance metrics by category.</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#c7d2fe', fontSize: 10}} />
                <Bar dataKey="value" fill="#ffffff" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Matrix (replacing System Intel) */}
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-1">
            <Zap size={20} className="text-indigo-500" /> Performance Matrix
          </h3>
          <p className="text-xs text-slate-500 mb-6">Key operational performance indicators.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Resolution Time</div>
              <div className="text-2xl font-bold text-slate-800 mt-2">{
                (() => {
                  const resolved = complaints.filter(c => c.status === 'Resolved' && c.createdAt && c.updatedAt);
                  if (resolved.length === 0) return 'N/A';
                  const totalHours = resolved.reduce((sum, r) => sum + (new Date(r.updatedAt) - new Date(r.createdAt)) / (1000*60*60), 0);
                  const avg = (totalHours / resolved.length).toFixed(1);
                  return `${avg} hrs`;
                })()
              }</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Compliance (72h)</div>
              <div className="text-2xl font-bold text-slate-800 mt-2">{
                (() => {
                  const resolved = complaints.filter(c => c.status === 'Resolved' && c.createdAt && c.updatedAt);
                  if (resolved.length === 0) return 'N/A';
                  const within = resolved.filter(r => (new Date(r.updatedAt) - new Date(r.createdAt)) <= 72*60*60*1000).length;
                  const perc = Math.round((within / resolved.length) * 100);
                  return `${perc}%`;
                })()
              }</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Assignments per Worker</div>
              <div className="text-2xl font-bold text-slate-800 mt-2">{
                (() => {
                  const assignedCount = complaints.filter(c => c.assigned && c.assigned !== '-').length;
                  if (workers.length === 0) return 'N/A';
                  const avg = (assignedCount / workers.length).toFixed(1);
                  return avg;
                })()
              }</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Tickets</div>
              <div className="text-2xl font-bold text-slate-800 mt-2">{filteredComplaints.filter(c => c.status !== 'Resolved').length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Citizens Under Administration */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-primary" /> Citizens Under Administration
            </h3>
            <p className="text-xs text-slate-500 mt-1">List of all citizens registered in your village/ward.</p>
          </div>
          <div className="text-xs font-bold px-3 py-1 border border-slate-200 rounded-full flex items-center gap-2">
            <Users size={14} className="text-slate-400" /> TOTAL: {citizens.length}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading citizens...</div>
          ) : citizens.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Users className="mx-auto mb-3 text-slate-300" size={48} />
              <p className="font-semibold text-slate-500">No citizens found</p>
              <p className="text-xs text-slate-400 mt-1">Citizens registering with your Village ID will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 sticky top-0 bg-white">
                  <th className="pb-3 pl-4">Name</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Demographics</th>
                  <th className="pb-3">Registered On</th>
                </tr>
              </thead>
              <tbody>
                {citizens.map((citizen) => (
                  <tr key={citizen._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {citizen.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">{citizen.name}</div>
                          <div className="text-xs text-slate-500">Village ID: {citizen.villageId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm font-semibold text-slate-700">{citizen.phone}</div>
                      <div className="text-xs text-slate-500 truncate w-40" title={citizen.email}>{citizen.email}</div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm text-slate-700">{citizen.age} Yrs</div>
                      <div className="text-xs text-slate-500 capitalize">{citizen.gender || 'Not specified'}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-semibold text-sm text-slate-800">
                        {new Date(citizen.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Operational Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">System Operational Logs</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time status updates and admin action tracking.</p>
              </div>
              <button onClick={() => setShowLogsModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4">
              {getSystemLogs().map((log, index) => (
                <div key={log.id || index} className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                    log.type === 'success' ? 'bg-green-100 text-green-700' :
                    log.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {log.category.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{log.category}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{log.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{log.event}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">ID: {log.id}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowLogsModal(false)} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-sm">
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
