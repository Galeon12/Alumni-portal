import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Award, Mail, Calendar, Briefcase, PlusCircle, Image, Send, FileText, CheckCircle2, MapPin, Users, Info, X, ThumbsUp, MessageSquare, AlignLeft, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Linkedin = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Posts Feed State
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postFile, setPostFile] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Events Feed State
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Modals & Selection State
  const [showHostModal, setShowHostModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventAttendees, setEventAttendees] = useState([]);
  const [loadingEventDetail, setLoadingEventDetail] = useState(false);

  // Post Details Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);

  // Feed Inline State
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [feedComments, setFeedComments] = useState({});

  // Profile Modal State
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Post Likes & Comments State
  const [likers, setLikers] = useState([]);
  const [loadingLikers, setLoadingLikers] = useState(false);
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [activeLikersPostId, setActiveLikersPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Post Edit State
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostFile, setEditPostFile] = useState(null);
  const [editPostError, setEditPostError] = useState('');
  const [editPostSubmitting, setEditPostSubmitting] = useState(false);

  // Event Edit State
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');
  const [editEventLocation, setEditEventLocation] = useState('');
  const [editEventDateTime, setEditEventDateTime] = useState('');
  const [editEventFile, setEditEventFile] = useState(null);
  const [editEventError, setEditEventError] = useState('');
  const [editEventSubmitting, setEditEventSubmitting] = useState(false);

  // Host Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [eventFile, setEventFile] = useState(null);
  const [eventSubmitError, setEventSubmitError] = useState('');
  const [eventSubmitSuccess, setEventSubmitSuccess] = useState('');
  const [eventSubmitting, setEventSubmitting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    fetchPosts();
    fetchEvents();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (location.state && location.state.openEventId) {
      handleOpenEventDetail(location.state.openEventId);
      // Clear history state to avoid reopening the modal on refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (activeLikersPostId !== null) {
        if (!e.target.closest('.likers-popover') && !e.target.closest('.likers-trigger')) {
          setActiveLikersPostId(null);
        }
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeLikersPostId]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

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

        // Update local state
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Close dropdown & open event details modal
      setShowNotificationDropdown(false);
      handleOpenEventDetail(notif.event_id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const fetchEventDetail = async (eventId) => {
    setLoadingEventDetail(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/events/${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedEvent(data.event);
        setEventAttendees(data.attendees);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoadingEventDetail(false);
    }
  };

  const handleOpenEventDetail = (eventId) => {
    setSelectedEvent(null);
    setEventAttendees([]);
    setShowDetailModal(true);
    fetchEventDetail(eventId);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (postFile) {
        formData.append('image', postFile);
      }

      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit post');
      }

      setTitle('');
      setContent('');
      setPostFile(null);

      if (user.role === 'admin' || user.role === 'superadmin') {
        setSubmitSuccess('Post published successfully!');
        fetchPosts();
        setTimeout(() => {
          setShowCreatePostModal(false);
          setSubmitSuccess('');
        }, 1500);
      } else {
        setSubmitSuccess('Post submitted successfully! Waiting for admin approval.');
        setTimeout(() => {
          setShowCreatePostModal(false);
          setSubmitSuccess('');
        }, 3500);
      }
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setEventSubmitError('');
    setEventSubmitSuccess('');
    setEventSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', eventTitle);
      formData.append('description', eventDescription);
      formData.append('location', eventLocation);
      formData.append('date_time', eventDateTime);
      if (eventFile) {
        formData.append('image', eventFile);
      }

      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit event request');
      }

      setEventTitle('');
      setEventDescription('');
      setEventLocation('');
      setEventDateTime('');
      setEventFile(null);

      if (user.role === 'admin' || user.role === 'superadmin') {
        setEventSubmitSuccess('Event published successfully!');
        fetchEvents();
        setTimeout(() => {
          setShowHostModal(false);
          setEventSubmitSuccess('');
        }, 1500);
      } else {
        setEventSubmitSuccess('Event request submitted! Waiting for admin approval.');
        setTimeout(() => {
          setShowHostModal(false);
          setEventSubmitSuccess('');
        }, 3500);
      }
    } catch (error) {
      setEventSubmitError(error.message);
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleRSVP = async (eventId, e) => {
    if (e) e.stopPropagation(); // Stop parent details card trigger

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchEvents(); // Refresh counts in list
        if (selectedEvent && selectedEvent.id === eventId) {
          fetchEventDetail(eventId); // Refresh modal view
        }
      }
    } catch (error) {
      console.error('Error toggling RSVP:', error);
    }
  };

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISODate = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISODate;
  };

  const startEditingPost = (post) => {
    setSelectedPost(post);
    setEditPostTitle(post.title || '');
    setEditPostContent(post.content || '');
    setEditPostFile(null);
    setEditPostError('');
    setIsEditingPost(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    setEditPostError('');
    setEditPostSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editPostTitle);
      formData.append('content', editPostContent);
      if (editPostFile) {
        formData.append('image', editPostFile);
      }

      const response = await fetch(`${API_BASE}/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update post');
      }

      setShowPostDetailModal(false);
      setSelectedPost(null);
      setIsEditingPost(false);
      setEditPostTitle('');
      setEditPostContent('');
      setEditPostFile(null);

      fetchPosts();
      alert(data.message || 'Post updated successfully!');
    } catch (error) {
      setEditPostError(error.message);
    } finally {
      setEditPostSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete post');
      }

      setShowPostDetailModal(false);
      setSelectedPost(null);
      fetchPosts();
      alert('Post deleted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const startEditingEvent = (event) => {
    setEditEventTitle(event.title || '');
    setEditEventDescription(event.description || '');
    setEditEventLocation(event.location || '');
    setEditEventDateTime(formatDateTimeLocal(event.date_time));
    setEditEventFile(null);
    setEditEventError('');
    setIsEditingEvent(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setEditEventError('');
    setEditEventSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', editEventTitle);
      formData.append('description', editEventDescription);
      formData.append('location', editEventLocation);
      formData.append('date_time', editEventDateTime);
      if (editEventFile) {
        formData.append('image', editEventFile);
      }

      const response = await fetch(`${API_BASE}/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update event');
      }

      setShowDetailModal(false);
      setSelectedEvent(null);
      setIsEditingEvent(false);
      setEditEventTitle('');
      setEditEventDescription('');
      setEditEventLocation('');
      setEditEventDateTime('');
      setEditEventFile(null);

      fetchEvents();
      alert(data.message || 'Event updated successfully!');
    } catch (error) {
      setEditEventError(error.message);
    } finally {
      setEditEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete event');
      }

      setShowDetailModal(false);
      setSelectedEvent(null);
      fetchEvents();
      alert('Event deleted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const fetchLikers = async (postId) => {
    setLoadingLikers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/posts/${postId}/likes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLikers(data.likers);
      }
    } catch (error) {
      console.error('Error fetching likers:', error);
    } finally {
      setLoadingLikers(false);
    }
  };

  const fetchComments = async (postId) => {
    setLoadingComments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();

        // Update posts feed list
        setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === postId) {
            let updatedLikers = p.likers || [];
            if (data.is_liked) {
              if (!updatedLikers.some(l => Number(l.id) === Number(user.id))) {
                updatedLikers = [{
                  id: user.id,
                  name: user.name,
                  role: user.role,
                  company: user.company,
                  position: user.position,
                  graduation_year: user.graduation_year,
                  avatar_url: user.avatar_url
                }, ...updatedLikers];
              }
            } else {
              updatedLikers = updatedLikers.filter(l => Number(l.id) !== Number(user.id));
            }
            return { ...p, is_liked: data.is_liked, like_count: data.like_count, likers: updatedLikers };
          }
          return p;
        }));

        // Update selectedPost
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => {
            let updatedLikers = prev.likers || [];
            if (data.is_liked) {
              if (!updatedLikers.some(l => Number(l.id) === Number(user.id))) {
                updatedLikers = [{
                  id: user.id,
                  name: user.name,
                  role: user.role,
                  company: user.company,
                  position: user.position,
                  graduation_year: user.graduation_year,
                  avatar_url: user.avatar_url
                }, ...updatedLikers];
              }
            } else {
              updatedLikers = updatedLikers.filter(l => Number(l.id) !== Number(user.id));
            }
            return { ...prev, is_liked: data.is_liked, like_count: data.like_count, likers: updatedLikers };
          });
        }

        // Refresh likers overlapping bubbles
        fetchLikers(postId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });

      const data = await response.json();
      if (response.ok) {
        setComments(prev => [...prev, data.comment]);
        setCommentText('');

        // Update comments count in posts list
        setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === selectedPost.id) {
            return { ...p, comment_count: (Number(p.comment_count) || 0) + 1 };
          }
          return p;
        }));

        // Update selectedPost comment count
        setSelectedPost(prev => ({
          ...prev,
          comment_count: (Number(prev.comment_count) || 0) + 1
        }));
      } else {
        alert(data.message || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleOpenProfile = async (userId) => {
    try {
      setLoadingProfile(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/alumni/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedProfile(data.alumni);
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleToggleComments = async (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!feedComments[postId]) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setFeedComments(prev => ({ ...prev, [postId]: data.comments }));
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }
  };

  const handleFeedCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: text })
      });

      const data = await response.json();
      if (response.ok) {
        setFeedComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));

        // Update posts feed list comment count
        setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === postId) {
            return { ...p, comment_count: (Number(p.comment_count) || 0) + 1 };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const now = new Date();
  const upcomingEvents = events
    .filter(e => new Date(e.date_time) >= now)
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

  const completedEvents = events
    .filter(e => e.date_time && new Date(e.date_time) < now)
    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', position: 'relative', paddingBottom: '60px' }} className="animate-fade-in">
      <div className="bg-blobs">
        <div className="blob blob-1" style={{ opacity: 0.1, filter: 'blur(160px)' }}></div>
        <div className="blob blob-2" style={{ opacity: 0.08, filter: 'blur(160px)' }}></div>
      </div>

      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main style={{
        maxWidth: '1200px',
        margin: '40px auto 0',
        padding: '0 24px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '32px'
      }}>

        {/* Left Column: Posts Feed */}
        <section className="custom-scrollbar" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          height: 'calc(100vh - 100px)',
          overflowY: 'auto',
          paddingRight: '12px'
        }}>
          {/* Composer moved to FAB modal */}

          {/* Social Feed Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} style={{ color: 'var(--primary)' }} /> Community Feed
            </h3>

            {loadingPosts ? (
              <p style={{ color: '#737373', fontSize: '0.9rem' }}>Loading community updates...</p>
            ) : posts.length === 0 ? (
              <p style={{ color: '#737373', fontSize: '0.9rem' }}>No updates shared yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="glass-container"
                    style={{
                      padding: '20px 24px',
                      background: '#111216',
                      border: '1px solid rgba(255, 255, 255, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          onClick={(e) => { e.stopPropagation(); handleOpenProfile(post.author_id); }}
                          style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'var(--accent-gradient)', color: '#ffffff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
                          }}>
                          {post.author_name ? post.author_name.slice(0, 2).toUpperCase() : 'AL'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4
                              onClick={(e) => { e.stopPropagation(); handleOpenProfile(post.author_id); }}
                              style={{ fontSize: '0.95rem', color: '#ffffff', margin: 0, cursor: 'pointer' }}
                              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >{post.author_name}</h4>
                            <span style={{
                              background: (post.author_role === 'admin' || post.author_role === 'superadmin') ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: (post.author_role === 'admin' || post.author_role === 'superadmin') ? 'var(--primary)' : '#10b981',
                              padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600
                            }}>{post.author_role}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#737373', margin: 0 }}>
                            {post.author_position && `${post.author_position} at `}{post.author_company || 'Alumni Network'}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <time style={{ fontSize: '0.75rem', color: '#737373' }}>
                          {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </time>
                        {(Number(user.id) === Number(post.author_id) || user.role === 'admin' || user.role === 'superadmin') && (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); startEditingPost(post); }}
                              style={{ background: 'transparent', border: 'none', color: '#a3a3a3', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'color 0.2s', padding: 0 }}
                              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                              onMouseLeave={(e) => e.target.style.color = '#a3a3a3'}
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                              style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'color 0.2s', padding: 0 }}
                              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                              onMouseLeave={(e) => e.target.style.color = 'var(--primary)'}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '0 0 8px 0', fontWeight: 600 }}>{post.title}</h4>
                    {post.content && (
                      <p style={{ color: '#a3a3a3', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                        {post.content}
                      </p>
                    )}
                    {post.image_url && (
                      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                        <img src={post.image_url} alt="Post Attachment" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                      </div>
                    )}

                    {/* Likes summary metadata */}
                    {Number(post.like_count) > 0 && (
                      <div 
                        className="likers-trigger"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeLikersPostId === post.id) {
                            setActiveLikersPostId(null);
                          } else {
                            setActiveLikersPostId(post.id);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          color: '#a3a3a3',
                          marginBottom: '10px',
                          cursor: 'pointer',
                          width: 'fit-content',
                          position: 'relative'
                        }}
                      >
                        {post.likers && post.likers.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', marginRight: '4px' }}>
                            {post.likers.slice(0, 3).map((liker, idx) => (
                              <div
                                key={liker.id || idx}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: 'var(--accent-gradient)',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.65rem',
                                  fontWeight: 'bold',
                                  border: '1.5px solid #111216',
                                  marginLeft: idx > 0 ? '-6px' : '0',
                                  zIndex: 5 - idx
                                }}
                                title={liker.name}
                              >
                                {liker.name ? liker.name.slice(0, 2).toUpperCase() : 'AL'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(168, 85, 247, 0.15)',
                            color: 'var(--primary)'
                          }}>
                            <ThumbsUp size={10} fill="var(--primary)" />
                          </div>
                        )}
                        <span onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>
                          {post.like_count} {Number(post.like_count) === 1 ? 'person' : 'people'} liked this
                        </span>

                        {/* Inline scrollable popover */}
                        {activeLikersPostId === post.id && (
                          <div
                            className="likers-popover custom-scrollbar"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              bottom: 'calc(100% + 8px)',
                              left: '0',
                              width: '260px',
                              maxHeight: '220px',
                              overflowY: 'auto',
                              background: '#18191d',
                              border: '1px solid rgba(168, 85, 247, 0.3)',
                              borderRadius: '8px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                              padding: '12px',
                              zIndex: 50,
                              cursor: 'default',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', marginBottom: '4px' }}>
                              <span style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 600 }}>Liked by</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); setActiveLikersPostId(null); }}
                                style={{ background: 'transparent', border: 'none', color: '#a3a3a3', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                            
                            {(!post.likers || post.likers.length === 0) ? (
                              <div style={{ color: '#737373', fontSize: '0.75rem', textAlign: 'center', padding: '6px' }}>No likes yet</div>
                            ) : (
                              post.likers.map((liker) => (
                                <div
                                  key={liker.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '4px 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.02)'
                                  }}
                                >
                                  {/* User Initials Circle */}
                                  <div
                                    onClick={(e) => { e.stopPropagation(); setActiveLikersPostId(null); handleOpenProfile(liker.id); }}
                                    style={{
                                      width: '26px',
                                      height: '26px',
                                      borderRadius: '50%',
                                      background: 'var(--accent-gradient)',
                                      color: '#ffffff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      border: '1px solid rgba(255,255,255,0.08)',
                                      cursor: 'pointer',
                                      flexShrink: 0
                                    }}
                                  >
                                    {liker.name ? liker.name.slice(0, 2).toUpperCase() : 'AL'}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left' }}>
                                    <span
                                      onClick={(e) => { e.stopPropagation(); setActiveLikersPostId(null); handleOpenProfile(liker.id); }}
                                      style={{
                                        color: '#ffffff',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden'
                                      }}
                                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                      onMouseLeave={(e) => e.target.style.textDecoration = 'none' }
                                    >
                                      {liker.name}
                                    </span>
                                    <span style={{ color: '#737373', fontSize: '0.65rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                      {liker.position && `${liker.position} at `}{liker.company || 'Alumni Network'}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: post.is_liked ? 'var(--primary)' : '#a3a3a3',
                          fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s'
                        }}
                      >
                        <ThumbsUp size={16} fill={post.is_liked ? 'var(--primary)' : 'none'} />
                        {post.like_count || 0}
                      </button>
                      <button
                        onClick={() => handleToggleComments(post.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: expandedComments[post.id] ? '#ffffff' : '#a3a3a3',
                          fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s'
                        }}
                      >
                        <MessageSquare size={16} />
                        {post.comment_count || 0}
                      </button>
                    </div>

                    {expandedComments[post.id] && (
                      <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                        <form onSubmit={(e) => handleFeedCommentSubmit(e, post.id)} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '24px', color: '#ffffff', fontSize: '0.85rem', outline: 'none' }}
                          />
                          <button type="submit" disabled={!commentInputs[post.id]?.trim()} style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '24px', padding: '0 20px', cursor: commentInputs[post.id]?.trim() ? 'pointer' : 'not-allowed', opacity: commentInputs[post.id]?.trim() ? 1 : 0.5, fontSize: '0.85rem', fontWeight: 600 }}>Post</button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                          {!feedComments[post.id] ? (
                            <p style={{ color: '#737373', fontSize: '0.85rem', textAlign: 'center' }}>Loading comments...</p>
                          ) : feedComments[post.id].length === 0 ? (
                            <p style={{ color: '#737373', fontSize: '0.85rem', textAlign: 'center' }}>No comments yet. Be the first!</p>
                          ) : (
                            feedComments[post.id].map(comment => (
                              <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                                <div
                                  onClick={(e) => { e.stopPropagation(); handleOpenProfile(comment.user_id); }}
                                  style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0, cursor: 'pointer' }}>
                                  {comment.user_name ? comment.user_name.slice(0, 2).toUpperCase() : 'AL'}
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '0 12px 12px 12px', flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span
                                      onClick={(e) => { e.stopPropagation(); handleOpenProfile(comment.user_id); }}
                                      style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e5e5e5', cursor: 'pointer' }}
                                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                    >
                                      {comment.user_name}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: '#737373' }}>{new Date(comment.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <p style={{ fontSize: '0.85rem', color: '#a3a3a3', margin: 0, lineHeight: '1.4' }}>{comment.content}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Profile & Events list */}
        <section className="custom-scrollbar" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          height: 'calc(100vh - 100px)',
          overflowY: 'auto',
          paddingRight: '12px',
          position: 'sticky',
          top: '80px'
        }}>

          {/* Welcome User details Card removed */}

          {/* Upcoming Events Card List */}
          <div className="glass-container" style={{ padding: '24px', background: '#111216', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} /> Upcoming Events
              </h3>

              <button
                onClick={() => {
                  setEventSubmitError('');
                  setEventSubmitSuccess('');
                  setShowHostModal(true);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: 'var(--primary)',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.08)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Host Event
              </button>
            </div>

            {loadingEvents ? (
              <p style={{ color: '#737373', fontSize: '0.85rem' }}>Loading events...</p>
            ) : upcomingEvents.length === 0 ? (
              <p style={{ color: '#737373', fontSize: '0.85rem' }}>No upcoming events scheduled.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleOpenEventDetail(event.id)}
                    style={{
                      padding: '14px',
                      backgroundColor: 'rgba(5,5,5,0.3)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.2)';
                      e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.backgroundColor = 'rgba(5,5,5,0.3)';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '75%' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#ffffff', margin: 0, fontWeight: 600 }}>{event.title}</h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#737373' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} style={{ color: 'var(--primary)' }} /> {event.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={12} style={{ color: 'var(--primary)' }} /> {event.attendee_count} going
                        </span>
                      </div>
                    </div>

                    {user.role !== 'admin' && user.role !== 'superadmin' && (() => {
                      const isEventEnded = new Date(event.date_time) < new Date();
                      return (
                      <button
                        onClick={(e) => { e.stopPropagation(); !isEventEnded && handleRSVP(event.id, e); }}
                        disabled={isEventEnded}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: isEventEnded ? 'not-allowed' : 'pointer',
                          border: 'none',
                          backgroundColor: isEventEnded ? 'rgba(255,255,255,0.05)' : (event.is_attending ? '#10b981' : 'transparent'),
                          color: isEventEnded ? '#737373' : (event.is_attending ? '#ffffff' : 'var(--primary)'),
                          outline: event.is_attending || isEventEnded ? 'none' : '1px solid rgba(236,72,153,0.4)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isEventEnded) {
                            e.target.style.background = event.is_attending ? '#059669' : 'rgba(236,72,153,0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isEventEnded) {
                            e.target.style.background = event.is_attending ? '#10b981' : 'transparent';
                          }
                        }}
                      >
                        {isEventEnded ? 'Ended' : (event.is_attending ? '✓ Going' : 'Attend')}
                      </button>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Events Card List */}
          <div className="glass-container" style={{ padding: '24px', background: '#111216', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', margin: 0 }}>
              <CheckCircle2 size={18} style={{ color: '#737373' }} /> Completed Events
            </h3>

            {loadingEvents ? (
              <p style={{ color: '#737373', fontSize: '0.85rem', marginTop: '16px' }}>Loading events...</p>
            ) : completedEvents.length === 0 ? (
              <p style={{ color: '#737373', fontSize: '0.85rem', marginTop: '16px' }}>No completed events.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px', marginTop: '16px' }}>
                {completedEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleOpenEventDetail(event.id)}
                    style={{
                      padding: '14px',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.01)';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#a3a3a3', margin: 0, fontWeight: 500, textDecoration: 'line-through' }}>{event.title}</h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#525252' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} style={{ color: '#525252' }} /> {event.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={12} style={{ color: '#525252' }} /> {event.attendee_count} attended
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

      </main>

      {/* MODAL 1: Host Event Form */}
      {showHostModal && (
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
            padding: '32px',
            background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowHostModal(false);
                setEventSubmitSuccess('');
                setEventSubmitError('');
              }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#737373', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
              Host a New Event
            </h3>

            {eventSubmitError && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                {eventSubmitError}
              </div>
            )}

            {eventSubmitSuccess && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.85rem', marginBottom: '16px' }}>
                {eventSubmitSuccess}
              </div>
            )}

            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alumni Networking Dinner"
                  className="form-input"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="What is this event about?"
                  className="form-input"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    className="form-input"
                    value={eventDateTime}
                    onChange={(e) => setEventDateTime(e.target.value)}
                    onClick={(e) => {
                      if (typeof e.currentTarget.showPicker === 'function') {
                        try {
                          e.currentTarget.showPicker();
                        } catch (err) {
                          console.log('showPicker not supported:', err);
                        }
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore Campus"
                    className="form-input"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Banner Image (Optional)</label>
                <input
                  key={eventFile ? 'loaded' : 'empty'}
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={(e) => setEventFile(e.target.files[0])}
                  style={{ background: 'rgba(5, 5, 5, 0.5)', padding: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#737373' }}>
                  {(user.role === 'admin' || user.role === 'superadmin') ? '✓ Auto-approved' : 'ℹ Submits for Admin Approval'}
                </span>
                <button type="submit" className="glow-btn" disabled={eventSubmitting} style={{ padding: '10px 24px', fontSize: '0.85rem' }}>
                  {eventSubmitting ? 'Submitting...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Event Details & Guest List */}
      {showDetailModal && (
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
            maxWidth: '600px',
            padding: '32px',
            background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => {
                setShowDetailModal(false);
                setIsEditingEvent(false);
                setSelectedEvent(null);
              }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#737373', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {loadingEventDetail ? (
              <p style={{ color: '#737373', padding: '40px 0', textAlign: 'center' }}>Loading details...</p>
            ) : !selectedEvent ? (
              <p style={{ color: 'var(--primary)', padding: '40px 0', textAlign: 'center' }}>Failed to load event details.</p>
            ) : isEditingEvent ? (
              <form onSubmit={handleUpdateEvent}>
                <h3 style={{ fontSize: '1.4rem', color: '#ffffff', fontWeight: 700, marginBottom: '20px' }}>Edit Event</h3>

                {editEventError && (
                  <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                    {editEventError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editEventTitle}
                    onChange={(e) => setEditEventTitle(e.target.value)}
                    style={{ background: 'rgba(5, 5, 5, 0.5)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Description *</label>
                  <textarea
                    required
                    rows="4"
                    className="form-input"
                    value={editEventDescription}
                    onChange={(e) => setEditEventDescription(e.target.value)}
                    style={{ background: 'rgba(5, 5, 5, 0.5)', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      className="form-input"
                      value={editEventDateTime}
                      onChange={(e) => setEditEventDateTime(e.target.value)}
                      onClick={(e) => {
                        if (typeof e.currentTarget.showPicker === 'function') {
                          try {
                            e.currentTarget.showPicker();
                          } catch (err) {
                            console.log('showPicker not supported:', err);
                          }
                        }
                      }}
                      style={{ background: 'rgba(5, 5, 5, 0.5)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={editEventLocation}
                      onChange={(e) => setEditEventLocation(e.target.value)}
                      style={{ background: 'rgba(5, 5, 5, 0.5)' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Replace Banner Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => setEditEventFile(e.target.files[0])}
                    style={{ background: 'rgba(5, 5, 5, 0.5)', padding: '8px' }}
                  />
                  {selectedEvent.image_url && !editEventFile && (
                    <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '6px' }}>
                      Current: {selectedEvent.image_url.split('/').pop()}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingEvent(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="glow-btn"
                    disabled={editEventSubmitting}
                    style={{ padding: '10px 24px', fontSize: '0.85rem' }}
                  >
                    {editEventSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {/* Event Image Banner */}
                {selectedEvent.image_url && (
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '200px', marginBottom: '20px' }}>
                    <img src={selectedEvent.image_url} alt={selectedEvent.title} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
                  </div>
                )}

                <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '6px' }}>{selectedEvent.title}</h3>

                <p style={{ fontSize: '0.8rem', color: '#737373', marginBottom: '16px' }}>
                  Hosted by <strong style={{ color: '#ffffff' }}>{selectedEvent.creator_name}</strong>
                </p>

                {/* Event Meta Details Card */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  backgroundColor: 'rgba(5,5,5,0.4)',
                  border: '1px solid rgba(255,255,255,0.03)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} style={{ color: 'var(--primary)' }} /> Date & Time
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 500 }}>
                      {new Date(selectedEvent.date_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} style={{ color: 'var(--primary)' }} /> Location
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 500 }}>
                      {selectedEvent.location}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '8px' }}>About the Event</h4>
                <p style={{ color: '#a3a3a3', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '24px' }}>
                  {selectedEvent.description}
                </p>

                {/* RSVP Status Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(168, 85, 247, 0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.1)',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '#ffffff', fontSize: '0.9rem', fontWeight: 500 }}>
                      {selectedEvent.attendee_count} Going
                    </span>
                  </div>

                  {user.role !== 'admin' && user.role !== 'superadmin' && (() => {
                    const isEventEnded = new Date(selectedEvent.date_time) < new Date();
                    return (
                    <button
                      onClick={() => !isEventEnded && handleRSVP(selectedEvent.id)}
                      disabled={isEventEnded}
                      style={{
                        padding: '8px 24px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: isEventEnded ? 'not-allowed' : 'pointer',
                        border: 'none',
                        backgroundColor: isEventEnded ? 'rgba(255,255,255,0.05)' : (selectedEvent.is_attending ? '#10b981' : 'var(--accent-gradient)'),
                        color: isEventEnded ? '#737373' : '#ffffff',
                        boxShadow: isEventEnded ? 'none' : (selectedEvent.is_attending ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(236, 72, 153, 0.2)'),
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isEventEnded) {
                          e.target.style.background = selectedEvent.is_attending ? '#059669' : 'var(--accent-gradient-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isEventEnded) {
                          e.target.style.background = selectedEvent.is_attending ? '#10b981' : 'var(--accent-gradient)';
                        }
                      }}
                    >
                      {isEventEnded ? 'Event Ended' : (selectedEvent.is_attending ? '✓ Attending' : 'RSVP Now')}
                    </button>
                    );
                  })()}
                </div>

                {/* Attendees profiles */}
                <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '12px' }}>Who's Attending</h4>
                {eventAttendees.length === 0 ? (
                  <p style={{ color: '#737373', fontSize: '0.85rem', fontStyle: 'italic' }}>No RSVPs yet. Be the first to join!</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '160px', overflowY: 'auto' }}>
                    {eventAttendees.map((guest) => (
                      <div key={guest.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#1c1c1c',
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          color: '#ffffff'
                        }}>
                          {guest.name ? guest.name.slice(0, 2).toUpperCase() : 'AL'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <p style={{ fontSize: '0.8rem', color: '#ffffff', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {guest.name}
                          </p>
                          <p style={{ fontSize: '0.7rem', color: '#737373', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {guest.company ? `at ${guest.company}` : `Class of ${guest.graduation_year || 'Network'}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Event Actions Footer */}
                <div style={{
                  marginTop: '32px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px'
                }}>
                  {(Number(user.id) === Number(selectedEvent.creator_id)) && (
                    <button
                      onClick={() => startEditingEvent(selectedEvent)}
                      style={{
                        padding: '8px 20px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        color: '#ffffff',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                    >
                      Edit Event
                    </button>
                  )}
                  {(Number(user.id) === Number(selectedEvent.creator_id) || user.role === 'admin' || user.role === 'superadmin') && (
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      style={{
                        padding: '8px 20px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'var(--accent-gradient)',
                        color: '#ffffff',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                      onMouseLeave={(e) => e.target.style.background = 'var(--accent-gradient)'}
                    >
                      Delete Event
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Post Details (Expanded view) */}
      {showPostDetailModal && selectedPost && (
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
            maxWidth: '650px',
            padding: '32px',
            background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => {
                setShowPostDetailModal(false);
                setIsEditingPost(false);
                setSelectedPost(null);
              }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#737373', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {isEditingPost ? (
              <form onSubmit={handleUpdatePost}>
                <h3 style={{ fontSize: '1.4rem', color: '#ffffff', fontWeight: 700, marginBottom: '20px' }}>Edit Post</h3>

                {editPostError && (
                  <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                    {editPostError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editPostTitle}
                    onChange={(e) => setEditPostTitle(e.target.value)}
                    style={{ background: 'rgba(5, 5, 5, 0.5)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Content *</label>
                  <textarea
                    required
                    rows="5"
                    className="form-input"
                    value={editPostContent}
                    onChange={(e) => setEditPostContent(e.target.value)}
                    style={{ background: 'rgba(5, 5, 5, 0.5)', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Replace Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => setEditPostFile(e.target.files[0])}
                    style={{ background: 'rgba(5, 5, 5, 0.5)', padding: '8px' }}
                  />
                  {selectedPost.image_url && !editPostFile && (
                    <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '6px' }}>
                      Current: {selectedPost.image_url.split('/').pop()}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingPost(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="glow-btn"
                    disabled={editPostSubmitting}
                    style={{ padding: '10px 24px', fontSize: '0.85rem' }}
                  >
                    {editPostSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {/* Top Left: Poster */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div
                    onClick={(e) => { e.stopPropagation(); handleOpenProfile(selectedPost.author_id); }}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--accent-gradient)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer'
                    }}>
                    {selectedPost.author_name ? selectedPost.author_name.slice(0, 2).toUpperCase() : 'AL'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4
                        onClick={(e) => { e.stopPropagation(); handleOpenProfile(selectedPost.author_id); }}
                        style={{ fontSize: '1rem', color: '#ffffff', margin: 0, fontWeight: 600, cursor: 'pointer' }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {selectedPost.author_name}
                      </h4>
                      <span style={{
                        background: (selectedPost.author_role === 'admin' || selectedPost.author_role === 'superadmin') ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: (selectedPost.author_role === 'admin' || selectedPost.author_role === 'superadmin') ? 'var(--primary)' : '#10b981',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {selectedPost.author_role}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#a3a3a3', margin: 0, marginTop: '2px' }}>
                      {selectedPost.author_position && `${selectedPost.author_position} at `}{selectedPost.author_company || 'Alumni Network'}
                      {selectedPost.author_graduation_year && ` • Class of ${selectedPost.author_graduation_year}`}
                      <span style={{ color: '#737373', marginLeft: '8px' }}>
                        • {new Date(selectedPost.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.4rem', color: '#ffffff', fontWeight: 700, marginBottom: '20px', lineHeight: '1.3' }}>
                  {selectedPost.title}
                </h3>

                {/* Image */}
                {selectedPost.image_url && (
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', maxHeight: '380px', marginBottom: '20px', background: 'rgba(0,0,0,0.2)' }}>
                    <img src={selectedPost.image_url} alt="Post Attachment" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', maxHeight: '380px', margin: '0 auto' }} />
                  </div>
                )}

                {/* Text */}
                <p style={{ color: '#d4d4d8', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {selectedPost.content}
                </p>

                {/* Summary Bar: Likes and Comments count */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '24px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.85rem',
                  color: '#a3a3a3'
                }}>
                  {/* Likes Info (Avatars + Count Clickable) */}
                  <div
                    className="likers-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeLikersPostId === selectedPost.id) {
                        setActiveLikersPostId(null);
                      } else {
                        setActiveLikersPostId(selectedPost.id);
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', position: 'relative' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {selectedPost.likers && selectedPost.likers.slice(0, 3).map((liker, i) => (
                        <div
                          key={liker.id}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'var(--accent-gradient)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.55rem',
                            fontWeight: 'bold',
                            border: '1.5px solid #111111',
                            marginLeft: i > 0 ? '-6px' : '0',
                            zIndex: 3 - i
                          }}
                          title={liker.name}
                        >
                          {liker.name ? liker.name.slice(0, 2).toUpperCase() : 'AL'}
                        </div>
                      ))}
                    </div>
                    <span
                      style={{ fontSize: '0.8rem', color: '#a3a3a3', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                      onMouseLeave={(e) => e.target.style.color = '#a3a3a3'}
                    >
                      {selectedPost.like_count || 0} {selectedPost.like_count === 1 ? 'like' : 'likes'}
                    </span>

                    {/* Inline scrollable popover inside detail modal */}
                    {activeLikersPostId === selectedPost.id && (
                      <div
                        className="likers-popover custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 8px)',
                          left: '0',
                          width: '260px',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          background: '#18191d',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                          padding: '12px',
                          zIndex: 50,
                          cursor: 'default',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', marginBottom: '4px' }}>
                          <span style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 600 }}>Liked by</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveLikersPostId(null); }}
                            style={{ background: 'transparent', border: 'none', color: '#a3a3a3', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        
                        {(!selectedPost.likers || selectedPost.likers.length === 0) ? (
                          <div style={{ color: '#737373', fontSize: '0.75rem', textAlign: 'center', padding: '6px' }}>No likes yet</div>
                        ) : (
                          selectedPost.likers.map((liker) => (
                            <div
                              key={liker.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.02)'
                              }}
                            >
                              {/* User Initials Circle */}
                              <div
                                onClick={(e) => { e.stopPropagation(); setActiveLikersPostId(null); handleOpenProfile(liker.id); }}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  background: 'var(--accent-gradient)',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  cursor: 'pointer',
                                  flexShrink: 0
                                }}
                              >
                                {liker.name ? liker.name.slice(0, 2).toUpperCase() : 'AL'}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left' }}>
                                <span
                                  onClick={(e) => { e.stopPropagation(); setActiveLikersPostId(null); handleOpenProfile(liker.id); }}
                                  style={{
                                    color: '#ffffff',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden'
                                  }}
                                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                  onMouseLeave={(e) => e.target.style.textDecoration = 'none' }
                                >
                                  {liker.name}
                                </span>
                                <span style={{ color: '#737373', fontSize: '0.65rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                  {liker.position && `${liker.position} at `}{liker.company || 'Alumni Network'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setShowComments(!showComments)}
                    style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#a3a3a3', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.target.style.color = '#a3a3a3'}
                  >
                    {selectedPost.comment_count || 0} {selectedPost.comment_count === 1 ? 'comment' : 'comments'}
                  </div>
                </div>

                {/* Interact Actions Bar: Like button, Comment button */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '12px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <button
                    onClick={() => handleToggleLike(selectedPost.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: selectedPost.is_liked ? 'var(--primary)' : '#a3a3a3',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      padding: '6px 12px',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                      if (!selectedPost.is_liked) e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      if (!selectedPost.is_liked) e.target.style.color = '#a3a3a3';
                    }}
                  >
                    <ThumbsUp size={16} fill={selectedPost.is_liked ? 'var(--primary)' : 'none'} />
                    Like
                  </button>

                  <button
                    onClick={() => setShowComments(!showComments)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: showComments ? '#ffffff' : '#a3a3a3',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      padding: '6px 12px',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      if (!showComments) e.target.style.color = '#a3a3a3';
                    }}
                  >
                    <MessageSquare size={16} />
                    Comment
                  </button>
                </div>

                {/* Comments Section (Expanded) */}
                {showComments && (
                  <div style={{ marginTop: '16px' }} className="animate-fade-in">
                    {/* Add comment Form */}
                    <form onSubmit={handleCreateComment} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="form-input"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        style={{
                          background: 'rgba(5, 5, 5, 0.5)',
                          borderRadius: '24px',
                          padding: '10px 16px',
                          fontSize: '0.85rem',
                          flexGrow: 1
                        }}
                        required
                      />
                      <button
                        type="submit"
                        className="glow-btn"
                        disabled={submittingComment}
                        style={{ borderRadius: '24px', padding: '8px 20px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                      >
                        {submittingComment ? 'Posting...' : 'Post'}
                      </button>
                    </form>

                    {/* Comments List */}
                    <h4 style={{ fontSize: '0.9rem', color: '#ffffff', marginBottom: '12px', fontWeight: 600 }}>Discussion</h4>
                    {loadingComments ? (
                      <p style={{ color: '#737373', fontSize: '0.85rem', textAlign: 'center', padding: '10px' }}>Loading comments...</p>
                    ) : comments.length === 0 ? (
                      <p style={{ color: '#737373', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>No comments yet. Be the first to share your thoughts!</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                        {comments.map((comment) => (
                          <div key={comment.id} style={{
                            display: 'flex',
                            gap: '10px',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.02)',
                            padding: '12px',
                            borderRadius: '8px'
                          }}>
                            <div
                              onClick={(e) => { e.stopPropagation(); handleOpenProfile(comment.user_id); }}
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'var(--accent-gradient)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                border: '1px solid rgba(255,255,255,0.1)',
                                flexShrink: 0,
                                cursor: 'pointer'
                              }}>
                              {comment.user_name ? comment.user_name.slice(0, 2).toUpperCase() : 'AL'}
                            </div>
                            <div style={{ flexGrow: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span
                                      onClick={(e) => { e.stopPropagation(); handleOpenProfile(comment.user_id); }}
                                      style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                    >
                                      {comment.user_name}
                                    </span>
                                    <span style={{
                                      background: (comment.user_role === 'admin' || comment.user_role === 'superadmin') ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                      color: (comment.user_role === 'admin' || comment.user_role === 'superadmin') ? 'var(--primary)' : '#10b981',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      fontSize: '0.55rem',
                                      fontWeight: 700,
                                      textTransform: 'uppercase'
                                    }}>{comment.user_role}</span>
                                  </div>
                                  <p style={{ fontSize: '0.65rem', color: '#737373', margin: 0, marginTop: '1px' }}>
                                    {comment.user_position && `${comment.user_position} at `}{comment.user_company || `Class of ${comment.user_graduation_year || 'Network'}`}
                                  </p>
                                </div>
                                <span style={{ fontSize: '0.65rem', color: '#737373' }}>
                                  {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.8rem', color: '#d4d4d8', margin: 0, marginTop: '8px', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Post Actions Footer */}
                <div style={{
                  marginTop: '32px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px'
                }}>
                  {(Number(user.id) === Number(selectedPost.author_id)) && (
                    <button
                      onClick={() => startEditingPost(selectedPost)}
                      style={{
                        padding: '8px 20px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        color: '#ffffff',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                    >
                      Edit Post
                    </button>
                  )}
                  {(Number(user.id) === Number(selectedPost.author_id) || user.role === 'admin' || user.role === 'superadmin') && (
                    <button
                      onClick={() => handleDeletePost(selectedPost.id)}
                      style={{
                        padding: '8px 20px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: 'none',
                        background: 'var(--accent-gradient)',
                        color: '#ffffff',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                      onMouseLeave={(e) => e.target.style.background = 'var(--accent-gradient)'}
                    >
                      Delete Post
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIKERS LIST MODAL OVERLAY */}
      {showLikersModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }} className="animate-fade-in" onClick={(e) => { e.stopPropagation(); setShowLikersModal(false); }}>
          <div className="glass-container" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            position: 'relative',
            maxHeight: '70vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLikersModal(false);
              }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#737373', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Likes</h4>
            {loadingLikers ? (
              <p style={{ color: '#737373', fontSize: '0.85rem', textAlign: 'center', padding: '10px' }}>Loading likes...</p>
            ) : likers.length === 0 ? (
              <p style={{ color: '#737373', fontSize: '0.85rem', textAlign: 'center', padding: '10px' }}>No likes yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {likers.map((liker) => (
                  <div key={liker.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      onClick={(e) => { e.stopPropagation(); handleOpenProfile(liker.id); }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer'
                      }}>
                      {liker.name ? liker.name.slice(0, 2).toUpperCase() : 'AL'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          onClick={(e) => { e.stopPropagation(); handleOpenProfile(liker.id); }}
                          style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 500, cursor: 'pointer' }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                          {liker.name}
                        </span>
                        <span style={{
                          background: (liker.role === 'admin' || liker.role === 'superadmin') ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: (liker.role === 'admin' || liker.role === 'superadmin') ? 'var(--primary)' : '#10b981',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.55rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>{liker.role}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#737373', margin: 0 }}>
                        {liker.position && `${liker.position} at `}{liker.company || `Class of ${liker.graduation_year || 'Network'}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB for New Post */}
      <button
        onClick={() => setShowCreatePostModal(true)}
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 90,
          transition: 'transform 0.2s ease, background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.backgroundColor = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'var(--accent-gradient)';
        }}
      >
        <PlusCircle size={28} />
      </button>

      {/* MODAL: Create Post */}
      {showCreatePostModal && (
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
            maxWidth: '550px',
            padding: '32px',
            background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowCreatePostModal(false);
                setSubmitSuccess('');
                setSubmitError('');
              }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#737373', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
              Create New Post
            </h3>

            {submitError && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.85rem', marginBottom: '16px' }}>
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleCreatePost}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  required
                  placeholder="Post Title"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ background: 'rgba(5, 5, 5, 0.5)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <textarea
                  required
                  placeholder="What's on your mind? Share updates, achievements, news..."
                  className="form-input"
                  rows="4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ background: 'rgba(5, 5, 5, 0.5)', resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Attach Image (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    key={postFile ? 'loaded' : 'empty'}
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => setPostFile(e.target.files[0])}
                    style={{ background: 'rgba(5, 5, 5, 0.5)', padding: '10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreatePostModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="glow-btn" disabled={submitting} style={{ padding: '10px 24px', fontSize: '0.85rem', gap: '8px' }}>
                  <Send size={14} />
                  {submitting ? 'Posting...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: Edit Post */}
      {isEditingPost && (
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
            maxWidth: '550px',
            padding: '32px',
            background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsEditingPost(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#737373', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
              Edit Post
            </h3>

            {editPostError && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                {editPostError}
              </div>
            )}

            <form onSubmit={handleUpdatePost}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  required
                  placeholder="Post Title"
                  className="form-input"
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  style={{ background: 'rgba(5, 5, 5, 0.5)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <textarea
                  required
                  placeholder="What's on your mind? Share updates, achievements, news..."
                  className="form-input"
                  rows="4"
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  style={{ background: 'rgba(5, 5, 5, 0.5)', resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Update Image (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    key={editPostFile ? 'loaded' : 'empty'}
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => setEditPostFile(e.target.files[0])}
                    style={{ background: 'rgba(5, 5, 5, 0.5)', padding: '10px' }}
                  />
                </div>
                {selectedPost?.image_url && !editPostFile && (
                  <p style={{ fontSize: '0.75rem', color: '#a3a3a3', marginTop: '6px' }}>Current image will be kept if no new file is uploaded.</p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingPost(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="glow-btn" disabled={editPostSubmitting} style={{ padding: '10px 24px', fontSize: '0.85rem', gap: '8px' }}>
                  {editPostSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE DETAIL MODAL */}
      {showProfileModal && selectedProfile && (
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
        }} className="animate-fade-in" onClick={() => setShowProfileModal(false)}>
          <div className="glass-container" onClick={(e) => e.stopPropagation()} style={{
            width: '100%',
            maxWidth: '500px',
            padding: '36px',
            background: 'linear-gradient(180deg, #180505 0%, #111111 100%)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            position: 'relative',
            textAlign: 'center'
          }}>
            <button
              onClick={() => setShowProfileModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#737373', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

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
                {selectedProfile.name ? selectedProfile.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              {selectedProfile.name}
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
              {selectedProfile.role === 'admin' ? 'Admin' : `Class of ${selectedProfile.graduation_year || 'Network'}`}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginBottom: '28px' }}>

              <div className="glass-container" style={{ padding: '16px', borderRadius: '10px', background: '#111216', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '6px' }}>
                  <Briefcase size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Professional Details</span>
                </div>
                {selectedProfile.company || selectedProfile.position ? (
                  <div style={{ fontSize: '0.85rem', color: '#a3a3a3' }}>
                    {selectedProfile.position && <p style={{ fontWeight: 500, color: '#ffffff', margin: 0 }}>{selectedProfile.position}</p>}
                    {selectedProfile.company && <p style={{ margin: 0 }}>at {selectedProfile.company}</p>}
                  </div>
                ) : (
                  <p style={{ color: '#737373', fontSize: '0.85rem', margin: 0 }}>No details specified</p>
                )}
              </div>

              <div className="glass-container" style={{ padding: '16px', borderRadius: '10px', background: '#111216', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '6px' }}>
                  <AlignLeft size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bio</span>
                </div>
                <p style={{ color: '#a3a3a3', fontSize: '0.85rem', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedProfile.bio || 'No biography written yet.'}
                </p>
              </div>

              <div className="glass-container" style={{ padding: '16px', borderRadius: '10px', background: '#111216', border: '1px solid rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '6px' }}>
                  <Mail size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</span>
                </div>
                <p style={{ color: '#a3a3a3', fontSize: '0.85rem', wordBreak: 'break-all', margin: 0 }}>
                  {selectedProfile.email}
                </p>
              </div>

            </div>

            {selectedProfile.linkedin_url && (
              <a
                href={selectedProfile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="glow-btn"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.85rem',
                  gap: '8px',
                  background: '#0077b5',
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

export default Dashboard;
