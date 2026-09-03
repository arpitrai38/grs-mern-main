import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaBuilding, FaCalendarAlt, FaTags, FaPlus, FaTrash } from 'react-icons/fa';

const ManageEntities = () => {
    const [activeTab, setActiveTab] = useState('colleges');
    const [entities, setEntities] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);

    const endpoints = {
        colleges: { fetch: '/college/get-all', create: '/college/create', delete: '/college/delete' },
        sessions: { fetch: '/session/get-all', create: '/session/create', delete: '/session/delete' },
        types: { fetch: '/complaintType/get-all', create: '/complaintType/create', delete: '/complaintType/delete' }
    };

    const fetchEntities = async () => {
        setLoading(true);
        try {
            const res = await api.get(endpoints[activeTab].fetch);
            setEntities(res.data);
        } catch (err) {
            console.error("Failed to fetch entities", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntities();
        setNewItem({ name: '', description: '' });
    }, [activeTab]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post(endpoints[activeTab].create, newItem);
            setNewItem({ name: '', description: '' });
            fetchEntities();
        } catch (err) {
            alert('Failed to create entity');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`${endpoints[activeTab].delete}/${id}`);
            fetchEntities();
        } catch (err) {
            alert('Failed to delete entity. It might be in use.');
        }
    };

    return (
        <div className="container animate-fade">
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Entity Management</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configure Colleges, Academic Sessions, and Complaint Categories.</p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <button 
                    className={`btn ${activeTab === 'colleges' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('colleges')}
                    style={{ gap: '0.5rem' }}
                >
                    <FaBuilding /> Colleges
                </button>
                <button 
                    className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('sessions')}
                    style={{ gap: '0.5rem' }}
                >
                    <FaCalendarAlt /> Sessions
                </button>
                <button 
                    className={`btn ${activeTab === 'types' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('types')}
                    style={{ gap: '0.5rem' }}
                >
                    <FaTags /> Complaint Types
                </button>
            </div>

            <div className="grid grid-2" style={{ gap: '2rem' }}>
                {/* Create Form */}
                <div className="card glass">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Add New {activeTab === 'colleges' ? 'College' : activeTab === 'sessions' ? 'Session' : 'Complaint Type'}</h3>
                    <form onSubmit={handleCreate}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={newItem.name} 
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea 
                                className="form-control" 
                                rows="3"
                                value={newItem.description} 
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '0.5rem' }}>
                            <FaPlus /> Create Entry
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Existing Entries</h3>
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : entities.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No entries found.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {entities.map(item => (
                                <li key={item._id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.description}</p>
                                    </div>
                                    <button 
                                        className="btn btn-outline" 
                                        style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem' }}
                                        onClick={() => handleDelete(item._id)}
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageEntities;
