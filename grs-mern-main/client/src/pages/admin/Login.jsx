import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FaUserShield, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/admin/login', { email, password });
      const { token, admin } = response.data;
      login(token, admin, 'admin');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper animate-fade">
      <div className="auth-card" style={{ borderTop: '4px solid var(--text-heading)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{ 
            background: 'var(--text-heading)', 
            color: '#FFFFFF', 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            display: 'grid', 
            placeItems: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 10px 25px rgba(30, 34, 41, 0.25)'
          }}>
            <FaUserShield size={30} />
          </div>
          <h2 style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>Admin Console</h2>
          <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
            Authorized campus personnel login
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'var(--danger-bg)', 
            color: 'var(--danger)', 
            padding: '0.85rem 1.2rem', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Administrator Email</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ 
                position: 'absolute', 
                left: '1.15rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} />
              <input 
                type="email" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }}
                placeholder="admin@grs.college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ 
                position: 'absolute', 
                left: '1.15rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} />
              <input 
                type="password" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-dark" 
            disabled={loading}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginBottom: '1.75rem' }}
          >
            {loading ? 'Verifying Authorization...' : <>Open Console <FaArrowRight size={14} /></>}
          </button>

          <div style={{ 
            textAlign: 'center', 
            fontSize: '0.92rem', 
            color: 'var(--text-body)',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <div>
              New Institution?{' '}
              <Link to="/register-college" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                Register Your College
              </Link>
            </div>
            <div>
              Are you a student?{' '}
              <Link to="/login" style={{ color: 'var(--text-heading)', fontWeight: '600' }}>
                Student Sign In
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
