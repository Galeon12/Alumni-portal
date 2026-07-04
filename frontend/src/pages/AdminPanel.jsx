import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, CheckCircle, XCircle, Clock, FileText, User, Calendar, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tab State ('posts' or 'events')
  const [activeTab, setActiveTab] = useState('posts');

  // Posts State
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Events State
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Promote Admin State
  const [promoteUsername, setPromoteUsername] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [promoteSuccess, setPromoteSuccess] = useState('');
  const [promoteError, setPromoteError] = useState('');

  // Registered Admins list state
  const [adminsList, setAdminsList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    // Safety check: redirect non-admin/non-superadmin out of here
    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      navigate('/');
    } else if (user) {
      fetchPendingPosts();
      fetchPendingEvents();
      fetchNotifications();
      if (user.role === 'superadmin') {
        fetchAdminsList();
      }
    }
  }, [user]);

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

  const fetchPendingPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/posts/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingPosts(data.posts);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch pending posts');
      }
    } catch (error) {
      console.error('Error fetching pending posts:', error);
      setActionError(error.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchPendingEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/events/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingEvents(data.events);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch pending events');
      }
    } catch (error) {
      console.error('Error fetching pending events:', error);
      setActionError(error.message);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Posts Actions
  const handleApprovePost = async (postId) => {
    setActionError('');
    setActionMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/posts/${postId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setActionMessage('Post approved and published successfully!');
        setPendingPosts((prev) => prev.filter((post) => post.id !== postId));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Post approval failed');
      }
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleRejectPost = async (postId) => {
    setActionError('');
    setActionMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/posts/${postId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setActionMessage('Post rejected successfully.');
        setPendingPosts((prev) => prev.filter((post) => post.id !== postId));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Post rejection failed');
      }
    } catch (error) {
      setActionError(error.message);
    }
  };

  // Events Actions
  const handleApproveEvent = async (eventId) => {
    setActionError('');
    setActionMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/events/${eventId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setActionMessage('Event approved and published live!');
        setPendingEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Event approval failed');
      }
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleRejectEvent = async (eventId) => {
    setActionError('');
    setActionMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/events/${eventId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setActionMessage('Event request rejected.');
        setPendingEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Event rejection failed');
      }
    } catch (error) {
      setActionError(error.message);
    }
  };

  const fetchAdminsList = async () => {
    setLoadingAdmins(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminsList(data.admins);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch admins list');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setPromoteError(error.message);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleRevokeAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to revoke admin access from this user?')) {
      return;
    }
    setPromoting(true);
    setPromoteSuccess('');
    setPromoteError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/revoke-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: adminId })
      });
      const data = await response.json();
      if (response.ok) {
        setPromoteSuccess(data.message || 'Admin access revoked successfully.');
        setAdminsList(prev => prev.filter(admin => admin.id !== adminId));
      } else {
        throw new Error(data.message || 'Failed to revoke admin access');
      }
    } catch (error) {
      setPromoteError(error.message);
    } finally {
      setPromoting(false);
    }
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    if (!promoteUsername.trim()) return;
    setPromoting(true);
    setPromoteSuccess('');
    setPromoteError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/promote-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: promoteUsername.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setPromoteSuccess(data.message || 'User promoted to Admin successfully!');
        setPromoteUsername('');
        fetchAdminsList();
      } else {
        throw new Error(data.message || 'Failed to promote user');
      }
    } catch (error) {
      setPromoteError(error.message);
    } finally {
      setPromoting(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', position: 'relative', paddingBottom: '60px' }} className="animate-fade-in">
      <div className="bg-blobs">
        <div className="blob blob-1" style={{ opacity: 0.1, filter: 'blur(160px)' }}></div>
        <div className="blob blob-2" style={{ opacity: 0.08, filter: 'blur(160px)' }}></div>
      </div>


      <Navbar />

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '40px auto 0',
        padding: '0 24px',
        width: '100%'
      }}>

        {/* Title and stats summary */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={26} style={{ color: 'var(--primary)' }} /> Approval Control Panel
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
            Review pending social updates and event host proposals submitted by alumni members.
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '28px', paddingBottom: '1px' }}>
          <button
            onClick={() => {
              setActionError('');
              setActionMessage('');
              setActiveTab('posts');
            }}
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'posts' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'posts' ? '#ffffff' : '#737373',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <FileText size={16} /> Pending Posts ({pendingPosts.length})
          </button>

          <button
            onClick={() => {
              setActionError('');
              setActionMessage('');
              setActiveTab('events');
            }}
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'events' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'events' ? '#ffffff' : '#737373',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Calendar size={16} /> Pending Events ({pendingEvents.length})
          </button>

          {user.role === 'superadmin' && (
            <button
              onClick={() => {
                setActionError('');
                setActionMessage('');
                setPromoteSuccess('');
                setPromoteError('');
                setActiveTab('superadmin');
                fetchAdminsList();
              }}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                fontWeight: 600,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'superadmin' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'superadmin' ? '#ffffff' : '#737373',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <ShieldAlert size={16} /> Superadmin Controls
            </button>
          )}
        </div>

        {/* Action Status messages */}
        {actionMessage && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.9rem', marginBottom: '24px' }}>
            {actionMessage}
          </div>
        )}
        {actionError && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            {actionError}
          </div>
        )}

        {/* TAB 1: PENDING POSTS QUEUE */}
        {activeTab === 'posts' && (
          loadingPosts ? (
            <p style={{ color: '#737373', fontSize: '0.95rem' }}>Loading pending posts...</p>
          ) : pendingPosts.length === 0 ? (
            <div className="glass-container" style={{ padding: '48px', textAlign: 'center', background: '#111216', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <Clock size={40} style={{ color: '#737373', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '6px' }}>No Pending Posts</h3>
              <p style={{ color: '#737373', fontSize: '0.9rem' }}>All post updates have been reviewed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {pendingPosts.map((post) => (
                <div key={post.id} className="glass-container" style={{
                  padding: '28px',
                  background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.15)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
                }}>
                  {/* Author Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        <User size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: '#ffffff', margin: 0 }}>{post.author_name}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#737373', margin: 0 }}>
                          {post.author_email} {post.author_company && `• ${post.author_company}`}
                        </p>
                      </div>
                    </div>
                    <time style={{ fontSize: '0.75rem', color: '#737373' }}>
                      {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>

                  {/* Content */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={16} style={{ color: 'var(--primary)' }} /> {post.title}
                    </h4>
                    <p style={{ color: '#a3a3a3', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: post.image_url ? '16px' : 0 }}>
                      {post.content}
                    </p>

                    {post.image_url && (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '300px', maxWidth: '500px' }}>
                        <img src={post.image_url} alt="Post Attachment" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  {/* Approval Actions */}
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleRejectPost(post.id)}
                      style={{
                        padding: '8px 20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(236, 72, 153, 0.4)',
                        borderRadius: '6px',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(236, 72, 153, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <XCircle size={16} /> Reject
                    </button>

                    <button
                      onClick={() => handleApprovePost(post.id)}
                      style={{
                        padding: '8px 20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: '#10b981',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      <CheckCircle size={16} /> Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* TAB 2: PENDING EVENTS QUEUE */}
        {activeTab === 'events' && (
          loadingEvents ? (
            <p style={{ color: '#737373', fontSize: '0.95rem' }}>Loading pending events...</p>
          ) : pendingEvents.length === 0 ? (
            <div className="glass-container" style={{ padding: '48px', textAlign: 'center', background: '#111216', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <Clock size={40} style={{ color: '#737373', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '6px' }}>No Pending Events</h3>
              <p style={{ color: '#737373', fontSize: '0.9rem' }}>All event proposals have been reviewed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {pendingEvents.map((ev) => (
                <div key={ev.id} className="glass-container" style={{
                  padding: '28px',
                  background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.15)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
                }}>
                  {/* Creator Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        <User size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: '#ffffff', margin: 0 }}>Proposed by {ev.creator_name}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#737373', margin: 0 }}>
                          {ev.creator_email} {ev.creator_company && `• ${ev.creator_company}`}
                        </p>
                      </div>
                    </div>
                    <time style={{ fontSize: '0.75rem', color: '#737373' }}>
                      Submitted {new Date(ev.created_at).toLocaleDateString()}
                    </time>
                  </div>

                  {/* Event Details */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} style={{ color: 'var(--primary)' }} /> {ev.title}
                    </h4>

                    {/* DateTime & Location stacked */}
                    <div style={{
                      display: 'flex',
                      gap: '24px',
                      fontSize: '0.85rem',
                      color: '#a3a3a3',
                      backgroundColor: 'rgba(5,5,5,0.3)',
                      border: '1px solid rgba(255,255,255,0.02)',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      width: 'fit-content'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: 'var(--primary)' }} />
                        {new Date(ev.date_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} style={{ color: 'var(--primary)' }} /> {ev.location}
                      </span>
                    </div>

                    <p style={{ color: '#a3a3a3', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: ev.image_url ? '16px' : 0 }}>
                      {ev.description}
                    </p>

                    {ev.image_url && (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '240px', maxWidth: '480px' }}>
                        <img src={ev.image_url} alt="Event Banner" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleRejectEvent(ev.id)}
                      style={{
                        padding: '8px 20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(236, 72, 153, 0.4)',
                        borderRadius: '6px',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(236, 72, 153, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <XCircle size={16} /> Reject Proposal
                    </button>

                    <button
                      onClick={() => handleApproveEvent(ev.id)}
                      style={{
                        padding: '8px 20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: '#10b981',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      <CheckCircle size={16} /> Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* TAB 3: SUPERADMIN CONTROLS */}
        {activeTab === 'superadmin' && user.role === 'superadmin' && (
          <div className="glass-container" style={{
            padding: '32px',
            background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
            border: '1px solid rgba(168, 85, 247, 0.15)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} style={{ color: 'var(--primary)' }} /> Promote User to Admin
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Enter the username of the user you want to grant administrative controls to. Once promoted, they will be able to review posts and events.
            </p>

            {promoteSuccess && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.9rem', marginBottom: '20px' }}>
                {promoteSuccess}
              </div>
            )}
            {promoteError && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                {promoteError}
              </div>
            )}

            <form onSubmit={handlePromoteSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', maxWidth: '500px' }}>
              <div className="form-group" style={{ flexGrow: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="promoteUsername">Username</label>
                <input
                  id="promoteUsername"
                  type="text"
                  required
                  placeholder="e.g. john_doe"
                  className="form-input"
                  value={promoteUsername}
                  onChange={(e) => setPromoteUsername(e.target.value)}
                  style={{ background: 'rgba(10, 10, 10, 0.7)' }}
                />
              </div>
              <button
                type="submit"
                className="glow-btn"
                disabled={promoting}
                style={{ padding: '12px 24px', fontSize: '0.9rem', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {promoting ? 'Promoting...' : 'Promote to Admin'}
              </button>
            </form>

            {/* Registered Admins List */}
            <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} style={{ color: 'var(--primary)' }} /> Registered Admins ({adminsList.length})
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                View all accounts currently designated with administrative access. You can revoke their access at any time.
              </p>

              {loadingAdmins ? (
                <p style={{ color: '#737373', fontSize: '0.9rem' }}>Loading admins list...</p>
              ) : adminsList.length === 0 ? (
                <p style={{ color: '#737373', fontSize: '0.9rem', fontStyle: 'italic' }}>No registered admins (excluding Super Admin) found in the database.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {adminsList.map((admin) => (
                    <div
                      key={admin.id}
                      style={{
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'var(--accent-gradient)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}>
                          {admin.name ? admin.name.slice(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', color: '#ffffff', margin: 0 }}>
                            {admin.name} {admin.username && <span style={{ color: 'var(--primary)', fontWeight: 500 }}>@{admin.username}</span>}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: '#737373', margin: 0 }}>
                            {admin.email} {admin.company && `• ${admin.company}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeAdmin(admin.id)}
                        disabled={promoting}
                        style={{
                          padding: '6px 16px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(236, 72, 153, 0.4)',
                          borderRadius: '6px',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(236, 72, 153, 0.08)'; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                      >
                        Revoke Admin
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminPanel;
