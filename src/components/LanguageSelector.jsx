import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-6 left-6 z-50 bg-white/80 backdrop-blur-md border border-slate-200 hover:border-primary/50 text-slate-800 px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-slate-50 transition-all font-semibold text-xs leading-none"
      title="Change Language / भाषा बदलें"
    >
      <Globe size={15} className="text-primary" />
      <span>{language === 'en' ? 'हिंदी (HI)' : 'English (EN)'}</span>
    </button>
  );
};

export default LanguageSelector;
