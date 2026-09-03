import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaUserCircle, FaSignOutAlt, FaHome, FaPlusCircle, FaListAlt } from 'react-icons/fa';
import logo from '../assets/image.png';
const Navbar = () => {
    const { user, role, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, marginBottom: '2rem', padding: '1rem 0' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <div style={{ color: 'white', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                       <img src={logo} alt="logo" style={{ width: '50px', height: '50px' }} />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>GRS Portal</span>
                </Link>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaHome /> Home
                    </Link>

                    {!user ? (
                        <>
                            <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1.25rem' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Register</Link>
                        </>
                    ) : (
                        <>
                            {role === 'student' && (
                                <>
                                    <Link to="/student/dashboard" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaListAlt /> Dashboard
                                    </Link>
                                    <Link to="/student/raise-complaint" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaPlusCircle /> Raise Complaint
                                    </Link>
                                </>
                            )}
                            
                            {role === 'admin' && (
                                <>
                                    <Link to="/admin/dashboard" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        Dashboard
                                    </Link>
                                </>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaUserCircle size={20} color="var(--primary)" />
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name || 'Admin'}</span>
                                </div>
                                <button onClick={handleLogout} className="btn" style={{ background: 'transparent', color: 'var(--error)', padding: '4px', fontSize: '1.2rem', display: 'flex' }} title="Logout">
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <style >{`
                .nav-link:hover {
                    color: var(--primary) !important;
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
