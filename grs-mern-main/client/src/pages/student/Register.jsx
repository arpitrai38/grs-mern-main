import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FaGraduationCap, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaArrowRight, 
  FaCalendar, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCity, 
  FaBuilding, 
  FaBook 
} from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', fatherName: '', email: '', gender: 'Male', password: '',
    address: '', mobile: '', dob: '', sessionId: '', city: '',
    pincode: '', course: '', collegeId: '', picture: ''
  });
  const [colleges, setColleges] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [collegeRes, sessionRes] = await Promise.all([
          api.get('/college/get-all'),
          api.get('/session/get-all')
        ]);
        setColleges(collegeRes.data || []);
        setSessions(sessionRes.data || []);
      } catch (err) {
        console.error('Failed to fetch dropdown data', err);
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/student/register', formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper animate-fade">
      <div className="auth-card auth-card-wide">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
          <h2 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Student Registration</h2>
          <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
            Join the grievance redressal network with verified college credentials
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

        {success && (
          <div style={{ 
            background: 'var(--success-bg)', 
            color: 'var(--success)', 
            padding: '0.85rem 1.2rem', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-2">
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                name="name" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                placeholder="e.g. Aarav Sharma"
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Father's Name */}
          <div className="form-group">
            <label className="form-label">Father's Name</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                name="fatherName" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                placeholder="Father's full name"
                value={formData.fatherName} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">College Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                name="email" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                placeholder="student@college.edu"
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                name="password" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                placeholder="Create secure password"
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select name="gender" className="form-control" value={formData.gender} onChange={handleChange} required>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <div style={{ position: 'relative' }}>
              <FaCalendar style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="date" 
                name="dob" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                value={formData.dob} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <FaPhone style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="tel" 
                name="mobile" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                placeholder="+91 9876543210"
                value={formData.mobile} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <div style={{ position: 'relative' }}>
              <FaMapMarkerAlt style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                name="address" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                placeholder="Street address or hostel block"
                value={formData.address} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* City */}
          <div className="form-group">
            <label className="form-label">City</label>
            <div style={{ position: 'relative' }}>
              <FaCity style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                name="city" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                placeholder="e.g. New Delhi"
                value={formData.city} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Pincode */}
          <div className="form-group">
            <label className="form-label">Pincode</label>
            <div style={{ position: 'relative' }}>
              <FaMapMarkerAlt style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                name="pincode" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                placeholder="6-digit postal code"
                value={formData.pincode} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* College */}
          <div className="form-group">
            <label className="form-label">College / Institution</label>
            <div style={{ position: 'relative' }}>
              <FaBuilding style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select 
                name="collegeId" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                value={formData.collegeId} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Affiliated College / Institution</option>
                {colleges.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {formData.collegeId && (() => {
              const sel = colleges.find(c => c._id === formData.collegeId);
              if (!sel) return null;
              return (
                <div style={{
                  marginTop: '0.65rem',
                  padding: '0.55rem 0.85rem',
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  {sel.logo ? (
                    <img 
                      src={sel.logo} 
                      alt={sel.name} 
                      style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain', backgroundColor: '#FFFFFF', border: '1px solid var(--border)', padding: '2px' }} 
                    />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                      <FaBuilding size={16} />
                    </div>
                  )}
                  <div style={{ fontSize: '0.82rem', lineHeight: 1.3 }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-heading)' }}>{sel.name}</div>
                    <div style={{ color: 'var(--text-muted)' }}>Tenant ID: <strong style={{ color: 'var(--primary)' }}>{sel.code}</strong></div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Course */}
          <div className="form-group">
            <label className="form-label">Academic Course</label>
            <div style={{ position: 'relative' }}>
              <FaBook style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                name="course" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                placeholder="e.g. B.Tech Computer Science"
                value={formData.course} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Session */}
          <div className="form-group">
            <label className="form-label">Academic Session</label>
            <div style={{ position: 'relative' }}>
              <FaCalendar style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select 
                name="sessionId" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                value={formData.sessionId} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Academic Session</option>
                {sessions.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Profile Picture */}
          <div className="form-group">
            <label className="form-label">Profile Picture URL (Optional)</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="url" 
                name="picture" 
                className="form-control" 
                style={{ paddingLeft: '3rem' }} 
                placeholder="https://example.com/photo.jpg" 
                value={formData.picture} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', marginBottom: '1.5rem' }}
            >
              {loading ? 'Creating Student Record...' : <>Create Student Account <FaArrowRight size={14} /></>}
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.92rem', color: 'var(--text-body)' }}>
              Already registered with an institution?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                Sign In here
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
