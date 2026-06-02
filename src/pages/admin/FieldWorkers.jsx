import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Phone, MapPin, MoreVertical, Shield } from 'lucide-react';

const FieldWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [village, setVillage] = useState('Bandra West');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/workers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !phone || !age) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email: name.toLowerCase().replace(/\s+/g, '') + '@panchayat.gov.in',
          phone,
          age: Number(age),
          gender,
        })
      });
      if (response.ok) {
        setSuccess('Worker registered successfully!');
        setName('');
        setPhone('');
        setAge('');
        fetchWorkers();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to register worker');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Field Workers</h1>
          <p className="text-slate-500 mt-1">Manage and track the active GramSuvidha workforce.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Force Overview Table */}
        <div className="card xl:col-span-2 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Force Overview</h3>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search workers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-48" 
              />
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            {loading ? (
              <div className="py-12 text-center text-slate-500">Loading workers...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                    <th className="pb-3 pl-4">Photo</th>
                    <th className="pb-3">Worker Identity</th>
                    <th className="pb-3">Area / Village</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Demographics</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {(() => {
                    const filteredWorkers = workers.filter(worker => 
                      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (worker.village || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      worker.phone.includes(searchQuery)
                    );
                    if (filteredWorkers.length === 0) {
                      return (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400">No field workers found matching search.</td>
                        </tr>
                      );
                    }
                    return filteredWorkers.map((worker, i) => (
                      <tr key={worker._id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 pl-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                            {worker.name.charAt(0).toUpperCase()}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="font-bold text-slate-800">{worker.name}</div>
                          <div className="text-xs text-slate-400">ID: {worker._id ? `WRK-${worker._id.slice(-4).toUpperCase()}` : 'N/A'}</div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-slate-600">
                            <MapPin size={14} /> {worker.village || 'Panchayat Area'}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Phone size={14} /> {worker.phone}
                          </div>
                        </td>
                        <td className="py-4 text-slate-600 text-xs">
                          {worker.age} Y/O • {worker.gender ? worker.gender.toUpperCase() : 'MALE'}
                        </td>
                        <td className="py-4 text-center">
                          <select
                            value={worker.status || 'active'}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              try {
                                const token = localStorage.getItem('token');
                                const res = await fetch(`/api/auth/workers/${worker._id}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ status: newStatus })
                                });
                                if (res.ok) {
                                  // optimistic update
                                  setWorkers(prev => prev.map(w => w._id === worker._id ? { ...w, status: newStatus } : w));
                                } else {
                                  const err = await res.json();
                                  alert(err.message || 'Failed to update status');
                                }
                              } catch (err) {
                                alert('Network error');
                              }
                            }}
                            className="text-sm rounded border border-slate-200 px-2 py-1 bg-white"
                          >
                            <option value="active">Active</option>
                            <option value="on_leave">On Leave</option>
                            <option value="resigned">Resigned</option>
                          </select>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add New Worker Form */}
        <div className="card h-fit sticky top-6">
          <div className="mb-6">
            <h3 className="font-bold text-lg">Add New Worker</h3>
            <p className="text-xs text-slate-500 mt-1">Register a new field worker for the GramSuvidha force.</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-xs font-semibold">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4 text-xs font-semibold">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
                <span className="font-bold">ℹ Village:</span> Worker will be automatically assigned to your village.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setName(''); setPhone(''); setAge(''); setError(''); setSuccess(''); }}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
              <button type="submit" className="btn-primary bg-green-600 hover:bg-green-700">Register Worker</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FieldWorkers;
