import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  FaUniversity, 
  FaUserShield, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBarcode, 
  FaArrowRight, 
  FaCheckCircle, 
  FaShieldAlt,
  FaFileAlt,
  FaUpload,
  FaImage,
  FaTimes
} from 'react-icons/fa';

const CollegeRegister = () => {
  const [formData, setFormData] = useState({
    collegeName: '',
    collegeCode: '',
    collegeEmail: '',
    contactNumber: '',
    address: '',
    description: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: ''
  });

  const [collegeLogo, setCollegeLogo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'collegeCode') {
      // Auto-capitalize and strip non-alphanumeric
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Canvas-based image compression (max 800x800, JPEG 85%)
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = (err) => reject(err);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleLogoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setCollegeLogo(compressed);
    } catch (err) {
      console.error('Failed to compress college logo', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCollegeLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCollegeLogo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/college/register', {
        collegeName: formData.collegeName,
        collegeCode: formData.collegeCode,
        collegeEmail: formData.collegeEmail,
        contactNumber: formData.contactNumber,
        address: formData.address,
        description: formData.description,
        logo: collegeLogo,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        password: formData.password
      });

      const { token, admin } = response.data;
      if (token && admin) {
        login(token, admin, 'admin');
        navigate('/admin/dashboard');
      } else {
        navigate('/admin/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Institution onboarding failed. Please verify the submitted details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper animate-fade" style={{ paddingTop: '2.5rem', paddingBottom: '4.5rem' }}>
      <div className="auth-card auth-card-wide" style={{ maxWidth: '860px', borderTop: '4px solid var(--primary)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)', 
            color: '#FFFFFF', 
            width: '68px', 
            height: '68px', 
            borderRadius: '20px', 
            display: 'grid', 
            placeItems: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <FaUniversity size={32} />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-heading)', 
            fontWeight: '700', 
            fontSize: '0.85rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            color: 'var(--primary)' 
          }}>
            Multi-Tenant Institution Onboarding
          </span>
          <h2 style={{ fontSize: '2.2rem', marginTop: '0.2rem', marginBottom: '0.4rem' }}>
            Register Your College
          </h2>
          <p style={{ color: 'var(--text-body)', fontSize: '0.96rem', maxWidth: '520px', margin: '0 auto' }}>
            Deploy an isolated institutional workspace with dedicated administration, student records, and grievance tracking.
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'var(--danger-bg)', 
            color: 'var(--danger)', 
            padding: '0.9rem 1.25rem', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1.75rem',
            fontSize: '0.92rem',
            fontWeight: '500',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Section 1: Institution Details */}
          <div style={{ marginBottom: '2.25rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              marginBottom: '1.25rem', 
              paddingBottom: '0.5rem', 
              borderBottom: '1px solid var(--border)' 
            }}>
              <FaUniversity style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-heading)' }}>
                1. Institutional Profile
              </h3>
            </div>

            <div className="grid grid-2" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">College / University Name *</label>
                <input 
                  type="text" 
                  name="collegeName"
                  className="form-control" 
                  placeholder="e.g. Apex Institute of Technology"
                  value={formData.collegeName}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  College Code / Unique Tenant ID *
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '6px' }}>(e.g. COL003, IITB)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <FaBarcode style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    name="collegeCode"
                    className="form-control" 
                    style={{ paddingLeft: '3rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}
                    placeholder="e.g. COL003"
                    value={formData.collegeCode}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Official College Email *</label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    name="collegeEmail"
                    className="form-control" 
                    style={{ paddingLeft: '3rem' }}
                    placeholder="contact@institution.edu"
                    value={formData.collegeEmail}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contact / Helpline Number</label>
                <div style={{ position: 'relative' }}>
                  <FaPhone style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="tel" 
                    name="contactNumber"
                    className="form-control" 
                    style={{ paddingLeft: '3rem' }}
                    placeholder="+91 98765 43210"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Campus Address</label>
              <div style={{ position: 'relative' }}>
                <FaMapMarkerAlt style={{ position: 'absolute', left: '1.15rem', top: '1.1rem', color: 'var(--text-muted)' }} />
                <textarea 
                  name="address"
                  className="form-control" 
                  rows="2"
                  style={{ paddingLeft: '3rem', resize: 'vertical' }}
                  placeholder="Campus Address, City, State, Postal Code"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* College Logo / Emblem Upload */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  Official College Logo / Institutional Crest
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '6px' }}>(Recommended)</span>
                </span>
                {collegeLogo && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '700' }}>
                    <FaCheckCircle style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Logo Ready
                  </span>
                )}
              </label>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                padding: '1.25rem',
                background: 'var(--surface)',
                border: collegeLogo ? '2px solid var(--primary-light)' : '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap',
                transition: 'border-color 0.2s ease, background 0.2s ease'
              }}>
                {collegeLogo ? (
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img 
                      src={collegeLogo} 
                      alt="College Logo Preview" 
                      style={{ 
                        width: '84px', 
                        height: '84px', 
                        objectFit: 'contain', 
                        borderRadius: '16px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid var(--border)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                        padding: '6px'
                      }} 
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      title="Remove Logo"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'var(--danger)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                      }}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <div style={{ 
                    width: '84px', 
                    height: '84px', 
                    borderRadius: '16px', 
                    border: '2px dashed var(--border)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--text-muted)',
                    backgroundColor: '#FFFFFF',
                    flexShrink: 0
                  }}>
                    <FaImage size={32} />
                  </div>
                )}

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoSelect} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline"
                      style={{ padding: '0.55rem 1.15rem', fontSize: '0.86rem', gap: '0.5rem' }}
                    >
                      <FaUpload size={13} /> {collegeLogo ? 'Replace Logo File' : 'Choose Logo / Crest Image'}
                    </button>
                    {collegeLogo && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="btn btn-outline"
                        style={{ padding: '0.55rem 0.95rem', fontSize: '0.86rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        <FaTimes size={13} /> Clear
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    Upload your institution's official emblem, seal, or logo (PNG, JPG, WebP). It will be featured on the admin console, navigation bar, and student records.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Master Administrator */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              marginBottom: '1.25rem', 
              paddingBottom: '0.5rem', 
              borderBottom: '1px solid var(--border)' 
            }}>
              <FaUserShield style={{ color: 'var(--text-heading)' }} />
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-heading)' }}>
                2. Master Administrator Credentials
              </h3>
            </div>

            <div className="grid grid-2" style={{ gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Administrator Full Name *</label>
                <input 
                  type="text" 
                  name="adminName"
                  className="form-control" 
                  placeholder="e.g. Dr. Rajesh Khanna (Dean of Student Affairs)"
                  value={formData.adminName}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Admin Login Email *</label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    name="adminEmail"
                    className="form-control" 
                    style={{ paddingLeft: '3rem' }}
                    placeholder="admin@institution.edu"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    name="password"
                    className="form-control" 
                    style={{ paddingLeft: '3rem' }}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    name="confirmPassword"
                    className="form-control" 
                    style={{ paddingLeft: '3rem' }}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Tenant Isolation Guarantee */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <FaShieldAlt size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
              <strong>Strict Tenant Isolation:</strong> Your college's grievances, student records, and reports are cryptographically isolated and accessible solely by authorized administrators belonging to your unique College ID.
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', marginBottom: '1.5rem' }}
          >
            {loading ? 'Creating Institutional Workspace...' : <>Complete College Registration <FaArrowRight size={14} /></>}
          </button>

          <div style={{ 
            textAlign: 'center', 
            fontSize: '0.92rem', 
            color: 'var(--text-body)',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)'
          }}>
            Already registered your institution?{' '}
            <Link to="/admin/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>
              College Admin Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollegeRegister;
