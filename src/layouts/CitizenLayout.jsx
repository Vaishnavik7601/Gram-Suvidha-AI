import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Lightbulb, FileWarning, LogOut, MessageSquare, User } from 'lucide-react';

const CitizenLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/citizen/dashboard', icon: Home },
    { name: 'Register Complaint', path: '/citizen/complaint', icon: FileWarning },
    { name: 'Available Schemes', path: '/citizen/schemes', icon: Lightbulb },
    { name: 'My Profile', path: '/citizen/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white shadow-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gov-saffron flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-white">
                GS
              </div>
              <span className="font-bold text-xl text-gov-text hidden sm:block">Gram-Suvidha AI <span className="font-medium text-sm text-gov-saffron ml-1">Citizen Portal</span></span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors border-b-2 px-1 py-5 ${
                      isActive ? 'text-gov-saffron border-gov-saffron' : 'text-gov-muted hover:text-gov-saffron border-transparent'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <Outlet />
      </main>

      {/* Floating AI Chatbot Button (mock) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-gov-saffron hover:bg-orange-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center relative group">
          <MessageSquare size={28} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
          </span>
          <div className="absolute top-1/2 -translate-y-1/2 right-16 bg-white text-gov-text font-medium text-sm px-4 py-2 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Need help? Ask AI
          </div>
        </button>
      </div>

    </div>
  );
};

export default CitizenLayout;
