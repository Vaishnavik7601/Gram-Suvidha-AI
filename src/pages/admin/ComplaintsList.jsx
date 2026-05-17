import { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter } from 'lucide-react';

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/complaints');
        if (response.ok) {
          const data = await response.json();
          setComplaints(data);
        }
      } catch (err) {
        console.error("Failed to fetch complaints", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const getPriorityInfo = (description) => {
    // Simple logic to determine priority based on keywords in description
    const desc = description.toLowerCase();
    if (desc.includes('burst') || desc.includes('emergency') || desc.includes('danger') || desc.includes('urgent')) {
      return { label: 'High', color: 'bg-red-100 text-red-800' };
    } else if (desc.includes('not working') || desc.includes('broken') || desc.includes('repair')) {
      return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Low', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="text-gov-primary" />
            Complaints Register
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track citizen issues prioritized by AI.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search ID..." className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-gov-primary" />
          </div>
          <button className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Subject</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">AI Priority</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-slate-500">Loading complaints...</td></tr>
            ) : complaints.length > 0 ? complaints.map((comp) => {
              const priority = getPriorityInfo(comp.description);
              return (
                <tr key={comp._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-gov-primary">{comp._id.substring(comp._id.length - 6).toUpperCase()}</td>
                  <td className="p-4 text-slate-800 text-sm max-w-[200px] truncate">{comp.description}</td>
                  <td className="p-4 text-slate-600 text-sm capitalize">{comp.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${priority.color}`}>
                      {priority.label}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">{new Date(comp.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                     <span className="text-sm font-medium text-slate-700">{comp.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelectedComplaint(comp)} className="text-gov-primary hover:text-gov-blue text-sm font-bold bg-blue-50 px-3 py-1 rounded-full transition-colors hover:bg-blue-100">
                      View
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="7" className="p-8 text-center text-slate-500">No complaints registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
        <span>Showing 1 to 4 of 4 entries</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
          <button className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedComplaint(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
              <ShieldAlert className="text-gov-primary" />
              Complaint Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-lg border-b pb-2">Issue Information</h3>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complaint ID</label>
                  <p className="text-slate-800 font-mono font-medium">{selectedComplaint._id.substring(selectedComplaint._id.length - 6).toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Filed</label>
                  <p className="text-slate-800">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category & Status</label>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm capitalize">{selectedComplaint.category}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">{selectedComplaint.status}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</label>
                  <p className="text-slate-800">{selectedComplaint.location}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded border border-slate-100 mt-1 text-sm leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4 bg-orange-50 border border-orange-100 p-5 rounded-xl h-fit">
                <h3 className="font-bold text-orange-900 text-lg border-b border-orange-200 pb-2">Citizen Profile</h3>
                {selectedComplaint.user ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-orange-600/80 uppercase tracking-wider">Full Name</label>
                      <p className="text-orange-900 font-medium">{selectedComplaint.user.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-orange-600/80 uppercase tracking-wider">Contact Details</label>
                      <p className="text-orange-900">{selectedComplaint.user.phone || 'N/A'}</p>
                      <p className="text-orange-800 text-sm">{selectedComplaint.user.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-orange-600/80 uppercase tracking-wider">Gender</label>
                        <p className="text-orange-900">{selectedComplaint.user.gender || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-orange-600/80 uppercase tracking-wider">Village</label>
                        <p className="text-orange-900 truncate" title={selectedComplaint.user.village}>{selectedComplaint.user.village || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-orange-800 text-sm italic">Citizen details unavailable.</p>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t flex justify-end">
              <button onClick={() => setSelectedComplaint(null)} className="btn-outline px-6 py-2">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsList;
