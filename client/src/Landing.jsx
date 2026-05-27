import React from 'react';
import { Search, Beaker, Users, FileText, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Landing = () => {
  return (
    <div className="landing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Unify Your Research Journey<br/>with ScholarSync.</h1>
          <p className="hero-subtitle">
            A centralized platform for researchers, faculty, and departments<br/>
            to connect, collaborate, and thrive.
          </p>
          <div className="hero-buttons">
            <a href="#featured-projects" className="btn-dark" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Explore Projects</a>
            <Link to="/signup" className="btn-dark" style={{ textDecoration: 'none', background: '#A5D6A7', color: '#133A26', display: 'inline-flex', alignItems: 'center' }}>Create Profile</Link>
          </div>
        </div>
      </section>

      {/* Main Content White Wrapper */}
      <div className="main-content-wrapper">
        {/* Overlapping Feature Cards */}
        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Beaker size={32} color="#133A26" /></div>
              <h3 className="feature-title">Discover Research Labs</h3>
              <p className="feature-text">Common platform for researchers, faculty, and department labs.</p>
              <Link to="/labs" className="btn-feature" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>Browse Labs</Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Users size={32} color="#133A26" /></div>
              <h3 className="feature-title">Find Collaborators</h3>
              <p className="feature-text">Centralized platform for researchers, faculty, and sponsors.</p>
              <Link to="/collaborate" className="btn-feature" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>Connect Now</Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><FileText size={32} color="#133A26" /></div>
              <h3 className="feature-title">Access Publications</h3>
              <p className="feature-text">Search in journals, papers, graphs, and access publications.</p>
              <Link to="/publications" className="btn-feature" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>Search Archive</Link>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Banknote size={32} color="#133A26" /></div>
              <h3 className="feature-title">Manage Grants & Funding</h3>
              <p className="feature-text">Centralized platform to researchers, faculty, manage grants, and funding.</p>
              <Link to="/funding" className="btn-feature" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>View Opportunities</Link>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="projects-section" id="featured-projects">
          <h2 className="section-title">Featured Doctoral Projects</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {[
              {
                title: "Autonomous UAS Swarms for Multi-Spectral Agricultural Mapping",
                dept: "Dept of Computer Science & AI",
                desc: "Implementing deep reinforcement learning models for drone mesh coordination.",
                img: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=150&q=80",
                link: "/labs"
              },
              {
                title: "Next-Gen Perovskite Solar Cells with Carbon Dot Passivation",
                dept: "Dept of Physics & Chemistry",
                desc: "Improving photothermal conversion stability and cells efficiency beyond 28%.",
                img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=150&q=80",
                link: "/publications"
              },
              {
                title: "Deep Learning Proteomics for Targeted Enzyme Optimization",
                dept: "Dept of Data Science & Biology",
                desc: "Synthesizing customized molecular catalysts for accelerated plastic degradation.",
                img: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=300&q=80",
                link: "/collaborate"
              },
              {
                title: "Topological Qubit Integration for Secure Quantum Key Distribution",
                dept: "Dept of Electronics & Quantum Science",
                desc: "Developing solid-state quantum nodes for absolute cryptographic link protection.",
                img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=150&q=80",
                link: "/funding"
              }
            ].map((proj, idx) => (
              <div className="project-card" key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <img 
                  src={proj.img} 
                  alt={proj.title} 
                  className="project-image" 
                  style={{ width: '100%', height: '140px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '0.72rem', background: '#EAF4EE', color: '#133A26', padding: '3px 8px', borderRadius: '12px', fontWeight: 600, alignSelf: 'flex-start' }}>{proj.dept}</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: '1.4' }}>{proj.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{proj.desc}</p>
                  <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <Link to={proj.link} className="btn-outline-small" style={{ textDecoration: 'none', display: 'inline-block' }}>Learn More ➔</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
