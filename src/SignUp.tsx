import React, { useState, useEffect } from 'react';

// Add Google Identity Services type declarations
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

interface SignUpProps {
  onSignUp: (userData: {
    email: string;
    password: string;
    name: string;
    age: number;
    gender: string;
    nationality: string;
    livingCountry: string;
  }) => Promise<void>;
  onGoogleSignUp: (googleUser: any) => Promise<void>;
  onSignIn: () => void;
}

const SignUp: React.FC<SignUpProps> = ({
  onSignUp,
  onGoogleSignUp,
  onSignIn,
}) => {
  // ================================
  // 🎯 FORM STATE - Multi-step collection
  // ================================
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Account Info
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    acceptTerms: false,
    
    // Step 2: Demographics
    age: '',
    gender: '',
    nationality: '',
    livingCountry: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    nationality: '',
    livingCountry: ''
  });

  // ================================
  // 🌍 COUNTRIES & GENDERS DATA
  // ================================
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria',
    'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic',
    'Denmark', 'Ecuador', 'Egypt', 'Estonia', 'Ethiopia',
    'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala',
    'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait',
    'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands',
    'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa',
    'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
    'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam'
  ];

  const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

  // ================================
  // 🚀 GOOGLE SIGN-IN INITIALIZATION
  // ================================
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  };

  // ================================
  // 🔒 PASSWORD VALIDATION
  // ================================
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 25) return '#dc3545';
    if (strength < 50) return '#fd7e14';
    if (strength < 75) return '#ffc107';
    return '#28a745';
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  // ================================
  // ✅ FIELD VALIDATION
  // ================================
  const validateField = (field: string, value: string) => {
    const errors = { ...fieldErrors };

    switch (field) {
      case 'name':
        if (value.length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else if (value.length > 50) {
          errors.name = 'Name must be less than 50 characters';
        } else {
          errors.name = '';
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          errors.email = '';
        }
        break;

      case 'password':
        if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain uppercase, lowercase, and number';
        } else {
          errors.password = '';
        }
        break;

      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          errors.confirmPassword = '';
        }
        break;

      case 'age':
        const ageNum = parseInt(value);
        if (!value || isNaN(ageNum)) {
          errors.age = 'Please enter your age';
        } else if (ageNum < 13) {
          errors.age = 'You must be at least 13 years old';
        } else if (ageNum > 120) {
          errors.age = 'Please enter a valid age';
        } else {
          errors.age = '';
        }
        break;

      case 'gender':
        if (!value) {
          errors.gender = 'Please select your gender';
        } else {
          errors.gender = '';
        }
        break;

      case 'nationality':
        if (!value) {
          errors.nationality = 'Please select your nationality';
        } else {
          errors.nationality = '';
        }
        break;

      case 'livingCountry':
        if (!value) {
          errors.livingCountry = 'Please select your living country';
        } else {
          errors.livingCountry = '';
        }
        break;
    }

    setFieldErrors(errors);
  };

  // ================================
  // 📝 FORM HANDLERS
  // ================================
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
      if (formData.confirmPassword) {
        validateField('confirmPassword', formData.confirmPassword);
      }
    }
  };

  // ================================
  // ✅ STEP VALIDATION
  // ================================
  const isStep1Valid = () => {
    return (
      formData.name.length >= 2 &&
      formData.email.includes('@') &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      formData.acceptTerms &&
      !['name', 'email', 'password', 'confirmPassword'].some(field => fieldErrors[field as keyof typeof fieldErrors] !== '')
    );
  };

  const isStep2Valid = () => {
    return (
      formData.age &&
      parseInt(formData.age) >= 13 &&
      formData.gender &&
      formData.nationality &&
      formData.livingCountry &&
      !['age', 'gender', 'nationality', 'livingCountry'].some(field => fieldErrors[field as keyof typeof fieldErrors] !== '')
    );
  };

  // ================================
  // 🚀 FORM SUBMISSION
  // ================================
  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
      setError('');
    } else {
      setError('Please fix the errors above');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isStep2Valid()) {
      setError('Please fix the errors above');
      return;
    }

    setIsLoading(true);

    try {
      // ✅ ENHANCED: Send complete user data including demographics
      await onSignUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        nationality: formData.nationality,
        livingCountry: formData.livingCountry,
      });
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ================================
  // 🌐 GOOGLE SIGN-UP HANDLERS
  // ================================
  const handleGoogleSignUp = () => {
    if (window.google) {
      setIsGoogleLoading(true);
      setError('');
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleLoading(false);
        }
      });
    } else {
      setError('Google Sign-In is not available. Please try again.');
    }
  };

  const handleGoogleResponse = async (response: any) => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      const userInfo = parseJwt(response.credential);
      
      // ✅ ENHANCED: Google users will need to complete demographics later
      await onGoogleSignUp({
        email: userInfo.email,
        name: userInfo.name,
        googleId: userInfo.sub,
        picture: userInfo.picture,
        token: response.credential,
        // Demographics will be collected in profile completion flow
        requiresDemographics: true
      });
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  // ================================
  // 🎨 UI COMPONENTS
  // ================================
  const EyeIcon: React.FC<{ show: boolean; onClick: () => void }> = ({ show, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="password-toggle"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {show ? (
          <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </>
        ) : (
          <>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94L6 6l6 6 6 6z" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </>
        )}
      </svg>
    </button>
  );

  const GoogleIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  const LoadingSpinner: React.FC = () => (
    <div className="loading-spinner">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="1s" repeatCount="indefinite"/>
        </path>
      </svg>
    </div>
  );

  // ================================
  // 📱 RENDER STEP 1: ACCOUNT INFO
  // ================================
  const renderStep1 = () => (
    <>
      <div className="signup-header">
        <h1>Create Account</h1>
        <p>Start your journey to lasting happiness</p>
        <div className="step-indicator">
          <span className="step active">1</span>
          <span className="step-divider"></span>
          <span className="step">2</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="signup-form">
        {/* Name Field */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            className={fieldErrors.name ? 'error' : ''}
          />
          {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
        </div>

        {/* Email Field */}
        <div className="form-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className={fieldErrors.email ? 'error' : ''}
          />
          {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
        </div>

        {/* Password Field */}
        <div className="form-group">
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className={fieldErrors.password ? 'error' : ''}
            />
            <EyeIcon show={showPassword} onClick={() => setShowPassword(!showPassword)} />
          </div>
          {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          
          {formData.password.length > 0 && (
            <div className="password-strength">
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: `${passwordStrength}%`,
                    backgroundColor: getPasswordStrengthColor(passwordStrength)
                  }}
                />
              </div>
              <span
                className="strength-text"
                style={{ color: getPasswordStrengthColor(passwordStrength) }}
              >
                {getPasswordStrengthText(passwordStrength)}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="form-group">
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              className={fieldErrors.confirmPassword ? 'error' : ''}
            />
            <EyeIcon show={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
          </div>
          {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
        </div>

        {/* Terms & Conditions */}
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => handleInputChange('acceptTerms', e.target.checked.toString())}
              required
            />
            <span className="checkmark"></span>
            I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={!isStep1Valid()}
        >
          Continue to Demographics →
        </button>
      </form>

      <div className="social-signup-options">
        <p>Or sign up with</p>
        <button
          onClick={handleGoogleSignUp}
          className="social-button google-button"
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? <LoadingSpinner /> : <GoogleIcon />}
          {isGoogleLoading ? 'Signing up...' : 'Continue with Google'}
        </button>
      </div>
    </>
  );

  // ================================
  // 👤 RENDER STEP 2: DEMOGRAPHICS
  // ================================
  const renderStep2 = () => (
    <>
      <div className="signup-header">
        <h1>Personal Information</h1>
        <p>Help us personalize your meditation experience</p>
        <div className="step-indicator">
          <span className="step completed">✓</span>
          <span className="step-divider"></span>
          <span className="step active">2</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="signup-form">
        {/* Age Field */}
        <div className="form-group">
          <input
            type="number"
            placeholder="Enter your age"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            min="13"
            max="120"
            required
            className={fieldErrors.age ? 'error' : ''}
          />
          {fieldErrors.age && <div className="field-error">{fieldErrors.age}</div>}
        </div>

        {/* Gender Field */}
        <div className="form-group">
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            required
            className={fieldErrors.gender ? 'error' : ''}
          >
            <option value="">Select your gender</option>
            {genders.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
          {fieldErrors.gender && <div className="field-error">{fieldErrors.gender}</div>}
        </div>

        {/* Nationality Field */}
        <div className="form-group">
          <select
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            required
            className={fieldErrors.nationality ? 'error' : ''}
          >
            <option value="">Select your nationality</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          {fieldErrors.nationality && <div className="field-error">{fieldErrors.nationality}</div>}
        </div>

        {/* Living Country Field */}
        <div className="form-group">
          <select
            value={formData.livingCountry}
            onChange={(e) => handleInputChange('livingCountry', e.target.value)}
            required
            className={fieldErrors.livingCountry ? 'error' : ''}
          >
            <option value="">Select your current country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          {fieldErrors.livingCountry && <div className="field-error">{fieldErrors.livingCountry}</div>}
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={handlePrevStep}
            className="secondary-button"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={isLoading || !isStep2Valid()}
          >
            {isLoading && <LoadingSpinner />}
            {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
          </button>
        </div>
      </form>
    </>
  );

  // ================================
  // 🎨 MAIN RENDER
  // ================================
  return (
    <div className="signup-container">
      <style>{`
        /* ✅ ENHANCED SIGNUP CSS WITH MULTI-STEP & DEMOGRAPHICS */
        .signup-container {
          min-height: 100vh;
          min-height: 100dvh;
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

        .signup-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 450px;
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

        .signup-content {
          padding: 40px 30px;
        }

        .signup-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .signup-header h1 {
          color: #2c3e50;
          font-size: clamp(24px, 6vw, 32px);
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .signup-header p {
          color: #6c757d;
          font-size: clamp(14px, 4vw, 16px);
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        /* ✅ STEP INDICATOR */
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 15px;
        }

        .step {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          background: #e9ecef;
          color: #6c757d;
          transition: all 0.3s ease;
        }

        .step.active {
          background: #667eea;
          color: white;
        }

        .step.completed {
          background: #28a745;
          color: white;
        }

        .step-divider {
          width: 40px;
          height: 2px;
          background: #e9ecef;
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

        .signup-form {
          margin-bottom: 25px;
        }

        .form-group {
          margin-bottom: 20px;
          position: relative;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: clamp(14px, 4vw, 16px);
          background-color: #f8f9fa;
          transition: all 0.3s ease;
          box-sizing: border-box;
          min-height: 50px;
          -webkit-appearance: none;
          -webkit-tap-highlight-color: rgba(102, 126, 234, 0.1);
          touch-action: manipulation;
        }

        .form-group select {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 40px;
        }

        .form-group input:focus,
        .form-group select:focus {
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

        .form-group input.error,
        .form-group select.error {
          border-color: #dc3545;
          background-color: #fff5f5;
        }

        .form-group input.error:focus,
        .form-group select.error:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
        }

        /* Password Input Container */
        .password-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-container input {
          padding-right: 50px;
        }

        /* Password Toggle Button */
        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #6c757d;
          transition: color 0.3s ease;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          min-height: 40px;
          border-radius: 4px;
          -webkit-tap-highlight-color: rgba(102, 126, 234, 0.1);
        }

        .password-toggle:hover {
          color: #667eea;
          background-color: rgba(102, 126, 234, 0.1);
        }

        /* Field Error Messages */
        .field-error {
          color: #dc3545;
          font-size: clamp(11px, 3vw, 12px);
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .field-error::before {
          content: '⚠';
          font-size: 14px;
        }

        /* Password Strength Indicator */
        .password-strength {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background-color: #e9ecef;
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .strength-text {
          font-size: clamp(11px, 3vw, 12px);
          font-weight: 600;
          min-width: 45px;
          text-align: right;
        }

        /* Checkbox Group */
        .checkbox-group {
          margin-bottom: 25px;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          font-size: clamp(13px, 3.5vw, 14px);
          line-height: 1.5;
          color: #495057;
        }

        .checkbox-label input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .checkmark {
          position: relative;
          min-width: 20px;
          height: 20px;
          background-color: #fff;
          border: 2px solid #e9ecef;
          border-radius: 4px;
          transition: all 0.3s ease;
          margin-top: 1px;
        }

        .checkmark::after {
          content: '';
          position: absolute;
          display: none;
          left: 6px;
          top: 2px;
          width: 6px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .checkbox-label input[type="checkbox"]:checked ~ .checkmark {
          background-color: #667eea;
          border-color: #667eea;
        }

        .checkbox-label input[type="checkbox"]:checked ~ .checkmark::after {
          display: block;
        }

        .checkbox-label a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .checkbox-label a:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        /* ✅ BUTTON STYLES */
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

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .secondary-button {
          padding: 12px 24px;
          background: #f8f9fa;
          color: #6c757d;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-button:hover {
          background: #e9ecef;
          border-color: #667eea;
          color: #667eea;
        }

        .button-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .button-group .primary-button {
          flex: 1;
        }

        .social-signup-options {
          text-align: center;
          margin-bottom: 25px;
        }

        .social-signup-options p {
          color: #6c757d;
          font-size: clamp(13px, 3.5vw, 14px);
          margin-bottom: 20px;
          position: relative;
        }

        .social-signup-options p::before,
        .social-signup-options p::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 45%;
          height: 1px;
          background-color: #dee2e6;
        }

        .social-signup-options p::before {
          left: 0;
        }

        .social-signup-options p::after {
          right: 0;
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
          margin-bottom: 12px;
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

        .signin-link {
          text-align: center;
          color: #6c757d;
          font-size: clamp(13px, 3.5vw, 14px);
          margin: 0;
        }

        .signin-link span {
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.3s ease;
          padding: 4px 8px;
          margin-left: 4px;
        }

        .signin-link span:hover {
          color: #764ba2;
          text-decoration: underline;
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

        /* ✅ RESPONSIVE DESIGN */
        @media (max-width: 480px) {
          .signup-container {
            padding: 10px;
          }
          
          .signup-content {
            padding: 25px 20px;
          }
          
          .button-group {
            flex-direction: column;
          }
          
          .button-group .primary-button {
            order: 1;
          }
          
          .secondary-button {
            order: 2;
            width: 100%;
            margin-top: 8px;
          }
        }
      `}</style>

      <div className="signup-card">
        <div className="signup-content">
          {currentStep === 1 ? renderStep1() : renderStep2()}
          
          <p className="signin-link">
            Already have an account? <span onClick={onSignIn}>Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;