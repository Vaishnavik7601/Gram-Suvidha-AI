import { LogOut, User, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo area */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gov-primary flex items-center justify-center text-white font-bold text-xs">
                GS
              </div>
              <span className="font-bold text-lg text-gov-text">Gram-Suvidha AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gov-muted hover:text-gov-primary rounded-full hover:bg-gray-50 transition-colors">
              <Bell size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-gov-saffron/20 flex items-center justify-center text-gov-saffron border border-gov-saffron">
              <User size={18} />
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors ml-4"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
