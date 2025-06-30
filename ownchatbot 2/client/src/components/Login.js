
import React, { useState } from 'react';
import { 
  signInWithGoogle, 
  registerWithEmailAndPassword, 
  signInWithEmailAndPassword_ 
} from '../firebase';
import './Login.css';

const Login = () => {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'signup') {
      if (!name) {
        alert("Please enter your name");
        return;
      }
      await registerWithEmailAndPassword(name, email, password);
    } else {
      await signInWithEmailAndPassword_(email, password);
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <div className="logo-circle">H</div>
          <h1>Humint</h1>
        </div>
        
        <div className="login-tabs">
          <button 
            className={`tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button 
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="login-form">
          {activeTab === 'signup' && (
            <div className="input-group">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full Name"
              />
            </div>
          )}
          <div className="input-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>
          <button type="submit" className="primary-signin-button">
            {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button className="google-signin-button" onClick={handleGoogleSignIn}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" />
          Sign in with Google
        </button>

        <div className="login-footer">
          <p>By signing in, you agree to our Terms of Service.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
