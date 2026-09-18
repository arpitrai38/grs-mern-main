import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaCamera, 
  FaShieldAlt, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCity, 
  FaBuilding, 
  FaBook, 
  FaCalendar,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaUpload
} from 'react-icons/fa';

// Preset avatar options for instant one-click selection
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
];

const Profile = () => {
  const { user, role, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'security'

  // Profile data state
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  // Profile image upload ref
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = role === 'admin' ? '/admin/profile/me' : '/student/profile/me';
        const res = await api.get(endpoint);
        setProfileData(res.data);
      } catch (err) {
        console.warn('Direct profile endpoint fallback:', err);
        // Fallback to user from auth context or by id
        if (user && (user.id || user._id) && role === 'student') {
          try {
            const fallbackRes = await api.get(`/student/${user.id || user._id}`);
            setProfileData(fallbackRes.data);
            return;
          } catch (e) {
            console.error('Fallback fetch error:', e);
          }
        }
        setProfileData(user || {});
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [role, user]);

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({ ...(prev || {}), [e.target.name]: e.target.value }));
  };

  // Resize and compress image using HTML5 Canvas
  const compressImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.85) => {
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

      img.onerror = (error) => reject(error);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Image Upload handler with instant compression
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file);
      setProfileData((prev) => ({ ...(prev || {}), picture: compressedDataUrl }));
      setStatusMessage({ 
        type: 'success', 
        text: 'Photo selected! Click "Save Profile Changes" below to update your account.' 
      });
    } catch (err) {
      console.error('Image compression failed', err);
      // Direct reader fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...(prev || {}), picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const endpoint = role === 'admin' ? '/admin/profile/update' : '/student/profile/update';
      let res;

      try {
        res = await api.put(endpoint, profileData);
      } catch (firstErr) {
        // If 404 on endpoint, fallback to /student/:id
        if (firstErr.response && firstErr.response.status === 404 && role === 'student') {
          const studentId = user?.id || user?._id || profileData?._id;
          if (studentId) {
            res = await api.put(`/student/${studentId}`, profileData);
            res.data = { student: res.data, profile: res.data };
          } else {
            throw firstErr;
          }
        } else {
          throw firstErr;
        }
      }
      
      const updatedUser = role === 'admin' 
        ? (res.data.admin || res.data) 
        : (res.data.student || res.data);

      if (updatedUser) {
        updateUser(updatedUser);
      }

      setStatusMessage({ type: 'success', text: 'Profile details and picture updated successfully!' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Save profile error:', err);
      setStatusMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile. Please verify your connection.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setChangingPass(true);
    try {
      const endpoint = role === 'admin' ? '/admin/profile/change-password' : '/student/profile/change-password';
      await api.put(endpoint, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setStatusMessage({ type: 'success', text: 'Password has been changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Change password error:', err);
      setStatusMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update password. Please check your current password.' 
      });
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading user profile...
      </div>
    );
  }

  const avatarSrc = profileData?.picture || user?.picture;
  const displayName = profileData?.name || user?.name || (role === 'admin' ? 'Administrator' : 'Student');

  return (
    <div className="container animate-fade" style={{ maxWidth: '920px', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Profile Header Banner */}
      <div className="card" style={{ 
        padding: '2.5rem', 
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #FFFFFF 0%, var(--bg-page) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Avatar with Upload button */}
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: '800',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-primary)',
              border: '4px solid #FFFFFF'
            }}>
              {avatarSrc ? (
                <img 
                  src={avatarSrc} 
                  alt={displayName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Quick Camera Upload Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload new picture"
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                border: '2px solid #FFFFFF',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <FaCamera size={14} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>

          {/* User Meta */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>{displayName}</h2>
              <span style={{ 
                background: role === 'admin' ? 'var(--text-heading)' : 'var(--primary)', 
                color: '#FFFFFF', 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                padding: '3px 10px', 
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {role}
              </span>
            </div>
            <p style={{ color: 'var(--text-body)', margin: '0 0 0.5rem 0', fontSize: '0.95rem' }}>
              {profileData?.email || user?.email}
            </p>
            {(profileData?.collegeId?.name || user?.collegeName) && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '0.2rem', padding: '4px 10px', background: 'var(--surface)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)' }}>
                {(profileData?.collegeId?.logo || user?.collegeLogo) && (
                  <img 
                    src={profileData?.collegeId?.logo || user?.collegeLogo} 
                    alt="College Logo" 
                    style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'contain', backgroundColor: '#FFFFFF' }} 
                  />
                )}
                <span style={{ fontSize: '0.82rem', color: 'var(--text-heading)', fontWeight: '600' }}>
                  {role === 'student' && profileData?.course ? `${profileData.course} • ` : ''}
                  {profileData?.collegeId?.name || user?.collegeName}
                  {(profileData?.collegeId?.code || user?.collegeCode) && (
                    <span style={{ color: 'var(--primary)', marginLeft: '4px', fontWeight: '800' }}>
                      ({profileData?.collegeId?.code || user?.collegeCode})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage.text && (
        <div style={{ 
          background: statusMessage.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)', 
          color: statusMessage.type === 'success' ? 'var(--success)' : 'var(--danger)', 
          padding: '0.9rem 1.25rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '2rem',
          fontSize: '0.92rem',
          fontWeight: '600',
          border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.85rem', 
        marginBottom: '2rem', 
        borderBottom: '1px solid var(--border)', 
        paddingBottom: '1rem' 
      }}>
        <button 
          className={`btn ${activeTab === 'details' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('details')}
          style={{ padding: '0.65rem 1.4rem' }}
        >
          <FaUser size={14} /> Profile Information
        </button>
        <button 
          className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('security')}
          style={{ padding: '0.65rem 1.4rem' }}
        >
          <FaKey size={14} /> Password & Security
        </button>
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === 'details' && (
        <div className="card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>Personal Information</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Update your public profile photo and contact records.
          </p>

          <form onSubmit={handleSaveProfile}>
            {/* Quick Avatar Presets */}
            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                Choose Avatar Preset or Upload Your Own Photo
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setProfileData((prev) => ({ ...(prev || {}), picture: p }))}
                    style={{
                      border: profileData?.picture === p ? '3px solid var(--primary)' : '2px solid var(--border)',
                      borderRadius: '50%',
                      padding: '2px',
                      background: 'none',
                      cursor: 'pointer',
                      width: '48px',
                      height: '48px',
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease, border-color 0.2s ease'
                    }}
                  >
                    <img src={p} alt={`Avatar ${idx + 1}`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem', height: '44px' }}
                >
                  <FaUpload size={13} /> Upload File
                </button>
              </div>
            </div>

            {/* Picture URL manual input */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Or Image URL</label>
              <div style={{ position: 'relative' }}>
                <FaCamera style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="url" 
                  name="picture" 
                  className="form-control" 
                  style={{ paddingLeft: '3rem' }} 
                  placeholder="https://example.com/photo.jpg"
                  value={profileData?.picture || ''} 
                  onChange={handleProfileChange} 
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '1.5rem' }}>
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
                    value={profileData?.name || ''} 
                    onChange={handleProfileChange} 
                    required 
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    name="email" 
                    className="form-control" 
                    style={{ paddingLeft: '3rem', backgroundColor: role === 'student' ? 'var(--bg-subtle)' : '#FFFFFF' }} 
                    value={profileData?.email || ''} 
                    onChange={handleProfileChange}
                    readOnly={role === 'student'} 
                    required 
                  />
                </div>
              </div>

              {/* Student Specific Fields */}
              {role === 'student' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Father's Name</label>
                    <input 
                      type="text" 
                      name="fatherName" 
                      className="form-control" 
                      value={profileData?.fatherName || ''} 
                      onChange={handleProfileChange} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <div style={{ position: 'relative' }}>
                      <FaPhone style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="tel" 
                        name="mobile" 
                        className="form-control" 
                        style={{ paddingLeft: '3rem' }} 
                        value={profileData?.mobile || ''} 
                        onChange={handleProfileChange} 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Residential Address</label>
                    <div style={{ position: 'relative' }}>
                      <FaMapMarkerAlt style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        name="address" 
                        className="form-control" 
                        style={{ paddingLeft: '3rem' }} 
                        value={profileData?.address || ''} 
                        onChange={handleProfileChange} 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <div style={{ position: 'relative' }}>
                      <FaCity style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        name="city" 
                        className="form-control" 
                        style={{ paddingLeft: '3rem' }} 
                        value={profileData?.city || ''} 
                        onChange={handleProfileChange} 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal Pincode</label>
                    <input 
                      type="text" 
                      name="pincode" 
                      className="form-control" 
                      value={profileData?.pincode || ''} 
                      onChange={handleProfileChange} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course / Program</label>
                    <div style={{ position: 'relative' }}>
                      <FaBook style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        name="course" 
                        className="form-control" 
                        style={{ paddingLeft: '3rem' }} 
                        value={profileData?.course || ''} 
                        onChange={handleProfileChange} 
                      />
                    </div>
                  </div>

                  {/* College & Session (Read-Only) */}
                  <div className="form-group">
                    <label className="form-label">College Affiliation</label>
                    <div style={{ position: 'relative' }}>
                      <FaBuilding style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        className="form-control" 
                        style={{ paddingLeft: '3rem', backgroundColor: 'var(--bg-subtle)' }} 
                        value={profileData?.collegeId?.name || 'Assigned Institution'} 
                        readOnly 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Session</label>
                    <div style={{ position: 'relative' }}>
                      <FaCalendar style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        className="form-control" 
                        style={{ paddingLeft: '3rem', backgroundColor: 'var(--bg-subtle)' }} 
                        value={profileData?.sessionId?.name || 'Active Session'} 
                        readOnly 
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
                style={{ minWidth: '180px' }}
              >
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Change Password & Security */}
      {activeTab === 'security' && (
        <div className="card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>Security & Password</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Ensure your account is protected with a secure password.
          </p>

          <form onSubmit={handleChangePassword} style={{ maxWidth: '520px' }}>
            {/* Current Password */}
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type={showCurrent ? 'text' : 'password'} 
                  className="form-control" 
                  style={{ paddingLeft: '3rem', paddingRight: '3rem' }} 
                  placeholder="Enter current password"
                  value={passwordData.currentPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{ 
                    position: 'absolute', 
                    right: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showCurrent ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type={showNew ? 'text' : 'password'} 
                  className="form-control" 
                  style={{ paddingLeft: '3rem', paddingRight: '3rem' }} 
                  placeholder="At least 6 characters"
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{ 
                    position: 'absolute', 
                    right: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showNew ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="form-control" 
                  style={{ paddingLeft: '3rem' }} 
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword} 
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={changingPass}
              style={{ minWidth: '180px' }}
            >
              {changingPass ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
