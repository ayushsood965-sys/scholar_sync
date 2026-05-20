import React from 'react';
import Navbar from '../components/Navbar';

const GenericPage = ({ title, description }) => {
  return (
    <div className="subpage-container">
      <Navbar />
      <div className="glass-panel">
        <h1 className="page-title">{title}</h1>
        <p className="page-desc">{description}</p>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>This is a sample page generated for the {title} section.</p>
        </div>
      </div>
    </div>
  );
};

export default GenericPage;
