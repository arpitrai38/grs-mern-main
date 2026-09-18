import React from 'react';
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
  FaArrowRight
} from 'react-icons/fa';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className="site-nav">
      <div className="container nav-inner">
        {/* Brand */}
        <Link to="/" className="brand">
          <div className="brand-badge">
            <FaShieldAlt size={20} />
          </div>
          <span>GRS<span style={{ color: 'var(--primary)', marginLeft: '2px' }}>.</span></span>
        </Link>

        {/* Center / Navigation Links */}
        <div className="nav-links">
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

        {/* Right CTA / Auth Status */}
        <div className="nav-cta-group">
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
      </div>
    </nav>
  );
};

export default Navbar;
