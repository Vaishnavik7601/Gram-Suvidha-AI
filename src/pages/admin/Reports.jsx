import { useState, useEffect } from 'react';
import { BarChart2, Download, FileText, Calendar, PlusCircle } from 'lucide-react';

const Reports = () => {
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/reports');
        if (res.ok) {
          const data = await res.json();
          setReportsList(data);
        } else {
          setError('Failed to fetch reports');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl text-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="text-gov-primary" />
            Official Reports Generation
          </h1>
          <p className="text-slate-500 mt-1">Export analytics and logs for state government submission.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report Cards */}
        {loading ? <p>Loading reports...</p> : error ? <p className="text-red-500">{error}</p> : reportsList.length === 0 ? <p>No reports generated yet.</p> : reportsList.map((report, i) => (
           <div key={i} className="card hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gov-primary group-hover:text-white transition-colors">
              <FileText />
            </div>
            <h3 className="font-bold text-lg mb-2">{report.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{report.desc}</p>
            
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">{report.type}</span>
              <button className="text-gov-primary hover:text-gov-blue p-2 rounded-full hover:bg-blue-50 transition-colors">
                <Download size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
        <h3 className="font-bold mb-4 flex items-center gap-2 border-b pb-2">
          <Calendar className="text-gov-primary" size={18} />
          Custom Date Range Export
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-slate-600 mb-1">Start Date</label>
            <input type="date" className="input-field" />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
            <input type="date" className="input-field" />
          </div>
          <button className="btn-primary flex items-center gap-2">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
