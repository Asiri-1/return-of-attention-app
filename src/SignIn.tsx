import React, { useState } from 'react';
import './SignIn.css';
import Logo from './Logo';
import GoogleIcon from './icons/GoogleIcon';
import AppleIcon from './icons/AppleIcon';

interface SignInProps {
  onSignIn: (email: string, password: string) => void;
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void; // New prop for forgot password
}

const SignIn: React.FC<SignInProps> = ({
  onSignIn,
  onGoogleSignIn,
  onAppleSignIn,
  onSignUp,
  onForgotPassword, // Destructure new prop
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setError('');
    onSignIn(email, password);
  };

  return (
    <div className="sign-in-container">
      <div className="sign-in-card">
        <div className="logo-container">
          <Logo />
          <h1>Welcome Back</h1>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button type="button" className="forgot-password-link" onClick={onForgotPassword}>
              Forgot Password?
            </button>
          </div>
          <button type="submit" className="sign-in-button" disabled={!email || !password}>
            Sign In
          </button>
        </form>
        <div className="sign-up-prompt">
          <p>Don't have an account?</p>
          <button className="sign-up-link" onClick={onSignUp}>Sign Up</button>
        </div>
        <div className="separator">
          <span>or</span>
        </div>
        <button className="sign-in-button google" onClick={onGoogleSignIn}>
          <GoogleIcon /> Continue with Google
        </button>
        <button className="sign-in-button apple" onClick={onAppleSignIn}>
          <AppleIcon /> Continue with Apple
        </button>
        <div className="demo-mode-notice">
          <p>Demo Mode: Use any email and password to sign in.</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;


