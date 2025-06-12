import React, { useState } from 'react';
import './SignIn.css';
import Logo from './Logo'; // Adjust path if needed
import GoogleIcon from './icons/GoogleIcon'; // Adjust path if needed
import AppleIcon from './icons/AppleIcon'; // Adjust path if needed

interface SignInProps {
  onSignIn: (email: string, password: string) => void;
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void; // Added this line
}

const SignIn: React.FC<SignInProps> = ({
  onSignIn,
  onGoogleSignIn,
  onAppleSignIn,
  onSignUp,
  onForgotPassword, // Added this line
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSignIn(email, password);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-content">
          <div className="logo-section">
            <div className="matrix-logo">
              <Logo />
            </div>
          </div>

          <div className="signin-header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue your journey to lasting happiness</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="signin-form">
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={error ? 'error' : ''}
              />
            </div>

            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>

            <div className="forgot-password">
              <a href="#" onClick={onForgotPassword}>Forgot Password?</a>
            </div>

            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading && <div className="loading-spinner"></div>}
              Sign In
            </button>
          </form>

          <div className="social-signin-options">
            <p>Or sign in with</p>
            <button onClick={onGoogleSignIn} className="social-button google-button">
              <GoogleIcon /> Continue with Google
            </button>
            <button onClick={onAppleSignIn} className="social-button apple-button">
              <AppleIcon /> Continue with Apple
            </button>
          </div>

          <p className="signup-link">
            Don't have an account? <span onClick={onSignUp}>Sign Up</span>
          </p>

          <div className="demo-notice">
            <p>Demo Mode: Use any email and password to sign in.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;


