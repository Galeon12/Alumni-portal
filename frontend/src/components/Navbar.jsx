import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, CheckCircle, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState('all'); // 'all' or 'city'

  // Pending Approvals indicator
  const [hasPendingApprovals, setHasPendingApprovals] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    if (user) {
      fetchNotifications();
      if (user.role === 'admin' || user.role === 'superadmin') {
        fetchPendingStatus();
        const interval = setInterval(fetchPendingStatus, 15000); // Check every 15 seconds
        return () => clearInterval(interval);
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

  const fetchPendingStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/pending-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHasPendingApprovals(data.hasPending);
      }
    } catch (error) {
      console.error('Error fetching pending status:', error);
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
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setShowNotificationDropdown(false);
      navigate('/', { state: { openEventId: notif.event_id } });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (!user) return null;

  const userCity = user.city?.toLowerCase()?.trim();
  const cityNotifications = notifications.filter(notif => {
    const eventLoc = notif.event_location?.toLowerCase()?.trim();
    return userCity && eventLoc && (eventLoc.includes(userCity) || userCity.includes(eventLoc));
  });

  const displayedNotifications = activeNotifTab === 'all' ? notifications : cityNotifications;
  const allUnreadCount = notifications.filter(n => !n.is_read).length;
  const cityUnreadCount = cityNotifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      backgroundColor: '#0a0a0a',
      padding: '16px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', gap: '6px' }}>
          <span style={{ color: '#ffffff', fontFamily: 'var(--font-display)' }}>Algo</span>
          <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>Alumni</span>
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/alumni" style={{ color: '#a3a3a3', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = '#a3a3a3'}>
          Alumni View
        </Link>
        {(user.role === 'admin' || user.role === 'superadmin') && (
          <Link to="/admin" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--secondary)'}>
            Admin Panel
            {hasPendingApprovals && (
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                boxShadow: '0 0 8px rgba(168, 85, 247, 0.8)'
              }} />
            )}
          </Link>
        )}
        
        {/* Notification Bell */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            style={{
              background: 'transparent',
              border: 'none',
              color: showNotificationDropdown || unreadCount > 0 ? '#ffffff' : '#a3a3a3',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => { if (!showNotificationDropdown && unreadCount === 0) e.currentTarget.style.color = '#a3a3a3'; }}
          >
            <Bell size={20} />
            
            {/* Unread Count Badge */}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Menu */}
          {showNotificationDropdown && (
            <div style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              width: '320px',
              background: '#111216',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              zIndex: 100,
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '8px 0'
            }} className="animate-fade-in">
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#737373' }}>{unreadCount} unread</span>
                )}
              </div>
              {/* Tabs header */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                backgroundColor: 'rgba(255,255,255,0.01)'
              }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveNotifTab('all'); }}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeNotifTab === 'all' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeNotifTab === 'all' ? '#ffffff' : '#737373',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  All Events
                  {allUnreadCount > 0 && (
                    <span style={{
                      backgroundColor: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontSize: '0.6rem'
                    }}>{allUnreadCount}</span>
                  )}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveNotifTab('city'); }}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeNotifTab === 'city' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeNotifTab === 'city' ? '#ffffff' : '#737373',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  For My City
                  {cityUnreadCount > 0 && (
                    <span style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontSize: '0.6rem'
                    }}>{cityUnreadCount}</span>
                  )}
                </button>
              </div>
              {displayedNotifications.length === 0 ? (
                <p style={{ color: '#737373', fontSize: '0.8rem', textAlign: 'center', padding: '24px 16px', margin: 0, fontStyle: 'italic' }}>
                  {activeNotifTab === 'all' ? 'No notifications yet.' : 'No notifications for your city yet.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {displayedNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'background-color 0.2s',
                        backgroundColor: notif.is_read ? 'transparent' : 'rgba(168, 85, 247, 0.03)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? 'transparent' : 'rgba(168, 85, 247, 0.03)'}
                    >
                      {/* Unread indicator dot */}
                      {!notif.is_read && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          flexShrink: 0
                        }} />
                      )}
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.8rem',
                          color: notif.is_read ? '#a3a3a3' : '#ffffff',
                          fontWeight: notif.is_read ? 400 : 500,
                          margin: 0,
                          lineHeight: '1.4',
                          textAlign: 'left'
                        }}>
                          {notif.message}
                        </p>
                        <span style={{ fontSize: '0.65rem', color: '#737373', marginTop: '4px', display: 'block', textAlign: 'left' }}>
                          {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar Dropdown */}
        <div style={{ position: 'relative', marginLeft: '12px' }}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#0d0d0d',
              border: '2px solid var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffffff',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              user.name ? user.name.slice(0, 2).toUpperCase() : 'US'
            )}
            
            {/* Red dot if profile incomplete */}
            {!user.profile_completed && (
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '12px',
                height: '12px',
                backgroundColor: 'var(--primary)',
                borderRadius: '50%',
                border: '2px solid #0a0a0a'
              }}></div>
            )}
          </div>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              width: '200px',
              background: '#111216',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '8px 0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 100
            }}>
              {!user.profile_completed && (
                <Link 
                  to="/complete-profile" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={16} /> Complete Profile
                  <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                </Link>
              )}
              {user.profile_completed && (
                <Link 
                  to="/profile" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={16} /> My Profile
                </Link>
              )}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
              <button 
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  color: 'var(--primary)',
                  background: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(239,68,68,0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
