import React, { useState } from 'react';
import './SignUp.css';
import GoogleIcon from './icons/GoogleIcon'; // Adjust path if needed
import AppleIcon from './icons/AppleIcon'; // Adjust path if needed

interface SignUpProps {
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
  onGoogleSignUp: () => Promise<void>;
  onAppleSignUp: () => Promise<void>;
  onSignIn: () => void;
}

const SignUp: React.FC<SignUpProps> = ({
  onSignUp,
  onGoogleSignUp,
  onAppleSignUp,
  onSignIn,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSignUp(email, password, name);
    } catch (err) {
      setError('Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-content">
          <div className="signup-header">
            <h1>Create Account</h1>
            <p>Sign up to start your journey to lasting happiness</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={error ? 'error' : ''}
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={error ? 'error' : ''}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={error ? 'error' : ''}
              />
            </div>

            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading && <div className="loading-spinner"></div>}
              Sign Up
            </button>
          </form>

          <div className="social-signup-options">
            <p>Or sign up with</p>
            <button onClick={onGoogleSignUp} className="social-button google-button">
              <GoogleIcon /> Continue with Google
            </button>
            <button onClick={onAppleSignUp} className="social-button apple-button">
              <AppleIcon /> Continue with Apple
            </button>
          </div>

          <p className="signin-link">
            Already have an account? <span onClick={onSignIn}>Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;