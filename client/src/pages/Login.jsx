import React, { useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(username, password);
    if (result.success) {
      if (result.role === 'SUPER_ADMIN') navigate('/super-dashboard');
      else if (result.role === 'ADMIN' || result.role === 'HOD') navigate('/admin-dashboard');
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
        <h1 className="page-title">Welcome Back</h1>
        <p className="page-desc">Log in to access your ScholarSync dashboard.</p>
        
        {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username (Email ID)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter your email id" 
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
          <button type="submit" className="btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '24px', cursor: 'pointer' }}>
            Log In
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#4B5563' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#133A26', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
