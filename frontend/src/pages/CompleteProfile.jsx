import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  GraduationCap, 
  MapPin, 
  Link2, 
  Mail, 
  Users, 
  Check, 
  Upload,
  User,
  Share2,
  Lock
} from 'lucide-react';

const Spinner = ({ size = 36, color = '#db4437', style = {} }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 38 38" 
    stroke={color}
    style={{ ...style, display: 'block' }}
  >
    <g fill="none" fillRule="evenodd">
      <g transform="translate(1 1)" strokeWidth="2">
        <circle strokeOpacity=".5" cx="18" cy="18" r="18"/>
        <path d="M36 18c0-9.94-8.06-18-18-18">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 18"
            to="360 18 18"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </g>
  </svg>
);

const Linkedin = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Whatsapp = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.706 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CompleteProfile = () => {
  const { user, checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');

  // Gmail Importer Modal states
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [gmailLoadingStage, setGmailLoadingStage] = useState(0); // 0: none, 1: connecting, 2: fetching, 3: completed
  const [gmailContacts, setGmailContacts] = useState([
    { id: 1, name: 'Amit Patel', email: 'amit.patel@algouniversity.com', checked: true },
    { id: 2, name: 'Sanjana Rao', email: 'sanjana.rao@algouniversity.com', checked: true },
    { id: 3, name: 'Vikram Singh', email: 'vikram.singh@gmail.com', checked: true },
    { id: 4, name: 'Nisha Mehta', email: 'nisha.m@yahoo.com', checked: false },
    { id: 5, name: 'Rohan Sharma', email: 'rohan.sharma@algouniversity.com', checked: true }
  ]);

  const [formData, setFormData] = useState({
    avatar_url: user?.avatar_url || '',
    edu_institution: user?.edu_institution || '',
    edu_degree: user?.edu_degree || '',
    edu_start_year: user?.edu_start_year || '',
    edu_end_year: user?.edu_end_year || '',
    edu_location: user?.edu_location || '',
    secondary_email: '', // Not needed, kept empty for api compatibility
    website_url: user?.website_url || '',
    twitter_handle: user?.twitter_handle || '',
    street_address: '', // Not needed, kept empty for api compatibility
    city: user?.city || '',
    postal_code: '', // Not needed, kept empty for api compatibility
    linkedin_url: user?.linkedin_url || '',
    invite_emails: ''
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    setError('');
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleFinish = async () => {
    setLoadingSubmit(true);
    setError('');
    
    // Auto prefix LinkedIn URL with full domain if they only put username/handle
    let formattedLinkedin = formData.linkedin_url.trim();
    if (formattedLinkedin && !formattedLinkedin.startsWith('http')) {
      if (formattedLinkedin.includes('linkedin.com')) {
        formattedLinkedin = `https://${formattedLinkedin}`;
      } else {
        formattedLinkedin = `https://www.linkedin.com/in/${formattedLinkedin}`;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/alumni/profile/complete`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          secondary_email: '',
          website_url: formData.website_url,
          twitter_handle: formData.twitter_handle,
          street_address: '',
          city: formData.city,
          postal_code: '',
          edu_institution: formData.edu_institution,
          edu_degree: formData.edu_degree,
          edu_start_year: formData.edu_start_year,
          edu_end_year: formData.edu_end_year,
          edu_location: formData.edu_location,
          avatar_url: formData.avatar_url,
          linkedin_url: formattedLinkedin
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      await checkAuthStatus();
      navigate('/profile');
    } catch (err) {
      console.error('Profile complete error:', err);
      setError(err.message || 'Something went wrong while completing your profile.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Simulated Gmail contacts flow
  const handleGmailImportClick = () => {
    setShowGmailModal(true);
    setGmailLoadingStage(1);
    
    // Stage 1: Connecting (1.2s)
    setTimeout(() => {
      setGmailLoadingStage(2);
      // Stage 2: Fetching (1.2s)
      setTimeout(() => {
        setGmailLoadingStage(3);
      }, 1200);
    }, 1200);
  };

  const toggleContactCheck = (id) => {
    setGmailContacts(contacts => contacts.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const handleSendGmailInvites = () => {
    const selectedEmails = gmailContacts.filter(c => c.checked).map(c => c.email);
    if (selectedEmails.length > 0) {
      const currentEmails = formData.invite_emails 
        ? formData.invite_emails.split(',').map(e => e.trim()).filter(Boolean)
        : [];
      
      const newEmails = Array.from(new Set([...currentEmails, ...selectedEmails]));
      setFormData(prev => ({
        ...prev,
        invite_emails: newEmails.join(', ')
      }));
      alert(`Successfully imported ${selectedEmails.length} contacts! They've been added to the invite list.`);
    }
    setShowGmailModal(false);
  };

  // Style Definitions for Better UI
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
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
    padding: '40px',
    width: '100%',
    maxWidth: '620px',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  const formLabelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '6px'
  };

  const formInputStyle = {
    boxSizing: 'border-box',
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.95rem',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    background: 'var(--bg-card)',
    color: '#ffffff',
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    borderBottom: '1px solid var(--border-color)'
  };

  const primaryBtnStyle = {
    backgroundColor: '#10b981', // Emerald green
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
  };

  const backBtnStyle = {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.2s'
  };

  const skipLinkStyle = {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.9rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginTop: '16px',
    transition: 'color 0.2s'
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

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px'
      }}>
        <div style={{ width: '100%', maxWidth: '620px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Complete your profile
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '6px' }}>
            Let's setup your AlgoUniversity alumni identity to help classmates find you.
          </p>
        </div>

        {/* Stepper Steps Indicators */}
        <div style={{
          width: '100%',
          maxWidth: '620px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '24px'
        }}>
          {[
            { title: 'Avatar', desc: 'Step 1' },
            { title: 'Education', desc: 'Step 2' },
            { title: 'Links', desc: 'Step 3' },
            { title: 'Invite', desc: 'Step 4' }
          ].map((s, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isActive = stepNum === step;
            return (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(236, 72, 153, 0.15)' : isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(236, 72, 153, 0.4)' : isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                opacity: isActive || isCompleted ? 1 : 0.6
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? 'var(--primary)' : isCompleted ? '#10b981' : 'var(--text-muted)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}>
                  {isCompleted ? <Check size={14} /> : stepNum}
                </div>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: '700', color: isActive ? 'var(--primary)' : isCompleted ? '#10b981' : '#f8fafc' }}>
                    {s.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Card */}
        <div style={cardStyle}>
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee2e2',
              color: 'var(--primary)',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              fontWeight: '500',
              textAlign: 'center',
              border: '1px solid #fca5a5'
            }}>
              {error}
            </div>
          )}

          {/* STEP 1: AVATAR PICTURE */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                Profile Picture
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
                Add a friendly face to your profile so alumni recognize you instantly.
              </p>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px',
                border: '2px dashed var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-main)',
                marginBottom: '32px'
              }}>
                <div style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  border: '4px solid #ffffff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt="Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={64} color="#9ca3af" />
                  )}
                </div>
                
                <p style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: '500', marginBottom: '6px' }}>
                  Drag and drop your image here or
                </p>
                
                <label style={{
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  marginBottom: '12px'
                }}>
                  Choose image file
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }}
                  />
                </label>
                
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supports JPG, PNG up to 5MB.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={handleNext} 
                  style={{...primaryBtnStyle, width: '100%'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                >
                  Save and Continue
                </button>
                <button 
                  onClick={handleNext} 
                  style={skipLinkStyle}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  Skip this step »
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EDUCATION DETAILS */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                Educational Background
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
                Tell us about your college studies at AlgoUniversity.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle} htmlFor="edu_institution">University / Institution / College *</label>
                <input
                  id="edu_institution"
                  type="text"
                  style={formInputStyle}
                  placeholder="AlgoUniversity"
                  value={formData.edu_institution}
                  onChange={handleChange}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle} htmlFor="edu_degree">Program *</label>
                <input
                  id="edu_degree"
                  type="text"
                  style={formInputStyle}
                  placeholder="e.g. Master of Science, Software Engineering Program"
                  value={formData.edu_degree}
                  onChange={handleChange}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle}>Time Period</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Start Year</span>
                    <select
                      id="edu_start_year"
                      style={formInputStyle}
                      value={formData.edu_start_year}
                      onChange={handleChange}
                    >
                      <option value="">Select start year</option>
                      {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={`start-${year}`} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Year of Completion</span>
                    <select
                      id="edu_end_year"
                      style={formInputStyle}
                      value={formData.edu_end_year}
                      onChange={handleChange}
                    >
                      <option value="">Present (Ongoing)</option>
                      {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() + 5 - i).map(year => (
                        <option key={`end-${year}`} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={formLabelStyle} htmlFor="edu_location">Location</label>
                <input
                  id="edu_location"
                  type="text"
                  style={formInputStyle}
                  placeholder="City / Country of campus (e.g. Bengaluru, India)"
                  value={formData.edu_location}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                <button 
                  onClick={handleBack} 
                  style={backBtnStyle}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  &larr; Back
                </button>
                <button 
                  onClick={handleNext} 
                  style={primaryBtnStyle}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                >
                  Save and Continue
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <button 
                  onClick={handleNext} 
                  style={skipLinkStyle}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  Skip this step »
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LINKS & CITY ONLY */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                Contact & Profiles
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
                Add your social links and current location so friends can find you.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle}>Primary Registered Email</label>
                <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-surface)', border: '1px solid #e5e7eb', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <Mail size={16} style={{ marginRight: '8px' }} />
                  {user?.email}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle} htmlFor="linkedin_url">LinkedIn Username / Profile URL *</label>
                <div style={{ display: 'flex' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRight: 'none', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px', color: '#f8fafc' }}>
                    <Linkedin size={16} />
                  </div>
                  <input
                    id="linkedin_url"
                    type="text"
                    style={{...formInputStyle, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                    placeholder="linkedin.com/in/username or username"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle} htmlFor="website_url">Website / Portfolio</label>
                <div style={{ display: 'flex' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRight: 'none', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px', color: '#f8fafc' }}>
                    <Link2 size={16} />
                  </div>
                  <input
                    id="website_url"
                    type="url"
                    style={{...formInputStyle, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                    placeholder="https://yourwebsite.com"
                    value={formData.website_url}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={formLabelStyle} htmlFor="twitter_handle">Twitter Handle</label>
                <div style={{ display: 'flex' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRight: 'none', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px', color: '#f8fafc' }}>
                    <Twitter size={16} />
                  </div>
                  <input
                    id="twitter_handle"
                    type="text"
                    style={{...formInputStyle, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                    placeholder="Twitter username (without @)"
                    value={formData.twitter_handle}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={formLabelStyle} htmlFor="city">Current City *</label>
                <div style={{ display: 'flex' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRight: 'none', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px', color: '#f8fafc' }}>
                    <MapPin size={16} />
                  </div>
                  <input
                    id="city"
                    type="text"
                    style={{...formInputStyle, borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}
                    placeholder="e.g. San Francisco, Bengaluru"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                <button 
                  onClick={handleBack} 
                  style={backBtnStyle}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  &larr; Back
                </button>
                <button 
                  onClick={handleNext} 
                  style={primaryBtnStyle}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                >
                  Save and Continue
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <button 
                  onClick={handleNext} 
                  style={skipLinkStyle}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  Skip this step »
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: INVITE & SHARE */}
          {step === 4 && (
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px', textAlign: 'center' }}>
                Invite Classmates
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px', lineHeight: 1.5, textAlign: 'center' }}>
                Help us grow our AlgoUniversity alumni directory by inviting your batchmates.
              </p>

              {/* Share actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <button 
                  type="button" 
                  onClick={handleGmailImportClick} 
                  style={{
                    backgroundColor: '#db4437', // Google red
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 2px 4px rgba(219,68,55,0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#c53727'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#db4437'}
                >
                  <Mail size={18} /> Invite Google Contacts
                </button>

                <a 
                  href={`https://api.whatsapp.com/send?text=Join%20the%20official%20AlgoUniversity%20Alumni%20Portal%20at%20${window.location.origin}/register`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#25d366', // WhatsApp green
                    color: '#ffffff',
                    textDecoration: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 2px 4px rgba(37,211,102,0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#128c7e'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
                >
                  <Whatsapp size={18} /> Share Invite link via WhatsApp
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-muted)' }}>
                <hr style={{ flex: 1, border: 'none', height: '1px', backgroundColor: 'var(--border-color)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', margin: '0 12px', letterSpacing: '0.05em' }}>OR ENTER MANUALLY</span>
                <hr style={{ flex: 1, border: 'none', height: '1px', backgroundColor: 'var(--border-color)' }} />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={formLabelStyle} htmlFor="invite_emails">Enter emails separated by commas</label>
                <textarea
                  id="invite_emails"
                  rows="3"
                  style={{...formInputStyle, resize: 'none', marginTop: '4px'}}
                  placeholder="alex@example.com, sanjay@example.com"
                  value={formData.invite_emails}
                  onChange={handleChange}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    Selected: {formData.invite_emails ? formData.invite_emails.split(',').filter(e => e.trim()).length : 0} email(s)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  onClick={handleBack} 
                  style={backBtnStyle}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  &larr; Back
                </button>
                <button 
                  onClick={handleFinish} 
                  disabled={loadingSubmit}
                  style={primaryBtnStyle}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                >
                  {loadingSubmit ? 'Saving...' : 'Save and Finish'}
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <button 
                  onClick={handleFinish} 
                  disabled={loadingSubmit}
                  style={skipLinkStyle}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  Skip & Finish Setup »
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Gmail Importer Modal */}
      {showGmailModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '8px',
            padding: '24px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            {gmailLoadingStage === 1 && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Spinner size={36} color="#db4437" style={{ margin: 'auto', marginBottom: '16px' }} />
                <h4 style={{ fontWeight: '700', color: '#ffffff', margin: 0 }}>Connecting to Google Accounts...</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>Authenticating via OAuth secure handshake</p>
              </div>
            )}

            {gmailLoadingStage === 2 && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Spinner size={36} color="#db4437" style={{ margin: 'auto', marginBottom: '16px' }} />
                <h4 style={{ fontWeight: '700', color: '#ffffff', margin: 0 }}>Syncing batch contacts...</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>Retrieving your Gmail contact directory list</p>
              </div>
            )}

            {gmailLoadingStage === 3 && (
              <div>
                <h4 style={{ fontWeight: '700', color: '#ffffff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#db4437', fontWeight: 'bold' }}>G</span> Select Google Contacts
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Import contacts related to AlgoUniversity to send invites.
                </p>

                <div style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  padding: '8px'
                }}>
                  {gmailContacts.map(contact => (
                    <div 
                      key={contact.id} 
                      onClick={() => toggleContactCheck(contact.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 8px',
                        cursor: 'pointer',
                        backgroundColor: contact.checked ? '#f0fdf4' : 'transparent',
                        borderRadius: '4px',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ffffff' }}>{contact.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{contact.email}</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={contact.checked} 
                        onChange={() => {}} // Handled by div onClick
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    onClick={() => setShowGmailModal(false)}
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendGmailInvites}
                    style={{
                      border: 'none',
                      background: '#10b981',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    Import Selected ({gmailContacts.filter(c => c.checked).length})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteProfile;
