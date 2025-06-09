import React, { useState } from 'react';
import './SignUp.css';
import Logo from './Logo';
import GoogleIcon from './icons/GoogleIcon';
import AppleIcon from './icons/AppleIcon';

interface SignUpProps {
  onSignUp: (email: string, password: string, name: string) => void;
  onGoogleSignUp: () => void;
  onAppleSignUp: () => void;
  onSignIn: () => void;
}

const SignUp: React.FC<SignUpProps> = ({
  onSignUp,
  onGoogleSignUp,
  onAppleSignUp,
  onSignIn
}) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Clear any previous errors
    setError('');

    // Call the sign up function passed from parent
    onSignUp(email, password, name);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <Logo />
          <h1>Create Your Account</h1>
          <p>Begin your journey to Happiness That Stays</p>
        </div>

        <div className="signup-content">
          <button
            className="primary-button create-account-button"
            onClick={() => document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Create Account
          </button>

          <div className="separator">
            <span>or</span>
          </div>

          <div className="social-buttons">
            <button className="social-button google" onClick={onGoogleSignUp}>
              <GoogleIcon /> <span className="social-button-text">Continue with Google</span>
            </button>
            <button className="social-button apple" onClick={onAppleSignUp}>
              <AppleIcon /> <span className="social-button-text">Continue with Apple</span>
            </button>
          </div>

          <p className="signin-link">
            Already have an account? <button className="text-button" onClick={onSignIn}>Sign in</button>
          </p>

          <form id="signup-form" className="signup-form" onSubmit={handleSubmit}>
            <h2>Create your account</h2>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

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
                placeholder="Create a password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={!name || !email || !password || !confirmPassword}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;


