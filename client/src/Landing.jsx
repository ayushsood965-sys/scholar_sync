import React from 'react';
import { Search, Beaker, Users, FileText, Banknote, Instagram, Facebook, Twitter, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

import Navbar from './components/Navbar';

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
            <button className="btn-dark">Explore Projects</button>
            <button className="btn-dark">Create Profile</button>
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
              <button className="btn-feature">Browse Labs</button>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Users size={32} color="#133A26" /></div>
              <h3 className="feature-title">Find Collaborators</h3>
              <p className="feature-text">Centralized platform for researchers, faculty, and sponsors.</p>
              <button className="btn-feature">Connect Now</button>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><FileText size={32} color="#133A26" /></div>
              <h3 className="feature-title">Access Publications</h3>
              <p className="feature-text">Search in journals, papers, graphs, and access publications.</p>
              <button className="btn-feature">Search Archive</button>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Banknote size={32} color="#133A26" /></div>
              <h3 className="feature-title">Manage Grants & Funding</h3>
              <p className="feature-text">Centralized platform to researchers, faculty, manage grants, and funding.</p>
              <button className="btn-feature">View Opportunities</button>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="projects-section">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            {[1, 2, 3, 4].map((item) => (
              <div className="project-card" key={item}>
                <img 
                  src={`https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80`} 
                  alt="Project" 
                  className="project-image" 
                />
                <div className="project-info">
                  <h4 className="project-title">Ongoing Research in {['Biotech', 'Students', 'Computing', 'Funding'][item-1]}</h4>
                  <button className="btn-outline-small">Learn More</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="landing-logo">
              <Shield size={24} color="#133A26" />
              <span className="logo-text">ScholarSync</span>
            </div>
            <p className="footer-text">University info about the<br/>Community chapter.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>University</h4>
              <a href="#">Support</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Links</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms</a>
            </div>
          </div>
          <div className="footer-social">
            <Facebook size={20} />
            <Instagram size={20} />
            <Twitter size={20} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
