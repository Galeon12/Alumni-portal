import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Calendar, Briefcase, Mail, Award, X, MapPin, AlignLeft, Info, Bell } from 'lucide-react';
import Navbar from '../components/Navbar';

const Linkedin = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const AlumniDirectory = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchText, setSearchText] = useState('');
  const [batchYear, setBatchYear] = useState('');

  // Modal Detail State
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        const unreads = data.notifications.filter(n => !n.is_read).length;
        setUnreadCount(unreads);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (notif) => {
    try {
      const token = localStorage.getItem('token');
      if (!notif.is_read) {
        await fetch(`${API_BASE}/notifications/${notif.id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setShowNotificationDropdown(false);
      navigate('/', { state: { openEventId: notif.event_id } });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [searchText, batchYear]);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE}/alumni?`;
      if (searchText.trim() !== '') {
        url += `search=${encodeURIComponent(searchText.trim())}&`;
      }
      if (batchYear !== '') {
        url += `batch=${batchYear}&`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAlumniList(data.alumni);
      }
    } catch (error) {
      console.error('Error fetching alumni list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (alumni) => {
    setSelectedAlumni(alumni);
    setShowDetailModal(true);
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', position: 'relative', paddingBottom: '60px' }} className="animate-fade-in">
      <div className="bg-blobs">
        <div className="blob blob-1" style={{ opacity: 0.1, filter: 'blur(160px)' }}></div>
        <div className="blob blob-2" style={{ opacity: 0.08, filter: 'blur(160px)' }}></div>
      </div>

      <Navbar />

      {/* Main Container */}
      <main style={{
        maxWidth: '1200px',
        margin: '40px auto 0',
        padding: '0 24px',
        width: '100%'
      }}>
        {/* Title */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Alumni Network Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Discover and connect with graduates from your college. Click on any card to view their profile details.
          </p>
        </div>

        {/* Search & Filter Bar Card */}
        <div className="glass-container" style={{
          padding: '20px',
          background: '#111216',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name, company, position..."
              className="form-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ paddingLeft: '44px', background: 'rgba(5, 5, 5, 0.5)' }}
            />
          </div>

          {/* Batch Year Select */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Calendar size={18} />
            </span>
            <select
              className="form-input"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
              style={{ paddingLeft: '44px', appearance: 'none', background: 'rgba(5, 5, 5, 0.5)' }}
            >
              <option value="" style={{ background: 'var(--bg-surface)' }}>Filter by Class (All Years)</option>
              {/* Generate dynamic options for the last 15 years */}
              {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year} style={{ background: 'var(--bg-surface)' }}>Class of {year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <p style={{ color: '#737373', fontSize: '0.95rem' }}>Searching directory...</p>
        ) : alumniList.length === 0 ? (
          <div className="glass-container" style={{ padding: '48px', textAlign: 'center', background: '#111216', border: '1px solid rgba(255,255,255,0.04)' }}>
            <Info size={40} style={{ color: '#737373', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '6px' }}>No Alumni Found</h3>
            <p style={{ color: '#737373', fontSize: '0.9rem' }}>Try adjusting your search queries or filtering keywords.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {alumniList.map((alumni) => (
              <div
                key={alumni.id}
                onClick={() => handleOpenDetail(alumni)}
                className="glass-container"
                style={{
                  padding: '24px',
                  background: 'linear-gradient(180deg, #121216 0%, #16171d 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '240px',
                  position: 'relative'
                }}
              >
                {/* Header profile initials */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#0d0d0d',
                    border: '2px solid var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    boxShadow: '0 0 12px rgba(168, 85, 247, 0.15)'
                  }}>
                    {alumni.name ? alumni.name.slice(0, 2).toUpperCase() : 'AL'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {alumni.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                      Class of {alumni.graduation_year || 'Network'}
                    </span>
                  </div>
                </div>

                {/* Professional Info */}
                <div style={{ flexGrow: 1, marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {alumni.position ? (
                    <p style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={12} style={{ color: 'var(--primary)' }} />
                      {alumni.position}
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#737373', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={12} style={{ color: '#737373' }} />
                      Status not specified
                    </p>
                  )}
                  {alumni.company && (
                    <p style={{ fontSize: '0.8rem', color: '#a3a3a3', margin: '0 0 0 18px' }}>
                      at {alumni.company}
                    </p>
                  )}
                </div>

                {/* LinkedIn Badge */}
                {alumni.linkedin_url && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <a
                      href={alumni.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} // Stop parent details card trigger
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      }}
                    >
                      <Linkedin size={12} /> Connect
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* DETAIL MODAL: Single Alumni Profile Detail */}
      {showDetailModal && selectedAlumni && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }} className="animate-fade-in">
          <div className="glass-container" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '36px',
            background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            position: 'relative',
            textAlign: 'center'
          }}>
            <button
              onClick={() => setShowDetailModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#737373', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Profile Avatar circle */}
            <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: '#0d0d0d',
                border: '3px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)'
              }}>
                {selectedAlumni.name ? selectedAlumni.name.slice(0, 2).toUpperCase() : 'AL'}
              </div>
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              {selectedAlumni.name}
            </h3>
            <span style={{
              background: 'rgba(168, 85, 247, 0.15)',
              color: 'var(--primary)',
              padding: '2px 10px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '20px'
            }}>
              Class of {selectedAlumni.graduation_year || 'Network'}
            </span>

            {/* Stack details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginBottom: '28px' }}>

              {/* Company & Role */}
              <div className="glass-container" style={{ padding: '16px', borderRadius: '10px', background: '#111216', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '6px' }}>
                  <Briefcase size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Professional Details</span>
                </div>
                {selectedAlumni.company || selectedAlumni.position ? (
                  <div style={{ fontSize: '0.85rem', color: '#a3a3a3' }}>
                    {selectedAlumni.position && <p style={{ fontWeight: 500, color: '#ffffff', margin: 0 }}>{selectedAlumni.position}</p>}
                    {selectedAlumni.company && <p style={{ margin: 0 }}>at {selectedAlumni.company}</p>}
                  </div>
                ) : (
                  <p style={{ color: '#737373', fontSize: '0.85rem', margin: 0 }}>No details specified</p>
                )}
              </div>

              {/* Bio summary */}
              <div className="glass-container" style={{ padding: '16px', borderRadius: '10px', background: '#111216', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '6px' }}>
                  <AlignLeft size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bio</span>
                </div>
                <p style={{ color: '#a3a3a3', fontSize: '0.85rem', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedAlumni.bio || 'This alumni has not written a biography yet.'}
                </p>
              </div>

              {/* Contact Email */}
              <div className="glass-container" style={{ padding: '16px', borderRadius: '10px', background: '#111216', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '6px' }}>
                  <Mail size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</span>
                </div>
                <p style={{ color: '#a3a3a3', fontSize: '0.85rem', wordBreak: 'break-all', margin: 0 }}>
                  {selectedAlumni.email}
                </p>
              </div>

            </div>

            {/* LinkedIn Redirect Connect Button */}
            {selectedAlumni.linkedin_url && (
              <a
                href={selectedAlumni.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="glow-btn"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.85rem',
                  gap: '8px',
                  background: '#0077b5', // LinkedIn blue
                  boxShadow: 'none',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => e.target.style.background = '#005582'}
                onMouseLeave={(e) => e.target.style.background = '#0077b5'}
              >
                <Linkedin size={16} /> Connect on LinkedIn
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AlumniDirectory;
