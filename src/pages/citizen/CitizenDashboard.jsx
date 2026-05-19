import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as LucideIcons from 'lucide-react';

const mockSubmissions = [
  {
    id: 'INC-001',
    title: 'WATER SUPPLY',
    desc: 'Major pipeline burst causing heavy water leakage on s...',
    location: 'S V Road, Bandra West, Mumbai',
    status: 'Under Review',
    statusColor: 'text-yellow-600 bg-yellow-100',
    stage: 'STAGE: REGISTRATION PHASE',
    progress: 25,
    date: '4/25/2026',
    icon: <LucideIcons.Droplets className="text-blue-500" size={24} />
  },
  {
    id: 'INC-002',
    title: 'ROADS',
    desc: 'Extremely deep pothole in the middle of the road...',
    location: 'SV Road, Bandra West, Mumbai',
    status: 'In Progress',
    statusColor: 'text-blue-600 bg-blue-100',
    stage: 'STAGE: IMPLEMENTATION PHASE',
    progress: 75,
    date: '4/24/2026',
    icon: <LucideIcons.AlertTriangle className="text-orange-500" size={24} />
  },
  {
    id: 'INC-003',
    title: 'DRAINAGE',
    desc: 'Open manhole near the school entrance. Very...',
    location: 'Sanjay Gandhi National Park Rd',
    status: 'Under Review',
    statusColor: 'text-yellow-600 bg-yellow-100',
    stage: 'STAGE: VERIFICATION',
    progress: 50,
    date: '4/23/2026',
    icon: <LucideIcons.AlertTriangle className="text-purple-500" size={24} />
  },
  {
    id: 'INC-004',
    title: 'GARBAGE',
    desc: 'Animal carcass on the road needs immediate...',
    location: 'Chembur Naka, Mumbai',
    status: 'Resolved',
    statusColor: 'text-green-600 bg-green-100',
    stage: 'STAGE: RESOLUTION REACHED',
    progress: 100,
    date: '4/22/2026',
    icon: <LucideIcons.Trash2 className="text-stone-500" size={24} />
  }
];

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
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('John Doe');

  const [stats, setStats] = useState({
    total: 6,
    review: 3,
    progress: 2,
    resolved: 1
  });

  const [barData, setBarData] = useState([
    { name: 'Water Supply', value: 1 },
    { name: 'Roads', value: 1 },
    { name: 'Drainage', value: 1 },
    { name: 'Public Health', value: 1 },
    { name: 'Encroachment', value: 1 },
    { name: 'Garbage', value: 1 },
  ]);

  const [pieData, setPieData] = useState([
    { name: 'Under Review', value: 3, color: '#f59e0b' },
    { name: 'In Progress', value: 2, color: '#3b82f6' },
    { name: 'Resolved', value: 1, color: '#10b981' },
  ]);

  useEffect(() => {
    // Get user details
    const userStr = localStorage.getItem('user');
    let loggedInUserId = '';
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUserName(userObj.name || 'John Doe');
        loggedInUserId = userObj._id;
      } catch (e) {
        console.error(e);
      }
    }

    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/complaints');
        if (response.ok) {
          const data = await response.json();
          // Filter to show user's complaints if logged in, otherwise show all backend complaints up to 5
          const filteredData = loggedInUserId 
            ? data.filter(c => c.user && (c.user._id === loggedInUserId || c.user === loggedInUserId))
            : data;
          
          if (filteredData && filteredData.length > 0) {
            const formatted = filteredData.map((c, i) => {
              const statusInfo = getStatusStyles(c.status);
              return {
                id: c._id ? `INC-${c._id.slice(-3).toUpperCase()}` : `INC-00${i + 1}`,
                title: c.category ? c.category.replace('_', ' ').toUpperCase() : 'GENERAL',
                desc: c.description ? c.description.slice(0, 50) + '...' : 'No description',
                location: c.location || 'Unknown Location',
                status: c.status,
                date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent',
                icon: getCategoryIcon(c.category),
                ...statusInfo
              };
            });
            setSubmissions(formatted);

            // Dynamically calculate stats
            const total = formatted.length;
            const review = formatted.filter(s => s.status === 'Pending' || s.status === 'Under Review' || s.status === 'Awaiting Review').length;
            const progress = formatted.filter(s => s.status === 'In Progress').length;
            const resolved = formatted.filter(s => s.status === 'Resolved').length;
            setStats({ total, review, progress, resolved });

            // Calculate category frequencies for bar chart
            const categories = {};
            formatted.forEach(s => {
              categories[s.title] = (categories[s.title] || 0) + 1;
            });
            const newBarData = Object.keys(categories).map(cat => ({
              name: cat,
              value: categories[cat]
            }));
            if (newBarData.length > 0) setBarData(newBarData);

            // Calculate resolution status pie chart
            setPieData([
              { name: 'Under Review', value: review, color: '#f59e0b' },
              { name: 'In Progress', value: progress, color: '#3b82f6' },
              { name: 'Resolved', value: resolved, color: '#10b981' },
            ]);

          } else {
            setSubmissions(mockSubmissions);
          }
        } else {
          setSubmissions(mockSubmissions);
        }
      } catch (err) {
        console.error("Error fetching user submissions, falling back to mock:", err);
        setSubmissions(mockSubmissions);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Citizen Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, <span className="font-bold text-slate-700">{userName}</span>. Track and manage your reported issues.</p>
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

      {/* My Submissions */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800">My Submissions</h3>
            <p className="text-xs text-slate-500">Track the live progress of your reported issues.</p>
          </div>
          <div className="text-xs font-bold px-3 py-1 border border-slate-200 rounded-full flex items-center gap-2">
            <LucideIcons.Activity size={14} className="text-slate-400" /> ACTIVE TRACKING
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading submissions...</div>
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
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
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
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md lowercase ${sub.statusColor}`}>
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
                          className={`h-full ${sub.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                          style={{width: `${sub.progress}%`}}
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

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-lg mb-1">Complaint Analytics</h3>
          <p className="text-xs text-slate-500 mb-6">Visual overview of your reporting activity.</p>
          
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{top: 10, right: 10, left: -20, bottom: 20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} angle={-45} textAnchor="end" />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickCount={5} />
                <Bar dataKey="value" fill="#2563eb" radius={[2, 2, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Issues By Category</div>
        </div>

        <div className="card">
          <h3 className="font-bold text-lg mb-6">&nbsp;</h3>
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
          </div>
          <div className="flex justify-center gap-4 mt-6">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></span>
                {item.name}
              </div>
            ))}
          </div>
          <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Resolution Status</div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
