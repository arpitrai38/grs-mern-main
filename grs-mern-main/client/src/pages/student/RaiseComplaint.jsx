import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaPlusCircle, FaArrowRight, FaCommentAlt, FaTags } from 'react-icons/fa';

const RaiseComplaint = () => {
    const [complaintTypes, setComplaintTypes] = useState([]);
    const [formData, setFormData] = useState({
        complaintType: '',
        complaint: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await api.get('/complaintType/get-all');
                setComplaintTypes(response.data);
            } catch (err) {
                console.error("Failed to fetch complaint types", err);
                setError('Failed to load complaint categories. Please try again later.');
            }
        };
        fetchTypes();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/complaint/create', formData);
            setSuccess('Grievance submitted successfully!');
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade" style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem' }}>Raise a Grievance</h2>
                <p style={{ color: 'var(--text-muted)' }}>Fill out the form below to submit a new complaint. Please be as detailed as possible.</p>
            </div>

            <div className="card glass">
                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>{error}</div>}
                {success && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>Complaint Category</label>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Select the category that best fits your issue.</p>
                        
                        <div style={{ position: 'relative' }}>
                            <FaTags style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <select 
                                name="complaintType" 
                                className="form-control" 
                                style={{ paddingLeft: '2.75rem', paddingRight: '1rem', height: '3rem', fontSize: '1rem' }} 
                                value={formData.complaintType} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Select a category...</option>
                                {complaintTypes.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>Complaint Description</label>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Provide a detailed explanation of your problem.</p>
                        
                        <div style={{ position: 'relative' }}>
                            <FaCommentAlt style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-muted)' }} />
                            <textarea 
                                name="complaint" 
                                className="form-control" 
                                style={{ paddingLeft: '2.75rem', minHeight: '150px', resize: 'vertical', paddingTop: '1rem' }} 
                                placeholder="Describe your issue here..."
                                value={formData.complaint} 
                                onChange={handleChange} 
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/student/dashboard')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '150px' }}>
                            {loading ? 'Submitting...' : <><FaPlusCircle style={{ marginRight: '8px' }}/> Submit Grievance</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RaiseComplaint;
