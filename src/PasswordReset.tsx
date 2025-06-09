// PasswordReset.tsx
import React, { useState } from 'react';
import './PasswordReset.css';
import Logo from './Logo';

interface PasswordResetProps {
  onBack: () => void;
  onSubmit: (email: string) => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onBack, onSubmit }) => {
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    // Reset error
    setError(null);
    
    // Submit email
    onSubmit(email);
    
    // Show success message
    setSubmitted(true);
  };
  
  return (
    <div className="password-reset">
      <div className="reset-container">
        <div className="reset-header">
          <Logo />
          <h1>Reset Password</h1>
        </div>
        
        {submitted ? (
          <div className="reset-success">
            <h2>Check Your Email</h2>
            <p>
              We've sent password reset instructions to <strong>{email}</strong>.
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <p className="note">
              If you don't see the email, please check your spam folder.
            </p>
            <button 
              className="back-to-signin"
              onClick={onBack}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form className="reset-form" onSubmit={handleSubmit}>
            <p className="form-description">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="submit-button"
            >
              Reset Password
            </button>
            
            <button 
              type="button"
              className="back-button"
              onClick={onBack}
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;
