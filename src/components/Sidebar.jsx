import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, ShieldAlert, Activity, Menu, X, PlusCircle, Clock, MapPin, Briefcase, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ role, isOpen, setIsOpen }) => {
  const { t } = useLanguage();
  const location = useLocation();

  const adminLinks = [
    { name: t('home'), path: '/', icon: <Home size={20} /> },
    { name: t('systemOverview'), path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: t('fieldWorkers'), path: '/admin/workers', icon: <Users size={20} /> },
    { name: t('complaintsMgmt'), path: '/admin/complaints', icon: <FileText size={20} /> },
  ];

  const citizenLinks = [
    { name: t('home'), path: '/', icon: <Home size={20} /> },
    { name: t('dashboard'), path: '/citizen/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: t('reportComplaint'), path: '/citizen/complaint', icon: <PlusCircle size={20} /> },
    { name: t('schemes'), path: '/citizen/schemes', icon: <Briefcase size={20} /> },
    { name: t('profile'), path: '/citizen/profile', icon: <Users size={20} /> },
  ];

  const links = role === 'admin' ? adminLinks : citizenLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:static lg:block`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <Activity className="text-primary" />
            GramSuvidha
          </div>
          <button className="lg:hidden text-slate-500" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = link.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(link.path);
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                {link.icon}
                <span className="font-medium">{link.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer">
            <Settings size={20} />
            <span className="font-medium">{t('settings')}</span>
          </div>
          <div className="mt-4 flex items-center gap-3 px-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
              {role === 'admin' ? 'AD' : 'CT'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{role === 'admin' ? t('sysAdmin') : t('citizen')}</p>
              <p className="text-xs text-slate-500 capitalize">{role === 'admin' ? t('sysAdmin') : t('citizen')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
