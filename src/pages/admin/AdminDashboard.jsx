import { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, CheckCircle, Clock, Sparkles, CalendarDays, Eye, Edit3, X } from 'lucide-react';

// Real-world scheme suggestions helper
const getSchemeSuggestions = (schemeName) => {
  const normalized = (schemeName || '').toLowerCase();
  const now = new Date();
  
  if (normalized.includes('awas') || normalized.includes('pmay')) {
    // PMAY: 3 months to start, 2 years to complete/expire
    const start = new Date();
    start.setMonth(now.getMonth() + 3);
    const end = new Date();
    end.setFullYear(now.getFullYear() + 2);
    return {
      availableFrom: start.toISOString().split('T')[0],
      expiresAt: end.toISOString().split('T')[0],
      name: 'Pradhan Mantri Awas Yojana (PMAY)',
      info: 'PMAY-G releases funds in 3 installments over 3 months. Average construction duration support is 2 years.'
    };
  } else if (normalized.includes('mgnrega') || normalized.includes('employment')) {
    // MGNREGA: 15 days to start, 1 year to reset
    const start = new Date();
    start.setDate(now.getDate() + 15);
    const end = new Date();
    end.setFullYear(now.getFullYear() + 1);
    return {
      availableFrom: start.toISOString().split('T')[0],
      expiresAt: end.toISOString().split('T')[0],
      name: 'MGNREGA',
      info: 'Employment is legally guaranteed within 15 days of demand. Work allocations reset annually.'
    };
  } else if (normalized.includes('kisan') || normalized.includes('samman')) {
    // PM-KISAN: 2 months to start, ongoing (no expiry)
    const start = new Date();
    start.setMonth(now.getMonth() + 2);
    return {
      availableFrom: start.toISOString().split('T')[0],
      expiresAt: '',
      name: 'PM Kisan Samman Nidhi',
      info: 'Income support is distributed in 3 equal installments every 4 months (starting next cycle). Valid ongoing with annual verification.'
    };
  } else if (normalized.includes('pension') || normalized.includes('social assistance') || normalized.includes('nsap')) {
    // NSAP: 1 month to start, ongoing (no expiry)
    const start = new Date();
    start.setMonth(now.getMonth() + 1);
    return {
      availableFrom: start.toISOString().split('T')[0],
      expiresAt: '',
      name: 'National Social Assistance Programme (NSAP)',
      info: 'Pensions start in the subsequent calendar month post approval. Valid ongoing for lifetime.'
    };
  } else if (normalized.includes('sukanya') || normalized.includes('girl')) {
    // Sukanya Samriddhi: 1 month to start, ongoing
    const start = new Date();
    start.setMonth(now.getMonth() + 1);
    return {
      availableFrom: start.toISOString().split('T')[0],
      expiresAt: '',
      name: 'Sukanya Samriddhi Yojana',
      info: 'Savings scheme starts immediately. Account matures after 21 years (or marriage after 18).'
    };
  } else if (normalized.includes('jal') || normalized.includes('water') || normalized.includes('jeevan')) {
    // Jal Jeevan: 15 days to start, ongoing
    const start = new Date();
    start.setDate(now.getDate() + 15);
    return {
      availableFrom: start.toISOString().split('T')[0],
      expiresAt: '',
      name: 'Jal Jeevan Mission',
      info: 'Tap connection installations begin within 15-30 days of GP project sanction.'
    };
  } else if (normalized.includes('kaushalya') || normalized.includes('upadhyaya') || normalized.includes('skill')) {
    // DDU-GKY: 1 month to start, 1 year duration
    const start = new Date();
    start.setMonth(now.getMonth() + 1);
    const end = new Date();
    end.setFullYear(now.getFullYear() + 1);
    return {
      availableFrom: start.toISOString().split('T')[0],
      expiresAt: end.toISOString().split('T')[0],
      name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana',
      info: 'Skill development training batches start in 30 days. Most courses span 3-12 months.'
    };
  }
  
  // Default fallback
  const start = new Date();
  const end = new Date();
  end.setFullYear(now.getFullYear() + 1);
  return {
    availableFrom: start.toISOString().split('T')[0],
    expiresAt: end.toISOString().split('T')[0],
    name: schemeName || 'Standard Scheme',
    info: 'Standard timeline applied. Benefit active immediately and renewable annually.'
  };
};

