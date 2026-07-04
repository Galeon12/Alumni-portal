import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Mail, 
  Link2, 
  ArrowLeft,
  Edit2
} from 'lucide-react';

const Linkedin = ({ size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter = ({ size = 20, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  // Formatting LinkedIn correctly in display
  const getLinkedinDisplayLink = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.includes('linkedin.com')) return `https://${url}`;
    return `https://www.linkedin.com/in/${url}`;
  };

  const containerStyle = {
    backgroundColor: 'var(--bg-surface)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Inter", sans-serif',
    color: '#ffffff'
  };

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '36px',
    border: '1px solid var(--border-color)',
    width: '100%',
    maxWidth: '700px',
    marginBottom: '24px'
  };

  const sectionTitleStyle = {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ffffff',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '8px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const infoRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1.2fr 2fr',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  };

  const labelStyle = {
    fontWeight: '600',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem'
  };

  const valueStyle = {
    color: '#ffffff',
    fontSize: '0.95rem',
    wordBreak: 'break-word'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-card)',
        padding: '16px 32px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', gap: '6px' }}>
            <span style={{ color: '#ffffff' }}>Algo</span>
            <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Alumni</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>DASHBOARD</Link>
          <Link to="/alumni" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>ALUMNI</Link>
        </div>
      </header>

      {/* Main Profile View */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px'
      }}>
        <div style={{ width: '100%', maxWidth: '700px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#ffffff'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <Link 
            to="/complete-profile" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            <Edit2 size={14} /> Edit Profile
          </Link>
        </div>

        {/* Profile Card */}
        <div style={cardStyle}>
          {/* Header Row with Avatar & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              backgroundColor: 'var(--border-color)',
              overflow: 'hidden',
              border: '4px solid #fff',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyItems: 'center', backgroundColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                  <User size={50} style={{ margin: 'auto' }} />
                </div>
              )}
            </div>

            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: '0 0 4px 0' }}>
                {user.name}
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                @{user.username} • <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{user.role}</span>
              </p>
              {user.profile_completed ? (
                <span style={{
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid #a7f3d0'
                }}>
                  Active Member
                </span>
              ) : (
                <span style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid #fca5a5'
                }}>
                  Incomplete Setup
                </span>
              )}
            </div>
          </div>

          {/* Education Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={sectionTitleStyle}>
              <GraduationCap size={20} style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} /> Education Details
            </h3>
            {user.edu_institution ? (
              <>
                <div style={infoRowStyle}>
                  <div style={labelStyle}>Institution</div>
                  <div style={valueStyle}>{user.edu_institution}</div>
                </div>
                <div style={infoRowStyle}>
                  <div style={labelStyle}>Program</div>
                  <div style={valueStyle}>{user.edu_degree}</div>
                </div>
                <div style={infoRowStyle}>
                  <div style={labelStyle}>Year of Completion</div>
                  <div style={valueStyle}>
                    {user.edu_start_year && `${user.edu_start_year} - `}
                    {user.edu_end_year || 'Present'}
                  </div>
                </div>
                {user.edu_location && (
                  <div style={infoRowStyle}>
                    <div style={labelStyle}>Location</div>
                    <div style={valueStyle}>{user.edu_location}</div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
                No education details provided yet.
              </p>
            )}
          </div>

          {/* Contact & Social Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={sectionTitleStyle}>
              <Mail size={20} style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} /> Contact & Social Information
            </h3>
            <div style={infoRowStyle}>
              <div style={labelStyle}>Primary Registered Email</div>
              <div style={valueStyle}>{user.email}</div>
            </div>
            {user.website_url && (
              <div style={infoRowStyle}>
                <div style={labelStyle}>Website / Portfolio</div>
                <div style={valueStyle}>
                  <a href={user.website_url.startsWith('http') ? user.website_url : `http://${user.website_url}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                    {user.website_url}
                  </a>
                </div>
              </div>
            )}
            {user.linkedin_url && (
              <div style={infoRowStyle}>
                <div style={labelStyle}>LinkedIn</div>
                <div style={valueStyle}>
                  <a href={getLinkedinDisplayLink(user.linkedin_url)} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                    <Linkedin size={16} /> View LinkedIn Profile
                  </a>
                </div>
              </div>
            )}
            {user.twitter_handle && (
              <div style={infoRowStyle}>
                <div style={labelStyle}>Twitter</div>
                <div style={valueStyle}>
                  <a href={`https://twitter.com/${user.twitter_handle}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                    <Twitter size={16} /> @{user.twitter_handle}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Address Section */}
          <div>
            <h3 style={sectionTitleStyle}>
              <MapPin size={20} style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} /> Location Details
            </h3>
            {user.city ? (
              <div style={infoRowStyle}>
                <div style={labelStyle}>Current City</div>
                <div style={valueStyle}>{user.city}</div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
                No city details provided yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
