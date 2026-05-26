import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProfileOnboardingModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState(user?.profile?.phoneNumber || '');
  const [address, setAddress] = useState(user?.profile?.address || '');
  const [academicBackground, setAcademicBackground] = useState(user?.profile?.academicBackground || '');
  const [areaOfInterest, setAreaOfInterest] = useState(user?.profile?.areaOfInterest || '');
  const [designation, setDesignation] = useState(user?.profile?.designation || '');
  const [specialization, setSpecialization] = useState(user?.profile?.specialization || '');
  const [officeRoom, setOfficeRoom] = useState(user?.profile?.officeRoom || '');
  const [yearsOfService, setYearsOfService] = useState(user?.profile?.yearsOfService || 0);
  const [additionalResponsibilities, setAdditionalResponsibilities] = useState(user?.profile?.additionalResponsibilities || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      phoneNumber,
      address,
      academicBackground: user.role === 'STUDENT' ? academicBackground : undefined,
      areaOfInterest: user.role === 'STUDENT' ? areaOfInterest : undefined,
      designation: user.role === 'FACULTY' ? designation : undefined,
      specialization: user.role === 'FACULTY' ? specialization : undefined,
      officeRoom: ['FACULTY', 'HOD'].includes(user.role) ? officeRoom : undefined,
      yearsOfService: user.role === 'HOD' ? Number(yearsOfService) : undefined,
      additionalResponsibilities: user.role === 'HOD' ? additionalResponsibilities : undefined,
    };

    const res = await updateProfile(payload);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '36px',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '56px', 
            height: '56px', 
            borderRadius: '16px', 
            background: '#F0FDF4', 
            color: '#10B981', 
            fontSize: '1.5rem', 
            marginBottom: '16px' 
          }}>
            👤
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
            Complete Your Profile
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.92rem' }}>
            Set up your professional credentials to unlock the full potential of ScholarSync.
          </p>
        </div>

        {error && (
          <div style={{ 
            background: '#FEF2F2', 
            color: '#DC2626', 
            padding: '12px 16px', 
            borderRadius: '12px', 
            fontSize: '0.85rem', 
            marginBottom: '20px', 
            border: '1px solid #FEE2E2', 
            textAlign: 'center' 
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* General Fields */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Phone Number
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="+1 (555) 019-2834"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Address
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="123 Academic Way, Suite 400"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Student Fields */}
          {user.role === 'STUDENT' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Academic Background
                </label>
                <select 
                  className="form-input" 
                  value={academicBackground} 
                  onChange={(e) => setAcademicBackground(e.target.value)}
                  required
                >
                  <option value="">Select Background...</option>
                  <option value="M.Tech Computer Science">M.Tech Computer Science</option>
                  <option value="M.Sc Information Technology">M.Sc Information Technology</option>
                  <option value="B.Tech Honours">B.Tech Honours</option>
                  <option value="M.Phil">M.Phil</option>
                  <option value="Other">Other Equivalent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Primary Area of Research Interest
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Machine Learning, Cybersecurity, NLP..."
                  value={areaOfInterest}
                  onChange={(e) => setAreaOfInterest(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Faculty Fields */}
          {user.role === 'FACULTY' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Academic Designation
                </label>
                <select 
                  className="form-input" 
                  value={designation} 
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                >
                  <option value="">Select Designation...</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="Professor Emeritus">Professor Emeritus</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Area of Specialization
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Distributed Systems, Quantum Computing..."
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Office Room No.
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Block A, Room 304"
                  value={officeRoom}
                  onChange={(e) => setOfficeRoom(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* HOD Fields */}
          {user.role === 'HOD' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Office Room No.
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="HOD Cabin, Department Wing B"
                  value={officeRoom}
                  onChange={(e) => setOfficeRoom(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Years of Service in Department
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={yearsOfService}
                  onChange={(e) => setYearsOfService(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Additional Institutional Responsibilities
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="DRC Chair, Dean of Research (optional)"
                  value={additionalResponsibilities}
                  onChange={(e) => setAdditionalResponsibilities(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-outline" 
              style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }}
            >
              Skip for Now
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary" 
              style={{ flex: 1.5, padding: '12px', fontSize: '0.95rem', background: '#059669' }}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileOnboardingModal;
