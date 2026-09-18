import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ComplaintCharts from '../../components/ComplaintCharts';
import { 
  FaListAlt, 
  FaPlusCircle, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaShieldAlt, 
  FaSearch, 
  FaFileDownload,
  FaUserCircle,
  FaTimes,
  FaImage
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, closed: 0, notProcessed: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await api.get('/complaint/student-complaints');
        const data = response.data || [];
        setComplaints(data);

        const s = { total: data.length, pending: 0, closed: 0, notProcessed: 0 };
        data.forEach((c) => {
          if (s[c.status] !== undefined) {
            s[c.status]++;
          }
        });
        setStats(s);
      } catch (err) {
        console.error('Failed to fetch complaints', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Filtered complaints based on search query and status filter
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        c._id.toLowerCase().includes(term) ||
        (c.complaint && c.complaint.toLowerCase().includes(term)) ||
        (c.complaintType?.name && c.complaintType.name.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [complaints, searchTerm, statusFilter]);

  // CSV Export utility
  const exportToCSV = () => {
    if (complaints.length === 0) return;
    const headers = ['Ticket ID', 'Category', 'Description', 'Has Photo', 'Date Logged', 'Status'];
    const rows = complaints.map((c) => [
      `"${c._id.slice(-6).toUpperCase()}"`,
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
    link.setAttribute('download', `GRS_Student_Grievances_${new Date().toISOString().slice(0,10)}.csv`);
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
      {/* Header Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1.25rem', 
        marginBottom: '2.5rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user?.picture ? (
            <img 
              src={user.picture} 
              alt={user.name} 
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #FFFFFF', boxShadow: 'var(--shadow-primary)' }} 
            />
          ) : (
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--primary)', 
              display: 'grid', 
              placeItems: 'center', 
              fontSize: '1.5rem', 
              fontWeight: '800' 
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : <FaUserCircle size={28} />}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontWeight: '700', 
                fontSize: '0.85rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em', 
                color: 'var(--primary)' 
              }}>
                Student Workspace
              </span>
              {user?.collegeCode && (
                <span style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: '800',
                  fontSize: '0.78rem',
                  padding: user?.collegeLogo ? '2px 9px 2px 4px' : '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(62, 63, 216, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {user.collegeLogo && (
                    <img 
                      src={user.collegeLogo} 
                      alt="College Logo" 
                      style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'contain', backgroundColor: '#FFFFFF' }} 
                    />
                  )}
                  {user.collegeCode}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '2.2rem', marginTop: '0.15rem', marginBottom: '0.2rem' }}>
              Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name || 'Student'}</span>
            </h2>
            <p style={{ color: 'var(--text-body)', margin: 0, fontSize: '0.92rem' }}>
              {user?.collegeName ? `${user.collegeName} • ` : ''}Real-time tracking of your concerns & institutional decisions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          {complaints.length > 0 && (
            <button 
              onClick={exportToCSV}
              className="btn btn-outline"
              title="Download CSV Report"
              style={{ padding: '0.75rem 1.3rem' }}
            >
              <FaFileDownload size={14} /> Export CSV
            </button>
          )}
          <Link to="/student/raise-complaint" className="btn btn-primary" style={{ padding: '0.75rem 1.6rem' }}>
            <FaPlusCircle size={15} /> Raise Grievance
          </Link>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ 
            background: 'var(--primary-light)', 
            color: 'var(--primary)', 
            width: '54px', 
            height: '54px', 
            borderRadius: '16px',
            display: 'grid',
            placeItems: 'center'
          }}>
            <FaListAlt size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '600' }}>Total Submitted</div>
            <h3 style={{ fontSize: '2rem', marginTop: '2px' }}>{stats.total}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ 
            background: 'var(--warning-bg)', 
            color: '#B45309', 
            width: '54px', 
            height: '54px', 
            borderRadius: '16px',
            display: 'grid',
            placeItems: 'center'
          }}>
            <FaClock size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '600' }}>In Progress / Pending</div>
            <h3 style={{ fontSize: '2rem', marginTop: '2px' }}>{stats.pending + stats.notProcessed}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.75rem' }}>
          <div style={{ 
            background: 'var(--success-bg)', 
            color: 'var(--success)', 
            width: '54px', 
            height: '54px', 
            borderRadius: '16px',
            display: 'grid',
            placeItems: 'center'
          }}>
            <FaCheckCircle size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '600' }}>Resolved & Closed</div>
            <h3 style={{ fontSize: '2rem', marginTop: '2px' }}>{stats.closed}</h3>
          </div>
        </div>
      </div>

      {/* Interactive Bar and Pie Analytics Charts */}
      {complaints.length > 0 && (
        <ComplaintCharts 
          complaints={complaints} 
          title="Personal Grievance Analytics" 
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
        <div style={{ position: 'relative', width: 'min(360px, 100%)' }}>
          <FaSearch style={{ position: 'absolute', left: '1.15rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by ticket ID or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '3rem', height: '44px', borderRadius: 'var(--radius-pill)', fontSize: '0.9rem' }}
          />
        </div>

        {/* Status Filter Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '0.4rem', 
          background: '#FFFFFF', 
          padding: '4px', 
          borderRadius: 'var(--radius-pill)', 
          border: '1px solid var(--border)' 
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

      {/* Complaints List Table */}
      <div className="table-container">
        <div style={{ 
          padding: '1.5rem 2rem', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.35rem' }}>Your Grievance Records</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Latest submissions and status reports</span>
          </div>
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: '700', 
            background: 'var(--primary-light)', 
            color: 'var(--primary)', 
            padding: '4px 12px', 
            borderRadius: '9999px' 
          }}>
            {filteredComplaints.length} of {complaints.length} Records
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading grievance records...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '1.25rem', opacity: 0.4 }}>
                <FaShieldAlt size={54} />
              </div>
              <h4 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                {complaints.length === 0 ? "No grievances registered" : "No records match your filters"}
              </h4>
              <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', marginBottom: '1.75rem', maxWidth: '400px', margin: '0 auto 1.75rem' }}>
                {complaints.length === 0 
                  ? "You have not submitted any complaints yet. If you have an academic, hostel, or campus issue, create one now."
                  : "Try clearing your search query or selecting 'All Cases' to see your grievances."
                }
              </p>
              {complaints.length === 0 ? (
                <Link to="/student/raise-complaint" className="btn btn-primary">
                  <FaPlusCircle size={14} /> Raise Grievance
                </Link>
              ) : (
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
                  <th>Ticket ID</th>
                  <th>Category</th>
                  <th>Photo Evidence</th>
                  <th>Grievance Statement</th>
                  <th>Date Logged</th>
                  <th>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      #{c._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-heading)' }}>
                      {c.complaintType?.name || 'General Issue'}
                    </td>
                    <td>
                      {c.image ? (
                        <div 
                          onClick={() => setSelectedEvidence({
                            url: c.image,
                            title: `${c.complaintType?.name || 'Grievance'} Evidence - #${c._id.slice(-6).toUpperCase()}`,
                            complaint: c.complaint
                          })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                          title="Click to view full photo"
                        >
                          <img 
                            src={c.image} 
                            alt="Evidence" 
                            style={{ 
                              width: '44px', 
                              height: '44px', 
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
                          <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>View</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No photo</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.complaint}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {new Date(c.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ verticalAlign: 'middle' }}>
                      {getStatusBadge(c.status)}
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
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '640px',
              width: '100%',
              overflow: 'hidden',
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
                  Your uploaded photo evidence
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

            <div style={{ padding: '1.25rem 1.75rem', backgroundColor: 'var(--surface)' }}>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                <strong>Your Grievance:</strong> {selectedEvidence.complaint}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
