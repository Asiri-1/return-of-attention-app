import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../src/SignIn.css'; // Make sure this path is correct
import Logo from './Logo'; // Assuming Logo component exists
import GoogleIcon from './icons/GoogleIcon'; // Assuming GoogleIcon component exists

interface SignInProps {
  onSignIn: (email: string, password: string) => void;
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
  onSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, onGoogleSignIn, onAppleSignIn, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (email === 'user@example.com' && password === 'password') {
        onSignIn(email, password);
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-in-container">
      <div className="sign-in-card">
        <div className="logo-container">
          <Logo />
          <h1>Return of Attention</h1>
        </div>
        <h2>Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="sign-in-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="sign-up-prompt">
          <p>Don't have an account?</p>
          <button onClick={onSignUp} className="sign-up-link" disabled={loading}>
            Sign Up
          </button>
        </div>

        <div className="demo-mode-notice">
          <p>Demo Mode: Use email "user@example.com" and password "password" to sign in.</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
