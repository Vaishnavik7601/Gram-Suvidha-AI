import { useState, useMemo, useEffect } from 'react';
import { Lightbulb, Search, Filter, ShieldCheck, IndianRupee } from 'lucide-react';

// Mock DB of schemes based on the synopsis requirements
const SCHEMES_DB = [
  { id: 1, name: 'Pradhan Mantri Awas Yojana (PMAY)', desc: 'Housing for the rural poor.', minAge: 18, maxAge: 100, maxIncome: 300000, fullDetails: 'Provides pucca houses with basic amenities to all houseless households and those living in kutcha and dilapidated houses.' },
  { id: 2, name: 'MGNREGA', desc: 'Guarantees 100 days of wage employment.', minAge: 18, maxAge: 65, maxIncome: 500000, fullDetails: 'Mahatma Gandhi National Rural Employment Guarantee Act enhances livelihood security in rural areas by providing at least 100 days of guaranteed wage employment.' },
  { id: 3, name: 'PM Kisan Samman Nidhi', desc: 'Income support to all landholding farmer families.', minAge: 18, maxAge: 100, maxIncome: 600000, fullDetails: 'Provides income support of ₹6,000 per year in three equal installments to all land holding farmer families.' },
  { id: 4, name: 'National Social Assistance Programme', desc: 'Pension scheme for elderly citizens.', minAge: 60, maxAge: 120, maxIncome: 200000, fullDetails: 'A welfare program being administered by the Ministry of Rural Development. It provides financial assistance to the elderly, widows and persons with disabilities.' },
  { id: 5, name: 'Sukanya Samriddhi Yojana', desc: 'Savings scheme targeted at parents of girl children.', minAge: 0, maxAge: 10, maxIncome: 1000000, fullDetails: 'A small deposit scheme for the girl child launched as a part of the Beti Bachao Beti Padhao campaign.' },
  { id: 6, name: 'Jal Jeevan Mission', desc: 'Safe and adequate drinking water through individual household tap connections.', minAge: 18, maxAge: 100, maxIncome: 10000000, fullDetails: 'Har Ghar Jal aims to provide tap water to every rural household.' },
  { id: 7, name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana', desc: 'Placement linked skill development program for rural youth.', minAge: 15, maxAge: 35, maxIncome: 400000, fullDetails: 'Transforms rural poor youth into an economically independent and globally relevant workforce.' },
];

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

  useEffect(() => {
    const fetchProfileAndApps = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
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

  const filteredSchemes = useMemo(() => {
    if (!hasSearched) return [];
    
    const userAge = parseInt(age, 10);
    const userIncome = parseInt(income, 10);

    if (isNaN(userAge) || isNaN(userIncome)) return [];

    // Basic filtering based on mock logic. In a real app, DB logic would handle socialCategory & occupation
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
    
    const formData = new FormData();
    formData.append('schemeName', selectedScheme.name);
    formData.append('applicantName', applicantName);
    formData.append('idNumber', idNumber);
    formData.append('age', age); // using age from the search criteria
    formData.append('idProof', idProof);
    formData.append('socialCategory', socialCategory);
    formData.append('occupation', occupation);
    formData.append('relationship', relationship);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/schemes/apply', {
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
        }, 2500);
      } else {
        const errData = await response.json();
        alert("Failed to submit application: " + errData.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting application. Is the backend running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Lightbulb className="text-gov-saffron" />
            Schemes Eligibility Checker
          </h1>
          <p className="text-slate-500 mt-1 text-sm max-w-xl">Enter your demographic details below. The Gram-Suvidha AI engine will recommend government schemes tailored for you.</p>
        </div>
      </div>

      <div className="card bg-white shadow-md border-t-4 border-t-gov-primary">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              Age (Years)
            </label>
            <input 
              type="number" 
              min="0" 
              required
              className="input-field w-full text-base" 
              placeholder="e.g. 35"
              value={age}
              onChange={(e) => {setAge(e.target.value); setHasSearched(false);}}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <IndianRupee size={16} className="text-slate-500" />
              Annual Family Income (₹)
            </label>
            <input 
              type="number" 
              min="0" 
              required
              className="input-field w-full text-base" 
              placeholder="e.g. 250000"
              value={income}
              onChange={(e) => {setIncome(e.target.value); setHasSearched(false);}}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Social Category
            </label>
            <select 
              required
              className="input-field w-full text-base" 
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Primary Occupation
            </label>
            <select 
              required
              className="input-field w-full text-base" 
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
            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-lg shadow-md">
              <Search size={20} />
              Check Eligibility
            </button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <Filter size={18} className="text-gov-muted" />
            Recommended Schemes ({filteredSchemes.length})
          </h2>
          
          {filteredSchemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSchemes.map((scheme) => (
                <div key={scheme.id} className="border border-green-100 bg-green-50/30 rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer" onClick={() => {setSelectedScheme(scheme); setSubmitSuccess(false);}}>
                  <div className="absolute top-0 right-0 p-3 text-green-500 opacity-20 group-hover:opacity-100 transition-opacity">
                    <ShieldCheck size={48} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2 pr-12">{scheme.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{scheme.desc}</p>
                  <div className="mt-auto flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-100 w-max px-3 py-1 rounded-full">
                    <ShieldCheck size={14} /> Highly Eligible
                  </div>
                </div>
              ))}
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
            <button onClick={() => setSelectedScheme(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            
            {!submitSuccess ? (
              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-2 pr-6">{selectedScheme.name}</h2>
                <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-100 w-max px-3 py-1 rounded-full mb-4">
                   <ShieldCheck size={14} /> You are Eligible
                </div>
                
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                  <h4 className="font-semibold text-blue-900 mb-1 text-sm">Scheme Details</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {selectedScheme.fullDetails}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Application Form</h3>
                  
                  {(() => {
                    const isAlreadyRegistered = selectedScheme && myApplications.some(app => 
                      app.schemeName === selectedScheme.name && 
                      (app.relationship || 'Self') === relationship
                    );

                    return (
                      <form onSubmit={handleApply} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Applying For (Related To)</label>
                            <select 
                              required
                              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-primary outline-none"
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Applicant Name</label>
                            <input 
                              type="text" 
                              required
                              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-primary focus:border-transparent outline-none"
                              placeholder="Enter full name"
                              value={applicantName}
                              onChange={e => setApplicantName(e.target.value)}
                            />
                          </div>
                        </div>

                        {isAlreadyRegistered && (
                          <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg flex items-center gap-2">
                            <ShieldCheck className="text-orange-600" />
                            <span className="text-sm font-medium">Notice: You have already registered for this scheme under the relationship "{relationship}".</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                          <input 
                            type="number" 
                            disabled
                            className="w-full p-2 border border-slate-300 bg-slate-50 text-slate-500 rounded-lg"
                            value={age}
                          />
                          <p className="text-xs text-slate-500 mt-1">Pre-filled from eligibility criteria</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">ID Number (Aadhaar / PAN)</label>
                          <input 
                            type="text" 
                            required
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-primary focus:border-transparent outline-none"
                            placeholder="e.g. 1234 5678 9012 or ABCDE1234F"
                            value={idNumber}
                            onChange={e => setIdNumber(e.target.value.toUpperCase())}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Upload ID Proof (Scan/Photo)</label>
                          <input 
                            type="file" 
                            required
                            accept="image/*,.pdf"
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={e => setIdProof(e.target.files[0])}
                          />
                        </div>
                        
                        <button type="submit" disabled={isSubmitting || isAlreadyRegistered} className="btn-primary w-full py-3 mt-4 text-base font-bold flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed">
                          {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                      </form>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div className="py-10 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Application Submitted!</h3>
                <p className="text-slate-600">Your application for {selectedScheme.name} has been successfully submitted and is under review.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
