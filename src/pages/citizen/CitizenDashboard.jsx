import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const getUpdateCategoryIcon = (category) => {
  switch (category) {
    case 'Election':
      return <LucideIcons.Calendar className="text-orange-500" size={18} />;
    case 'Result':
      return <LucideIcons.Award className="text-green-500" size={18} />;
    case 'Water Dispute':
      return <LucideIcons.Droplets className="text-blue-500" size={18} />;
    case 'Electricity':
      return <LucideIcons.Zap className="text-yellow-500" size={18} />;
    default:
      return <LucideIcons.Info className="text-purple-500" size={18} />;
  }
};

const getUpdateCategoryStyle = (category) => {
  switch (category) {
    case 'Election':
      return 'bg-orange-50 border-orange-100 text-orange-700';
    case 'Result':
      return 'bg-green-50 border-green-100 text-green-700';
    case 'Water Dispute':
      return 'bg-blue-50 border-blue-100 text-blue-700';
    case 'Electricity':
      return 'bg-yellow-50 border-yellow-100 text-yellow-700';
    default:
      return 'bg-purple-50 border-purple-100 text-purple-700';
  }
};

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
  const { t } = useLanguage();
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

  // Village Updates & Election States
  const [updates, setUpdates] = useState([]);
  const [electionConfig, setElectionConfig] = useState(null);
  const [electionResults, setElectionResults] = useState(null);
  const [votingLoading, setVotingLoading] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [voteSuccess, setVoteSuccess] = useState('');

  const isVotingActive = () => {
    if (!electionConfig) return false;
    const now = new Date();
    const start = new Date(electionConfig.startDate);
    const end = new Date(electionConfig.endDate);
    return now >= start && now <= end;
  };

  const handleCastVote = async (adminId) => {
    setVotingLoading(true);
    setVoteError('');
    setVoteSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/elections/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminId })
      });
      const data = await res.json();
      if (res.ok) {
        setVoteSuccess('Your vote has been cast successfully!');
        const resultsRes = await fetch('/api/elections/results', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          setElectionResults(resultsData);
        }
      } else {
        setVoteError(data.message || 'Failed to cast vote.');
      }
    } catch (err) {
      setVoteError('Network error. Failed to cast vote.');
    } finally {
      setVotingLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

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
        const [complaintsRes, profileRes] = await Promise.all([
          fetch('/api/complaints', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

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

          const total = formatted.length;
          const review = formatted.filter(s => s.status === 'Pending' || s.status === 'Under Review').length;
          const progress = formatted.filter(s => s.status === 'In Progress').length;
          const resolved = formatted.filter(s => s.status === 'Resolved').length;
          setStats({ total, review, progress, resolved });

          const categories = {};
          formatted.forEach(s => {
            categories[s.title] = (categories[s.title] || 0) + 1;
          });
          const newBarData = Object.keys(categories).map(cat => ({ name: cat, value: categories[cat] }));
          setBarData(newBarData);

          setPieData([
            { name: 'Pending', value: review, color: '#f59e0b' },
            { name: 'In Progress', value: progress, color: '#3b82f6' },
            { name: 'Resolved', value: resolved, color: '#10b981' },
          ]);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setSchemeApplications(profileData.applications || []);
          if (profileData.user) {
            setUserName(profileData.user.name || 'Citizen');
            setVillage(profileData.user.village || '');
          }
        }

        const [updatesRes, electionConfigRes, electionResultsRes] = await Promise.all([
          fetch('/api/updates', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/elections/config', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/elections/results', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (updatesRes.ok) {
          const updatesData = await updatesRes.json();
          setUpdates(updatesData);
        }
        if (electionConfigRes.ok) {
          const configData = await electionConfigRes.json();
          setElectionConfig(configData);
        }
        if (electionResultsRes.ok) {
          const resultsData = await electionResultsRes.json();
          setElectionResults(resultsData);
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
          <h1 className="text-3xl font-bold text-slate-800">{t('citizenDashboard')}</h1>
          <p className="text-slate-500 mt-1">
            {t('welcomeBack')}, <span className="font-bold text-slate-700">{userName}</span>.
            {village && <span className="text-slate-400"> • {village}</span>}
            <span className="ml-2 text-xs">{t('trackIssues')}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/citizen/complaint')}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
        >
          <LucideIcons.PlusCircle size={18} /> {t('newComplaint')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center py-6">
          <LucideIcons.FileText className="mx-auto mb-2 text-slate-400" size={24} />
          <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">{t('total')}</div>
        </div>
        <div className="card text-center py-6">
          <LucideIcons.Clock className="mx-auto mb-2 text-yellow-500" size={24} />
          <div className="text-3xl font-bold text-slate-800">{stats.review}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">{t('underReview')}</div>
        </div>
        <div className="card text-center py-6">
          <LucideIcons.Activity className="mx-auto mb-2 text-blue-500" size={24} />
          <div className="text-3xl font-bold text-slate-800">{stats.progress}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">{t('inProgress')}</div>
        </div>
        <div className="card text-center py-6">
          <LucideIcons.CheckCircle className="mx-auto mb-2 text-green-500" size={24} />
          <div className="text-3xl font-bold text-slate-800">{stats.resolved}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-1">{t('resolved')}</div>
        </div>
      </div>

      {/* Village Updates and Voting Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Village Updates Feed */}
        <div className="card flex flex-col h-[480px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 flex-shrink-0">
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <LucideIcons.BellRing className="text-primary animate-pulse" size={20} />
                {t('villageUpdates')}
              </h3>
              <p className="text-xs text-slate-500">{t('latestAnnouncements')}</p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {updates.length} Updates
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {updates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <LucideIcons.VolumeX size={40} className="mb-2 text-slate-300" />
                <p className="font-semibold text-sm text-slate-500">No updates published yet</p>
                <p className="text-xs text-slate-450">Announcements for your village will appear here.</p>
              </div>
            ) : (
              updates.map((up) => (
                <div key={up._id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getUpdateCategoryStyle(up.category)}`}>
                      {getUpdateCategoryIcon(up.category)}
                      {up.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {new Date(up.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{up.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{up.description}</p>
                  <div className="mt-2 text-[9px] text-slate-400 flex items-center gap-1">
                    <LucideIcons.User size={10} />
                    Posted by: {up.createdAdmin?.name || 'Panchayat Administrator'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Administrator Voting Widget */}
        <div className="card flex flex-col h-[480px]">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 flex-shrink-0">
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <LucideIcons.Award className="text-orange-500" size={20} />
                {t('adminVoting')}
              </h3>
              <p className="text-xs text-slate-500">{t('voteBestAdmin')}</p>
            </div>
            {isVotingActive() ? (
              <span className="text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {t('activeElection')}
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full">
                {t('electionInactive')}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Election Schedule Info */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold mb-1.5">
                <LucideIcons.Calendar size={14} className="text-primary" />
                {electionConfig ? `${electionConfig.year} ${t('electionSchedule')}` : t('electionSchedule')}
              </div>
              {electionConfig ? (
                <div className="text-slate-600 flex flex-col gap-1">
                  <div><span className="font-medium text-slate-800">{t('votingPeriod')}:</span> {new Date(electionConfig.startDate).toLocaleDateString()} to {new Date(electionConfig.endDate).toLocaleDateString()}</div>
                  <div className="text-[10px] text-slate-400 italic mt-0.5">
                    {isVotingActive() ? 'The voting period is currently open. Please cast your vote below.' : 'Voting is closed. Standings of candidates are listed below.'}
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 italic">{t('noElectionScheduled')}</div>
              )}
            </div>

            {/* Error/Success Feedbacks */}
            {voteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-semibold">
                {voteError}
              </div>
            )}
            {voteSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs font-semibold">
                {voteSuccess}
              </div>
            )}

            {/* Candidate Admins List */}
            {electionResults && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isVotingActive() && !electionResults.hasVoted ? t('candidateAdmins') : t('electionStandings')}
                </h4>

                {electionResults.results.length === 0 ? (
                  <div className="text-center py-6 text-slate-450 italic">{t('noAdminsRegistered')}</div>
                ) : (
                  electionResults.results.map((cand, idx) => {
                    const isSelected = electionResults.votedFor === cand._id;
                    const votePercent = electionResults.totalVotes > 0 
                      ? Math.round((cand.votes / electionResults.totalVotes) * 100) 
                      : 0;

                    return (
                      <div key={cand._id} className={`p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-slate-100 bg-white hover:bg-slate-50'
                      }`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-105 flex items-center justify-center font-bold text-slate-650 overflow-hidden border border-slate-200 flex-shrink-0">
                              {cand.profilePhoto ? (
                                <img src={cand.profilePhoto} alt={cand.name} className="w-full h-full object-cover" />
                              ) : (
                                cand.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                {cand.name}
                                {isSelected && (
                                  <span className="text-[9px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                                    {t('myVote')}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-450">{cand.email} • {cand.phone}</div>
                            </div>
                          </div>

                          <div>
                            {isVotingActive() && !electionResults.hasVoted ? (
                              <button
                                disabled={votingLoading}
                                onClick={() => handleCastVote(cand._id)}
                                className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                {t('voteBtn')}
                              </button>
                            ) : (
                              <div className="text-right">
                                <div className="font-bold text-sm text-slate-800">{cand.votes} {t('votes')}</div>
                                <div className="text-[10px] text-slate-400 font-semibold">{votePercent}% {t('percentTotal')}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {(!isVotingActive() || electionResults.hasVoted) && (
                          <div className="mt-3">
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : 'bg-slate-400'
                                }`}
                                style={{ width: `${votePercent}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Complaints */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800">{t('myComplaints')}</h3>
            <p className="text-xs text-slate-500">Track the live progress of your reported issues.</p>
          </div>
          <div className="text-xs font-bold px-3 py-1 border border-slate-200 rounded-full flex items-center gap-2">
            <LucideIcons.Activity size={14} className="text-slate-400" /> {t('activeTracking')}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading your complaints...</div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center">
              <LucideIcons.Inbox className="mx-auto mb-3 text-slate-300" size={48} />
              <p className="font-semibold text-slate-500">{t('noComplaints')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('clickNewComplaint')}</p>
              <button
                onClick={() => navigate('/citizen/complaint')}
                className="mt-4 px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
              >
                {t('fileFirstComplaint')}
              </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="pb-3 pl-4">{t('incident')}</th>
                  <th className="pb-3">{t('currentStatus')}</th>
                  <th className="pb-3">{t('incidentLocation')}</th>
                  <th className="pb-3">{t('progressStage')}</th>
                  <th className="pb-3">{t('registered')}</th>
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
            <h3 className="font-bold text-lg text-slate-800">{t('mySchemes')}</h3>
            <p className="text-xs text-slate-500">Status of your government scheme applications.</p>
          </div>
          <button
            onClick={() => navigate('/citizen/schemes')}
            className="text-xs font-bold px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5"
          >
            <LucideIcons.Plus size={13} /> {t('applySchemeBtn')}
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-sm">Loading applications...</div>
        ) : schemeApplications.length === 0 ? (
          <div className="py-10 text-center">
            <LucideIcons.ClipboardList className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="font-semibold text-slate-500">{t('noSchemes')}</p>
            <p className="text-xs text-slate-400 mt-1">Check eligibility and apply for government schemes.</p>
            <button
              onClick={() => navigate('/citizen/schemes')}
              className="mt-4 px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
            >
              {t('exploreSchemes')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="pb-3 pl-4">{t('schemeName')}</th>
                  <th className="pb-3">{t('applicant')}</th>
                  <th className="pb-3">{t('statusLabel')}</th>
                  <th className="pb-3">{t('appliedOn')}</th>
                  <th className="pb-3">{t('applicationId')}</th>
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

      {/* Analytics */}
      {submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold text-lg mb-1">{t('complaintAnalytics')}</h3>
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
            <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{t('issuesByCategory')}</div>
          </div>

          <div className="card flex flex-col items-center justify-center">
            <h3 className="font-bold text-lg mb-4 self-start">{t('resolutionStatus')}</h3>
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