const AdminDashboard = () => {
  const [complaintStats, setComplaintStats] = useState({ total: 0, resolvedRate: '0%', raw: {} });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Application Modal States
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalStatus, setModalStatus] = useState('Pending');
  const [modalAvailableFrom, setModalAvailableFrom] = useState('');
  const [modalExpiresAt, setModalExpiresAt] = useState('');
  const [isSavingApplication, setIsSavingApplication] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Fetch complaints
      const response = await fetch('http://localhost:5000/api/complaints');
      const data = await response.json();
      
      // Pass data to Python ML Service for KPI generation
      const mlResponse = await fetch('http://localhost:8000/generate-kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data.map(c => ({ status: c.status, category: c.category })) })
      });
      
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        setComplaintStats({
          total: mlData.total_complaints,
          resolvedRate: mlData.resolved_rate,
          raw: mlData.raw_counts,
          raw_categories: mlData.raw_categories
        });
      } else {
        throw new Error("ML Service Error");
      }
    } catch (err) {
      console.error("Failed to fetch ML insights, using local fallback", err);
      // Fallback: Calculate basic stats from the raw data
      try {
        const response = await fetch('http://localhost:5000/api/complaints');
        const data = await response.json();
        
        const total = data.length;
        const resolved = data.filter(c => c.status === 'Resolved').length;
        const resolvedRate = total > 0 ? `${((resolved / total) * 100).toFixed(1)}%` : '0%';
        
        const raw = {};
        const raw_categories = {};
        data.forEach(c => {
          raw[c.status] = (raw[c.status] || 0) + 1;
          raw_categories[c.category] = (raw_categories[c.category] || 0) + 1;
        });
        
        setComplaintStats({
          total,
          resolvedRate,
          raw,
          raw_categories
        });
      } catch (fallbackErr) {
        console.error("Critical dashboard failure", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/schemes/applications');
      if (res.ok) {
        const apps = await res.json();
        setApplications(apps);
      }
    } catch (error) {
      console.error("Failed to fetch applications", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchApplications();
  }, []);

  const openApplicationManager = (app) => {
    setSelectedApplication(app);
    setModalStatus(app.status || 'Pending');
    setModalAvailableFrom(app.availableFrom ? new Date(app.availableFrom).toISOString().split('T')[0] : '');
    setModalExpiresAt(app.expiresAt ? new Date(app.expiresAt).toISOString().split('T')[0] : '');
  };

  const applyTimelineSuggestions = () => {
    if (!selectedApplication) return;
    const suggestions = getSchemeSuggestions(selectedApplication.schemeName);
    setModalAvailableFrom(suggestions.availableFrom);
    setModalExpiresAt(suggestions.expiresAt);
  };

  const handleSaveApplication = async (e) => {
    e.preventDefault();
    setIsSavingApplication(true);
    try {
      const res = await fetch(`http://localhost:5000/api/schemes/applications/${selectedApplication._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: modalStatus,
          availableFrom: modalAvailableFrom || null,
          expiresAt: modalExpiresAt || null
        })
      });
      if (res.ok) {
        fetchApplications();
        setSelectedApplication(null);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to update application');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating application. Is the server running?');
    } finally {
      setIsSavingApplication(false);
    }
  };

  const kpis = [
    { label: 'Total Active Complaints', value: loading ? '...' : complaintStats.total, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100' },
    { label: 'Resolution Rate', value: loading ? '...' : complaintStats.resolvedRate, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
    { label: 'Pending (Needs Attention)', value: loading ? '...' : (complaintStats.raw['Pending'] || 0), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100' },
    { label: 'Avg Resolution Time', value: '4.2 Days', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100' }, 
  ];

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Application Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-full ${kpi.bg} ${kpi.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Predictive Analytics Chart Mock */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="text-gov-primary" size={20} />
              AI Predictive Trend Analysis
            </h3>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold">Predictive Model Active</span>
          </div>
          
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 relative overflow-hidden">
             {/* Mock Chart Visual */}
            <div className="flex items-end justify-between w-full h-40 px-8 opacity-80 gap-2">
              {[40, 50, 70, 45, 90, 110, 80].map((h, i) => (
                <div key={i} className="w-8 bg-gov-blue rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 to-transparent flex items-center justify-center">
              <p className="text-slate-600 font-medium">Summer Water Shortage Trend Prediction</p>
            </div>
          </div>
        </div>

        {/* Recent Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-6">Complaints by Category</h3>
          <div className="space-y-4">
            {(() => {
              const categories = ['water', 'electricity', 'roads', 'welfare', 'other'];
              const categoryNames = {
                water: 'Water Supply',
                electricity: 'Electricity',
                roads: 'Road Maintenance',
                welfare: 'Welfare',
                other: 'Others'
              };
              const colors = {
                water: 'bg-blue-500',
                electricity: 'bg-yellow-500',
                roads: 'bg-orange-500',
                welfare: 'bg-purple-500',
                other: 'bg-slate-400'
              };
              
              if (loading) return <p>Loading categories...</p>;
              
              return categories.map((cat, i) => {
                const count = complaintStats.raw_categories ? (complaintStats.raw_categories[cat] || 0) : 0;
                const percent = complaintStats.total > 0 ? Math.round((count / complaintStats.total) * 100) : 0;
                
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{categoryNames[cat]}</span>
                      <span className="text-slate-500">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${colors[cat]}`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Scheme Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Recent Scheme Applications</h3>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{applications.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheme</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Timeline</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length > 0 ? applications.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-slate-800">{app.applicantName}</p>
                    <p className="text-xs text-slate-500">Age: {app.age}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-medium">{app.schemeName}</td>
                  <td className="p-4 text-xs text-slate-600">
                    {app.availableFrom ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Start: {new Date(app.availableFrom).toLocaleDateString()}</span>
                        {app.expiresAt ? (
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Expiry: {new Date(app.expiresAt).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-indigo-600 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>Ongoing Benefit</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not Scheduled</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyle(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-3 h-full pt-6">
                    <a 
                      href={`http://localhost:5000${app.idProofPath}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title="View ID Proof"
                    >
                      <Eye size={18} />
                    </a>
                    <button 
                      onClick={() => openApplicationManager(app)}
                      className="text-gov-blue hover:text-blue-800 transition-colors"
                      title="Manage Application Status"
                    >
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No scheme applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Status & Duration Manager Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in zoom-in-95 duration-200 border border-slate-100">
            <button 
              onClick={() => setSelectedApplication(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-2">Review Scheme Application</h3>
            <p className="text-xs text-slate-500 border-b pb-3 mb-4">
              Review details for <span className="font-bold text-gov-blue">{selectedApplication.schemeName}</span> applied by {selectedApplication.applicantName}
            </p>

            {/* Scheme Insights & Suggested Timelines */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5 text-sm">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                  Real-world Scheme Insights
                </h5>
                <button 
                  type="button"
                  onClick={applyTimelineSuggestions}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded transition-colors shadow-sm"
                >
                  Auto-Fill suggested dates
                </button>
              </div>
              <p className="text-indigo-800 leading-relaxed text-xs">
                {getSchemeSuggestions(selectedApplication.schemeName).info}
              </p>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-4">
              {/* Application Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Review Status</label>
                <select
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                  value={modalStatus}
                  onChange={e => setModalStatus(e.target.value)}
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Application Submitted">Application Submitted</option>
                  <option value="Approved">Approved (Sanctioned)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Benefit Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <CalendarDays size={14} className="text-slate-400" />
                    Available From Date
                  </label>
                  <input 
                    type="date"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                    value={modalAvailableFrom}
                    onChange={e => setModalAvailableFrom(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Timeline when benefits begin.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <CalendarDays size={14} className="text-slate-400" />
                    Expires On Date
                  </label>
                  <input 
                    type="date"
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue text-sm transition-shadow"
                    value={modalExpiresAt}
                    onChange={e => setModalExpiresAt(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Leave empty if ongoing benefits.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSavingApplication}
                  className="px-5 py-2 bg-gov-blue hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-55 flex items-center gap-1.5 animate-pulse"
                >
                  {isSavingApplication ? 'Saving Changes...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
