import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Upload, MapPin, Navigation, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const RegisterComplaint = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [category, setCategory] = useState('water_leakage');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Bengeri, Vishweshwara Nagar, Hubli, Hubballi Urban Taluka, Dharwad, Karnataka, 580020, India');
  const [locationMode, setLocationMode] = useState('gps');
  const [locationStatus, setLocationStatus] = useState('Ready');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAutoDetectLocation = () => {
    setError('');
    setLocationStatus('Detecting location...');
    setLocationMode('gps');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocationStatus('Geolocation unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setAddress(`Detected location: ${coords}`);
        setLocationStatus('Location detected successfully');
      },
      (err) => {
        setError('Unable to detect current location. Please allow location permissions or enter manually.');
        setLocationStatus('Detection failed');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCurrentGPS = () => {
    setLocationMode('gps');
    handleAutoDetectLocation();
  };

  const handleManualEntry = () => {
    setError('');
    setLocationMode('manual');
    setLocationStatus('Enter the address manually below.');
  };

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!description.trim()) {
      setError('Please provide a detailed description of the issue.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: category,
          description: description,
          location: address,
          priority: priority
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Complaint registered successfully! Redirecting...');
        setTimeout(() => {
          navigate('/citizen/dashboard');
        }, 1500);
      } else {
        setError(data.message || data.error || 'Failed to submit complaint.');
      }
    } catch (err) {
      setError(err.message || 'Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card border-primary/20 bg-primary/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('registerNewComplaint')}</h2>
          <p className="text-sm text-slate-600 mt-1">{t('complaintHelperText')}</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-semibold">{error}</div>}
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-semibold">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Complaint Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {t('complaintDetailsSection')}
          </h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('issueCategory')} *</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white"
            >
              <option value="water_leakage">{t('waterLeakage')}</option>
              <option value="road_damage">{t('roadDamage')}</option>
              <option value="garbage_dump">{t('garbageDump')}</option>
              <option value="electricity_issue">{t('electricityIssue')}</option>
              <option value="drainage_issue">{t('drainageIssue')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('priority')}</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white">
              <option value="High">{t('high')}</option>
              <option value="Medium">{t('medium')}</option>
              <option value="Low">{t('low')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('detailedDescription')} *</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail. Include landmarks or specific observations."
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            ></textarea>
          </div>
        </div>

        {/* 2. Visual Evidence */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {t('visualEvidence')}
          </h3>
          
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors group">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 transition-transform">
              <Upload size={28} />
            </div>
            <div className="font-bold text-slate-800 mb-1">{t('uploadPrompt')}</div>
            <div className="text-sm text-slate-500 mb-6">{t('uploadFormats')}</div>
            <div className="text-xs text-slate-400">{t('uploadLimit')}</div>
            
            <button type="button" onClick={handleBrowseFiles} className="mt-6 px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 flex items-center gap-2">
              <Upload size={16} /> {t('browseFiles')}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelection}
              multiple
              accept="image/*,video/mp4,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />
            {selectedFiles.length > 0 && (
              <div className="mt-3 text-xs text-slate-600">
                Selected: {selectedFiles.map((file) => file.name).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* 3. Location Information */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {t('locationSection')}
          </h3>
          
          <div className="flex rounded-lg overflow-hidden border border-slate-200 p-1 bg-slate-100">
            <button type="button" onClick={handleCurrentGPS} className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 ${locationMode === 'gps' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Navigation size={16} /> {t('currentGPS')}
            </button>
            <button type="button" onClick={handleManualEntry} className={`flex-1 py-2 text-sm font-bold flex justify-center items-center gap-2 ${locationMode === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <MapPin size={16} /> {t('manualEntry')}
            </button>
          </div>

          <button type="button" onClick={handleAutoDetectLocation} className="w-full py-3 bg-primary text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-primary-dark transition-colors">
            <Navigation size={16} /> {t('autoDetect')}
          </button>
          {locationStatus && <div className="text-xs text-slate-500 mt-2">Status: {locationStatus}</div>}

          <div className="relative h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
            {/* Map placeholder */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 text-red-500 mb-2 drop-shadow-md">
                <MapPin size={32} />
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-md text-xs font-bold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> LIVE DATA
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('detectedLocation')}</div>
              <div className="text-xs font-medium text-slate-800 truncate">{address}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('finalAddress')}</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/citizen/dashboard')}
            className="px-6 py-3 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 sm:w-1/3"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-sm sm:w-2/3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <CheckCircle size={18} /> {loading ? t('registeringComplaint') : t('reportComplaint')}
          </button>
        </div>
        
        <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 mt-4">
          <Shield size={12} /> {t('ipLogNote')}
        </p>
      </form>
    </div>
  );
};

export default RegisterComplaint;
