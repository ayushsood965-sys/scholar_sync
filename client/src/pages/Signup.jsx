import React, { useState, useContext, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [depts, setDepts] = useState([]);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/departments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDepts(data);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !username || !password || !department || !phoneNumber) {
      setError('Please fill in all fields');
      return;
    }

    const cleanedPhone = phoneNumber.trim().replace(/[\s\-()]/g, '');
    const indianPhoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(cleanedPhone)) {
      setError('Please enter a valid 10-digit Indian phone number (starts with 6-9).');
      return;
    }

    const result = await register({ name, username, password, role, department, phoneNumber });
    if (result.success) {
      if (result.role === 'ADMIN' || result.role === 'HOD') navigate('/admin-dashboard');
      else if (result.role === 'FACULTY') navigate('/faculty-dashboard');
      else navigate('/student-dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="subpage-container">
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
        <div className="glass-panel auth-panel" style={{ margin: 0 }}>
          <h1 className="page-title">Join ScholarSync</h1>
          <p className="page-desc">Create your credentials to join your department.</p>
          
          {error && (
            <div style={{ 
              color: '#DC2626', 
              background: '#FEF2F2', 
              border: '1px solid #FEE2E2', 
              padding: '10px', 
              borderRadius: '8px', 
              marginBottom: '15px', 
              textAlign: 'center',
              fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address (Username)</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Enter your email id" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number (Indian Format)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter 10-digit mobile number e.g. 9876543210" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
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
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select 
                className="form-input" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="">Select your department</option>
                {depts.map(d => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select 
                className="form-input" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="STUDENT">Student / Scholar</option>
                <option value="FACULTY">Faculty / Supervisor</option>
                <option value="HOD">Head of Department (HOD)</option>
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
      <Footer />
    </div>
  );
};

export default Signup;
