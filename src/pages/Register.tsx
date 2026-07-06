import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import barberImg from '../assets/barber-login.jpg';

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // API register endpoint expects JSON payload matching UserCreate schema
      await api.post('/register', {
        name,
        email,
        password,
      });

      setSuccess(true);
      // Wait a moment and navigate to login
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to create account. Please check your connection.');
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
          <h1 className="welcome-title">Sign Up</h1>
          <p className="welcome-subtitle">Create a new account to access our online booking system.</p>

          {success ? (
            <div style={{ color: 'var(--success)', fontSize: '16px', fontWeight: 500, margin: '20px 0' }}>
              Account created successfully! Redirecting to login...
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <div className="error-banner">{error}</div>}

              <button type="submit" className="action-button" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          )}

          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign In</Link>
          </p>
        </div>
      </div>

      {/* Right side: Premium image background */}
      <div 
        className="image-side" 
        style={{ backgroundImage: `url(${barberImg})` }} 
      />
    </div>
  );
}

export default Register;
