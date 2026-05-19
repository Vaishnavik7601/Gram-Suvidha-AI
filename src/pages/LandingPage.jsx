import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowRight, ShieldCheck, MapPin, Users, Droplets, Lightbulb, Trash2, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isCitizen = token && role === 'citizen';

  const handleDashboardRedirect = () => {
    if (isCitizen) {
      navigate('/citizen/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleReportRedirect = () => {
    if (isCitizen) {
      navigate('/citizen/complaint');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen relative text-slate-900 font-sans overflow-x-hidden">
      {/* Blurred full page background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/village-bg.jpg')",
          filter: 'blur(3px) brightness(0.95)',
          transform: 'scale(1.02)'
        }}
      />
      {/* Semi-transparent white overlay to ensure readability */}
      <div className="fixed inset-0 z-0 bg-white/75 backdrop-blur-[1px]" />

      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Activity className="text-primary" />
          </div>
          GramSuvidha
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          {!isCitizen ? (
            <>
              <a href="#" className="hover:text-primary transition-colors">{t('features')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('howItWorks')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('community')}</a>
            </>
          ) : (
            <>
              <Link to="/citizen/complaint" className="hover:text-primary transition-colors">{t('reportComplaint')}</Link>
              <Link to="/citizen/schemes" className="hover:text-primary transition-colors">{t('schemes')}</Link>
              <Link to="/citizen/profile" className="hover:text-primary transition-colors">{t('profile')}</Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {t('activeStatus')}
          </span>
          {token && (
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="text-slate-600 hover:text-red-600 font-semibold text-sm transition-colors mr-2"
            >
              {t('logout')}
            </button>
          )}
          <button 
            onClick={handleDashboardRedirect}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/30"
          >
            {isCitizen ? t('dashboard') : t('login')} <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-20 pb-32 bg-transparent">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-100 bg-blue-50/50 backdrop-blur-sm text-sm font-medium text-primary">
            {t('smartPortal')}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight text-slate-900">
            <span className="text-slate-500 font-light italic">{t('heroTitleLight')}</span>{t('heroTitleMiddle')}<br />
            <span className="text-primary">{t('heroTitleBlue')}</span>{t('heroTitleEnd')}
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {t('heroDesc')}
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={handleReportRedirect}
              className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              {t('btnReport')} <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Section */}
      <div className="bg-transparent py-24 border-t border-slate-100/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('categoriesTitle')}</h2>
          <p className="text-slate-500 max-w-lg mx-auto mb-16 text-sm">{t('categoriesDesc')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6">
                <Droplets size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{t('waterTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('waterDesc')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-6">
                <Lightbulb size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{t('lightTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('lightDesc')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6">
                <Trash2 size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{t('roadTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('roadDesc')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-6">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{t('schemeTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('schemeDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/40 backdrop-blur-sm border-t border-slate-200/50 py-12 text-center text-slate-400 text-xs font-semibold tracking-wider">
        &copy; {new Date().getFullYear()} GRAMSUVIDHA - SMART GRAM PANCHAYAT INITIATIVE. ALL RIGHTS RESERVED.
      </footer>
      </div>
    </div>
  );
};

export default LandingPage;
