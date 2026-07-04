import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative'
    }} className="animate-fade-in">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="glass-container" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 32px',
        position: 'relative',
        zIndex: 1,
        background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
        border: '1px solid rgba(168, 85, 247, 0.15)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 24px rgba(168, 85, 247, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            color: '#fff',
            marginBottom: '16px',
            boxShadow: '0 8px 24px var(--primary-glow)'
          }}>
            <LogIn size={28} />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Login to connect with your alumni network
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(236, 72, 153, 0.1)',
            border: '1px solid rgba(236, 72, 153, 0.2)',
            color: 'var(--danger)',
            fontSize: '0.9rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email or Username</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <User size={18} />
              </span>
              <input
                id="email"
                type="text"
                required
                className="form-input"
                placeholder="you@example.com or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="glow-btn"
            disabled={submitting}
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.2s'
          }} onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
             onMouseLeave={(e) => e.target.style.color = 'var(--primary)'}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
