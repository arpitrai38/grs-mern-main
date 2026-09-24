import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaUserCircle, 
  FaSignOutAlt, 
  FaHome, 
  FaPlusCircle, 
  FaListAlt, 
  FaSlidersH, 
  FaShieldAlt, 
  FaArrowRight,
  FaTimes,
  FaUniversity,
  FaGraduationCap,
  FaComments,
  FaLayerGroup,
  FaStar,
  FaCode
} from 'react-icons/fa';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/');
  };

  // Close mobile drawer on route or hash change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isHome = location.pathname === '/';

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <nav className="site-nav">
        <div className="container nav-inner">
          {/* Brand */}
          <Link to="/" className="brand" onClick={closeMenu}>
            <div className="brand-badge">
              <FaShieldAlt size={20} />
            </div>
            <span>GRS<span style={{ color: 'var(--primary)', marginLeft: '2px' }}>.</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links desktop-only">
            <Link to="/" className="nav-link">
              <FaHome size={15} />
              <span>Home</span>
            </Link>

            {isHome && !user && (
              <>
                <a href="#features" className="nav-link">
                  <span>Features</span>
                </a>
                <a href="#portals" className="nav-link">
                  <span>Portals</span>
                </a>
                <a href="#testimonials" className="nav-link">
                  <span>Reviews</span>
                </a>
                <Link to="/register-college" className="nav-link" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                  <span>Register College</span>
                </Link>
                <a href="#developer" className="nav-link">
                  <span>Developer</span>
                </a>
              </>
            )}

            {user && role === 'student' && (
              <>
                <Link to="/student/dashboard" className="nav-link">
                  <FaListAlt size={14} />
                  <span>My Grievances</span>
                </Link>
                <Link to="/student/raise-complaint" className="nav-link">
                  <FaPlusCircle size={14} />
                  <span>Raise Issue</span>
                </Link>
              </>
            )}

            {user && role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="nav-link">
                  <FaListAlt size={14} />
                  <span>Console</span>
                </Link>
                <Link to="/admin/manage-entities" className="nav-link">
                  <FaSlidersH size={14} />
                  <span>Manage Entities</span>
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right CTA / Auth Status */}
          <div className="nav-cta-group desktop-only">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-outline" style={{ padding: '0.6rem 1.1rem', fontSize: '0.88rem' }}>
                  Sign In
                </Link>
                <Link to="/register-college" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}>
                  Register College <FaArrowRight size={11} />
                </Link>
              </>
            ) : (
              <div className="user-menu">
                {user.collegeCode && (
                  <div 
                    title={`Institution: ${user.collegeName || user.collegeCode}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--primary-light)',
                      padding: user.collegeLogo ? '2px 8px 2px 3px' : '4px 9px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid rgba(62, 63, 216, 0.2)'
                    }}
                  >
                    {user.collegeLogo && (
                      <img 
                        src={user.collegeLogo} 
                        alt="Logo" 
                        style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          objectFit: 'contain',
                          backgroundColor: '#FFFFFF'
                        }} 
                      />
                    )}
                    <span 
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        letterSpacing: '0.04em',
                        color: 'var(--primary)'
                      }}
                    >
                      {user.collegeCode}
                    </span>
                  </div>
                )}
                <Link 
                  to="/profile" 
                  className="user-badge" 
                  title="View and Edit Profile"
                  style={{ textDecoration: 'none', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                >
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name || 'Profile'} 
                      style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <FaUserCircle size={18} />
                  )}
                  <span>{user.name || (role === 'admin' ? 'Administrator' : 'Student')}</span>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    textTransform: 'uppercase', 
                    background: 'var(--primary)', 
                    color: '#FFFFFF', 
                    padding: '2px 8px', 
                    borderRadius: '9999px',
                    marginLeft: '4px'
                  }}>
                    {role}
                  </span>
                </Link>
                <button onClick={handleLogout} className="logout-btn" title="Sign out" aria-label="Sign out">
                  <FaSignOutAlt size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Compact status & Hamburger Icon */}
          <div className="mobile-header-controls">
            {user && (
              <Link 
                to="/profile" 
                className="mobile-avatar-pill" 
                title="View Profile" 
                onClick={closeMenu}
              >
                {user.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name || 'Profile'} 
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <FaUserCircle size={22} color="var(--primary)" />
                )}
                {user.collegeCode && (
                  <span className="mobile-college-tag">{user.collegeCode}</span>
                )}
              </Link>
            )}

            {/* Hamburger Toggle Button with 3 animated bars */}
            <button
              type="button"
              className={`nav-hamburger ${mobileOpen ? 'is-active' : ''}`}
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
            >
              <span className="hamburger-box">
                <span className="hamburger-line top" />
                <span className="hamburger-line middle" />
                <span className="hamburger-line bottom" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay Backdrop */}
      <div 
        className={`mobile-nav-backdrop ${mobileOpen ? 'open' : ''}`} 
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <aside 
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${mobileOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation"
      >
        <div className="mobile-drawer-inner">
          {/* Drawer Header */}
          <div className="mobile-drawer-header">
            <Link to="/" className="brand" onClick={closeMenu}>
              <div className="brand-badge" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                <FaShieldAlt size={18} />
              </div>
              <span style={{ fontSize: '1.35rem' }}>GRS<span style={{ color: 'var(--primary)', marginLeft: '2px' }}>.</span></span>
            </Link>
            <button 
              type="button" 
              className="mobile-drawer-close" 
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* User Profile Card (if authenticated) */}
          {user && (
            <div className="mobile-user-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {user.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name || 'User Profile'} 
                    style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '2px solid var(--primary)'
                    }} 
                  />
                ) : (
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.25rem',
                    fontWeight: '700'
                  }}>
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '1rem', 
                    color: 'var(--text-heading)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.name || (role === 'admin' ? 'Administrator' : 'Student')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      background: 'var(--primary)',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      letterSpacing: '0.04em'
                    }}>
                      {role}
                    </span>
                    {user.collegeCode && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        background: 'var(--primary-light)',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        border: '1px solid rgba(62,63,216,0.2)'
                      }}>
                        {user.collegeCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <Link 
                to="/profile" 
                onClick={closeMenu}
                className="btn btn-outline"
                style={{ 
                  marginTop: '0.9rem', 
                  width: '100%', 
                  padding: '0.5rem', 
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FaUserCircle size={14} /> View / Edit Profile
              </Link>
            </div>
          )}

          {/* Navigation Links list */}
          <div className="mobile-nav-section">
            <div className="mobile-section-label">Navigation</div>
            <div className="mobile-links-list">
              <Link to="/" className="mobile-nav-link" onClick={closeMenu}>
                <div className="mobile-link-icon"><FaHome size={16} /></div>
                <span>Home</span>
              </Link>

              {/* Landing Page anchor links for guest on home */}
              {isHome && !user && (
                <>
                  <a href="#features" className="mobile-nav-link" onClick={closeMenu}>
                    <div className="mobile-link-icon"><FaLayerGroup size={15} /></div>
                    <span>System Features</span>
                  </a>
                  <a href="#portals" className="mobile-nav-link" onClick={closeMenu}>
                    <div className="mobile-link-icon"><FaGraduationCap size={15} /></div>
                    <span>Workspace Portals</span>
                  </a>
                  <a href="#testimonials" className="mobile-nav-link" onClick={closeMenu}>
                    <div className="mobile-link-icon"><FaStar size={15} /></div>
                    <span>Reviews & Trust</span>
                  </a>
                  <a href="#developer" className="mobile-nav-link" onClick={closeMenu}>
                    <div className="mobile-link-icon"><FaCode size={15} /></div>
                    <span>Lead Developer</span>
                  </a>
                </>
              )}

              {/* Student Role Links */}
              {user && role === 'student' && (
                <>
                  <Link to="/student/dashboard" className="mobile-nav-link" onClick={closeMenu}>
                    <div className="mobile-link-icon"><FaListAlt size={15} /></div>
                    <span>My Grievance Tickets</span>
                  </Link>
                  <Link to="/student/raise-complaint" className="mobile-nav-link" onClick={closeMenu}>
                    <div className="mobile-link-icon"><FaPlusCircle size={15} /></div>
                    <span>Raise New Grievance</span>
                  </Link>
                  <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>
                    <div className="mobile-link-icon"><FaUserCircle size={15} /></div>
                    <span>Student Profile</span>
                  </Link>
                </>
              )}

              {/* Admin Role Links */}
              {user && role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="mobile-nav-link" onClick={closeMenu}>
                    <div className="mobile-link-icon"><FaListAlt size={15} /></div>
                    <span>Management Console</span>
                  </Link>
                  <Link to="/admin/manage-entities" className="mobile-nav-link" onClick={closeMenu}>
                    <div className="mobile-link-icon"><FaSlidersH size={15} /></div>
                    <span>Configure Entities</span>
                  </Link>
                  <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>
                    <div className="mobile-link-icon"><FaUserCircle size={15} /></div>
                    <span>Admin Profile</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="mobile-drawer-footer">
            {!user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                <Link 
                  to="/login" 
                  className="btn btn-primary" 
                  onClick={closeMenu}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem' }}
                >
                  <FaGraduationCap size={16} /> Student Sign In
                </Link>
                <Link 
                  to="/admin/login" 
                  className="btn btn-dark" 
                  onClick={closeMenu}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem' }}
                >
                  <FaShieldAlt size={15} /> Institutional Admin Login
                </Link>
                <Link 
                  to="/register-college" 
                  className="btn btn-outline" 
                  onClick={closeMenu}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.92rem' }}
                >
                  <FaUniversity size={15} /> Register New College
                </Link>
              </div>
            ) : (
              <button 
                onClick={handleLogout} 
                className="btn btn-outline" 
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  padding: '0.85rem', 
                  color: 'var(--danger)', 
                  borderColor: 'var(--danger-bg)',
                  backgroundColor: 'var(--danger-bg)'
                }}
              >
                <FaSignOutAlt size={15} /> Sign Out of System
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;

