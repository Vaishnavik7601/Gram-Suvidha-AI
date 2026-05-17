import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gov-bg flex flex-col justify-center items-center relative overflow-hidden">
      {/* Dynamic, clean rural background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "url('/bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Embellishments for a premium government portal look */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gov-saffron via-white to-gov-green z-10" />

      {/* Main content wrapper */}
      <div className="z-10 w-full max-w-md px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md border border-gray-100 mb-4">
            {/* National emblem mock / Logo placeholder */}
            <span className="text-gov-primary font-bold text-xl">GS</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gov-text tracking-tight">Gram-Suvidha AI</h2>
          <p className="mt-2 text-sm text-gov-muted">Intelligent Rural Governance System</p>
        </div>
        
        <Outlet />
      </div>
      
      <footer className="absolute bottom-4 z-10 text-xs text-gov-muted">
        &copy; {new Date().getFullYear()} Gram Panchayat Administration System
      </footer>
    </div>
  );
};

export default AuthLayout;
