import React, { useState } from 'react';

// ✅ iPhone-Optimized SignIn Component with Password Visibility Toggle
interface SignInProps {
  onSignIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onSignUp: () => void;
  onForgotPassword: () => void;
}

const SignIn: React.FC<SignInProps> = ({
  onSignIn,
  onGoogleSignIn,
  onSignUp,
  onForgotPassword
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecurityTooltip, setShowSecurityTooltip] = useState(false);
  // ✅ NEW: Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSignIn(email, password, rememberMe);
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await onGoogleSignIn();
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signin-container">
      <style>{`
        /* ✅ IPHONE-OPTIMIZED CSS WITH PASSWORD TOGGLE */
        .signin-container {
          min-height: 100vh;
          min-height: 100dvh; /* Dynamic viewport height for iPhone */
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: env(safe-area-inset-top, 20px) env(safe-area-inset-right, 20px) env(safe-area-inset-bottom, 20px) env(safe-area-inset-left, 20px);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
          overflow-x: hidden;
        }

        .signin-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          overflow: hidden;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .signin-content {
          padding: 40px 30px;
        }

        .signin-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .signin-header h1 {
          color: #2c3e50;
          font-size: clamp(24px, 6vw, 32px);
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .signin-header p {
          color: #6c757d;
          font-size: clamp(14px, 4vw, 16px);
          margin: 0;
          line-height: 1.5;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
          font-size: clamp(13px, 3.5vw, 14px);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .error-message::before {
          content: '❌';
          font-size: 16px;
        }

        .signin-form {
          margin-bottom: 25px;
        }

        .form-group {
          margin-bottom: 20px;
          position: relative;
        }

        .form-group input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: clamp(14px, 4vw, 16px);
          background-color: #f8f9fa;
          transition: all 0.3s ease;
          box-sizing: border-box;
          min-height: 50px; /* iPhone touch target minimum */
          -webkit-appearance: none;
          -webkit-tap-highlight-color: rgba(102, 126, 234, 0.1);
        }

        /* ✅ NEW: Password input with space for eye icon */
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-wrapper input {
          padding-right: 55px; /* Make space for eye icon */
        }

        /* ✅ NEW: Eye icon button styling */
        .password-toggle-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          color: #6c757d;
          transition: all 0.2s ease;
          min-width: 32px;
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: rgba(102, 126, 234, 0.1);
          touch-action: manipulation;
          user-select: none;
          -webkit-user-select: none;
        }

        .password-toggle-btn:hover {
          background-color: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .password-toggle-btn:active {
          background-color: rgba(102, 126, 234, 0.15);
          transform: translateY(-50%) scale(0.95);
        }

        .password-toggle-btn:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }

        /* ✅ Eye icon animations */
        .eye-icon {
          width: 18px;
          height: 18px;
          transition: all 0.2s ease;
        }

        .password-toggle-btn:hover .eye-icon {
          transform: scale(1.1);
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }

        .form-group input::placeholder {
          color: #adb5bd;
          font-weight: 400;
        }

        .signin-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .remember-me-section {
          display: flex;
          align-items: center;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: clamp(13px, 3.5vw, 14px);
          position: relative;
        }

        .checkbox-group input[type="checkbox"] {
          width: 18px;
          height: 18px;
          min-width: 18px;
          min-height: 18px;
          margin: 0;
          cursor: pointer;
        }

        .checkbox-group label {
          cursor: pointer;
          color: #495057;
          user-select: none;
        }

        .security-info-icon {
          cursor: pointer;
          color: #6c757d;
          position: relative;
          margin-left: 4px;
          padding: 4px;
          min-width: 24px;
          min-height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .security-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #2c3e50;
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          width: 200px;
          z-index: 1000;
          margin-bottom: 8px;
        }

        .tooltip-content {
          text-align: left;
        }

        .tooltip-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .remember-note {
          margin: 4px 0 0 0;
          color: #10b981;
          font-size: 11px;
        }

        .forgot-link {
          background: none;
          border: none;
          color: #667eea;
          font-size: clamp(13px, 3.5vw, 14px);
          cursor: pointer;
          text-decoration: none;
          padding: 8px;
          min-height: 44px;
          display: flex;
          align-items: center;
        }

        .forgot-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .primary-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: clamp(14px, 4vw, 16px);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          -webkit-tap-highlight-color: rgba(102, 126, 234, 0.1);
          touch-action: manipulation;
        }

        .primary-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .primary-button:hover::before {
          left: 100%;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .primary-button:active {
          transform: translateY(0);
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .social-signin {
          margin-bottom: 25px;
        }

        .divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
          font-size: clamp(13px, 3.5vw, 14px);
          color: #6c757d;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: #dee2e6;
        }

        .divider span {
          background-color: white;
          padding: 0 15px;
          position: relative;
          z-index: 1;
        }

        .social-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .social-button {
          width: 100%;
          padding: 14px 20px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          background-color: #fff;
          color: #495057;
          font-size: clamp(13px, 3.5vw, 15px);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 50px;
          -webkit-tap-highlight-color: rgba(102, 126, 234, 0.1);
          touch-action: manipulation;
        }

        .social-button:hover {
          border-color: #667eea;
          background-color: #f8f9ff;
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .google-button:hover {
          border-color: #db4437;
          background-color: #fef7f7;
        }

        .social-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .signup-section {
          text-align: center;
          margin-bottom: 20px;
        }

        .signup-section p {
          color: #6c757d;
          font-size: clamp(13px, 3.5vw, 14px);
          margin: 0;
        }

        .signup-link {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.3s ease;
          padding: 4px 8px;
          margin-left: 4px;
          min-height: 32px;
          display: inline-flex;
          align-items: center;
        }

        .signup-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .trust-indicators {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #6c757d;
          font-size: clamp(11px, 3vw, 12px);
        }

        /* ✅ IPHONE SE (375px and smaller) */
        @media (max-width: 374px) {
          .signin-container {
            padding: 10px 8px;
          }
          
          .signin-content {
            padding: 25px 20px;
          }
          
          .signin-options {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .forgot-link {
            align-self: flex-end;
          }

          /* ✅ Smaller eye icon on very small screens */
          .password-toggle-btn {
            min-width: 28px;
            min-height: 28px;
          }

          .eye-icon {
            width: 16px;
            height: 16px;
          }

          .password-input-wrapper input {
            padding-right: 50px;
          }
        }

        /* ✅ IPHONE STANDARD (375px - 414px) */
        @media (min-width: 375px) and (max-width: 414px) {
          .signin-container {
            padding: 15px 12px;
          }
          
          .signin-content {
            padding: 30px 25px;
          }
        }

        /* ✅ IPHONE PLUS/PRO MAX (415px+) */
        @media (min-width: 415px) and (max-width: 768px) {
          .signin-content {
            padding: 35px 30px;
          }
        }

        /* ✅ LANDSCAPE MODE */
        @media (max-width: 768px) and (orientation: landscape) {
          .signin-container {
            padding: 10px 20px;
            align-items: flex-start;
            padding-top: max(10px, env(safe-area-inset-top));
          }
          
          .signin-content {
            padding: 20px 25px;
          }
          
          .signin-header {
            margin-bottom: 20px;
          }
          
          .form-group {
            margin-bottom: 15px;
          }
        }

        /* ✅ SAFE AREA SUPPORT (iPhone X and newer) */
        @supports (padding: max(0px)) {
          .signin-container {
            padding-left: max(20px, env(safe-area-inset-left));
            padding-right: max(20px, env(safe-area-inset-right));
            padding-top: max(20px, env(safe-area-inset-top));
            padding-bottom: max(20px, env(safe-area-inset-bottom));
          }
        }

        /* ✅ HIGH CONTRAST MODE SUPPORT */
        @media (prefers-contrast: high) {
          .form-group input {
            border-width: 3px;
          }
          
          .error-message {
            border-left: 4px solid #dc3545;
          }

          .password-toggle-btn {
            border: 2px solid currentColor;
          }
        }

        /* ✅ REDUCED MOTION SUPPORT */
        @media (prefers-reduced-motion: reduce) {
          .signin-card {
            animation: none;
          }
          
          .loading-spinner {
            animation: none;
          }
          
          .primary-button::before {
            transition: none;
          }

          .eye-icon {
            transition: none;
          }

          .password-toggle-btn {
            transition: none;
          }
        }

        /* ✅ DARK MODE SUPPORT */
        @media (prefers-color-scheme: dark) {
          .signin-card {
            background: rgba(30, 30, 30, 0.95);
          }
          
          .signin-header h1 {
            color: #f8f9fa;
          }
          
          .signin-header p {
            color: #adb5bd;
          }
          
          .form-group input {
            background-color: #2c3e50;
            color: #f8f9fa;
            border-color: #495057;
          }
          
          .form-group input::placeholder {
            color: #6c757d;
          }

          .password-toggle-btn {
            color: #adb5bd;
          }

          .password-toggle-btn:hover {
            background-color: rgba(102, 126, 234, 0.2);
            color: #667eea;
          }

          .divider span {
            background-color: rgba(30, 30, 30, 0.95);
          }
        }
      `}</style>

      <div className="signin-card">
        <div className="signin-content">
          {/* Clean Header */}
          <div className="signin-header">
            <h1>Welcome Back</h1>
            <p>Sign in to continue your journey to lasting happiness</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* ✅ NEW: Password input with visibility toggle */}
            <div className="form-group">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye with slash (password visible - click to hide)
                    <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    // Regular eye (password hidden - click to show)
                    <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Professional Remember Me Section */}
            <div className="signin-options">
              <div className="remember-me-section">
                <div className="checkbox-group">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor="remember">Remember me</label>
                  
                  {/* Subtle Security Info - Like GitHub/Google */}
                  <div 
                    className="security-info-icon"
                    onMouseEnter={() => setShowSecurityTooltip(true)}
                    onMouseLeave={() => setShowSecurityTooltip(false)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    
                    {/* Professional Tooltip */}
                    {showSecurityTooltip && (
                      <div className="security-tooltip">
                        <div className="tooltip-content">
                          <div className="tooltip-header">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <circle cx="12" cy="16" r="1"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Secure Sessions
                          </div>
                          <p>Sessions automatically expire after 6 hours for your security</p>
                          {rememberMe && (
                            <p className="remember-note">✓ Stay signed in on this device</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button type="button" onClick={onForgotPassword} className="forgot-link">
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              className="primary-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Social Login - Clean Design */}
          <div className="social-signin">
            <div className="divider">
              <span>or</span>
            </div>
            
            <div className="social-buttons">
              <button 
                type="button" 
                className="social-button google-button"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          {/* Clean Sign Up Link */}
          <div className="signup-section">
            <p>Don't have an account? <button type="button" onClick={onSignUp} className="signup-link">Sign up</button></p>
          </div>

          {/* Subtle Trust Indicators - Like Stripe/Banking Apps */}
          <div className="trust-indicators">
            <div className="security-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Secured with enterprise-grade encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;