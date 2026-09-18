import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaBuilding, FaCalendarAlt, FaTags, FaPlus, FaTrash, FaArrowLeft } from 'react-icons/fa';

const ManageEntities = () => {
  const [activeTab, setActiveTab] = useState('colleges');
  const [entities, setEntities] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const endpoints = {
    colleges: { fetch: '/college/get-all', create: '/college/create', delete: '/college/delete', label: 'College' },
    sessions: { fetch: '/session/get-all', create: '/session/create', delete: '/session/delete', label: 'Session' },
    types: { fetch: '/complaintType/get-all', create: '/complaintType/create', delete: '/complaintType/delete', label: 'Complaint Type' }
  };

  const fetchEntities = async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoints[activeTab].fetch);
      setEntities(res.data || []);
    } catch (err) {
      console.error('Failed to fetch entities', err);
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
      alert('Failed to create entry. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entity?')) return;
    try {
      await api.delete(`${endpoints[activeTab].delete}/${id}`);
      fetchEntities();
    } catch (err) {
      alert('Failed to delete entity. It might currently be in use by student records.');
    }
  };

  return (
    <div className="container animate-fade" style={{ paddingTop: '2.5rem', paddingBottom: '4.5rem' }}>
      <button 
        onClick={() => navigate('/admin/dashboard')}
        className="btn btn-outline"
        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}
      >
        <FaArrowLeft size={12} /> Back to Console
      </button>

      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ 
          fontFamily: 'var(--font-heading)', 
          fontWeight: '700', 
          fontSize: '0.85rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em', 
          color: 'var(--primary)' 
        }}>
          System Configuration
        </span>
        <h2 style={{ fontSize: '2.2rem', marginTop: '0.25rem', marginBottom: '0.35rem' }}>
          Entity & Department Management
        </h2>
        <p style={{ color: 'var(--text-body)' }}>
          Configure institutions, academic calendars, and grievance classification taxonomy.
        </p>
      </div>

      {/* Modern Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.85rem', 
        marginBottom: '2.5rem', 
        paddingBottom: '1.25rem', 
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        <button 
          className={`btn ${activeTab === 'colleges' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('colleges')}
          style={{ padding: '0.65rem 1.4rem' }}
        >
          <FaBuilding size={14} /> Affiliated Colleges
        </button>
        <button 
          className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('sessions')}
          style={{ padding: '0.65rem 1.4rem' }}
        >
          <FaCalendarAlt size={14} /> Academic Sessions
        </button>
        <button 
          className={`btn ${activeTab === 'types' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('types')}
          style={{ padding: '0.65rem 1.4rem' }}
        >
          <FaTags size={14} /> Complaint Categories
        </button>
      </div>

      <div className="grid grid-2" style={{ gap: '2.5rem', alignItems: 'start' }}>
        {/* Create Form Card */}
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.35rem' }}>
            Add New {endpoints[activeTab].label}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.75rem' }}>
            Enter details to add this entity to student registration & filing dropdowns.
          </p>

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">{endpoints[activeTab].label} Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder={`e.g. ${activeTab === 'colleges' ? 'Faculty of Engineering & Technology' : activeTab === 'sessions' ? '2025 - 2026' : 'Hostel & Residential Amenities'}`}
                value={newItem.name} 
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Brief Description</label>
              <textarea 
                className="form-control" 
                style={{ minHeight: '100px' }}
                placeholder="Key details or scope of this entity..."
                value={newItem.description} 
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              <FaPlus size={13} /> Create {endpoints[activeTab].label}
            </button>
          </form>
        </div>

        {/* Existing Entries Card */}
        <div className="table-container">
          <div style={{ 
            padding: '1.25rem 1.75rem', 
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '1.2rem' }}>Registered {endpoints[activeTab].label}s</h3>
            <span style={{ 
              fontSize: '0.8rem', 
              fontWeight: '700', 
              background: 'var(--primary-light)', 
              color: 'var(--primary)', 
              padding: '3px 10px', 
              borderRadius: '9999px' 
            }}>
              {entities.length} Items
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading entries...
            </div>
          ) : entities.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No entries found. Use the form to add the first record.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {entities.map((item) => (
                <li 
                  key={item._id} 
                  style={{ 
                    padding: '1.25rem 1.75rem', 
                    borderBottom: '1px solid var(--border)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {activeTab === 'colleges' && (
                      item.logo ? (
                        <img 
                          src={item.logo} 
                          alt={item.name} 
                          style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'contain', backgroundColor: '#FFFFFF', border: '1px solid var(--border)', padding: '3px', flexShrink: 0 }} 
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <FaBuilding size={18} />
                        </div>
                      )
                    )}
                    <div>
                      <h4 style={{ fontSize: '1.05rem', marginBottom: '0.2rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {item.name}
                        {item.code && (
                          <span style={{ fontSize: '0.72rem', fontWeight: '800', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
                            {item.code}
                          </span>
                        )}
                      </h4>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', margin: 0 }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <button 
                    className="logout-btn" 
                    onClick={() => handleDelete(item._id)}
                    title="Delete Entity"
                    aria-label="Delete Entity"
                  >
                    <FaTrash size={13} />
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
