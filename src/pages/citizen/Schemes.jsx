import { useState, useMemo, useEffect } from 'react';
import { Lightbulb, Search, Filter, ShieldCheck, IndianRupee } from 'lucide-react';
import SCHEMES_DB from '../../data/schemes';
import { useLanguage } from '../../context/LanguageContext';

const Schemes = () => {
  const [age, setAge] = useState('');
  const [income, setIncome] = useState('');
  const [socialCategory, setSocialCategory] = useState('');
  const [occupation, setOccupation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  
  // Application Form State
  const [applicantName, setApplicantName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idProof, setIdProof] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [relationship, setRelationship] = useState('Self');
  const [myApplications, setMyApplications] = useState([]);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    const fetchProfileAndApps = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMyApplications(data.applications || []);
          if (data.user && data.user.age) {
            setAge(data.user.age.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      }
    };
    fetchProfileAndApps();
  }, []);

  const { language } = useLanguage();

  const filteredSchemes = useMemo(() => {
    if (!hasSearched) return [];
    
    const userAge = parseInt(age, 10);
    const userIncome = parseInt(income, 10);

    if (isNaN(userAge) || isNaN(userIncome)) return [];

    return SCHEMES_DB.filter(
      (scheme) =>
        userAge >= scheme.minAge &&
        userAge <= scheme.maxAge &&
        userIncome <= scheme.maxIncome
    );
  }, [age, income, socialCategory, occupation, hasSearched]);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applicantName || !idProof) return;

    setIsSubmitting(true);
    setApplyError('');
    
    const schemeTxtForSubmit = selectedScheme.translations?.[language] || selectedScheme.translations?.en || {};
    const formData = new FormData();
    formData.append('schemeName', schemeTxtForSubmit.name || selectedScheme.key);
    formData.append('applicantName', applicantName);
    formData.append('idNumber', idNumber);
    formData.append('age', age);
    formData.append('idProof', idProof);
    formData.append('socialCategory', socialCategory);
    formData.append('occupation', occupation);
    formData.append('relationship', relationship);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/schemes/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSelectedScheme(null);
          setSubmitSuccess(false);
          setApplicantName('');
          setIdNumber('');
          setIdProof(null);
          setApplyError('');
        }, 2500);
      } else {
        const errData = await response.json();
        setApplyError(errData.message || 'Failed to submit application.');
      }
    } catch (error) {
      console.error(error);
      setApplyError('Network error submitting application. Is the backend running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Lightbulb className="text-primary animate-pulse" />
            Schemes Eligibility Checker
          </h1>
          <p className="text-slate-500 mt-1 text-sm max-w-xl">Enter your demographic details below. The GramSuvidha engine will recommend government schemes tailored for you.</p>
        </div>
      </div>

      <div className="card bg-white shadow-md border-t-4 border-t-primary">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Age (Years)
            </label>
            <input 
              type="number" 
              min="0" 
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
              placeholder="e.g. 35"
              value={age}
              onChange={(e) => {setAge(e.target.value); setHasSearched(false);}}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <IndianRupee size={12} />
              Annual Income (₹)
            </label>
            <input 
              type="number" 
              min="0" 
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
              placeholder="e.g. 250000"
              value={income}
              onChange={(e) => {setIncome(e.target.value); setHasSearched(false);}}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Social Category
            </label>
            <select 
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
              value={socialCategory}
              onChange={(e) => {setSocialCategory(e.target.value); setHasSearched(false);}}
            >
              <option value="" disabled>Select Category</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Primary Occupation
            </label>
            <select 
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" 
              value={occupation}
              onChange={(e) => {setOccupation(e.target.value); setHasSearched(false);}}
            >
              <option value="" disabled>Select Occupation</option>
              <option value="Farmer">Farmer</option>
              <option value="Student">Student</option>
              <option value="Labour">Labour</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Self-Employed">Self-Employed</option>
            </select>
          </div>
          <div className="lg:col-span-4">
            <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark shadow-sm transition-colors flex items-center justify-center gap-2">
              <Search size={18} />
              Check Eligibility
            </button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <Filter size={18} className="text-slate-400" />
            Recommended Schemes ({filteredSchemes.length})
          </h2>
          
          {filteredSchemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchemes.map((scheme) => {
                const txt = scheme.translations?.[language] || scheme.translations?.en;
                return (
                  <div key={scheme.id} className="border border-blue-100 bg-blue-50/20 rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer" onClick={() => {setSelectedScheme(scheme); setSubmitSuccess(false);}}>
                    
                    <div className="absolute top-0 right-0 p-3 text-primary opacity-10 group-hover:opacity-100 transition-opacity">
                      <ShieldCheck size={48} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 pr-12">{txt.name}</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{txt.short}</p>
                    <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 w-max px-3 py-1 rounded-full">
                      <ShieldCheck size={14} /> Highly Eligible
                    </div>
                  </div>
                );
                })}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 mb-2 flex justify-center"><Search size={48} /></div>
              <p className="text-slate-600 font-medium">No matching schemes found for the entered criteria.</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting the income or age parameters.</p>
            </div>
          )}
        </div>
      )}

      {/* Scheme Details & Application Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedScheme(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-semibold">&times;</button>
            
            {!submitSuccess ? (
              <>
                {(() => {
                  const txt = selectedScheme.translations?.[language] || selectedScheme.translations?.en || {};
                  return <h2 className="text-2xl font-bold text-slate-800 mb-2 pr-6">{txt.name}</h2>;
                })()}
                <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 w-max px-3 py-1 rounded-full mb-4">
                   <ShieldCheck size={14} /> You are Eligible
                </div>
                
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6">
                  <h4 className="font-semibold text-slate-800 mb-1 text-sm">Scheme Details</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {(() => {
                      const txt = selectedScheme.translations?.[language] || selectedScheme.translations?.en || {};
                      return txt.full;
                    })()}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Application Form</h3>
                  
                  {(() => {
                    const schemeTxt = selectedScheme.translations?.[language] || selectedScheme.translations?.en || {};
                    const isAlreadyRegistered = selectedScheme && myApplications.some(app => 
                      app.schemeName === (schemeTxt.name || selectedScheme.key) && 
                      (app.relationship || 'Self') === relationship
                    );

                    return (
                      <form onSubmit={handleApply} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Applying For</label>
                            <select 
                              required
                              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                              value={relationship}
                              onChange={e => setRelationship(e.target.value)}
                            >
                              <option value="Self">Self</option>
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Sibling">Sibling</option>
                              <option value="Daughter">Daughter</option>
                              <option value="Son">Son</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Applicant Name</label>
                            <input 
                              type="text" 
                              required
                              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                              placeholder="Enter full name"
                              value={applicantName}
                              onChange={e => setApplicantName(e.target.value)}
                            />
                          </div>
                        </div>

                        {isAlreadyRegistered && (
                          <div className="bg-orange-50 border border-orange-200 text-orange-850 px-4 py-3 rounded-lg flex items-center gap-2">
                            <ShieldCheck className="text-orange-600" />
                            <span className="text-xs font-semibold">Notice: You have already registered for this scheme under the relationship "{relationship}".</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
                          <input 
                            type="number" 
                            disabled
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-slate-50 text-slate-500"
                            value={age}
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Pre-filled from eligibility criteria</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ID Number (Aadhaar / PAN)</label>
                          <input 
                            type="text" 
                            required
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                            placeholder="e.g. 1234 5678 9012"
                            value={idNumber}
                            onChange={e => setIdNumber(e.target.value.toUpperCase())}
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Enter a valid 12-digit Aadhaar number or a 10-character PAN number (e.g., ABCDE1234F)</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload ID Proof (Scan/Photo)</label>
                          <input 
                            type="file" 
                            required
                            accept="image/*,.pdf"
                            className="w-full border border-slate-300 rounded-lg text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                            onChange={e => setIdProof(e.target.files[0])}
                          />
                        </div>
                        
                        {applyError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs font-semibold flex items-start gap-2">
                            <span className="mt-0.5">⚠</span>
                            <span>{applyError}</span>
                          </div>
                        )}

                        <button type="submit" disabled={isSubmitting || isAlreadyRegistered} className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                          {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                      </form>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div className="py-10 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Application Submitted!</h3>
                <p className="text-slate-600 text-sm">{(() => {
                  const txt = selectedScheme.translations?.[language] || selectedScheme.translations?.en || {};
                  return `Your application for ${txt.name || selectedScheme.key} has been successfully submitted and is under review.`;
                })()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
