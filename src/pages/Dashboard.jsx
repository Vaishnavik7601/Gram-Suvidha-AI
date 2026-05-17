import Navbar from '../components/Navbar';
import { MessageSquare, AlertTriangle, FileText, BarChart3, Users, Zap } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Complaints', value: '1,248', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Resolved (AI Assisted)', value: '892', icon: Zap, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Active Schemes', value: '24', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Registered Citizens', value: '5,430', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-gov-bg">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gov-text">Overview Dashboard</h1>
          <p className="text-gov-muted text-sm mt-1">AI-powered insights for rural administration</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="card flex items-center p-6">
                <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mr-4`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gov-muted">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gov-text">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2 spans */}
          <div className="lg:col-span-2 space-y-8">
            {/* Predictive Analytics Mockup */}
            <div className="card">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="text-gov-primary" size={20} />
                  Predictive Complaint Trends
                </h2>
                <span className="text-xs font-medium px-2 py-1 bg-gov-green/10 text-gov-green rounded-full">AI Model Active</span>
              </div>
              <div className="h-64 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center">
                <p className="text-gov-muted text-sm text-center">
                  Chart rendering here...<br/>
                  <span className="text-xs">Predicting upcoming summer water shortages</span>
                </p>
              </div>
            </div>

            {/* Scheme Recommendations */}
            <div className="card">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="text-gov-primary" size={20} />
                  Targeted Scheme Recommendations
                </h2>
              </div>
              <ul className="space-y-3">
                {[
                  { name: 'Pradhan Mantri Awas Yojana', match: '98%' },
                  { name: 'Jal Jeevan Mission Target', match: '94%' },
                  { name: 'PM Kisan Samman Nidhi', match: '87%' }
                ].map((scheme, i) => (
                  <li key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border border-gray-100 transition-colors">
                    <span className="font-medium text-gov-text text-sm">{scheme.name}</span>
                    <span className="text-xs font-bold text-gov-green bg-gov-green/10 px-2 py-1 rounded">Match: {scheme.match}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - 1 span */}
          <div className="space-y-8">
            {/* AI Chatbot Widget Mockup */}
            <div className="card flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="text-gov-primary" size={20} />
                  Gram-Suvidha Sahayak
                </h2>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs text-gov-muted">Online</span>
                </div>
              </div>
              
              <div className="flex-1 bg-gray-50 rounded-md p-4 flex flex-col gap-3 overflow-y-auto border border-gray-100 mb-4">
                <div className="self-start bg-white p-3 rounded-lg shadow-sm max-w-[85%] border border-gray-100">
                  <p className="text-sm text-gov-text">Namaste! How can I assist you with Panchayat services today?</p>
                </div>
                <div className="self-end bg-gov-primary text-white p-3 rounded-lg shadow-sm max-w-[85%]">
                  <p className="text-sm">What is the status of complaint #C-3412?</p>
                </div>
                <div className="self-start bg-white p-3 rounded-lg shadow-sm max-w-[85%] border border-gray-100">
                  <p className="text-sm text-gov-text">
                    Complaint <strong>#C-3412 (Water Supply Issue)</strong> is currently categorized as <span className="text-red-500 font-bold">HIGH PRIORITY</span>. It has been assigned to the engineering team and is expected to be resolved within 24 hours.
                  </p>
                </div>
              </div>

              <div className="relative mt-auto">
                <input 
                  type="text" 
                  placeholder="Ask a query..." 
                  className="w-full text-sm rounded-full border border-gray-300 pl-4 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-gov-primary focus:border-gov-primary"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gov-primary p-1 rounded-full hover:bg-gray-100">
                  <Zap size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
