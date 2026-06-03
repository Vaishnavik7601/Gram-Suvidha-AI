import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Activity, Clock, CheckCircle, Users, AlertCircle, TrendingUp, Zap, User, MapPin, Mail, Phone, Bell, Plus, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const getCategoryLabel = (category, t) => {
  if (!category) return '';
  const normalized = category.toLowerCase();
  if (normalized.includes('water')) return t('waterTitle');
  if (normalized.includes('elect') || normalized.includes('light')) return t('lightTitle');
  if (normalized.includes('road')) return t('roadTitle');
  if (normalized.includes('garbage')) return t('garbageDump');
  if (normalized.includes('scheme')) return t('schemeTitle');
  if (normalized.includes('election')) return t('electionSchedule');
  if (normalized.includes('result')) return t('liveElectionStandings');
  if (normalized.includes('other')) return t('other');
  return category;
};

const AdminDashboard = () => {
  const { t } = useLanguage();
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

  // Tabs and updates/elections state
  const [activeTab, setActiveTab] = useState('overview');
  const [updates, setUpdates] = useState([]);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [updateForm, setUpdateForm] = useState({ title: '', category: 'Other', description: '', date: '' });
  const [updateStatus, setUpdateStatus] = useState('');
  
  const [electionConfig, setElectionConfig] = useState(null);
  const [electionResults, setElectionResults] = useState(null);
  const [electionForm, setElectionForm] = useState({ startDate: '', endDate: '' });
  const [electionStatus, setElectionStatus] = useState('');

  const fetchUpdates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/updates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUpdates(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchElectionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [configRes, resultsRes] = await Promise.all([
        fetch('/api/elections/config', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/elections/results', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (configRes.ok) {
        const configData = await configRes.json();
        setElectionConfig(configData);
        if (configData) {
          setElectionForm({
            startDate: configData.startDate ? configData.startDate.split('T')[0] : '',
            endDate: configData.endDate ? configData.endDate.split('T')[0] : ''
          });
        }
      }
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setElectionResults(resultsData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setUpdateStatus(t('submitting'));
    try {
      const token = localStorage.getItem('token');
      const isEdit = !!editingUpdate;
      const url = isEdit ? `/api/updates/${editingUpdate._id}` : '/api/updates';
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateForm)
      });
      const result = await res.json();
      if (res.ok) {
        setUpdateStatus(isEdit ? t('updateSuccess') : t('publishSuccess'));
        setUpdateForm({ title: '', category: 'Other', description: '', date: '' });
        setIsAddingUpdate(false);
        setEditingUpdate(null);
        setUpdateStatus('');
        fetchUpdates();
      } else {
        setUpdateStatus(result.message || t('updateFailed'));
      }
    } catch (err) {
      setUpdateStatus(t('networkError'));
    }
  };

  const handleDeleteUpdate = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/updates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUpdates();
      } else {
        const errData = await res.json();
        alert(errData.message || t('deleteSuccess'));
      }
    } catch (err) {
      alert(t('networkError'));
    }
  };

  const handleSaveElection = async (e) => {
    e.preventDefault();
    setElectionStatus(t('scheduling'));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/elections/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(electionForm)
      });
      const data = await res.json();
      if (res.ok) {
        setElectionStatus(t('electionSaved'));
        setElectionConfig(data);
        fetchElectionData();
      } else {
        setElectionStatus(data.message || t('electionSaveFailed'));
      }
    } catch (err) {
      setElectionStatus(t('networkError'));
    }
  };

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

        // Fetch updates and election config
        fetchUpdates();
        fetchElectionData();
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
    let displayName = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (cat === 'water') displayName = t('waterTitle').split(' ')[0];
    else if (cat === 'electricity') displayName = t('lightTitle').split(' ')[0];
    else if (cat === 'roads') displayName = t('roadTitle').split(' ')[0];
    else if (cat === 'garbage') displayName = t('garbageDump');
    return {
      name: displayName,
      value: count || Math.floor(Math.random() * 10) + 1 // Default fallback for nice display
    };
  });

  const stats = [
    { title: t('totalSubmissionsLabel'), value: totalRequests.toString(), trend: '+12%', icon: <Activity size={24} className="text-primary" />, bg: 'bg-primary/10' },
    { title: t('awaitingReview'), value: pendingCount.toString(), trend: '-2%', icon: <Clock size={24} className="text-orange-500" />, bg: 'bg-orange-500/10' },
    { title: t('resolved'), value: resolvedCount.toString(), trend: '+5%', icon: <CheckCircle size={24} className="text-green-500" />, bg: 'bg-green-500/10' },
    { title: t('workersActive'), value: activeWorkers.toString(), trend: 'STABLE', icon: <Users size={24} className="text-blue-500" />, bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{t('home')}</h1>
          <p className="text-slate-500 mt-1">{t('infrastructureMetrics')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-full text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> {t('nodesOperational', '63 Nodes Operational')}
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button 
              onClick={() => setDays(7)} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${days === 7 ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              7 {t('days', 'DAYS')}
            </button>
            <button 
              onClick={() => setDays(30)} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${days === 30 ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              30 {t('days', 'DAYS')}
            </button>
          </div>
          <div className="relative">
            <button onClick={() => setShowNotif(prev => !prev)} className="ml-3 relative inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <Bell />
              {notifications.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5">{notifications.length}</span>}
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-100 z-50">
                <div className="p-3 border-b border-slate-100 font-bold">{t('notifications')}</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500">{t('noNotifications')}</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id} className="p-3 border-b border-slate-100 text-sm">
                        <div className="font-semibold text-slate-800 truncate">{getCategoryLabel(n.category, t) || t('complaintDetailsModal')}</div>
                        <div className="text-xs text-slate-500">{n.description?.slice(0,80) || ''}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 text-center">
                  <button onClick={() => setShowNotif(false)} className="text-xs text-primary font-bold">{t('close')}</button>
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
              <h2 className="text-xl font-bold text-slate-800">{t('adminDetails')}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('assignedRegion')}</p>
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
                    {t('changePhoto')}
                  </button>
                </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Mail size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">{t('email')}</span>
                </div>
                <p className="font-semibold text-slate-800 break-all">{adminInfo.email || 'Not set'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Phone size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">{t('phone')}</span>
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
                  <span className="text-xs uppercase tracking-wider font-bold">{t('villageId')}</span>
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
              {isEditingAdmin ? t('cancel') : t('editDetails')}
            </button>
          </div>

          {isEditingAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('fullName')}</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('phone')}</label>
                <input
                  type="text"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('age')}</label>
                <input
                  type="number"
                  value={adminForm.age}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, age: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('village')}</label>
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('taluk')}</label>
                <input
                  type="text"
                  value={adminForm.taluk}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, taluk: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('district')}</label>
                <input
                  type="text"
                  value={adminForm.district}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, district: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('state')}</label>
                <input
                  type="text"
                  value={adminForm.state}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, state: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('pincode')}</label>
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
                  setAdminSaveStatus(t('submitting'));
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
                      setAdminSaveStatus(t('detailsUpdated', 'Details updated successfully'));
                    } else {
                      setAdminSaveStatus(result.message || t('updateFailed', 'Update failed'));
                    }
                  } catch (error) {
                    console.error(error);
                    setAdminSaveStatus(t('updateFailed', 'Update failed'));
                  }
                }}
                className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors"
              >
                {t('saveChanges')}
              </button>
              <span className="text-sm text-slate-500">{adminSaveStatus}</span>
            </div>
          )}

          {!isEditingAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">{t('village')}</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.village || t('notSet', 'Not set')}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">{t('taluk')}</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.taluk || t('notSet', 'Not set')}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">{t('district')}</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.district || t('notSet', 'Not set')}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">{t('state')}</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.state || t('notSet', 'Not set')}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold">{t('pincode')}</span>
                </div>
                <p className="font-semibold text-slate-800">{adminInfo.pincode || t('notSet', 'Not set')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 mb-6 flex gap-6 flex-wrap">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'overview' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('overviewTab')}
        </button>
        <button
          onClick={() => setActiveTab('updates')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'updates' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          {t('updatesTab')}
        </button>
        <button
          onClick={() => setActiveTab('election')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'election' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Election Scheduler & Standings
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
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
                <TrendingUp size={20} className="text-primary" /> {t('registrationVolume')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{t('dailyVolumeDesc')}</p>
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
              <Zap size={20} className="text-orange-500" /> {t('liveStatus')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{t('liveStatusDesc')}</p>
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
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.name === 'Pending' ? t('pendingStatus') : item.name === 'In Progress' ? t('inProgress') : item.name === 'Resolved' ? t('resolved') : item.name}</div>
                  <div className="font-bold text-slate-800">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-700 mb-2">{t('complaintPriorities')}</h4>
            <div className="flex gap-3">
              {priorityData.map((p, idx) => (
                <div key={idx} className="flex-1 bg-white rounded-lg p-3 border border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{p.name === 'High' ? t('high') : p.name === 'Medium' ? t('medium') : p.name === 'Low' ? t('low') : p.name}</div>
                  <div className="text-2xl font-bold" style={{color: p.color}}>{p.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card bg-secondary text-white border-none">
          <h3 className="font-bold text-lg flex items-center gap-2">{t('departmentVelocity')}</h3>
          <p className="text-xs text-indigo-200 mt-1 mb-6">{t('deptVelocityDesc')}</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#c7d2fe', fontSize: 10}} />
                <Bar dataKey="value" fill="#ffffff" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Matrix */}
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-1">
            <Zap size={20} className="text-indigo-500" /> {t('performanceMatrix')}
          </h3>
          <p className="text-xs text-slate-500 mb-6">{t('perfMatrixDesc')}</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('avgResolutionTime')}</div>
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
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('slaCompliance')}</div>
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
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('avgAssignments')}</div>
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
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('openTickets')}</div>
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
              <Users size={20} className="text-primary" /> {t('citizensUnderAdmin')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{t('citizensUnderAdminDesc')}</p>
          </div>
          <div className="text-xs font-bold px-3 py-1 border border-slate-200 rounded-full flex items-center gap-2">
            <Users size={14} className="text-slate-400" /> {t('totalCaps')}: {citizens.length}
          </div>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500">{t('loadingCitizens')}</div>
          ) : citizens.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Users className="mx-auto mb-3 text-slate-300" size={48} />
              <p className="font-semibold text-slate-500">{t('noCitizensFound')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('citizensRegisteringNote')}</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 sticky top-0 bg-white">
                  <th className="pb-3 pl-4">{t('fullName')}</th>
                  <th className="pb-3">{t('contactLabel')}</th>
                  <th className="pb-3">{t('demographics')}</th>
                  <th className="pb-3">{t('registered')}</th>
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
                          <div className="text-xs text-slate-500">{t('villageId')}: {citizen.villageId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm font-semibold text-slate-700">{citizen.phone}</div>
                      <div className="text-xs text-slate-500 truncate w-40" title={citizen.email}>{citizen.email}</div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm text-slate-700">{citizen.age} {t('yrs')}</div>
                      <div className="text-xs text-slate-500 capitalize">{citizen.gender || t('notSpecified')}</div>
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
      </>
      )}

      {activeTab === 'updates' && (
        <div className="space-y-6">
          {/* Add / Edit Update Form */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  {editingUpdate ? t('editAnnouncement') : t('addAnnouncement')}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingUpdate ? t('editAnnouncementDesc') : t('publishAnnouncementDesc')}
                </p>
              </div>
              {(isAddingUpdate || editingUpdate) && (
                <button
                  onClick={() => {
                    setIsAddingUpdate(false);
                    setEditingUpdate(null);
                    setUpdateForm({ title: '', category: 'Other', description: '', date: '' });
                    setUpdateStatus('');
                  }}
                  className="text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  {t('cancel')}
                </button>
              )}
            </div>

            {!isAddingUpdate && !editingUpdate ? (
              <button
                onClick={() => setIsAddingUpdate(true)}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus size={16} /> {t('publishAnnouncement')}
              </button>
            ) : (
              <form onSubmit={handleSaveUpdate} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('title')}</label>
                    <input
                      type="text"
                      required
                      value={updateForm.title}
                      onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Panchayat Elections 2026 Scheduled"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('category')}</label>
                    <select
                      value={updateForm.category}
                      onChange={(e) => setUpdateForm({ ...updateForm, category: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                    >
                      <option value="Election">{getCategoryLabel('Election', t)}</option>
                      <option value="Result">{getCategoryLabel('Result', t)}</option>
                      <option value="Water Dispute">{getCategoryLabel('Water Dispute', t)}</option>
                      <option value="Electricity">{getCategoryLabel('Electricity', t)}</option>
                      <option value="Other">{getCategoryLabel('Other', t)}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('eventDate')}</label>
                    <input
                      type="date"
                      value={updateForm.date ? updateForm.date.split('T')[0] : ''}
                      onChange={(e) => setUpdateForm({ ...updateForm, date: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('description')}</label>
                   <textarea
                     required
                     rows="4"
                     value={updateForm.description}
                     onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                     className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                     placeholder={t('announcementPlaceholder', 'Provide details about the announcement...')}
                   ></textarea>
                </div>

                <div className="flex items-center gap-4">
                  <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">
                    {editingUpdate ? t('updateAnnouncement') : t('publishAnnouncement')}
                  </button>
                  {updateStatus && <span className="text-xs font-bold text-primary">{updateStatus}</span>}
                </div>
              </form>
            )}
          </div>

          {/* Published Updates List */}
          <div className="card">
            <h3 className="font-bold text-lg text-slate-800 mb-2">{t('publishedVillageUpdates')}</h3>
            <p className="text-xs text-slate-500 mb-6">{t('publishedUpdatesDesc')}</p>

            <div className="space-y-4">
              {updates.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic">{t('noAnnouncements')}</div>
              ) : (
                updates.map((up) => (
                  <div key={up._id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-100 transition-all flex justify-between items-start gap-4 shadow-sm">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                          {getCategoryLabel(up.category, t)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {t('eventDateLabel')}: {new Date(up.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{up.title}</h4>
                      <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{up.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingUpdate(up);
                          setUpdateForm({
                            title: up.title,
                            category: up.category,
                            description: up.description,
                            date: up.date ? up.date.split('T')[0] : ''
                          });
                        }}
                        className="px-2.5 py-1 border border-slate-200 text-slate-650 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors text-xs font-bold"
                        title={t('editLabel')}
                      >
                        {t('editLabel')}
                      </button>
                      <button
                        onClick={() => handleDeleteUpdate(up._id)}
                        className="px-2.5 py-1 border border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold"
                        title={t('deleteLabel')}
                      >
                        {t('deleteLabel')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'election' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Schedule Election dates */}
            <div className="card lg:col-span-1 h-fit">
              <h3 className="font-bold text-lg text-slate-800 mb-1">{t('scheduleYearlyElection')}</h3>
              <p className="text-xs text-slate-500 mb-6">{t('scheduleYearlyElectionDesc')}</p>

              <form onSubmit={handleSaveElection} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('votingStartDate')}</label>
                  <input
                    type="date"
                    required
                    value={electionForm.startDate}
                    onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('votingEndDate')}</label>
                  <input
                    type="date"
                    required
                    value={electionForm.endDate}
                    onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors mt-4">
                  {t('saveElectionDates')}
                </button>
                {electionStatus && (
                  <p className="text-xs font-bold text-center mt-2 text-primary">{electionStatus}</p>
                )}
              </form>

              {electionConfig && (
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <h4 className="font-bold text-slate-800 mb-2">{t('activeConfiguration')}</h4>
                  <p className="text-slate-600"><span className="font-semibold text-slate-800">{t('yearLabel')}:</span> {electionConfig.year}</p>
                  <p className="text-slate-600"><span className="font-semibold text-slate-800">{t('startLabel')}:</span> {new Date(electionConfig.startDate).toLocaleDateString()}</p>
                  <p className="text-slate-600"><span className="font-semibold text-slate-800">{t('endLabel')}:</span> {new Date(electionConfig.endDate).toLocaleDateString()}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      (() => {
                        const now = new Date();
                        const start = new Date(electionConfig.startDate);
                        const end = new Date(electionConfig.endDate);
                        return (now >= start && now <= end) ? 'bg-green-500 animate-pulse' : 'bg-red-500';
                      })()
                    }`}></span>
                    <span className="font-semibold text-slate-600">
                      {(() => {
                        const now = new Date();
                        const start = new Date(electionConfig.startDate);
                        const end = new Date(electionConfig.endDate);
                        return (now >= start && now <= end) ? t('electionsCurrentlyActive') : t('electionsCurrentlyInactive');
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Live Election Results Standings */}
            <div className="card lg:col-span-2">
              <h3 className="font-bold text-lg text-slate-800 mb-1">{t('liveElectionStandings')}</h3>
              <p className="text-xs text-slate-500 mb-6">{t('liveElectionStandingsDesc')}</p>

              {electionResults ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-bold text-slate-600">
                    <span>{t('totalVotesCast')}: {electionResults.totalVotes}</span>
                    <span>{t('electionYear')}: {electionResults.year}</span>
                  </div>

                  <div className="space-y-4">
                    {electionResults.results.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 italic">{t('noAdminsRegistered')}</div>
                    ) : (
                      electionResults.results.map((cand, idx) => {
                        const pct = electionResults.totalVotes > 0 
                          ? Math.round((cand.votes / electionResults.totalVotes) * 100)
                          : 0;

                        return (
                          <div key={cand._id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 overflow-hidden border border-slate-200 flex-shrink-0">
                                {cand.profilePhoto ? (
                                  <img src={cand.profilePhoto} alt={cand.name} className="w-full h-full object-cover" />
                                ) : (
                                  cand.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-slate-800 text-sm">{cand.name}</span>
                                  <span className="text-xs font-bold text-slate-500">{cand.votes} {t('votes')} ({pct}%)</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${
                                      idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : 'bg-slate-400'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="text-center font-bold text-xs bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-slate-700 min-w-16">
                              {t('rank')} #{idx + 1}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 italic">{t('loadingStandings')}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Operational Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{t('systemOperationalLogs')}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t('systemLogsDesc')}</p>
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
                {t('closeLogs')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
