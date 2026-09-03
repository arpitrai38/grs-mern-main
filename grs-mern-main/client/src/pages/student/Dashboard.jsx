import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FaListAlt, FaPlusCircle, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Dashboard = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, closed: 0, notProcessed: 0 });

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await api.get('/complaint/student-complaints');
                setComplaints(response.data);
                
                // Calculate stats
                const s = { total: response.data.length, pending: 0, closed: 0, notProcessed: 0 };
                response.data.forEach(c => s[c.status]++);
                setStats(s);
            } catch (err) {
                console.error("Failed to fetch complaints", err);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span style={{ background: '#FEF3C7', color: '#D97706', padding: '0.25rem 0.75rem', borderRadius: 'full', fontSize: '0.875rem', fontWeight: '600', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaClock /> Pending</span>;
            case 'closed':
                return <span style={{ background: '#D1FAE5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: 'full', fontSize: '0.875rem', fontWeight: '600', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaCheckCircle /> Closed</span>;
            default:
                return <span style={{ background: '#F1F5F9', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: 'full', fontSize: '0.875rem', fontWeight: '600', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaExclamationCircle /> Not Processed</span>;
        }
    };

    return (
        <div className="container animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem' }}>Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name}</span></h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Here is an overview of your grievances.</p>
                </div>
                <Link to="/student/raise-complaint" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                    <FaPlusCircle /> Raise New Complaint
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-3" style={{ marginBottom: '2.5rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <FaListAlt size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.25rem' }}>Total Complaints</p>
                        <h3 style={{ fontSize: '1.75rem' }}>{stats.total}</h3>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ background: '#F59E0B', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <FaClock size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.25rem' }}>Pending</p>
                        <h3 style={{ fontSize: '1.75rem' }}>{stats.pending + stats.notProcessed}</h3>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ background: 'var(--success)', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <FaCheckCircle size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.25rem' }}>Resolved</p>
                        <h3 style={{ fontSize: '1.75rem' }}>{stats.closed}</h3>
                    </div>
                </div>
            </div>

            {/* Complaints List */}
            <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Recent Grievances</h3>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading complaints...</div>
                    ) : complaints.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}><FaExclamationCircle size={48} opacity={0.2} /></div>
                            <h4 style={{ color: 'var(--text-muted)' }}>No grievances found</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>You haven't raised any complaints yet.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--background)' }}>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>ID</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Type</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Description</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Date</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c) => (
                                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '500' }}>#{c._id.slice(-6).toUpperCase()}</td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{c.complaintType?.name || 'Unknown'}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.complaint}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{getStatusBadge(c.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
