import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as LucideIcons from 'lucide-react';

const getCategoryIcon = (category) => {
  const normalized = (category || '').toUpperCase();
  if (normalized.includes('WATER')) {
    return <LucideIcons.Droplets className="text-blue-500" size={24} />;
  } else if (normalized.includes('ROAD')) {
    return <LucideIcons.AlertTriangle className="text-orange-500" size={24} />;
  } else if (normalized.includes('GARBAGE')) {
    return <LucideIcons.Trash2 className="text-stone-500" size={24} />;
  } else if (normalized.includes('ELECT')) {
    return <LucideIcons.Zap className="text-yellow-500" size={24} />;
  }
  return <LucideIcons.AlertTriangle className="text-purple-500" size={24} />;
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'Resolved':
      return { statusColor: 'text-green-600 bg-green-100', stage: 'STAGE: RESOLUTION REACHED', progress: 100 };
    case 'In Progress':
      return { statusColor: 'text-blue-600 bg-blue-100', stage: 'STAGE: IMPLEMENTATION PHASE', progress: 75 };
    default:
      return { statusColor: 'text-yellow-600 bg-yellow-100', stage: 'STAGE: REGISTRATION PHASE', progress: 25 };
  }
};

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [schemeApplications, setSchemeApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Citizen');
  const [village, setVillage] = useState('');

  const [stats, setStats] = useState({ total: 0, review: 0, progress: 0, resolved: 0 });
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([
    { name: 'Pending', value: 0, color: '#f59e0b' },
    { name: 'In Progress', value: 0, color: '#3b82f6' },
    { name: 'Resolved', value: 0, color: '#10b981' },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Read user info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUserName(userObj.name || 'Citizen');
        setVillage(userObj.village || '');
      } catch (e) {
        console.error(e);
      }
    }

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch this citizen's complaints (backend filters by req.user._id for citizens)
        const [complaintsRes, profileRes] = await Promise.all([
          fetch('/api/complaints', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        // ---- Complaints ----
        if (complaintsRes.ok) {
          const data = await complaintsRes.json();
          const formatted = (data || []).map((c, i) => {
            const statusInfo = getStatusStyles(c.status);
            return {
              _id: c._id,
              id: c._id ? `INC-${c._id.slice(-3).toUpperCase()}` : `INC-00${i + 1}`,
              title: c.category ? c.category.replace('_', ' ').toUpperCase() : 'GENERAL',
              desc: c.description ? c.description.slice(0, 55) + (c.description.length > 55 ? '...' : '') : 'No description',
              location: c.location || 'Unknown Location',
              status: c.status || 'Pending',
              date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent',
              icon: getCategoryIcon(c.category),
              ...statusInfo
            };
          });
          setSubmissions(formatted);

          // Calculate stats from real data
          const total = formatted.length;
          const review = formatted.filter(s => s.status === 'Pending' || s.status === 'Under Review').length;
          const progress = formatted.filter(s => s.status === 'In Progress').length;
          const resolved = formatted.filter(s => s.status === 'Resolved').length;
          setStats({ total, review, progress, resolved });

          // Category bar chart
          const categories = {};
          formatted.forEach(s => {
            categories[s.title] = (categories[s.title] || 0) + 1;
          });
          const newBarData = Object.keys(categories).map(cat => ({ name: cat, value: categories[cat] }));
          setBarData(newBarData);

          // Pie chart
          setPieData([
            { name: 'Pending', value: review, color: '#f59e0b' },
            { name: 'In Progress', value: progress, color: '#3b82f6' },
            { name: 'Resolved', value: resolved, color: '#10b981' },
          ]);
        }

        // ---- Scheme Applications ----
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setSchemeApplications(profileData.applications || []);
          // Also update name/village from fresh profile data
          if (profileData.user) {
            setUserName(profileData.user.name || 'Citizen');
            setVillage(profileData.user.village || '');
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const schemeStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Too Late': return 'bg-rose-100 text-rose-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Citizen Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, <span className="font-bold text-slate-700">{userName}</span>.
            {village && <span className="text-slate-400"> • {village}</span>}
            <span className="ml-2 text-xs">Track your reported issues and scheme applications.</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/citizen/complaint')}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
        >
          <LucideIcons.PlusCircle size={18} /> New Complaint
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center py-6">
          <LucideIcons.FileText className="mx-auto mb-2 text-slate-400" size={24} />
          <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">Total</div>
        </div>
        <div className="card text-center py-6">
          <LucideIcons.Clock className="mx-auto mb-2 text-yellow-500" size={24} />
          <div className="text-3xl font-bold text-slate-800">{stats.review}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">Under Review</div>
        </div>
        <div className="card text-center py-6">
          <LucideIcons.Activity className="mx-auto mb-2 text-blue-500" size={24} />
          <div className="text-3xl font-bold text-slate-800">{stats.progress}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">In Progress</div>
        </div>
        <div className="card text-center py-6">
          <LucideIcons.CheckCircle className="mx-auto mb-2 text-green-500" size={24} />
          <div className="text-3xl font-bold text-slate-800">{stats.resolved}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">Resolved</div>
        </div>
      </div>

      {/* My Complaints */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800">My Complaints</h3>
            <p className="text-xs text-slate-500">Track the live progress of your reported issues.</p>
          </div>
          <div className="text-xs font-bold px-3 py-1 border border-slate-200 rounded-full flex items-center gap-2">
            <LucideIcons.Activity size={14} className="text-slate-400" /> ACTIVE TRACKING
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading your complaints...</div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center">
              <LucideIcons.Inbox className="mx-auto mb-3 text-slate-300" size={48} />
              <p className="font-semibold text-slate-500">No complaints filed yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "New Complaint" to report an issue in your village.</p>
              <button
                onClick={() => navigate('/citizen/complaint')}
                className="mt-4 px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
              >
                File Your First Complaint
              </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="pb-3 pl-4">Incident</th>
                  <th className="pb-3">Current Status</th>
                  <th className="pb-3">Incident Location</th>
                  <th className="pb-3">Progress Stage</th>
                  <th className="pb-3">Registered</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => (
                  <tr key={sub._id || i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-4 pl-4 flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {sub.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm mb-0.5">{sub.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 w-48">{sub.desc}</div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${sub.statusColor}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-8 bg-slate-100 rounded flex items-center justify-center text-red-500">
                          <LucideIcons.MapPin size={14} />
                        </div>
                        <div className="text-xs text-slate-500 w-32 line-clamp-2">{sub.location}</div>
                      </div>
                    </td>
                    <td className="py-4 w-48">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">{sub.stage}</div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${sub.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${sub.progress}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-sm text-slate-800">{sub.date}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Entry</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* My Scheme Applications */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800">My Scheme Applications</h3>
            <p className="text-xs text-slate-500">Status of your government scheme applications.</p>
          </div>
          <button
            onClick={() => navigate('/citizen/schemes')}
            className="text-xs font-bold px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5"
          >
            <LucideIcons.Plus size={13} /> Apply for Scheme
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-sm">Loading applications...</div>
        ) : schemeApplications.length === 0 ? (
          <div className="py-10 text-center">
            <LucideIcons.ClipboardList className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="font-semibold text-slate-500">No scheme applications yet</p>
            <p className="text-xs text-slate-400 mt-1">Check eligibility and apply for government schemes.</p>
            <button
              onClick={() => navigate('/citizen/schemes')}
              className="mt-4 px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
            >
              Explore Schemes
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="pb-3 pl-4">Scheme Name</th>
                  <th className="pb-3">Applicant</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Applied On</th>
                  <th className="pb-3">Application ID</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {schemeApplications.map((app, i) => (
                  <tr key={app._id || i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="py-3 pl-4 font-semibold text-slate-800">{app.schemeName}</td>
                    <td className="py-3 text-slate-600">
                      {app.applicantName}
                      <div className="text-xs text-slate-400">{app.relationship || 'Self'} • {app.age} yrs</div>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${schemeStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-500">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 font-mono text-xs text-slate-500">{app.applicationId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics — only show if there's data */}
      {submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-lg mb-1">Complaint Analytics</h3>
            <p className="text-xs text-slate-500 mb-6">Visual overview of your reporting activity.</p>
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-30} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickCount={5} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Issues By Category</div>
          </div>

          <div className="card flex flex-col items-center justify-center">
            <h3 className="font-bold text-lg mb-4 self-start">Resolution Status</h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.filter(d => d.value > 0)}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {pieData.filter(d => d.value > 0).map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
