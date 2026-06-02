import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, AlertTriangle, Droplets, Trash2, Zap, MoreVertical } from 'lucide-react';

const mockComplaints = [
  {
    id: 'CMP-001',
    category: 'WATER SUPPLY',
    title: 'Major pipeline burst causing heavy water leakage on the sidewalk.',
    status: 'Pending',
    assigned: '-',
    location: 'S V Road, Bandra West, Mumbai',
    icon: <Droplets size={20} className="text-blue-500" />,
    bg: 'bg-blue-100',
  },
  {
    id: 'CMP-002',
    category: 'ROADS',
    title: 'Extremely deep pothole in the middle of the road, causing multiple fall...',
    status: 'In Progress',
    assigned: 'RAJESH KUMAR',
    location: 'SV Road, Bandra West, Mumbai',
    icon: <AlertTriangle size={20} className="text-orange-500" />,
    bg: 'bg-orange-100',
  },
];

const getCategoryStyles = (category) => {
  const normalized = (category || '').toUpperCase();
  if (normalized.includes('WATER')) {
    return { icon: <Droplets size={20} className="text-blue-500" />, bg: 'bg-blue-100' };
  } else if (normalized.includes('ROAD')) {
    return { icon: <AlertTriangle size={20} className="text-orange-500" />, bg: 'bg-orange-100' };
  } else if (normalized.includes('GARBAGE')) {
    return { icon: <Trash2 size={20} className="text-stone-500" />, bg: 'bg-stone-100' };
  } else if (normalized.includes('ELECT')) {
    return { icon: <Zap size={20} className="text-yellow-500" />, bg: 'bg-yellow-100' };
  }
  return { icon: <AlertTriangle size={20} className="text-purple-500" />, bg: 'bg-purple-100' };
};

const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalStatus, setModalStatus] = useState('Pending');
  const [modalAssigned, setModalAssigned] = useState('-');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchComplaintsAndWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [compRes, workRes] = await Promise.all([
        fetch('/api/complaints', { headers }),
        fetch('/api/auth/workers', { headers })
      ]);

      if (compRes.ok) {
        const data = await compRes.json();
        const formatted = (data || []).map((c, i) => {
          const styles = getCategoryStyles(c.category);
          return {
            _id: c._id,
            id: c._id ? `CMP-${c._id.slice(-4).toUpperCase()}` : `CMP-00${i + 1}`,
            category: c.category ? c.category.replace('_', ' ').toUpperCase() : 'GENERAL',
            title: c.description || 'No description provided',
            status: c.status || 'Pending',
            assigned: c.assigned || '-',
            location: c.location || 'Unknown Location',
            user: c.user,
            ...styles
          };
        });
        setComplaints(formatted);
      } else {
        console.error('Failed to fetch complaints');
        setComplaints([]);
      }

      if (workRes.ok) {
        const workersData = await workRes.json();
        setWorkers(workersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintsAndWorkers();
  }, []);

  const handleOpenModal = (complaint) => {
    setSelectedComplaint(complaint);
    setModalStatus(complaint.status);
    setModalAssigned(complaint.assigned || '-');
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint || !selectedComplaint._id) {
      setSelectedComplaint(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: modalStatus, assigned: modalAssigned })
      });

      if (response.ok) {
        fetchComplaintsAndWorkers();
        setSelectedComplaint(null);
      } else {
        alert('Failed to update complaint');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            Complaints Management
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {workers.length || 28} Workers Active
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Detailed review and resolution of civic reports.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="font-bold text-lg">All Submissions</h3>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full sm:w-64 focus-within:border-primary transition-colors">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by ID or details..." 
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
                <option value="Pending">Awaiting Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading complaints...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50/50">
                  <th className="py-3 pl-6 w-12"></th>
                  <th className="py-3 w-1/3">Complaint Details</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Assigned Force</th>
                  <th className="py-3">Incident Location</th>
                  <th className="py-3 text-center">Actions</th>
                </tr>
              </thead>
                <tbody className="text-sm">
                  {(() => {
                    const filtered = complaints.filter(c => {
                      const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            c.category.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
                      return matchesSearch && matchesStatus;
                    });
                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400">No complaints found matching current search and filters.</td>
                        </tr>
                      );
                    }
                    return filtered.map((complaint, i) => (
                      <tr key={complaint._id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 pl-6">
                          <div className={`w-10 h-10 rounded-xl ${complaint.bg || 'bg-slate-100'} flex items-center justify-center`}>
                            {complaint.icon || <AlertTriangle size={20} className="text-slate-500" />}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-bold text-slate-800 text-xs mb-1">{complaint.category}</div>
                          <div className="text-slate-600 line-clamp-1">{complaint.title}</div>
                          <div className="text-xs text-slate-400 mt-1 uppercase">ID: {complaint.id}</div>
                        </td>
                        <td className="py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                            complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                            complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {complaint.status === 'Pending' ? 'Awaiting Review' : complaint.status}
                          </span>
                        </td>
                        <td className="py-4">
                          {complaint.assigned && complaint.assigned !== '-' ? (
                            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-md">
                              {complaint.assigned}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-4">
                          <div className="text-slate-600 flex items-center gap-1.5 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            {complaint.location}
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <button onClick={() => handleOpenModal(complaint)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm">
                            <Eye size={14} /> View
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

      {/* Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Complaint Details - {selectedComplaint.id}</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                <p className="font-semibold text-slate-700 text-sm mt-1">{selectedComplaint.category}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Details</label>
                <p className="font-medium text-slate-700 text-sm mt-1">
                  Name: {selectedComplaint.user?.name || 'Anonymous citizen'}<br/>
                  Phone: {selectedComplaint.user?.phone || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <p className="text-slate-600 text-sm mt-1 whitespace-pre-wrap">{selectedComplaint.title}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                <p className="text-slate-600 text-sm mt-1">{selectedComplaint.location}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Status</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="Pending">Awaiting Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign Worker</label>
                  <select
                    value={modalAssigned}
                    onChange={(e) => setModalAssigned(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="-">None</option>
                    {workers.map(w => (
                      <option key={w._id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setSelectedComplaint(null)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800">Close</button>
              <button onClick={handleUpdateComplaint} className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsManagement;
