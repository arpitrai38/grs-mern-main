import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ComplaintCharts from '../../components/ComplaintCharts';
import { 
  FaListAlt, 
  FaUsers, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaSlidersH, 
  FaShieldAlt, 
  FaSearch, 
  FaFileDownload, 
  FaUserShield, 
  FaTimes, 
  FaImage,
  FaCamera,
  FaUpload,
  FaTrash,
  FaPlus,
  FaCheck
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, updateUser } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collegeData, setCollegeData] = useState(null);
  const [stats, setStats] = useState({ totalCom: 0, pending: 0, closed: 0, notProcessed: 0, totalStu: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  // College Logo Modification State
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [tempLogo, setTempLogo] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);
  const [logoModalError, setLogoModalError] = useState('');
  const [bannerNotice, setBannerNotice] = useState(null);
  const logoFileRef = useRef(null);

  // Canvas-based image compression for college logo
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

  const openLogoModal = () => {
    setTempLogo(collegeData?.logo || user?.collegeLogo || '');
    setLogoModalError('');
    setShowLogoModal(true);
  };

  const handleLogoFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setTempLogo(compressed);
      setLogoModalError('');
    } catch (err) {
      console.error('Failed to compress logo', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveTempLogo = () => {
    setTempLogo('');
    if (logoFileRef.current) {
      logoFileRef.current.value = '';
    }
  };

  const handleSaveLogo = async () => {
    setSavingLogo(true);
    setLogoModalError('');
    try {
      await api.put('/college/update-my-college', { logo: tempLogo });
      const updatedLogo = tempLogo;
      
      setCollegeData(prev => ({ ...(prev || {}), logo: updatedLogo }));
      updateUser({ collegeLogo: updatedLogo });
      
      setBannerNotice({
        type: 'success',
        text: updatedLogo ? 'Institutional crest updated successfully!' : 'Institutional crest removed successfully!'
      });
      setTimeout(() => setBannerNotice(null), 4000);
      setShowLogoModal(false);
    } catch (err) {
      console.error('Failed to update college logo', err);
      setLogoModalError(err.response?.data?.message || 'Failed to update logo. Please try again.');
    } finally {
      setSavingLogo(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, stuRes, colRes] = await Promise.all([
          api.get('/complaint/get-all'),
          api.get('/student/all'),
          api.get('/college/my-college').catch(() => ({ data: null }))
        ]);
        
        const compData = compRes.data || [];
        const stuData = stuRes.data || [];

        setComplaints(compData);
        setStudents(stuData);
        
        if (colRes?.data) {
          setCollegeData(colRes.data);
          if (colRes.data.logo && (!user?.collegeLogo || user.collegeLogo !== colRes.data.logo)) {
            updateUser({ collegeLogo: colRes.data.logo });
          }
        }
        
        const s = { totalCom: compData.length, pending: 0, closed: 0, notProcessed: 0, totalStu: stuData.length };
        compData.forEach(c => {
          if (s[c.status] !== undefined) {
            s[c.status]++;
          }
        });
        setStats(s);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/complaint/update-status/${id}`, { status: newStatus });
      setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert('Failed to update status. Please try again.');
    }
  };

  // Filtered complaints based on search query and status filter
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        c._id.toLowerCase().includes(term) ||
        (c.studentId?.name && c.studentId.name.toLowerCase().includes(term)) ||
        (c.complaint && c.complaint.toLowerCase().includes(term)) ||
        (c.complaintType?.name && c.complaintType.name.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [complaints, searchTerm, statusFilter]);

  // CSV Export utility for administrators
  const exportToCSV = () => {
    if (complaints.length === 0) return;
    const headers = ['Ticket ID', 'Student Name', 'Category', 'Description', 'Has Photo', 'Date Logged', 'Status'];
    const rows = complaints.map((c) => [
      `"${c._id.slice(-6).toUpperCase()}"`,
      `"${c.studentId?.name || 'Unknown'}"`,
      `"${c.complaintType?.name || 'General'}"`,
      `"${c.complaint ? c.complaint.replace(/"/g, '""') : ''}"`,
      `"${c.image ? 'Yes' : 'No'}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
      `"${c.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GRS_Master_Grievances_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') {
      return (
        <span 
          className="status-pill status-pill-pending"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.42rem 0.95rem',
            borderRadius: '9999px',
            backgroundColor: '#D97706',
            color: '#FFFFFF',
            fontSize: '0.84rem',
            fontWeight: '800',
            letterSpacing: '0.02em',
            boxShadow: '0 2px 6px rgba(217, 119, 6, 0.35)',
            border: '1px solid #B45309',
            whiteSpace: 'nowrap',
            lineHeight: 1.2
          }}
        >
          <FaClock size={13} style={{ flexShrink: 0, color: '#FFFFFF' }} />
          <span style={{ color: '#FFFFFF', fontWeight: '800' }}>Pending</span>
        </span>
      );
    }
    if (s === 'closed' || s === 'resolved') {
      return (
        <span 
          className="status-pill status-pill-closed"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.42rem 0.95rem',
            borderRadius: '9999px',
            backgroundColor: '#059669',
            color: '#FFFFFF',
            fontSize: '0.84rem',
            fontWeight: '800',
            letterSpacing: '0.02em',
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.35)',
            border: '1px solid #047857',
            whiteSpace: 'nowrap',
            lineHeight: 1.2
          }}
        >
          <FaCheckCircle size={13} style={{ flexShrink: 0, color: '#FFFFFF' }} />
          <span style={{ color: '#FFFFFF', fontWeight: '800' }}>Closed</span>
        </span>
      );
    }
    return (
      <span 
        className="status-pill status-pill-unprocessed"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.42rem 0.95rem',
          borderRadius: '9999px',
          backgroundColor: '#475569',
          color: '#FFFFFF',
          fontSize: '0.84rem',
          fontWeight: '800',
          letterSpacing: '0.02em',
          boxShadow: '0 2px 6px rgba(71, 85, 105, 0.25)',
          border: '1px solid #334155',
          whiteSpace: 'nowrap',
          lineHeight: 1.2
        }}
      >
        <FaExclamationCircle size={13} style={{ flexShrink: 0, color: '#FFFFFF' }} />
        <span style={{ color: '#FFFFFF', fontWeight: '800' }}>In Review</span>
      </span>
    );
  };

  return (
    <div className="container animate-fade" style={{ paddingTop: '2.5rem', paddingBottom: '4.5rem' }}>
      {/* Banner Notice */}
      {bannerNotice && (
        <div style={{ 
          background: bannerNotice.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)', 
          color: bannerNotice.type === 'success' ? 'var(--success)' : 'var(--danger)', 
          padding: '0.9rem 1.25rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1.75rem',
          fontSize: '0.92rem',
          fontWeight: '600',
          border: `1px solid ${bannerNotice.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{bannerNotice.text}</span>
          <button 
            onClick={() => setBannerNotice(null)} 
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <FaTimes size={14} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1.25rem', 
        marginBottom: '2.5rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {(collegeData?.logo || user?.collegeLogo) ? (
            <div 
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={openLogoModal}
              title="Click to modify or remove College Logo"
            >
              <img 
                src={collegeData?.logo || user?.collegeLogo} 
                alt={user?.collegeName || 'College Logo'} 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '18px', 
                  objectFit: 'contain', 
                  backgroundColor: '#FFFFFF', 
                  border: '2px solid var(--border)', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  padding: '4px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }} 
              />
              <div
                title="Modify Logo"
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'grid',
                  placeItems: 'center',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  zIndex: 2
                }}
              >
                <FaCamera size={11} />
              </div>
            </div>
          ) : (
            <div 
              onClick={openLogoModal}
              title="Click to upload College Logo"
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '18px', 
                border: '2px dashed var(--primary)', 
                backgroundColor: 'var(--primary-light)', 
                color: 'var(--primary)', 
                display: 'grid', 
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <FaPlus size={16} />
                <div style={{ fontSize: '0.62rem', fontWeight: '800', marginTop: '2px' }}>+ LOGO</div>
              </div>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontWeight: '700', 
                fontSize: '0.85rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em', 
                color: 'var(--primary)' 
              }}>
                Institutional Oversight
              </span>
              {user?.collegeCode && (
                <span style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: '800',
                  fontSize: '0.78rem',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(62, 63, 216, 0.25)'
                }}>
                  {user.collegeCode}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '2.2rem', marginTop: '0.15rem', marginBottom: '0.2rem' }}>
              {collegeData?.name || user?.collegeName || 'Executive Dashboard'}
            </h2>
            <p style={{ color: 'var(--text-body)', margin: 0, fontSize: '0.92rem' }}>
              {user?.name ? `Logged in as ${user.name} • ` : ''}Institution-scoped grievance records, student registrations, and resolution metrics.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button 
            onClick={openLogoModal}
            className="btn btn-outline"
            title="Modify Institutional Logo"
            style={{ padding: '0.75rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FaCamera size={14} /> Modify Logo
          </button>
          {complaints.length > 0 && (
            <button 
              onClick={exportToCSV}
              className="btn btn-outline"
              title="Download Master CSV Report"
              style={{ padding: '0.75rem 1.3rem' }}
            >
              <FaFileDownload size={14} /> Export Master CSV
            </button>
          )}
          <Link to="/admin/manage-entities" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem' }}>
            <FaSlidersH size={14} /> Configure Entities
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ 
            background: 'var(--primary-light)', 
            color: 'var(--primary)', 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px',
            display: 'grid',
            placeItems: 'center'
          }}>
            <FaListAlt size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '600' }}>Total Grievances</div>
            <h3 style={{ fontSize: '2.1rem', marginTop: '2px' }}>{stats.totalCom}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ 
            background: 'var(--warning-bg)', 
            color: '#B45309', 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px',
            display: 'grid',
            placeItems: 'center'
          }}>
            <FaExclamationCircle size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '600' }}>Action Needed</div>
            <h3 style={{ fontSize: '2.1rem', marginTop: '2px' }}>{stats.pending + stats.notProcessed}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ 
            background: '#E0E7FF', 
            color: '#4338CA', 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px',
            display: 'grid',
            placeItems: 'center'
          }}>
            <FaUsers size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '600' }}>Enrolled Students</div>
            <h3 style={{ fontSize: '2.1rem', marginTop: '2px' }}>{stats.totalStu}</h3>
          </div>
        </div>
      </div>

      {/* Interactive Bar & Pie Charts */}
      {complaints.length > 0 && (
        <ComplaintCharts 
          complaints={complaints} 
          title="Institutional Grievance Analytics" 
        />
      )}

      {/* Search & Filter Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem', 
        marginBottom: '1.25rem' 
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: 'min(380px, 100%)' }}>
          <FaSearch style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by student, ticket ID, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '3rem', height: '44px', borderRadius: 'var(--radius-pill)', fontSize: '0.9rem' }}
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="filter-pill-group" style={{ 
          display: 'flex', 
          gap: '0.4rem', 
          background: '#FFFFFF', 
          padding: '4px', 
          borderRadius: 'var(--radius-pill)', 
          border: '1px solid var(--border)',
          overflowX: 'auto',
          maxWidth: '100%',
          WebkitOverflowScrolling: 'touch'
        }}>
          {['all', 'notProcessed', 'pending', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                border: 'none',
                background: statusFilter === st ? 'var(--primary)' : 'transparent',
                color: statusFilter === st ? '#FFFFFF' : 'var(--text-body)',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
            >
              {st === 'all' ? 'All Cases' : st === 'notProcessed' ? 'In Review' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Master Grievances Table */}
      <div className="table-container">
        <div style={{ 
          padding: '1.5rem 2rem', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.35rem' }}>Master Grievance Registry</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Complete cross-department complaint tracking</span>
          </div>
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: '700', 
            background: 'var(--primary-light)', 
            color: 'var(--primary)', 
            padding: '4px 12px', 
            borderRadius: '9999px' 
          }}>
            {filteredComplaints.length} of {complaints.length} Cases
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading institutional records...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.3 }}>
                <FaShieldAlt size={54} />
              </div>
              <h4 style={{ color: 'var(--text-heading)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                {complaints.length === 0 ? "No grievances registered" : "No cases match your filters"}
              </h4>
              <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {complaints.length === 0 
                  ? "All student issues are presently cleared or no cases have been lodged."
                  : "Try clearing your search query or selecting 'All Cases'."
                }
              </p>
              {complaints.length > 0 && (
                <button 
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} 
                  className="btn btn-outline"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student / ID</th>
                  <th>Department / Category</th>
                  <th>Photo Evidence</th>
                  <th>Grievance Statement</th>
                  <th>Date Logged</th>
                  <th>Current Status</th>
                  <th>Triage Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-heading)' }}>
                        {c.studentId?.name || 'Student'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                        #{c._id.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-heading)' }}>
                      {c.complaintType?.name || 'General'}
                    </td>
                    {/* Photo Evidence Thumbnail */}
                    <td>
                      {c.image ? (
                        <div 
                          onClick={() => setSelectedEvidence({
                            url: c.image,
                            title: `${c.complaintType?.name || 'Grievance'} Evidence - #${c._id.slice(-6).toUpperCase()}`,
                            complaint: c.complaint,
                            student: c.studentId?.name || 'Student'
                          })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                          title="Click to zoom evidence photo"
                        >
                          <img 
                            src={c.image} 
                            alt="Evidence" 
                            style={{ 
                              width: '46px', 
                              height: '46px', 
                              borderRadius: '10px', 
                              objectFit: 'cover', 
                              border: '2px solid var(--border)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                              transition: 'transform 0.2s ease, border-color 0.2s ease'
                            }} 
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.borderColor = 'var(--primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                          />
                          <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>View Photo</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No photo</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.complaint}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {getStatusBadge(c.status)}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      <select 
                        className="form-control" 
                        style={{ 
                          height: '38px', 
                          padding: '0.35rem 0.85rem', 
                          fontSize: '0.85rem', 
                          fontWeight: '700',
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: 'var(--radius-pill)',
                          width: 'auto',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}
                        value={c.status}
                        onChange={(e) => updateStatus(c._id, e.target.value)}
                      >
                        <option value="notProcessed" style={{ color: '#0F172A', fontWeight: '700' }}>In Review</option>
                        <option value="pending" style={{ color: '#0F172A', fontWeight: '700' }}>Pending</option>
                        <option value="closed" style={{ color: '#0F172A', fontWeight: '700' }}>Closed / Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Lightbox Evidence Photo Modal */}
      {selectedEvidence && (
        <div 
          onClick={() => setSelectedEvidence(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="evidence-modal-box"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: 'min(640px, 95vw)',
              maxHeight: '92vh',
              width: '100%',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{ 
              padding: '1.25rem 1.75rem', 
              borderBottom: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-heading)' }}>
                  {selectedEvidence.title}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Submitted by {selectedEvidence.student}
                </span>
              </div>
              <button 
                onClick={() => setSelectedEvidence(null)}
                className="logout-btn"
                style={{ width: '32px', height: '32px' }}
                title="Close"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div style={{ 
              padding: '1.25rem', 
              backgroundColor: '#0F172A', 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img 
                src={selectedEvidence.url} 
                alt="Evidence Full View" 
                style={{ 
                  maxHeight: '440px', 
                  maxWidth: '100%', 
                  objectFit: 'contain', 
                  borderRadius: '8px' 
                }} 
              />
            </div>

            <div style={{ padding: '1.25rem 1.75rem', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.35rem' }}>
                Complaint Description:
              </div>
              <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', margin: 0, lineHeight: 1.6 }}>
                {selectedEvidence.complaint}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Logo & Branding Management Modal */}
      {showLogoModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}
        >
          <div 
            className="card animate-fade evidence-modal-box" 
            style={{ 
              maxWidth: 'min(520px, 95vw)', 
              maxHeight: '92vh',
              width: '100%', 
              padding: '0', 
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              borderRadius: '20px'
            }}
          >
            {/* Modal Header */}
            <div style={{ 
              padding: '1.5rem 1.75rem', 
              borderBottom: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-heading)' }}>
                  Institutional Crest & Logo
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {collegeData?.name || user?.collegeName} {user?.collegeCode ? `(${user.collegeCode})` : ''}
                </span>
              </div>
              <button 
                onClick={() => setShowLogoModal(false)}
                className="logout-btn"
                style={{ width: '32px', height: '32px' }}
                title="Close"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div style={{ padding: '2rem 1.75rem' }}>
              {logoModalError && (
                <div style={{ 
                  background: 'var(--danger-bg)', 
                  color: 'var(--danger)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1.25rem',
                  fontSize: '0.88rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  {logoModalError}
                </div>
              )}

              {/* Logo Preview Container */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.75rem' 
              }}>
                <div style={{ 
                  width: '124px', 
                  height: '124px', 
                  borderRadius: '24px', 
                  backgroundColor: '#FFFFFF', 
                  border: '2px solid var(--border)', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                  display: 'grid',
                  placeItems: 'center',
                  padding: '10px',
                  marginBottom: '1rem',
                  position: 'relative'
                }}>
                  {tempLogo ? (
                    <img 
                      src={tempLogo} 
                      alt="Logo Preview" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain', 
                        borderRadius: '16px' 
                      }} 
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <FaImage size={40} />
                      <div style={{ fontSize: '0.75rem', marginTop: '6px', fontWeight: '700' }}>No Logo Set</div>
                    </div>
                  )}
                </div>

                <span style={{ 
                  fontSize: '0.82rem', 
                  fontWeight: '700', 
                  color: tempLogo ? 'var(--primary)' : 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  {tempLogo ? 'Ready to Apply' : 'No Emblem Configured'}
                </span>
              </div>

              {/* Upload & Remove Controls */}
              <input 
                type="file" 
                ref={logoFileRef} 
                onChange={handleLogoFileSelect} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />

              <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <button 
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.3rem', fontSize: '0.9rem', gap: '0.5rem' }}
                >
                  <FaUpload size={13} /> {tempLogo ? 'Replace With New File' : 'Upload Crest Image'}
                </button>

                {tempLogo && (
                  <button 
                    type="button"
                    onClick={handleRemoveTempLogo}
                    className="btn btn-outline"
                    style={{ padding: '0.65rem 1.1rem', fontSize: '0.9rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)', gap: '0.5rem' }}
                  >
                    <FaTrash size={13} /> Remove Logo
                  </button>
                )}
              </div>

              <div style={{ 
                fontSize: '0.82rem', 
                color: 'var(--text-muted)', 
                textAlign: 'center', 
                lineHeight: 1.5,
                background: 'var(--surface)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}>
                Upload PNG, JPG, or WebP. The crest will be automatically compressed and immediately synchronized across the header, navigation pill, and student portals.
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ 
              padding: '1.25rem 1.75rem', 
              borderTop: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '0.85rem',
              backgroundColor: 'var(--surface)'
            }}>
              <button 
                type="button"
                onClick={() => setShowLogoModal(false)}
                className="btn btn-outline"
                disabled={savingLogo}
                style={{ padding: '0.65rem 1.2rem' }}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveLogo}
                className="btn btn-primary"
                disabled={savingLogo}
                style={{ padding: '0.65rem 1.5rem' }}
              >
                {savingLogo ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
