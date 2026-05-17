import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileWarning, Lightbulb, MessageSquare, CheckCircle2, Home, Sprout, ShieldPlus, GraduationCap, ArrowRight } from 'lucide-react';

const SCHEMES_THUMBNAILS = [
  { id: 1, name: 'Pradhan Mantri Awas Yojana', icon: <Home size={32} />, gradient: 'from-blue-500 to-blue-700', details: 'Provides pucca houses with basic amenities to all houseless households and those living in kutcha and dilapidated houses.' },
  { id: 2, name: 'MGNREGA', icon: <Sprout size={32} />, gradient: 'from-green-500 to-green-700', details: 'Enhances livelihood security in rural areas by providing at least 100 days of guaranteed wage employment.' },
  { id: 3, name: 'PM Kisan Samman Nidhi', icon: <IndianRupee size={32} />, gradient: 'from-orange-500 to-orange-700', details: 'Provides income support of ₹6,000 per year to all land holding farmer families.' },
  { id: 4, name: 'National Social Assistance', icon: <ShieldPlus size={32} />, gradient: 'from-purple-500 to-purple-700', details: 'Provides financial assistance to the elderly, widows and persons with disabilities.' },
  { id: 5, name: 'Deen Dayal Upadhyaya GKY', icon: <GraduationCap size={32} />, gradient: 'from-pink-500 to-pink-700', details: 'Transforms rural poor youth into an economically independent and globally relevant workforce.' },
];
// Import IndianRupee directly for the array
import { IndianRupee } from 'lucide-react';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [selectedScheme, setSelectedScheme] = useState(null);
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          {/* Abstract background shape */}
          <div className="w-64 h-64 bg-gov-saffron rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Gram-Suvidha AI</h1>
          <p className="text-slate-600 mb-6 text-lg">Your intelligent gateway to simplified Panchayat services, schemes, and rapid complaint resolution.</p>

          <div className="flex flex-wrap gap-4">
            <Link to="/citizen/complaint" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full shadow-md">
              <FileWarning size={20} />
              Register Complaint
            </Link>
            <Link to="/citizen/schemes" className="btn-outline flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-800 border-slate-300 hover:border-gov-saffron hover:bg-orange-50">
              <Lightbulb className="text-gov-saffron" size={20} />
              View Eligible Schemes
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Status Card */}
        <div className="card border-t-4 border-t-gov-saffron">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={20} />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-800">Water Supply Issue</p>
                <p className="text-xs text-slate-500">ID: COMP-0892</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">IN PROGRESS</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-800">PM Awas Yojana Query</p>
                <p className="text-xs text-slate-500">AI Chatbot log</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">RESOLVED</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="card col-span-1 lg:col-span-2 bg-gradient-to-br from-gov-blue text-white to-blue-900 border-none shadow-lg flex items-center p-8">
          <div className="flex-1 pr-6">
            <h3 className="text-2xl font-bold mb-2">Have questions? Ask our AI Assistant.</h3>
            <p className="text-indigo-100 mb-4 text-sm">Gram-Suvidha AI can guide you through scheme applications, document requirements, and automatically escalate your urgent complaints to the Panchayat immediately.</p>
            <button onClick={() => navigate('/citizen/chatbot')} className="bg-white text-gov-blue px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors">
              <MessageSquare size={16} />
              Start Chat
            </button>
          </div>
          <div className="hidden md:flex w-24 h-24 rounded-full bg-white/20 items-center justify-center">
            <MessageSquare size={48} className="text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
          <Lightbulb className="text-gov-saffron" />
          Explore Government Schemes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {SCHEMES_THUMBNAILS.map(scheme => (
            <div 
              key={scheme.id} 
              onClick={() => setSelectedScheme(scheme)}
              className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col"
            >
              <div className={`h-24 bg-gradient-to-br ${scheme.gradient} flex items-center justify-center text-white`}>
                <div className="transform group-hover:scale-110 transition-transform">
                  {scheme.icon}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-bold text-slate-800 text-sm leading-tight flex-1">{scheme.name}</h4>
                <div className="text-xs font-semibold text-gov-primary mt-2 flex items-center gap-1 group-hover:text-gov-blue">
                  View Details <ArrowRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedScheme && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
            <button onClick={() => setSelectedScheme(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedScheme.gradient} text-white flex items-center justify-center mb-4`}>
              {selectedScheme.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{selectedScheme.name}</h3>
            <p className="text-sm text-slate-600 mb-6">{selectedScheme.details}</p>
            <button onClick={() => navigate('/citizen/schemes')} className="btn-primary w-full py-2">
              Check Eligibility
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CitizenDashboard;
