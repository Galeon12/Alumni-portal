import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Calendar, Briefcase, Award, AlignLeft } from 'lucide-react';

const Linkedin = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'alumni',
  });
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.');
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
      padding: '40px 20px',
      position: 'relative'
    }} className="animate-fade-in">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="glass-container" style={{
        width: '100%',
        maxWidth: '680px',
        padding: '40px',
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
            <UserPlus size={28} />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Join the alumni community portal
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
          <h3 style={{ fontSize: '1.1rem', color: '#fff', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
            Account Credentials
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="name">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="username">Username *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </span>
                <input
                  id="username"
                  type="text"
                  required
                  className="form-input"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="email">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="role">Portal Role</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Award size={18} />
                </span>
                <select
                  id="role"
                  className="form-input"
                  value={formData.role}
                  onChange={handleChange}
                  style={{ paddingLeft: '44px', appearance: 'none', background: 'rgba(10, 10, 10, 0.7)' }}
                >
                  <option value="alumni" style={{ background: 'var(--bg-surface)' }}>Alumni</option>
                  <option value="algouniversity" style={{ background: 'var(--bg-surface)' }}>AlgoUniversity User</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="password">Password *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: 0 }}></div>
          </div>



          <button
            type="submit"
            className="glow-btn"
            disabled={submitting}
            style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          >
            {submitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.2s'
          }} onMouseEnter={(e) => e.target.style.color = '#8b5cf6'}
             onMouseLeave={(e) => e.target.style.color = 'var(--primary)'}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
