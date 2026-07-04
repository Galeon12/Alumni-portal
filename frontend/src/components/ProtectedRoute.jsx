import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireProfileCompleted = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#020617',
        color: '#f8fafc',
        fontSize: '1.25rem',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          border: '4px solid rgba(99, 102, 241, 0.1)',
          borderLeftColor: '#6366f1',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '10px'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireProfileCompleted && !user.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};


export default ProtectedRoute;
