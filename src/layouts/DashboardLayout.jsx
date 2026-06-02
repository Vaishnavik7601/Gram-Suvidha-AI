import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, Search, LogOut } from 'lucide-react';

const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'New complaint assigned', message: 'A new complaint has been assigned to your village.', time: '2m ago' },
    { id: 2, title: 'Worker onboarding', message: 'A new field worker has been added for your region.', time: '1h ago' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-700"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              onClick={() => setShowNotifications((prev) => !prev)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-300/20 z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    <button
                      className="text-xs text-slate-500 hover:text-slate-700"
                      onClick={() => setShowNotifications(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((note) => (
                      <div key={note.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                        <p className="text-sm font-semibold text-slate-900">{note.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{note.message}</p>
                        <p className="text-[11px] text-slate-400 mt-2">{note.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-sm text-slate-500">No new notifications.</div>
                  )}
                </div>
              </div>
            )}

            <div className="h-6 w-px bg-slate-200"></div>
            <button 
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('user');
                navigate('/login');
              }}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
