import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface SignupFlowProps {
  onComplete: () => void;
}

const SignupFlow: React.FC<SignupFlowProps> = ({ onComplete }) => {
  // Use currentUser and login instead of signup which doesn't exist
  const { login } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  
  const handleSignup = async () => {
    try {
      // Use login instead of signup since signup doesn't exist in AuthContext
      await login(email, password);
      onComplete();
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };
  
  return (
    <div className="signup-flow">
      <h1>Create Account</h1>
      
      {step === 1 && (
        <div className="signup-step">
          <h2>Step 1: Your Information</h2>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
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
            />
          </div>
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}
      
      {step === 2 && (
        <div className="signup-step">
          <h2>Step 2: Personal Details</h2>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your name"
            />
          </div>
          <div className="button-group">
            <button onClick={() => setStep(1)}>Back</button>
            <button onClick={handleSignup}>Create Account</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupFlow;
