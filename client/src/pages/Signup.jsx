import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await register({ name, username, password, role });
    if (result.success) {
      if (result.role === 'ADMIN') navigate('/admin-dashboard');
      else if (result.role === 'FACULTY') navigate('/faculty-dashboard');
      else navigate('/student-dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="subpage-container">
      <Navbar />
      <div className="glass-panel auth-panel">
        <h1 className="page-title">Join ScholarSync</h1>
        <p className="page-desc">Create your profile to start collaborating.</p>
        
        {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Dr. Jane Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="jane_doe" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select 
              className="form-input" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '24px', cursor: 'pointer' }}>
            Create Account
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#4B5563' }}>
          Already have an account? <Link to="/login" style={{ color: '#133A26', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
