import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FaListAlt, FaUsers, FaCheckCircle, FaExclamationCircle, FaUserShield, FaBuilding, FaLayerGroup } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalCom: 0, pending: 0, closed: 0, notProcessed: 0, totalStu: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compRes, stuRes] = await Promise.all([
                    api.get('/complaint/get-all'),
                    api.get('/student/all')
                ]);
                
                setComplaints(compRes.data);
                setStudents(stuRes.data);
                
                const s = { totalCom: compRes.data.length, pending: 0, closed: 0, notProcessed: 0, totalStu: stuRes.data.length };
                compRes.data.forEach(c => s[c.status]++);
                setStats(s);
            } catch (err) {
                console.error("Failed to fetch admin data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/complaint/update-status/${id}`, { status: newStatus });
            // Update local state
            setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));
            // Recalculate stats quickly locally or let it be (simplified for now)
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="container animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem' }}>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>System Overview and Grievance Management.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/admin/manage-entities" className="btn btn-outline">
                        <FaBuilding style={{ marginRight: '8px' }} /> Setup Entities
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-3" style={{ marginBottom: '2.5rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ background: '#DC2626', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <FaListAlt size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.25rem' }}>Total Grievances</p>
                        <h3 style={{ fontSize: '1.75rem' }}>{stats.totalCom}</h3>
                    </div>
                </div>
                
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ background: '#F59E0B', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <FaExclamationCircle size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.25rem' }}>Action Needed</p>
                        <h3 style={{ fontSize: '1.75rem' }}>{stats.pending + stats.notProcessed}</h3>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <FaUsers size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.25rem' }}>Registered Students</p>
                        <h3 style={{ fontSize: '1.75rem' }}>{stats.totalStu}</h3>
                    </div>
                </div>
            </div>

            {/* All Complaints Table */}
            <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>All Grievances</h3>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading system data...</div>
                    ) : complaints.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <h4 style={{ color: 'var(--text-muted)' }}>No grievances found in system.</h4>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--background)' }}>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Student / ID</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Type</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Description</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Date</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Current Status</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((c) => (
                                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontWeight: '500' }}>{c.studentId?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{c._id.slice(-6).toUpperCase()}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{c.complaintType?.name || 'Unknown'}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.complaint}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{ 
                                                background: c.status === 'closed' ? '#D1FAE5' : c.status === 'pending' ? '#FEF3C7' : '#F1F5F9',
                                                color: c.status === 'closed' ? '#059669' : c.status === 'pending' ? '#D97706' : '#475569',
                                                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600'
                                            }}>
                                                {c.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <select 
                                                className="form-control" 
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', width: 'auto' }}
                                                value={c.status}
                                                onChange={(e) => updateStatus(c._id, e.target.value)}
                                            >
                                                <option value="notProcessed">Not Processed</option>
                                                <option value="pending">Pending</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </td>
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

export default AdminDashboard;
