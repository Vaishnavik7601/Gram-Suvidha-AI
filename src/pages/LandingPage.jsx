import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowRight, ShieldCheck, MapPin, Users, Droplets, Lightbulb, Trash2, FileSpreadsheet, Bell, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SCHEMES_DB from '../data/schemes';

const LandingPage = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const isCitizen = token && role === 'citizen';

  const [selectedScheme, setSelectedScheme] = useState(null);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      {/* Formal Government-style background with gradient overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/village-bg.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/75 via-white/80 to-blue-50/75 backdrop-blur-[2px]" />
      </div>

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
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-primary transition-colors">{t('features')}</a>
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-primary transition-colors">{t('howItWorks')}</a>
              <a href="#community" onClick={(e) => scrollToSection(e, 'community')} className="hover:text-primary transition-colors">{t('community')}</a>
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

      {/* Category Section / Features */}
      <div id="features" className="bg-transparent py-24 border-t border-slate-100/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('categoriesTitle')}</h2>
          <p className="text-slate-500 max-w-lg mx-auto mb-16 text-sm">{t('categoriesDesc')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300 transition-all duration-300 text-left group cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Droplets size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{t('waterTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('waterDesc')}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-amber-300 transition-all duration-300 text-left group cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <Lightbulb size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">{t('lightTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('lightDesc')}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-300 transition-all duration-300 text-left group cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Trash2 size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">{t('roadTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('roadDesc')}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-300 transition-all duration-300 text-left group cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <FileSpreadsheet size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{t('schemeTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('schemeDesc')}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-orange-300 transition-all duration-300 text-left group cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Bell size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">{t('villageUpdates')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('latestAnnouncements')}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-rose-350 transition-all duration-300 text-left group cursor-pointer">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <Award size={28} />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">{t('adminVoting')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('voteBestAdmin')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Schemes Preview */}
      <div className="py-12 bg-transparent">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('popularSchemesTitle')}</h2>
          <p className="text-slate-500 mb-6 text-sm">{t('popularSchemesDesc')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCHEMES_DB.map(s => {
              const txt = s.translations?.[language] || s.translations?.en;
              return (
                <div key={s.id} onClick={() => setSelectedScheme(s)} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50 transition-all duration-300 text-left cursor-pointer group">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors">{txt.name}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{txt.full.length > 140 ? txt.full.slice(0,140) + '...' : txt.full}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Age {s.minAge}-{s.maxAge}</div>
                    <button className="text-primary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">{t('learnMore')} <ArrowRight size={14}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scheme Details Modal (inline) */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedScheme(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-semibold">×</button>
            {(() => {
              const txt = selectedScheme.translations?.[language] || selectedScheme.translations?.en || {};
              return (
                <>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{txt.name}</h2>
                  <div className="text-sm text-slate-600 mb-4">{t('eligibilityLabel')}: Age {selectedScheme.minAge} - {selectedScheme.maxAge} • Income limit: ₹{(selectedScheme.maxIncome || 0).toLocaleString()}</div>
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6">
                    <h4 className="font-semibold text-slate-800 mb-1 text-sm">{t('schemeDetailsLabel')}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {txt.full}
                    </p>
                  </div>
                </>
              );
            })()}
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedScheme(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm">{t('close')}</button>
              <button onClick={() => {
                if (token && role === 'citizen') {
                  navigate('/citizen/schemes');
                } else {
                  navigate('/login');
                }
              }} className="px-4 py-2 rounded-lg bg-primary text-white text-sm">{t('openSchemesPage')}</button>
            </div>
          </div>
        </div>
      )}

    {/* How it Works Section */}
    <div id="how-it-works" className="bg-transparent py-24 border-t border-slate-100/50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('howItWorksTitle')}</h2>
        <p className="text-slate-500 max-w-lg mx-auto mb-16 text-sm">{t('howItWorksDesc')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="relative p-6 rounded-2xl bg-white/60 border border-slate-200 shadow-sm flex flex-col text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-4">1</div>
            <h4 className="font-bold text-slate-800 text-base mb-2">{t('step1Title')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step1Desc')}</p>
          </div>
          
          <div className="relative p-6 rounded-2xl bg-white/60 border border-slate-200 shadow-sm flex flex-col text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-4">2</div>
            <h4 className="font-bold text-slate-800 text-base mb-2">{t('step2Title')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step2Desc')}</p>
          </div>

          <div className="relative p-6 rounded-2xl bg-white/60 border border-slate-200 shadow-sm flex flex-col text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-4">3</div>
            <h4 className="font-bold text-slate-800 text-base mb-2">{t('step3Title')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step3Desc')}</p>
          </div>

          <div className="relative p-6 rounded-2xl bg-white/60 border border-slate-200 shadow-sm flex flex-col text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-4">4</div>
            <h4 className="font-bold text-slate-800 text-base mb-2">{t('step4Title')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step4Desc')}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Community Section */}
    <div id="community" className="bg-transparent py-24 border-t border-slate-100/50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('communityTitle')}</h2>
        <p className="text-slate-500 max-w-lg mx-auto mb-16 text-sm">{t('communityDesc')}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('comm1Badge')}</span>
              <h3 className="font-bold text-xl text-slate-800 mt-2 mb-4">{t('comm1Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {t('comm1Desc')}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Users className="text-primary flex-shrink-0" size={24} />
              <span className="text-xs font-semibold text-slate-600">{t('comm1Footer')}</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('comm2Badge')}</span>
              <h3 className="font-bold text-xl text-slate-800 mt-2 mb-4">{t('comm2Title')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {t('comm2Desc')}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <ShieldCheck className="text-primary flex-shrink-0" size={24} />
              <span className="text-xs font-semibold text-slate-600">{t('comm2Footer')}</span>
            </div>
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
