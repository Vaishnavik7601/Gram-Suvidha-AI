import { useState } from 'react';
import { Droplet, Zap, Tractor, Users, AlertCircle, FileWarning, ArrowRight } from 'lucide-react';

const RegisterComplaint = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const [nlpWarning, setNlpWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'water', name: 'Water & Sanitation', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'electricity', name: 'Electricity & Lighting', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'roads', name: 'Roads & Infrastructure', icon: Tractor, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'welfare', name: 'Welfare & Benefits', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'other', name: 'Other Issues', icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileWarning className="text-gov-saffron" />
          Register a New Complaint
        </h1>
        <p className="text-slate-500 mt-1">Select a category to direct your issue to the correct Panchayat department.</p>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="card border-2 border-transparent hover:border-gov-saffron transition-all text-left group hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gov-saffron focus:ring-offset-2"
              >
                <div className={`w-14 h-14 rounded-xl ${cat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={cat.color} size={28} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{cat.name}</h3>
                <p className="text-sm text-slate-500 mb-4">Click to report issues related to {cat.name.toLowerCase()}.</p>

                <div className="flex items-center text-sm font-semibold text-gov-saffron group-hover:text-orange-600 transition-colors">
                  Select <ArrowRight size={16} className="ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="card max-w-2xl mx-auto border-t-4 border-t-gov-saffron shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Issue Details
            </h2>
            <button
              onClick={() => { setSelectedCategory(null); setNlpWarning(''); }}
              className="text-sm text-gov-primary hover:underline hover:text-gov-blue"
            >
              Change Category
            </button>
          </div>

          {nlpWarning && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
              <p className="font-bold">AI Suggestion</p>
              <p>{nlpWarning}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            setNlpWarning('');

            try {
              // 1. NLP Validation
              let nlpData = { is_valid: true, warning: '' };
              try {
                const nlpRes = await fetch('http://localhost:8000/analyze-complaint', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ category: selectedCategory, description })
                });

                if (nlpRes.ok) {
                  nlpData = await nlpRes.json();
                }
              } catch (nlpErr) {
                console.warn("ML Service unreachable, skipping validation", nlpErr);
              }

              if (!nlpData.is_valid) {
                setNlpWarning(nlpData.warning);
                setIsSubmitting(false);
                return; // Stop submission to let user fix it
              }

              // 2. Submit to Node API
              const res = await fetch('http://localhost:5000/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user: localStorage.getItem('userId') || '60d0fe4f5311236168a109ca', // mock user ID for now
                  category: selectedCategory,
                  description: `${subject}: ${description}`,
                  location
                })
              });

              if (res.ok) {
                alert("Complaint registered successfully!");
                setSelectedCategory(null);
                setDescription('');
                setSubject('');
                setLocation('');
              } else {
                const errorData = await res.json();
                alert(`Failed to register complaint: ${errorData.message || 'Unknown error'}`);
              }
            } catch (err) {
              console.error("Submission error:", err);
              alert("Network error: Could not connect to the server. Please ensure the backend is running.");
            } finally {
              setIsSubmitting(false);
            }
          }}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Issue Subject</label>
              <input type="text" className="input-field w-full" placeholder="Brief title of the problem" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
              <textarea
                className="input-field w-full min-h-[120px] resize-y"
                placeholder="Explain the issue in detail. Our AI will automatically analyze this to determine the urgency."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location / Ward</label>
              <input type="text" className="input-field w-full" placeholder="e.g. Ward 4, Near Primary School" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 italic max-w-[200px]">By submitting, you agree to let our AI process this text for categorization.</span>
              <button type="submit" disabled={isSubmitting} className="btn-primary px-8 flex items-center gap-2 disabled:opacity-50">
                {isSubmitting ? 'Processing...' : 'Submit Complaint'} <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegisterComplaint;
