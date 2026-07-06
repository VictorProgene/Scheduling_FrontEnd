import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import barberImg from '../assets/barber-login.jpg';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // OAuth2PasswordRequestForm expects values encoded as url-encoded format
      const payload = new URLSearchParams();
      payload.append('username', email);
      payload.append('password', password);

      const response = await api.post('/login', payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Save token in the Auth Context
      login(response.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Connection failed. Please check if the API server is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="split-container">
      {/* Left side: Form */}
      <div className="form-side">
        <div className="welcome-card glass-panel hover-card" style={{ maxWidth: '380px' }}>
          <h1 className="welcome-title">Sign In</h1>
          <p className="welcome-subtitle">Welcome back! Please sign in to schedule your next service.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="error-banner">{error}</div>}

            <button type="submit" className="action-button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>Create account</Link>
          </p>
        </div>
      </div>

      {/* Right side: Premium image background (hidden on mobile) */}
      <div 
        className="image-side" 
        style={{ backgroundImage: `url(${barberImg})` }} 
      />
    </div>
  );
}

export default Login;
