import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  return (
    <div className="card w-full shadow-xl">
      <div className="flex items-center mb-6 border-b pb-4">
        <Link to="/login" className="text-gov-muted hover:text-gov-primary mr-2">
          <ArrowLeft size={20} />
        </Link>
        <h3 className="text-xl font-semibold text-gov-text">Reset Password</h3>
      </div>
      
      <p className="text-sm text-gov-muted mb-6">
        Enter your registered Aadhaar Number or Email ID. We will send you instructions to reset your password.
      </p>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gov-text">Registered Identifier</label>
          <input type="text" required className="input-field" placeholder="Aadhaar / Email" />
        </div>

        <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 mt-6 py-3">
          <KeyRound size={20} />
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
