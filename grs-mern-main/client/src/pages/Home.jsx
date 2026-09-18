import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaArrowRight, 
  FaShieldAlt, 
  FaGraduationCap, 
  FaUserShield, 
  FaClock, 
  FaCheckCircle, 
  FaRegLightbulb, 
  FaBell, 
  FaChartLine, 
  FaTwitter, 
  FaLinkedin, 
  FaGithub, 
  FaEnvelope, 
  FaQuoteLeft,
  FaSearch,
  FaLaptopCode,
  FaCode,
  FaUniversity
} from 'react-icons/fa';

const Home = () => {
  const [emailSub, setEmailSub] = useState('');
  const [subStatus, setSubStatus] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSub) {
      setSubStatus(true);
      setEmailSub('');
      setTimeout(() => setSubStatus(false), 3500);
    }
  };

  return (
    <main className="agency-landing animate-fade">
      {/* 1. Hero Section */}
      <section className="agency-hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <span style={{ 
                  display: 'inline-block', 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--primary)' 
                }} />
                Multi-Tenant Grievance Redressal Architecture
              </div>

              <h1 className="hero-title" style={{ fontSize: '3rem', lineHeight: 1.15 }}>
                GRS – Grievance Redressal System <br />
                <span className="highlight">One Platform for Every Institution.</span>
              </h1>

              <p className="hero-description" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
                A multi-tenant cloud platform providing cryptographically isolated grievance resolution workspaces for universities, colleges, and educational institutions worldwide. Complete privacy for students, full control for administrators.
              </p>

              <div className="hero-actions" style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/register-college" className="btn btn-primary" style={{ padding: '0.9rem 1.8rem', fontSize: '1.02rem' }}>
                  <FaUniversity size={15} /> Register Your College
                </Link>
                <Link to="/admin/login" className="btn btn-dark" style={{ padding: '0.9rem 1.6rem', fontSize: '1.02rem' }}>
                  <FaUserShield size={15} /> College Login
                </Link>
                <Link to="/login" className="btn btn-outline" style={{ padding: '0.9rem 1.6rem', fontSize: '1.02rem' }}>
                  <FaGraduationCap size={15} /> Student Login
                </Link>
              </div>

              <div className="hero-trust-bar">
                <div className="trust-avatars">
                  <div className="trust-avatar" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)' }}>🏛️</div>
                  <div className="trust-avatar" style={{ backgroundColor: '#DDF4FC', color: '#0284C7' }}>🎓</div>
                  <div className="trust-avatar" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>⚖️</div>
                  <div className="trust-avatar" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>🛡️</div>
                </div>
                <div className="trust-text">
                  Enterprise-grade platform engineered for universities, autonomous colleges, and institutional campus networks.
                </div>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="hero-visual">
              <div className="hero-visual-bg-circle" />

              {/* Floating Badge 1 (Top Right) */}
              <div className="hero-floating-badge badge-top">
                <div style={{ 
                  background: 'var(--success-bg)', 
                  color: 'var(--success)', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  display: 'grid', 
                  placeItems: 'center' 
                }}>
                  <FaCheckCircle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)' }}>99.4% Addressed</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-body)' }}>Within 48 hours</div>
                </div>
              </div>

              {/* Central Card */}
              <div className="hero-card-main">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '12px', 
                      background: 'var(--primary)', 
                      display: 'grid', 
                      placeItems: 'center', 
                      color: '#FFFFFF' 
                    }}>
                      <FaShieldAlt size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>Live Redressal</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time Status Feed</span>
                    </div>
                  </div>
                  <span style={{ 
                    background: 'var(--primary-light)', 
                    color: 'var(--primary)', 
                    fontSize: '0.75rem', 
                    fontWeight: '700', 
                    padding: '4px 10px', 
                    borderRadius: '9999px' 
                  }}>
                    Active
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-heading)' }}>Hostel Maintenance</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: '700' }}>In Review</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-body)', margin: 0 }}>Room 304 water pressure issue logged.</p>
                  </div>

                  <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-heading)' }}>Exam Re-evaluation</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: '700' }}>Resolved</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-body)', margin: 0 }}>Updated marks statement dispatched.</p>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>Campus Resolution Rate</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>98.2%</strong>
                </div>
              </div>

              {/* Floating Badge 2 (Bottom Left) */}
              <div className="hero-floating-badge badge-bottom">
                <div style={{ 
                  background: 'var(--accent-pink)', 
                  color: 'var(--accent-rose)', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  display: 'grid', 
                  placeItems: 'center' 
                }}>
                  <FaClock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)' }}>Direct Scheduling</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-body)' }}>Immediate Case Routing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section (Template-10: "Take Your Online marketing to the next level") */}
      <section id="features" className="agency-section" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Core Capabilities</span>
            <h2 className="section-title">Take Campus Redressal to The Next Level</h2>
            <p className="section-description">
              Engineered to eliminate bottlenecks, provide end-to-end accountability, and restore student trust through speed and transparency.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaClock />
              </div>
              <h3 className="feature-title">Direct Scheduling</h3>
              <p className="feature-desc">
                Submit complaints instantly with category tags. Cases are automatically assigned to the designated administrative officer.
              </p>
              <Link to="/register" className="feature-link">
                Learn More <FaArrowRight size={12} />
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaBell />
              </div>
              <h3 className="feature-title">Real-time Reminders</h3>
              <p className="feature-desc">
                Keep both students and staff on track with automated timelines, reminder milestones, and instant resolution notices.
              </p>
              <Link to="/login" className="feature-link">
                Learn More <FaArrowRight size={12} />
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FaChartLine />
              </div>
              <h3 className="feature-title">Transparent Tracking</h3>
              <p className="feature-desc">
                Track every stage from "Not Processed" to "Pending" and "Closed". Zero opaque delays, 100% visible audit history.
              </p>
              <Link to="/student/dashboard" className="feature-link">
                Learn More <FaArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Multi-Tenant "How It Works" Section */}
      <section id="how-it-works" className="agency-section" style={{ background: '#F8FAFC', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Multi-Tenant Workflow</span>
            <h2 className="section-title">How The Platform Works</h2>
            <p className="section-description">
              A five-step institutional lifecycle ensuring strict data isolation, verified enrollment, and prompt grievance resolution.
            </p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                step: '01',
                title: 'College Registers',
                desc: 'A college administrator registers their institution and receives a verified, unique institutional identifier (e.g. COL001).'
              },
              {
                step: '02',
                title: 'Sets Up Institution',
                desc: 'The college admin configures departments, academic calendar sessions, and localized grievance classifications.'
              },
              {
                step: '03',
                title: 'Students Join College',
                desc: 'Students sign up by selecting their verified college ID, cryptographically binding all records to that institution.'
              },
              {
                step: '04',
                title: 'Submits Grievance',
                desc: 'Students file concerns with photo evidence. The system automatically scopes and routes it strictly to their college.'
              },
              {
                step: '05',
                title: 'Admin Resolves Issue',
                desc: 'College administrators inspect evidence, triage tickets, and resolve grievances with real-time audit updates.'
              }
            ].map((item, idx) => (
              <div key={idx} className="card" style={{ padding: '1.75rem 1.5rem', position: 'relative', background: '#FFFFFF' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--primary)',
                  opacity: 0.85,
                  marginBottom: '0.75rem'
                }}>
                  {item.step}
                </div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.6rem', color: 'var(--text-heading)' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Portals / Solutions Section (Template-10: "Unique Solutions for Your Business") */}
      <section id="portals" className="agency-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Dedicated Portals</span>
            <h2 className="section-title">Unique Solutions for Campus Stakeholders</h2>
            <p className="section-description">
              Tailored workspaces specifically designed for students to communicate easily and for administrators to manage efficiently.
            </p>
          </div>

          <div className="portals-grid">
            {/* College Onboarding Card */}
            <div className="portal-access-card" style={{ borderTop: '3px solid var(--primary)' }}>
              <span className="portal-tag" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                Multi-Tenant Onboarding
              </span>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Register College</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', marginBottom: '2rem', flexGrow: 1 }}>
                Onboard your college or university with a unique institutional code. Create an isolated tenant environment with automated routing.
              </p>
              <Link to="/register-college" className="btn btn-primary" style={{ width: '100%' }}>
                Register Your College <FaArrowRight size={13} />
              </Link>
            </div>

            {/* Admin Card */}
            <div className="portal-access-card" style={{ borderTop: '3px solid #EF8B8D' }}>
              <span className="portal-tag" style={{ background: 'var(--accent-pink)', color: '#C026D3' }}>
                Management Console
              </span>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>College Admin Login</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', marginBottom: '2rem', flexGrow: 1 }}>
                Authorized institution officers log in to triage grievances, inspect photographic evidence, and access localized analytics.
              </p>
              <Link to="/admin/login" className="btn btn-dark" style={{ width: '100%' }}>
                College Login <FaArrowRight size={13} />
              </Link>
            </div>

            {/* Student Card */}
            <div className="portal-access-card" style={{ borderTop: '3px solid #10B981' }}>
              <span className="portal-tag" style={{ background: 'var(--success-bg)', color: '#065F46' }}>
                Student Workspace
              </span>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Student Portal</h3>
              <p style={{ color: 'var(--text-body)', fontSize: '0.95rem', marginBottom: '2rem', flexGrow: 1 }}>
                Submit issues, upload photographic evidence, track grievance lifecycles, and communicate with your institution's ombudsman.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-outline" style={{ flex: 1, padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                  New Student
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Statistics Section (Template-10: 50+ Total Client, 100+ Project Done) */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-box pastel-pink">
              <div className="stat-number">50+</div>
              <div className="stat-label">Affiliated Colleges</div>
            </div>

            <div className="stat-box pastel-blue">
              <div className="stat-number">1,200+</div>
              <div className="stat-label">Grievances Resolved</div>
            </div>

            <div className="stat-box pastel-cyan">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>

            <div className="stat-box pastel-indigo">
              <div className="stat-number">24h</div>
              <div className="stat-label">Average Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section (Template-10: "What The People Thinks About Us") */}
      <section id="testimonials" className="agency-section" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Testimonials</span>
            <h2 className="section-title">What Campus Leaders & Students Say</h2>
            <p className="section-description">
              Real feedback from students, faculty heads, and ombudsman members who rely on GRS every day.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-quote">
                "GRS eliminated endless back-and-forth emails. I filed a hostel facility request at 10 AM, and it was inspected and marked resolved by noon the next day."
              </p>
              <div className="testimonial-user">
                <div className="testimonial-avatar">AR</div>
                <div>
                  <div className="testimonial-name">Aarav Roy</div>
                  <div className="testimonial-role">Computer Science Student</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-quote">
                "The admin overview gives our grievance committee complete clarity. We can monitor bottlenecks, verify action items, and ensure no student is ever ignored."
              </p>
              <div className="testimonial-user">
                <div className="testimonial-avatar" style={{ backgroundColor: 'var(--accent-pink)', color: '#C026D3' }}>DK</div>
                <div>
                  <div className="testimonial-name">Dr. Kavita Sharma</div>
                  <div className="testimonial-role">Dean of Student Affairs</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-quote">
                "Confidentiality and transparent tracking restored trust among students. Knowing their issues are acknowledged officially encourages constructive dialogue."
              </p>
              <div className="testimonial-user">
                <div className="testimonial-avatar" style={{ backgroundColor: '#E0E7FF', color: '#4338CA' }}>PS</div>
                <div>
                  <div className="testimonial-name">Pooja Sengupta</div>
                  <div className="testimonial-role">Student Council President</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Developer Spotlight Section */}
      <section id="developer" className="agency-section" style={{ background: '#F8FAFC', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Lead Developer & Architect</span>
            <h2 className="section-title">Engineered by Arpit Rai</h2>
            <p className="section-description">
              Fullstack Developer & Freelancer building scalable web architectures and modern digital experiences.
            </p>
          </div>

          <div style={{
            maxWidth: '840px',
            margin: '0 auto',
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Ambient decorative glow */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(62, 63, 216, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.25rem',
              flexWrap: 'wrap'
            }}>
              {/* Developer Avatar Badge */}
              <div style={{
                position: 'relative',
                flexShrink: 0
              }}>
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '28px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #6366F1 100%)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#FFFFFF',
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  boxShadow: 'var(--shadow-primary)',
                  fontFamily: 'var(--font-heading)'
                }}>
                  AR
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  right: '-6px',
                  background: 'var(--success)',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }} title="Available for Freelance Projects">
                  <FaLaptopCode size={14} />
                </div>
              </div>

              {/* Developer Details */}
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '1.85rem', margin: 0, color: 'var(--text-heading)' }}>
                    Arpit Rai
                  </h3>
                  <span style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)'
                  }}>
                    Fullstack Developer
                  </span>
                  <span style={{
                    background: 'var(--success-bg)',
                    color: '#065F46',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)' }} />
                    Freelancer Available
                  </span>
                </div>

                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  marginBottom: '0.75rem'
                }}>
                  MERN Stack Specialist & Freelance Software Engineer
                </div>

                <p style={{
                  color: 'var(--text-body)',
                  fontSize: '0.94rem',
                  lineHeight: 1.65,
                  marginBottom: '1.25rem'
                }}>
                  I am a passionate <strong>Fullstack Developer</strong> and <strong>Freelancer</strong> dedicated to engineering high-performance, responsive web applications with clean design systems, scalable backend architectures, and robust security. Open to freelance opportunities, enterprise projects, and technical collaborations.
                </p>

                {/* Tech Chips */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Freelance Consulting', 'Modern UI/UX'].map((chip) => (
                    <span key={chip} style={{
                      background: '#F1F5F9',
                      border: '1px solid var(--border)',
                      padding: '4px 11px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: 'var(--text-heading)'
                    }}>
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Action Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
                  <a 
                    href="mailto:arpitrai38@gmail.com" 
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
                  >
                    <FaEnvelope size={13} /> Hire for Freelance
                  </a>
                  <a 
                    href="https://github.com/arpitrai38" 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ padding: '0.65rem 1.3rem', fontSize: '0.9rem' }}
                  >
                    <FaGithub size={14} /> GitHub Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Newsletter / Quick Notification Subscription (Template-10 Banner) */}
      <section className="agency-section">
        <div className="container">
          <div className="newsletter-banner">
            <span className="section-subtitle">Stay Informed</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>Get the Latest Campus Updates</h2>
            <p style={{ color: 'var(--text-body)', maxWidth: '480px', margin: '0 auto' }}>
              Subscribe to official announcements, grievance committee circulars, and campus policy changes.
            </p>

            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your college email address..." 
                className="newsletter-input"
                value={emailSub}
                onChange={(e) => setEmailSub(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-btn">
                Subscribe
              </button>
            </form>

            {subStatus && (
              <p style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.88rem' }}>
                Thank you! You have been subscribed to system notifications.
              </p>
            )}

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              By subscribing you agree to our <a href="#" style={{ textDecoration: 'underline' }}>Terms of Service</a> and <a href="#" style={{ textDecoration: 'underline' }}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Agency Multi-Column Footer */}
      <footer className="agency-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Link to="/" className="brand">
                <div className="brand-badge">
                  <FaShieldAlt size={20} />
                </div>
                <span>GRS<span style={{ color: 'var(--primary)' }}>.</span></span>
              </Link>
              <p>
                An enterprise-grade grievance redressal architecture connecting students and administrative authorities with speed, clarity, and trust.
              </p>
              <div className="footer-socials">
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Twitter">
                  <FaTwitter size={15} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="LinkedIn">
                  <FaLinkedin size={15} />
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="GitHub">
                  <FaGithub size={15} />
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Categories</h4>
              <ul className="footer-links">
                <li><a href="#features" className="footer-link">Academic Affairs</a></li>
                <li><a href="#features" className="footer-link">Hostel & Mess</a></li>
                <li><a href="#features" className="footer-link">Examination</a></li>
                <li><a href="#features" className="footer-link">Campus Amenities</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Portals</h4>
              <ul className="footer-links">
                <li><Link to="/login" className="footer-link">Student Login</Link></li>
                <li><Link to="/register" className="footer-link">New Student Sign Up</Link></li>
                <li><Link to="/admin/login" className="footer-link">Administration Console</Link></li>
                <li><Link to="/student/dashboard" className="footer-link">Grievance Status</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <ul className="footer-links">
                <li><a href="#features" className="footer-link">Documentation</a></li>
                <li><a href="#testimonials" className="footer-link">Redressal Policy</a></li>
                <li><a href="#features" className="footer-link">Contact Ombudsman</a></li>
                <li><a href="#features" className="footer-link">System FAQs</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">Terms of Service</a></li>
                <li><a href="#" className="footer-link">Privacy Policy</a></li>
                <li><a href="#" className="footer-link">Security Guidelines</a></li>
                <li><a href="#" className="footer-link">Cookie Settings</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              © {new Date().getFullYear()} GRS Portal. Developed by <strong>Arpit Rai</strong> — Fullstack Developer & Freelancer. All rights reserved.
            </div>
            <div>
              Crafted for seamless grievance redressal, transparency, and academic excellence.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
