import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FaGraduationCap, FaEnvelope, FaLock, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

const Login = () => {
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
      const response = await api.post('/student/login', { email, password });
      const { token, student } = response.data;
      login(token, student, 'student');
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper animate-fade">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{ 
            background: 'var(--primary)', 
            color: '#FFFFFF', 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            display: 'grid', 
            placeItems: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <FaGraduationCap size={32} />
          </div>
          <h2 style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>Student Sign In</h2>
          <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
            Access your student grievance dashboard
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
            <label className="form-label">College Email Address</label>
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
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.75rem' }}>
            <span style={{ color: 'var(--primary)', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer' }}>
              Forgot Password?
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginBottom: '1.75rem' }}
          >
            {loading ? 'Authenticating...' : <>Sign In to Portal <FaArrowRight size={14} /></>}
          </button>

          <div style={{ 
            textAlign: 'center', 
            fontSize: '0.92rem', 
            color: 'var(--text-body)',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
