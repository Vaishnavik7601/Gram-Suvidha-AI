import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ClipboardList, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

const SchemeApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalStatus, setModalStatus] = useState('Pending');
  const [modalAvailableFrom, setModalAvailableFrom] = useState('');
  const [modalExpiresAt, setModalExpiresAt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/schemes/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Network error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenModal = (app) => {
    setSelectedApp(app);
    setModalStatus(app.status);
    setModalAvailableFrom(app.availableFrom ? new Date(app.availableFrom).toISOString().split('T')[0] : '');
    setModalExpiresAt(app.expiresAt ? new Date(app.expiresAt).toISOString().split('T')[0] : '');
  };

  const handleUpdateApplication = async () => {
    if (!selectedApp || !selectedApp._id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/schemes/applications/${selectedApp._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: modalStatus,
          availableFrom: modalAvailableFrom || null,
          expiresAt: modalExpiresAt || null
        })
      });

      if (response.ok) {
        fetchApplications();
        setSelectedApp(null);
      } else {
        alert('Failed to update application');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating application');
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            Scheme Applicants
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> {applications.length} Total Submissions
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Review, approve, and manage citizen welfare scheme applications.</p>
        </div>
      </div>

      <div className="card overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="font-bold text-lg text-slate-800">All Submissions</h3>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full sm:w-64 focus-within:border-primary transition-colors">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, scheme, ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full" 
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 focus-within:border-primary transition-colors">
              <Filter size={16} className="text-slate-400" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Too Late">Too Late</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading scheme applications...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50/50">
                  <th className="py-3 pl-6">Scheme Name</th>
                  <th className="py-3">Applicant (Relation, Age)</th>
                  <th className="py-3">ID Number</th>
                  <th className="py-3">ID Proof</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Applied On</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(() => {
                  const filtered = applications.filter(app => {
                    const matchesSearch = 
                      (app.schemeName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (app.applicantName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (app.idNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
                    return matchesSearch && matchesStatus;
                  });
                  
                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-slate-400">
                          <ClipboardList className="mx-auto mb-2 text-slate-300" size={32} />
                          No applications found matching search criteria.
                        </td>
                      </tr>
                    );
                  }
                  
                  return filtered.map((app) => (
                    <tr key={app._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 pl-6 font-bold text-slate-800">
                        {app.schemeName}
                      </td>
                      <td className="py-4">
                        <div className="font-semibold text-slate-700">{app.applicantName}</div>
                        <div className="text-xs text-slate-400 capitalize">{app.relationship || 'Self'} • {app.age} yrs</div>
                      </td>
                      <td className="py-4 font-mono text-xs text-slate-600">
                        {app.idNumber}
                      </td>
                      <td className="py-4">
                        {app.idProofPath ? (
                          <a 
                            href={app.idProofPath} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            View Document
                          </a>
                        ) : (
                          <span className="text-slate-300 text-xs">No File</span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusClass(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-center">
                        <button 
                          onClick={() => handleOpenModal(app)} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors shadow-sm"
                        >
                          <Eye size={14} /> Review
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details & Status Edit Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Review Application</h3>
                <p className="text-xs text-slate-400 mt-0.5">Edit status and validity parameters.</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-650 font-bold text-lg">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Scheme</div>
                <div className="font-bold text-slate-800 text-base">{selectedApp.schemeName}</div>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-150/50 mt-2 text-xs text-slate-600">
                  <div><span className="font-semibold text-slate-700">Applicant:</span> {selectedApp.applicantName}</div>
                  <div><span className="font-semibold text-slate-700">Relation:</span> {selectedApp.relationship || 'Self'}</div>
                  <div><span className="font-semibold text-slate-700">Age:</span> {selectedApp.age} years</div>
                  <div><span className="font-semibold text-slate-700">ID Number:</span> {selectedApp.idNumber}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Application Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white font-medium"
                >
                  <option value="Pending">Pending</option>
                  <option value="Application Submitted">Application Submitted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Too Late">Too Late</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Benefit Start Date</label>
                  <input
                    type="date"
                    value={modalAvailableFrom}
                    onChange={(e) => setModalAvailableFrom(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Benefit Expiry Date</label>
                  <input
                    type="date"
                    value={modalExpiresAt}
                    onChange={(e) => setModalExpiresAt(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>
              </div>

              {selectedApp.idProofPath && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-550">Uploaded Document: </span>
                  <a 
                    href={selectedApp.idProofPath} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 ml-1"
                  >
                    View ID Proof File ↗
                  </a>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedApp(null)} 
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateApplication} 
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold shadow-md shadow-primary/10 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeApplicants;
