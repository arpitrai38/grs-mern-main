import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  FaPlusCircle, 
  FaCommentAlt, 
  FaTags, 
  FaShieldAlt, 
  FaArrowLeft, 
  FaCamera, 
  FaUpload, 
  FaTimes, 
  FaImage 
} from 'react-icons/fa';

const RaiseComplaint = () => {
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [formData, setFormData] = useState({
    complaintType: '',
    complaint: ''
  });
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await api.get('/complaintType/get-all');
        setComplaintTypes(response.data || []);
      } catch (err) {
        console.error('Failed to fetch complaint types', err);
        setError('Failed to load complaint categories. Please check your connection.');
      }
    };
    fetchTypes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Client-side image resize & compression
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
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

  // Image Upload selection
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file);
      setImage(compressedDataUrl);
    } catch (err) {
      console.error('Failed to process image', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/complaint/create', {
        ...formData,
        image
      });
      setSuccess('Grievance & evidence photo lodged successfully! Authorities have been notified.');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade" style={{ maxWidth: '840px', paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <button 
          onClick={() => navigate('/student/dashboard')}
          className="btn btn-outline"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}
        >
          <FaArrowLeft size={12} /> Back to Dashboard
        </button>

        <span style={{ 
          fontFamily: 'var(--font-heading)', 
          fontWeight: '700', 
          fontSize: '0.85rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          color: 'var(--primary)' 
        }}>
          Direct Submission Channel
        </span>
        <h2 style={{ fontSize: '2.3rem', marginTop: '0.25rem', marginBottom: '0.4rem' }}>
          Raise a Campus Grievance
        </h2>
        <p style={{ color: 'var(--text-body)' }}>
          Your submission is confidential, assigned directly to the committee, and tracked under official SLA timelines.
        </p>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        {error && (
          <div style={{ 
            background: 'var(--danger-bg)', 
            color: 'var(--danger)', 
            padding: '0.85rem 1.2rem', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '1.75rem',
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
            marginBottom: '1.75rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category Dropdown */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ fontSize: '1rem' }}>
              Select Complaint Category
            </label>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Choose the department or area closest to your concern for faster routing (e.g. Mess & Food, Hostel, Academic).
            </p>

            <div style={{ position: 'relative' }}>
              <FaTags style={{ 
                position: 'absolute', 
                left: '1.15rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} />
              <select 
                name="complaintType" 
                className="form-control" 
                style={{ paddingLeft: '3rem', height: '52px' }} 
                value={formData.complaintType} 
                onChange={handleChange} 
                required
              >
                <option value="">Choose category (e.g. Mess, Hostel, Academic, Facilities)...</option>
                {complaintTypes.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed Statement */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" style={{ fontSize: '1rem' }}>
              Detailed Grievance Statement
            </label>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Include facts, dates, location (e.g., Dining Hall #2, Room 304), and specific details.
            </p>

            <div style={{ position: 'relative' }}>
              <FaCommentAlt style={{ 
                position: 'absolute', 
                left: '1.15rem', 
                top: '1.15rem', 
                color: 'var(--text-muted)' 
              }} />
              <textarea 
                name="complaint" 
                className="form-control" 
                style={{ paddingLeft: '3rem', minHeight: '150px', lineHeight: '1.6' }} 
                placeholder="Describe your issue with clarity (e.g., Food served in hostel mess was cold and unhygienic on Friday lunch...)"
                value={formData.complaint} 
                onChange={handleChange} 
                required
              />
            </div>
          </div>

          {/* Evidence Photo Upload Section */}
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaCamera color="var(--primary)" /> Attach Evidence Photo (Optional)
            </label>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.9rem' }}>
              Attach a photo to corroborate your issue (e.g., mess food quality, damaged facility, receipt, or schedule notice).
            </p>

            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-subtle)',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                }}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: '#FFFFFF', 
                  color: 'var(--primary)',
                  display: 'grid', 
                  placeItems: 'center', 
                  margin: '0 auto 0.75rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <FaUpload size={18} />
                </div>
                <div style={{ fontWeight: '700', color: 'var(--text-heading)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  Click to choose a photo or drag & drop
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  PNG, JPG, or WEBP (Photos are automatically optimized for instant upload)
                </div>
              </div>
            ) : (
              /* Image Attached Preview Box */
              <div style={{
                position: 'relative',
                display: 'inline-block',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '2px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
                backgroundColor: '#FFFFFF',
                padding: '0.5rem'
              }}>
                <img 
                  src={image} 
                  alt="Evidence Preview" 
                  style={{ 
                    display: 'block', 
                    maxWidth: '260px', 
                    maxHeight: '200px', 
                    borderRadius: '12px', 
                    objectFit: 'cover' 
                  }} 
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  title="Remove image"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <FaTimes size={13} />
                </button>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '700', marginTop: '0.4rem', textAlign: 'center' }}>
                  ✓ Evidence photo attached
                </div>
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '1rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid var(--border)' 
          }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => navigate('/student/dashboard')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ minWidth: '180px' }}
            >
              {loading ? 'Submitting...' : <><FaPlusCircle size={14} /> Submit Grievance</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseComplaint;
