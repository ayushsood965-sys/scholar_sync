import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Book, Flag, FileText, Calendar, User, LogOut, Bell, ClipboardList, CheckCircle2, Clock, Upload, Lock, Award, Edit, File, Layers, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThesisContext } from '../context/ThesisContext';
import ProfileOnboardingModal from '../components/ProfileOnboardingModal';
import NotificationPanel from '../components/NotificationPanel';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const MilestoneTimeline = ({ currentStatus }) => {
  const PHASES = [
    { key: 'REGISTRATION_PENDING', label: 'Registration', desc: 'Awaiting Verification' },
    { key: 'COURSEWORK', label: 'Coursework', desc: 'Clearing Exams' },
    { key: 'SYNOPSIS_PENDING', label: 'Synopsis Approval', desc: 'DRC Evaluation' },
    { key: 'ACTIVE_RESEARCH', label: 'Active Research', desc: 'RAC & Progress' },
    { key: 'PRE_SUBMISSION', label: 'Pre-Submission', desc: 'Colloquium & Seminars' },
    { key: 'SUBMITTED', label: 'Thesis Submission', desc: 'Evaluation Board' },
    { key: 'AWARDED', label: 'Degree Awarded', desc: 'Convocation' }
  ];

  const currentStep = PHASES.findIndex(p => p.key === currentStatus);
  const activeStepIndex = currentStep === -1 ? 0 : currentStep;

  return (
    <div className="card" style={{ padding: '24px 20px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🎓 Ph.D. Research Progression Timeline</span>
      </h3>
      
      {/* Horizontal timeline bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', overflowX: 'auto', paddingBottom: '10px', gap: '12px' }}>
        {/* Connecting background line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '6%',
          right: '6%',
          height: '4px',
          background: '#E2E8F0',
          zIndex: 1
        }} />
        
        {/* Active colored line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '6%',
          width: `${(activeStepIndex / (PHASES.length - 1)) * 88}%`,
          height: '4px',
          background: 'linear-gradient(90deg, #10B981 0%, #3B82F6 100%)',
          zIndex: 2,
          transition: 'width 0.4s ease'
        }} />

        {PHASES.map((phase, idx) => {
          const isCompleted = idx < activeStepIndex;
          const isActive = idx === activeStepIndex;
          const isPending = idx > activeStepIndex;

          return (
            <div key={phase.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '95px', textAlign: 'center', zIndex: 3 }}>
              {/* Step indicator circle */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isCompleted ? '#10B981' : isActive ? '#3B82F6' : '#FFFFFF',
                border: isCompleted ? 'none' : isActive ? '4px solid #DBEAFE' : '2px solid #CBD5E1',
                color: isCompleted || isActive ? '#FFFFFF' : '#64748B',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                boxShadow: isActive ? '0 0 0 4px rgba(59, 130, 246, 0.15)' : 'none',
                transition: 'all 0.3s ease',
                marginBottom: '10px'
              }}>
                {isCompleted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  idx + 1
                )}
              </div>

              {/* Title & Desc */}
              <div style={{ fontSize: '0.78rem', fontWeight: isActive ? 800 : 600, color: isActive ? '#1E3A8A' : isCompleted ? '#10B981' : '#475569', marginBottom: '3px' }}>
                {phase.label}
              </div>
              <div style={{ fontSize: '0.68rem', color: isActive ? '#3B82F6' : '#94A3B8', fontWeight: isActive ? 600 : 400 }}>
                {phase.desc}
              </div>
              {isActive && (
                <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', background: '#DBEAFE', color: '#1E40AF', borderRadius: '4px', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Phase
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const items = [
    { key: 'overview', label: 'Dashboard', Icon: Home },
    { key: 'registration', label: 'Registration', Icon: ClipboardList },
    { key: 'thesis', label: 'My Thesis', Icon: Book },
    { key: 'rac', label: 'RAC Progress', Icon: Layers },
    { key: 'publications', label: 'Publications', Icon: File },
    { key: 'changes', label: 'Request Changes', Icon: Edit },
    { key: 'certificates', label: 'Certificates', Icon: Award },
    { key: 'milestones', label: 'Milestones', Icon: Flag },
    { key: 'documents', label: 'Documents', Icon: FileText },
    { key: 'meetings', label: 'Meetings', Icon: Calendar },
    { key: 'profile', label: 'Profile', Icon: User },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A5D6A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
          </svg>
        </div>
        <h2>ScholarHub</h2>
      </div>
      <div className="sidebar-nav" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}>
        {items.map(({ key, label, Icon }) => (
          <button key={key} className={`nav-item ${activeTab === key ? 'active' : ''}`} onClick={() => { setActiveTab(key); document.body.classList.remove('sidebar-mobile-open'); }}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <Icon className="nav-icon" /> {label}
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={() => { logout(); navigate('/'); }}
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', color: '#F87171' }}>
          <LogOut className="nav-icon" /> Logout
        </button>
      </div>
    </div>
  );
};

const Header = ({ title }) => {
  const { user } = useContext(AuthContext);
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useContext(NotificationContext);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => setShowDropdown(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleItemClick = (e, notifId) => {
    e.stopPropagation();
    markAsRead(notifId);
  };

  const handleMarkAll = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const getAccentColor = (type) => {
    if (type === 'WELCOME') return '#7C3AED';
    if (type === 'PROFILE_INCOMPLETE') return '#EF4444';
    if (type === 'PENDING_ACTION') return '#D97706';
    if (type === 'SUCCESSFUL_ACTION') return '#10B981';
    return '#3B82F6';
  };

  return (
    <div className="header">
      <button 
        className="mobile-menu-toggle" 
        onClick={() => document.body.classList.toggle('sidebar-mobile-open')}
        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '8px' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>
      <div className="header-title">{title}</div>
      <div className="header-actions">
        {/* Bell Popover Container */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={toggleDropdown}
            className="notification-bell"
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
              color: '#475569'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span 
                className="notification-badge" 
                style={{ 
                  position: 'absolute', 
                  top: '2px', 
                  right: '2px', 
                  background: '#EF4444', 
                  color: 'white', 
                  fontSize: '9px', 
                  fontWeight: 'bold', 
                  borderRadius: '50%', 
                  width: '18px', 
                  height: '18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px solid white'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Floating Dropdown */}
          {showDropdown && (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: '45px',
                right: '0',
                width: '340px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                zIndex: 99999,
                overflow: 'hidden',
                textAlign: 'left'
              }}
            >
              {/* Dropdown Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🔔</span> Recent Notifications
                </span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAll}
                    style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Scrollable List */}
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94A3B8', fontSize: '0.8rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🍃</div>
                    <p style={{ margin: 0, fontWeight: 600 }}>All Caught Up!</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.72rem' }}>No notifications to show.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const dotColor = getAccentColor(n.type);
                    return (
                      <div 
                        key={n._id}
                        onClick={(e) => handleItemClick(e, n._id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F1F5F9',
                          background: n.read ? 'white' : '#F8FAFC',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '10px',
                          alignItems: 'flex-start',
                          transition: 'background-color 0.2s',
                          position: 'relative'
                        }}
                      >
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, marginTop: '5px', flexShrink: 0 }} />
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: n.read ? 600 : 800, color: '#1E293B', lineHeight: 1.2 }}>
                              {n.title}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: '#94A3B8', flexShrink: 0 }}>
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748B', lineHeight: 1.3 }}>
                            {n.message}
                          </p>
                        </div>

                        {!n.read && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', alignSelf: 'center', marginLeft: 'auto' }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-profile">
          {user?.avatarUrl ? (
            <img src={`http://localhost:5000${user.avatarUrl}`} alt="Student" className="user-avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <svg viewBox="0 0 100 100" className="user-avatar" style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', display: 'block' }}>
              <circle cx="50" cy="35" r="20" fill="#94a3b8" />
              <path d="M15 85c0-13.8 11.2-25 25-25h20c13.8 0 25 11.2 25 25z" fill="#94a3b8" />
            </svg>
          )}
          <div className="user-info"><span className="user-name">{user?.name || 'Student'}</span><span className="user-dept">SCHOLAR</span></div>
        </div>
      </div>
    </div>
  );
};

// ── Enrollment Form (no thesis yet) ──
const EnrollmentForm = ({ onSubmit }) => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ 
    enrollmentNumber: '', 
    department: user?.department || '', 
    title: '', 
    abstract: '' 
  });
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/departments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDepts(data);
          if (data.length > 0 && !form.department) {
            setForm(prev => ({ ...prev, department: data[0].name }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); 
    setLoading(true);
    try { 
      await onSubmit({
        ...form,
        department: user?.department || form.department
      }); 
    } catch (err) { 
      alert(err.response?.data?.message || 'Error'); 
    } finally { 
      setLoading(false); 
    }
  };
  return (
    <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h3 className="card-title">Complete Enrollment</h3>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>You must complete your thesis registration before accessing the research portal.</p>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Enrollment Number *</label>
            <input className="form-input" name="enrollmentNumber" value={form.enrollmentNumber} onChange={handle} placeholder="e.g., 2024-CS-001" required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Department *</label>
            <select className="form-input" name="department" value={form.department} disabled style={{ background: '#F1F5F9', color: '#64748B' }}>
              <option value={user?.department || ''}>{user?.department || 'N/A'}</option>
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Tentative Research Title *</label>
          <input className="form-input" name="title" value={form.title} onChange={handle} placeholder="e.g., AI-Driven Solutions for Healthcare" required />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Research Abstract *</label>
          <textarea className="form-input" name="abstract" value={form.abstract} onChange={handle} rows="5" placeholder="Brief summary of your proposed research..." required />
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
};

// ── Waiting Room ──
const WaitingRoom = ({ thesis }) => (
  <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 48 }}>
    <Clock size={64} color="#F59E0B" style={{ margin: '0 auto 16px' }} />
    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>Awaiting Admin Verification</h3>
    <p style={{ color: '#6b7280', marginBottom: 24 }}>Your registration has been submitted. The admin will verify your enrollment and assign a supervisor. All uploads are locked until verification is complete.</p>
    <div style={{ background: '#FEF3C7', borderRadius: 12, padding: 16, textAlign: 'left' }}>
      <div style={{ fontWeight: 600, marginBottom: 8, color: '#92400E' }}>Submitted Details:</div>
      <div style={{ fontSize: '0.9rem', color: '#78350F' }}>
        <div>📋 Enrollment: <strong>{thesis.enrollmentNumber}</strong></div>
        <div>🏛 Department: <strong>{thesis.department}</strong></div>
        <div>📌 Title: <strong>{thesis.title}</strong></div>
      </div>
    </div>
    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#6b7280', fontSize: '0.85rem' }}>
      <Lock size={16} /> Uploads disabled until admin verification
    </div>
  </div>
);

// ── Coursework Phase ──
const CourseworkPhase = ({ thesis }) => (
  <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 48 }}>
    <Book size={64} color="#3B82F6" style={{ margin: '0 auto 16px' }} />
    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>Coursework Phase</h3>
    <p style={{ color: '#6b7280', marginBottom: 24 }}>Enrollment verified! ✅ You are currently in the coursework phase. Attend offline classes and exams. Your supervisor will unlock the synopsis upload once coursework is cleared.</p>
    <div style={{ background: '#DBEAFE', borderRadius: 12, padding: 16, textAlign: 'left' }}>
      <div style={{ fontWeight: 600, marginBottom: 8, color: '#1D4ED8' }}>Your Supervisor:</div>
      <div style={{ fontSize: '0.9rem', color: '#1E40AF' }}>
        {thesis.supervisorId ? `👨‍🏫 ${thesis.supervisorId.name}` : '⏳ Supervisor assignment pending'}
      </div>
    </div>
    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#6b7280', fontSize: '0.85rem' }}>
      <Lock size={16} /> Synopsis upload unlocks after coursework clearance
    </div>
  </div>
);

// ── Synopsis Phase ──
const SynopsisPhase = ({ thesis, milestones, onSubmit }) => {
  const synopsisMilestone = milestones.find(m => m.type === 'SYNOPSIS');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(thesis.title || '');
  const [abstract, setAbstract] = useState(thesis.abstract || '');
  const [loading, setLoading] = useState(false);
  const [drcMeetings, setDrcMeetings] = useState([]);

  useEffect(() => {
    if (synopsisMilestone && synopsisMilestone.status === 'APPROVED') {
      axios.get(`${API}/lifecycle/drc/thesis/${thesis._id}`, getAuthHeader())
        .then(res => setDrcMeetings(res.data))
        .catch(() => {});
    }
  }, [thesis._id, synopsisMilestone]);

  if (!synopsisMilestone) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 32, color: '#6b7280' }}>
        ⏳ Generating synopsis milestone... Please refresh.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a synopsis document');
    if (!title.trim()) return alert('Please enter your finalized research title');
    if (!abstract.trim()) return alert('Please enter your finalized research abstract');
    setLoading(true);
    try {
      await onSubmit(synopsisMilestone._id, file, title, abstract);
      alert('Synopsis and finalized research outline submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Synopsis Submission</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Current status info banner */}
        <div style={{ 
          background: synopsisMilestone.status === 'PENDING' ? '#FFFBEB' : synopsisMilestone.status === 'SUBMITTED' ? '#EFF6FF' : synopsisMilestone.status === 'APPROVED' ? '#ECFDF5' : '#FEF2F2',
          border: '1px solid',
          borderColor: synopsisMilestone.status === 'PENDING' ? '#FDE68A' : synopsisMilestone.status === 'SUBMITTED' ? '#BFDBFE' : synopsisMilestone.status === 'APPROVED' ? '#A7F3D0' : '#FCA5A5',
          padding: 16, 
          borderRadius: 8 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#1E293B' }}>Current Lifecycle Status:</span>
            <span style={{ 
              fontWeight: 800, 
              color: synopsisMilestone.status === 'PENDING' ? '#D97706' : synopsisMilestone.status === 'SUBMITTED' ? '#2563EB' : synopsisMilestone.status === 'APPROVED' ? '#059669' : '#DC2626',
              textTransform: 'uppercase'
            }}>
              {synopsisMilestone.status === 'PENDING' ? 'Synopsis Upload Unlocked' : 
               synopsisMilestone.status === 'SUBMITTED' ? 'Synopsis Submitted & Under Review' : 
               synopsisMilestone.status === 'APPROVED' ? 'Approved & Verified' : 
               'Correction Needed'}
            </span>
          </div>
          {synopsisMilestone.comments?.length > 0 && (
            <div style={{ marginTop: 12, padding: 12, background: 'rgba(255, 255, 255, 0.7)', borderRadius: 6 }}>
              <div style={{ fontWeight: 600, color: '#991B1B', marginBottom: 4 }}>Faculty Feedback / Directives:</div>
              {synopsisMilestone.comments.map((c, idx) => (
                <div key={idx} style={{ fontSize: '0.85rem', color: '#7F1D1D', fontStyle: 'italic', marginBottom: 2 }}>
                  "{c.text}" — {c.authorName}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Synopsis submission form */}
        {synopsisMilestone.status === 'PENDING' || synopsisMilestone.status === 'REVISION_REQUIRED' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Finalized Thesis Title *</label>
              <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Update or finalize your research title" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Finalized Research Abstract *</label>
              <textarea className="form-input" value={abstract} onChange={e => setAbstract(e.target.value)} required rows="5" placeholder="Provide a detailed finalized abstract summarizing methodology and expected contributions." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Synopsis Document (PDF/Word) *</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} required />
              <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 4 }}>Please ensure your document includes introduction, literature survey, proposed methodology, and references.</p>
            </div>
            
            <div style={{ background: '#F3F4F6', borderRadius: 8, padding: 12, fontSize: '0.8rem', color: '#4B5563' }}>
              ℹ️ <strong>Ph.D. Regulation Notice:</strong> Your synopsis will be automatically run through Turnitin/URKUND for plagiarism checks. Ensure similarity is strictly below 10% before submitting.
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', padding: '8px 20px' }}>
              {loading ? 'Submitting...' : 'Submit Research Synopsis'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#F9FAFB', padding: 16, borderRadius: 8, color: '#374151' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#4B5563', marginBottom: 4 }}>RESEARCH ABSTRACT</div>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{thesis.abstract}</div>
              {synopsisMilestone.documentUrl && (
                <a href={`http://localhost:5000${synopsisMilestone.documentUrl}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 12, color: '#0284C7', fontWeight: 600 }}>View Submitted Synopsis</a>
              )}
            </div>

            {synopsisMilestone.status === 'APPROVED' && (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 16, borderRadius: 10 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', marginBottom: 8 }}>
                  📆 Departmental Research Committee (DRC) Review
                </div>
                {drcMeetings.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem' }}>⏳</span>
                    <span>Synopsis approved by your supervisor! HOD will schedule the official DRC meeting for final evaluation shortly.</span>
                  </div>
                ) : (
                  drcMeetings.map(drc => (
                    <div key={drc._id} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0F172A' }}>DRC Session Schedule</span>
                        <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, background: drc.status === 'APPROVED' ? '#D1FAE5' : drc.status === 'REVISION_REQUIRED' ? '#FEE2E2' : '#FEF3C7', color: drc.status === 'APPROVED' ? '#065F46' : drc.status === 'REVISION_REQUIRED' ? '#991B1B' : '#92400E' }}>
                          {drc.status}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '0.8rem', color: '#475569' }}>
                        <div><strong>Date:</strong> {new Date(drc.scheduledDate).toLocaleDateString()}</div>
                        <div><strong>Time:</strong> {drc.scheduledTime}</div>
                        <div style={{ gridColumn: 'span 2' }}><strong>Venue:</strong> {drc.venue}</div>
                        {drc.committeeMembers && <div style={{ gridColumn: 'span 2' }}><strong>Committee:</strong> {drc.committeeMembers}</div>}
                        {drc.agenda && <div style={{ gridColumn: 'span 2' }}><strong>Agenda:</strong> {drc.agenda}</div>}
                        {drc.remarks && <div style={{ gridColumn: 'span 2', background: '#FFFBEB', padding: 6, borderRadius: 6, color: '#92400E', borderLeft: '3px solid #F59E0B', marginTop: 4 }}><strong>Committee Feedback:</strong> {drc.remarks}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Milestone Upload Card ──
const MilestoneCard = ({ milestone, onSubmit, isLocked }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const statusColor = { PENDING: '#D97706', SUBMITTED: '#3B82F6', APPROVED: '#059669', REVISION_REQUIRED: '#DC2626' };
  const statusBg = { PENDING: '#FEF3C7', SUBMITTED: '#DBEAFE', APPROVED: '#D1FAE5', REVISION_REQUIRED: '#FEE2E2' };

  const handleSubmit = async () => {
    if (!file) return alert('Please select a file');
    setLoading(true);
    try { await onSubmit(milestone._id, file); setFile(null); }
    catch (e) { alert(e.response?.data?.message || 'Upload failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#111827' }}>{milestone.title}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>Type: {milestone.type}</div>
          {milestone.dueDate && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Due: {new Date(milestone.dueDate).toLocaleDateString()}</div>}
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600, background: statusBg[milestone.status], color: statusColor[milestone.status] }}>
          {milestone.status}
        </span>
      </div>

      {milestone.comments?.length > 0 && (
        <div style={{ marginTop: 12, padding: 10, background: '#FEF3C7', borderRadius: 8 }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#92400E', marginBottom: 4 }}>Supervisor Feedback:</div>
          {milestone.comments.map((c, i) => <div key={i} style={{ fontSize: '0.85rem', color: '#78350F' }}>"{c.text}" — {c.authorName}</div>)}
        </div>
      )}

      {!isLocked && (milestone.status === 'PENDING' || milestone.status === 'REVISION_REQUIRED') && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} style={{ flex: 1, fontSize: '0.85rem' }} />
          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ padding: '6px 16px' }}>
            <Upload size={14} style={{ marginRight: 4 }} />{loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
      {milestone.documentUrl && (
        <div style={{ marginTop: 8 }}>
          <a href={`http://localhost:5000${milestone.documentUrl}`} target="_blank" rel="noreferrer" style={{ color: '#10B981', fontSize: '0.85rem' }}>📄 View Submitted Document</a>
        </div>
      )}
    </div>
  );
};

// ── Active Research Phase ──
const ActiveResearch = ({ thesis, milestones, onSubmit }) => (
  <div>
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 className="card-title">Research Timeline</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[{ label: 'Start Date', value: thesis.startDate ? new Date(thesis.startDate).toLocaleDateString() : 'N/A' },
          { label: 'Supervisor', value: thesis.supervisorId?.name || 'N/A' },
          { label: 'Department', value: thesis.department }].map(({ label, value }) => (
          <div key={label} style={{ background: '#F0FDF4', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{label}</div>
            <div style={{ fontWeight: 600, color: '#111827' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
    <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: 12 }}>Progress Milestones</h3>
    {milestones.filter(m => m.type === 'PROGRESS_REPORT' || m.type === 'SYNOPSIS').map(m => (
      <MilestoneCard key={m._id} milestone={m} onSubmit={onSubmit} isLocked={false} />
    ))}
    {milestones.filter(m => m.type === 'PROGRESS_REPORT' || m.type === 'SYNOPSIS').length === 0 && (
      <div className="card" style={{ textAlign: 'center', color: '#6b7280', padding: 32 }}>No milestones yet. Your supervisor will create progress report milestones.</div>
    )}
  </div>
);

// ── Pre-Submission Phase ──
const PreSubmission = ({ thesis, milestones, onSubmit }) => {
  const preMilestone = milestones.find(m => m.type === 'PRE_SUBMISSION');
  return (
    <div>
      <div className="card" style={{ marginBottom: 16, background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
        <h3 style={{ color: '#0369A1', marginBottom: 8 }}>🎯 Pre-Submission Stage</h3>
        <p style={{ color: '#0C4A6E', fontSize: '0.9rem' }}>You've been cleared by the HOD! Upload your pre-submission package including publication proofs, plagiarism report, and rough draft.</p>
      </div>
      {preMilestone && <MilestoneCard milestone={preMilestone} onSubmit={onSubmit} isLocked={false} />}
    </div>
  );
};

// ── Submitted (Read-Only) ──
const SubmittedView = ({ thesis }) => (
  <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 48 }}>
    <Lock size={64} color="#6B7280" style={{ margin: '0 auto 16px' }} />
    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>Thesis Submitted</h3>
    <p style={{ color: '#6b7280', marginBottom: 16 }}>Your thesis was submitted on <strong>{thesis.submittedAt ? new Date(thesis.submittedAt).toLocaleDateString() : 'N/A'}</strong>. All uploads are now permanently locked. Awaiting external evaluation.</p>
    <div style={{ background: '#F3F4F6', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: '0.9rem', color: '#374151' }}>📬 Thesis dispatched to external examiners<br/>⏳ Awaiting examiner reports and viva date</div>
    </div>
  </div>
);

// ── Awarded ──
const AwardedView = ({ thesis }) => (
  <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 48 }}>
    <div style={{ fontSize: 80, marginBottom: 16 }}>🎓</div>
    <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669', marginBottom: 8 }}>Degree Awarded!</h3>
    <p style={{ color: '#6b7280', marginBottom: 16 }}>Congratulations, Doctor! Your Ph.D. degree has been officially awarded on <strong>{thesis.awardedAt ? new Date(thesis.awardedAt).toLocaleDateString() : 'N/A'}</strong>.</p>
    <div style={{ fontStyle: 'italic', color: '#374151', fontSize: '1.1rem' }}>"{thesis.title}"</div>
  </div>
);

// ── Overview (status summary) ──
const OverviewPage = ({ thesis, milestones, setActiveTab, user }) => {
  const [drcMeetings, setDrcMeetings] = useState([]);
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    if (thesis) {
      axios.get(`${API}/lifecycle/drc/thesis/${thesis._id}`, getAuthHeader())
        .then(res => setDrcMeetings(res.data))
        .catch(() => {});
      axios.get(`${API}/lifecycle/publications/thesis/${thesis._id}`, getAuthHeader())
        .then(res => setPublications(res.data))
        .catch(() => {});
    }
  }, [thesis]);

  const statusMap = {
    REGISTRATION_PENDING: { label: 'Awaiting Admin Verification', color: '#D97706', bg: '#FEF3C7', progress: 10, nextAction: 'Wait for HOD to verify your enrollment and assign a department supervisor.' },
    COURSEWORK: { label: 'Coursework Phase', color: '#3B82F6', bg: '#DBEAFE', progress: 25, nextAction: 'Focus on completing your doctoral coursework syllabus and clear your coursework exams.' },
    SYNOPSIS_PENDING: { label: 'Synopsis Submission', color: '#8B5CF6', bg: '#EDE9FE', progress: 40, nextAction: 'Upload your research synopsis proposal PDF. Ensure similarity indexing is within permissible limits.' },
    ACTIVE_RESEARCH: { label: 'Active Research', color: '#059669', bg: '#D1FAE5', progress: 65, nextAction: 'Submit periodic 6-month progress reports to your Research Advisory Committee (RAC) and publish research papers.' },
    PRE_SUBMISSION: { label: 'Pre-Submission', color: '#EA580C', bg: '#FED7AA', progress: 85, nextAction: 'Prepare for your pre-submission seminar and defense colloquium in front of department experts.' },
    SUBMITTED: { label: 'Under Evaluation', color: '#6B7280', bg: '#F3F4F6', progress: 95, nextAction: 'Your final thesis is under review by external examiners. Updates will be visible here shortly.' },
    AWARDED: { label: 'Degree Awarded 🎓', color: '#059669', bg: '#D1FAE5', progress: 100, nextAction: 'Congratulations! Your Ph.D. degree has been officially awarded by the Academic Council.' },
  };

  const s = statusMap[thesis.status] || statusMap['REGISTRATION_PENDING'];
  const activeDrc = drcMeetings.find(m => m.status === 'SCHEDULED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Milestone Timeline */}
      <MilestoneTimeline currentStatus={thesis.status} />

      {/* 2. DRC Scheduled Reminder Callout (if active) */}
      {activeDrc && (
        <div style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          borderLeft: '5px solid #F59E0B',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{ width: '40px', height: '40px', background: '#FEF3C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.9rem' }}>⚠️ Upcoming Departmental Research Committee (DRC) Meeting Scheduled!</div>
            <div style={{ fontSize: '0.8rem', color: '#B45309', marginTop: '4px' }}>
              <strong>Date:</strong> {new Date(activeDrc.scheduledDate).toLocaleDateString()} | <strong>Time:</strong> {activeDrc.scheduledTime} | <strong>Venue:</strong> {activeDrc.venue}
            </div>
            {activeDrc.agenda && (
              <div style={{ fontSize: '0.78rem', color: '#B45309', fontStyle: 'italic', marginTop: '2px' }}>
                Agenda: {activeDrc.agenda}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Body (Grid layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {/* Left Hand: Ph.D. Profile Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <NotificationPanel user={user} onTabChange={setActiveTab} />
          <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
              📝 Ph.D. Research Overview
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {[
                ['Enrollment Number', thesis.enrollmentNumber],
                ['Research Department', thesis.department],
                ['Research Advisor', thesis.supervisorId?.name || 'Awaiting Allocation'],
                ['Assigned Co-Supervisor', thesis.coSupervisorId?.name || 'None Assigned']
              ].map(([k, v]) => (
                <div key={k} style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{k}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '16px', border: '1px solid #DCFCE7' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Next Action Required</div>
              <div style={{ fontSize: '0.82rem', color: '#15803D', lineHeight: 1.5 }}>{s.nextAction}</div>
            </div>
          </div>

          {/* Audit Log Card */}
          {thesis.auditLog && thesis.auditLog.length > 0 && (
            <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
                📜 Progression History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {thesis.auditLog.slice().reverse().map((log, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6', marginTop: '6px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B' }}>{log.action.replace(/_/g, ' ')}</div>
                      {log.note && <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>{log.note}</div>}
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
                        {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Hand Column: Stats & Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Key Metrics Card */}
          <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
              📊 Academic Metrics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '16px', background: '#EFF6FF', borderRadius: '12px', textAlign: 'center', border: '1px solid #DBEAFE' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#1E40AF' }}>{publications.length}</div>
                <div style={{ fontSize: '0.7rem', color: '#1E40AF', fontWeight: 600 }}>Publications</div>
              </div>
              <div style={{ padding: '16px', background: '#ECFDF5', borderRadius: '12px', textAlign: 'center', border: '1px solid #D1FAE5' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#065F46' }}>
                  {milestones.filter(m => m.status === 'APPROVED').length} / {milestones.length || 1}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#065F46', fontWeight: 600 }}>Milestones Approved</div>
              </div>
            </div>
          </div>

          {/* Quick Actions Nav */}
          <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
              ⚡ Quick Navigation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { key: 'milestones', label: '🚀 Upload Milestone Document' },
                { key: 'rac', label: '📆 Submit RAC Progress Report' },
                { key: 'publications', label: '📚 Log Research Publication' },
                { key: 'profile', label: '👤 Complete/Edit Profile Details' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Deliverables list */}
          {milestones.length > 0 && (
            <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
                📂 Recent Deliverables
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {milestones.slice(0, 3).map(m => (
                  <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B' }}>{m.title}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>Type: {m.type}</div>
                    </div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 12,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: m.status === 'APPROVED' ? '#D1FAE5' : m.status === 'REVISION_REQUIRED' ? '#FEE2E2' : '#FEF3C7',
                      color: m.status === 'APPROVED' ? '#065F46' : m.status === 'REVISION_REQUIRED' ? '#991B1B' : '#92400E'
                    }}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Profile Tab ──
// ── GNUMS Ph.D. Lifecycle components ──
const RACProgressTab = ({ thesis }) => {
  const [racs, setRacs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportUrl, setReportUrl] = useState('');
  const [uploadingId, setUploadingId] = useState(null);

  const fetchRACs = async () => {
    try {
      const res = await axios.get(`${API}/lifecycle/rac/thesis/${thesis._id}`, getAuthHeader());
      setRacs(res.data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => { fetchRACs(); }, []);

  const handleReportUpload = async (racId) => {
    if (!reportUrl) return alert('Please enter report URL or document link.');
    try {
      await axios.put(`${API}/lifecycle/rac/${racId}/report`, { progressReportUrl: reportUrl }, getAuthHeader());
      alert('Progress report submitted successfully!');
      setUploadingId(null);
      setReportUrl('');
      fetchRACs();
    } catch (err) {
      alert('Upload failed.');
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Research Advisory Committee (RAC) Progress</h3>
      <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 20 }}>
        Track scheduled RAC reviews, upload mandatory periodic progress reports, and view evaluation remarks from the doctoral committee.
      </p>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>Loading reviews...</div>
      ) : racs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748B', background: '#F8FAFC', borderRadius: 8 }}>
          No RAC sessions have been scheduled by your HOD yet.
        </div>
      ) : (
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex: 1 }}>Session</div>
            <div style={{ flex: 2 }}>Scheduled Date</div>
            <div style={{ flex: 2 }}>Committee</div>
            <div style={{ flex: 1.5 }}>Status</div>
            <div style={{ flex: 2 }}>Remarks</div>
            <div style={{ flex: 2, textAlign: 'center' }}>Action</div>
          </div>
          {racs.map(r => (
            <div key={r._id} className="file-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div style={{ flex: 1, fontWeight: 700, color: '#1E3A8A' }}>RAC-{r.racNumber}</div>
                <div style={{ flex: 2, fontSize: '0.9rem' }}>{new Date(r.scheduledDate).toLocaleDateString()}</div>
                <div style={{ flex: 2, fontSize: '0.85rem', color: '#475569' }}>{r.committeeMembers || 'Pending Formation'}</div>
                <div style={{ flex: 1.5 }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                    background: r.status === 'SATISFACTORY' ? '#D1FAE5' : r.status === 'UNSATISFACTORY' ? '#FEE2E2' : '#FEF3C7',
                    color: r.status === 'SATISFACTORY' ? '#065F46' : r.status === 'UNSATISFACTORY' ? '#991B1B' : '#D97706'
                  }}>
                    {r.status}
                  </span>
                </div>
                <div style={{ flex: 2, fontSize: '0.85rem', color: '#475569' }}>{r.remarks || '—'}</div>
                <div style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
                  {r.status === 'SCHEDULED' ? (
                    <button 
                      onClick={() => setUploadingId(uploadingId === r._id ? null : r._id)}
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#2563EB' }}
                    >
                      {r.progressReportUrl ? 'Update Report' : 'Submit Report'}
                    </button>
                  ) : r.progressReportUrl ? (
                    <a href={r.progressReportUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}>
                      📄 View Report
                    </a>
                  ) : '—'}
                </div>
              </div>
              {uploadingId === r._id && (
                <div style={{ display: 'flex', gap: 10, background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px dashed #CBD5E1' }}>
                  <input 
                    type="text" 
                    placeholder="Paste report document URL or drive link here..." 
                    className="form-input" 
                    value={reportUrl} 
                    onChange={e => setReportUrl(e.target.value)} 
                    style={{ flex: 1, fontSize: '0.85rem' }} 
                  />
                  <button onClick={() => handleReportUpload(r._id)} className="btn-primary" style={{ background: '#059669', fontSize: '0.85rem' }}>Submit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PublicationsTab = ({ thesis }) => {
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', journalName: '', issn: '', publicationDate: '', paperLink: '', attachmentUrl: '' });

  const fetchPubs = async () => {
    try {
      const res = await axios.get(`${API}/lifecycle/publications/thesis/${thesis._id}`, getAuthHeader());
      setPubs(res.data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => { fetchPubs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/lifecycle/publications`, { ...form, thesisId: thesis._id }, getAuthHeader());
      alert('Publication logged successfully and pending review!');
      setShowForm(false);
      setForm({ title: '', journalName: '', issn: '', publicationDate: '', paperLink: '', attachmentUrl: '' });
      fetchPubs();
    } catch (err) {
      alert('Error logging publication.');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>Research Publications Log</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: 4 }}>
            Maintain records of peer-reviewed journal papers and scientific publications generated during your doctoral studies.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ background: '#059669', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Plus size={16} /> Log Paper
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h4 style={{ margin: 0, color: '#0F172A' }}>Log New Scientific Publication</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Paper Title</label>
              <input type="text" className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Journal/Conference Name</label>
              <input type="text" className="form-input" required value={form.journalName} onChange={e => setForm({ ...form, journalName: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>ISSN / ISBN</label>
              <input type="text" className="form-input" value={form.issn} onChange={e => setForm({ ...form, issn: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Publication Date</label>
              <input type="date" className="form-input" required value={form.publicationDate} onChange={e => setForm({ ...form, publicationDate: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Paper/Publisher Link</label>
              <input type="text" className="form-input" value={form.paperLink} onChange={e => setForm({ ...form, paperLink: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Attachment Proof URL (e.g. PDF copy upload link)</label>
            <input type="text" className="form-input" value={form.attachmentUrl} onChange={e => setForm({ ...form, attachmentUrl: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ padding: '8px 16px' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: '#133A26', padding: '8px 16px' }}>Submit Log</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>Loading publications...</div>
      ) : pubs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748B', background: '#F8FAFC', borderRadius: 8 }}>
          No research papers logged yet.
        </div>
      ) : (
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex: 3 }}>Paper Title</div>
            <div style={{ flex: 2 }}>Journal</div>
            <div style={{ flex: 1.2 }}>ISSN</div>
            <div style={{ flex: 1.5 }}>Date</div>
            <div style={{ flex: 1.2 }}>Status</div>
            <div style={{ flex: 1.2, textAlign: 'center' }}>Links</div>
          </div>
          {pubs.map(p => (
            <div key={p._id} className="file-item">
              <div style={{ flex: 3, fontWeight: 700 }}>{p.title}</div>
              <div style={{ flex: 2, fontSize: '0.9rem' }}>{p.journalName}</div>
              <div style={{ flex: 1.2, fontSize: '0.85rem', color: '#64748B' }}>{p.issn || '—'}</div>
              <div style={{ flex: 1.5, fontSize: '0.85rem' }}>{new Date(p.publicationDate).toLocaleDateString()}</div>
              <div style={{ flex: 1.2 }}>
                <span style={{ 
                  padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                  background: p.status === 'VERIFIED' ? '#D1FAE5' : p.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                  color: p.status === 'VERIFIED' ? '#065F46' : p.status === 'REJECTED' ? '#991B1B' : '#D97706'
                }}>
                  {p.status}
                </span>
              </div>
              <div style={{ flex: 1.2, display: 'flex', gap: 8, justifyContent: 'center' }}>
                {p.paperLink && <a href={p.paperLink} target="_blank" rel="noreferrer" title="View Article" style={{ color: '#2563EB' }}><File size={16} /></a>}
                {p.attachmentUrl && <a href={p.attachmentUrl} target="_blank" rel="noreferrer" title="Attachment" style={{ color: '#059669' }}><Upload size={16} /></a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RequestChangesTab = ({ thesis }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [form, setForm] = useState({ type: 'TITLE_CHANGE', proposedValue: '', reason: '' });

  const fetchRequests = async () => {
    try {
      const [rRes, fRes] = await Promise.all([
        axios.get(`${API}/lifecycle/change-requests/thesis/${thesis._id}`, getAuthHeader()),
        axios.get(`${API}/auth/faculty`, getAuthHeader())
      ]);
      setRequests(rRes.data);
      setFaculty(fRes.data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.proposedValue) return alert('Please enter proposed value.');
    try {
      await axios.post(`${API}/lifecycle/change-requests`, { ...form, thesisId: thesis._id }, getAuthHeader());
      alert('Change request submitted successfully!');
      setShowForm(false);
      setForm({ type: 'TITLE_CHANGE', proposedValue: '', reason: '' });
      fetchRequests();
    } catch (err) {
      alert('Error submitting request.');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>Guide & Title Change Desk</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: 4 }}>
            Propose updates to your registered Thesis Title or assigned Supervisor (Guide) along with supporting academic reasons.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ background: '#059669', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Plus size={16} /> New Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h4 style={{ margin: 0, color: '#0F172A' }}>Create Academic Modification Request</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Request Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, proposedValue: '' })}>
                <option value="TITLE_CHANGE">Thesis Title Modification</option>
                <option value="GUIDE_CHANGE">Supervisor Reallocation</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                {form.type === 'TITLE_CHANGE' ? 'Proposed New Title' : 'Select Proposed Research Guide'}
              </label>
              {form.type === 'TITLE_CHANGE' ? (
                <input type="text" className="form-input" required placeholder="Enter the exact new thesis topic title..." value={form.proposedValue} onChange={e => setForm({ ...form, proposedValue: e.target.value })} />
              ) : (
                <select className="form-input" required value={form.proposedValue} onChange={e => setForm({ ...form, proposedValue: e.target.value })}>
                  <option value="">Select guide...</option>
                  {faculty.map(f => <option key={f._id} value={f._id}>{f.name} ({f.department})</option>)}
                </select>
              )}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Supporting Rationale & Academic Reason</label>
            <textarea className="form-input" required rows={3} placeholder="Please detail the academic ground or scientific reason for this reallocation/change request..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ padding: '8px 16px' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: '#133A26', padding: '8px 16px' }}>Submit Request</button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>Loading requests...</div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748B', background: '#F8FAFC', borderRadius: 8 }}>
          No guide or title modification requests logged yet.
        </div>
      ) : (
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex: 1.5 }}>Type</div>
            <div style={{ flex: 2 }}>Current Value</div>
            <div style={{ flex: 2.5 }}>Proposed Value</div>
            <div style={{ flex: 2.5 }}>Reason</div>
            <div style={{ flex: 1.2 }}>Status</div>
            <div style={{ flex: 2 }}>Remarks</div>
          </div>
          {requests.map(r => (
            <div key={r._id} className="file-item">
              <div style={{ flex: 1.5, fontWeight: 600, fontSize: '0.85rem', color: '#1E3A8A' }}>
                {r.type === 'TITLE_CHANGE' ? '📝 Title Change' : '🤝 Guide Change'}
              </div>
              <div style={{ flex: 2, fontSize: '0.85rem', color: '#64748B' }}>{r.currentValue}</div>
              <div style={{ flex: 2.5, fontSize: '0.85rem', fontWeight: 600 }}>
                {r.type === 'GUIDE_CHANGE' ? (faculty.find(f => f._id === r.proposedValue)?.name || 'New Faculty') : r.proposedValue}
              </div>
              <div style={{ flex: 2.5, fontSize: '0.85rem' }}>{r.reason}</div>
              <div style={{ flex: 1.2 }}>
                <span style={{ 
                  padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                  background: r.status === 'APPROVED' ? '#D1FAE5' : r.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                  color: r.status === 'APPROVED' ? '#065F46' : r.status === 'REJECTED' ? '#991B1B' : '#D97706'
                }}>
                  {r.status}
                </span>
              </div>
              <div style={{ flex: 2, fontSize: '0.85rem', color: '#475569' }}>{r.remarks || '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CertificatesTab = ({ thesis }) => {
  const [hasVerifiedPubs, setHasVerifiedPubs] = useState(false);
  const [hasVerifiedRacs, setHasVerifiedRacs] = useState(false);

  useEffect(() => {
    axios.get(`${API}/lifecycle/publications/thesis/${thesis._id}`, getAuthHeader())
      .then(res => setHasVerifiedPubs(res.data.some(p => p.status === 'VERIFIED')))
      .catch(() => {});
    axios.get(`${API}/lifecycle/rac/thesis/${thesis._id}`, getAuthHeader())
      .then(res => setHasVerifiedRacs(res.data.some(r => r.status === 'SATISFACTORY')))
      .catch(() => {});
  }, []);

  const certs = [
    {
      type: 'REGISTRATION',
      title: 'Ph.D. Registration Certificate',
      desc: 'Official certificate verifying scholar registration, topic approval, and department affiliation.',
      enabled: thesis.enrollmentVerified
    },
    {
      type: 'COURSEWORK',
      title: 'Course Work Certificate',
      desc: 'Certifies successful completion of all core coursework, assignments, and curriculum exams.',
      enabled: thesis.status !== 'COURSEWORK'
    },
    {
      type: 'PUBLICATIONS',
      title: 'Research Publications Log',
      desc: 'Log certificate validating peer-reviewed articles and research papers published.',
      enabled: hasVerifiedPubs
    },
    {
      type: 'RAC',
      title: 'Research Progress Certificate',
      desc: 'Official certificate verifying satisfactory periodic Research Advisory Committee reviews.',
      enabled: hasVerifiedRacs
    }
  ];

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title">Dynamic Academic Credentials</h3>
        <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
          Upon formal HOD reviews and supervisor clearances, download official printable registration, coursework, progress, and publication credentials.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {certs.map(c => (
          <div key={c.type} className="card" style={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: c.enabled ? 1 : 0.65, 
            borderLeft: `6px solid ${c.enabled ? '#059669' : '#CBD5E1'}`, transition: 'all 0.2s' 
          }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0F172A' }}>{c.title}</h4>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 16px 0', lineHeight: 1.5 }}>{c.desc}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ 
                padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                background: c.enabled ? '#D1FAE5' : '#F3F4F6', color: c.enabled ? '#065F46' : '#64748B'
              }}>
                {c.enabled ? '✓ Unlocked' : '🔒 Locked'}
              </span>
              {c.enabled ? (
                <a 
                  href={`http://localhost:5000/api/lifecycle/certificates/${thesis._id}/${c.type}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-primary" 
                  style={{ background: '#059669', fontSize: '0.8rem', padding: '8px 16px', display: 'flex', gap: 6, alignItems: 'center', textDecoration: 'none' }}
                >
                  View / Print
                </a>
              ) : (
                <button disabled className="btn-primary" style={{ background: '#CBD5E1', color: '#64748B', cursor: 'not-allowed', fontSize: '0.8rem', padding: '8px 16px' }}>
                  View / Print
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileTab = () => {
  const { user, updateProfile, uploadAvatar } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState(user?.profile?.phoneNumber || '');
  const [address, setAddress] = useState(user?.profile?.address || '');
  const [academicBackground, setAcademicBackground] = useState(user?.profile?.academicBackground || '');
  const [areaOfInterest, setAreaOfInterest] = useState(user?.profile?.areaOfInterest || '');
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    setMsg('');
    const res = await uploadAvatar(file);
    setAvatarLoading(false);
    if (res.success) {
      setMsg('Profile picture uploaded successfully!');
    } else {
      setMsg('Failed to upload profile picture: ' + res.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const cleanedPhone = phoneNumber.trim().replace(/[\s\-()]/g, '');
    const indianPhoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(cleanedPhone)) {
      setMsg('Failed to update profile: Please enter a valid 10-digit Indian phone number (starts with 6-9).');
      setLoading(false);
      return;
    }

    const payload = {
      phoneNumber,
      address,
      academicBackground: user.role === 'STUDENT' ? academicBackground : undefined,
      areaOfInterest: user.role === 'STUDENT' ? areaOfInterest : undefined,
    };
    const res = await updateProfile(payload);
    setLoading(false);
    if (res.success) {
      setMsg('Profile updated successfully!');
    } else {
      setMsg('Failed to update profile: ' + res.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: 16 }}>My Profile & Credentials</h3>
      
      {/* Profile Picture Upload */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
        {user?.avatarUrl ? (
          <img 
            src={`http://localhost:5000${user.avatarUrl}`} 
            alt="Avatar Preview" 
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #E2E8F0', background: '#F8FAFC' }} 
          />
        ) : (
          <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e2e8f0', display: 'block', border: '3px solid #E2E8F0' }}>
            <circle cx="50" cy="35" r="20" fill="#94a3b8" />
            <path d="M15 85c0-13.8 11.2-25 25-25h20c13.8 0 25 11.2 25 25z" fill="#94a3b8" />
          </svg>
        )}
        <div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#133A26', color: 'white', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            {avatarLoading ? 'Uploading...' : '📷 Change Profile Picture'}
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} disabled={avatarLoading} />
          </label>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>JPG, PNG or GIF. Max 5MB.</span>
        </div>
      </div>

      {msg && (
        <div style={{ padding: 12, borderRadius: 8, background: msg.includes('successfully') ? '#E8F5E9' : '#FFEBEE', color: msg.includes('successfully') ? '#2E7D32' : '#C62828', marginBottom: 16, fontSize: '0.85rem', fontWeight: 600 }}>
          {msg}
        </div>
      )}
      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Full Name</label>
            <input type="text" className="form-input" value={user?.name} disabled style={{ background: '#F1F5F9', color: '#64748B' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Username / Email</label>
            <input type="text" className="form-input" value={user?.username} disabled style={{ background: '#F1F5F9', color: '#64748B' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Role</label>
            <input type="text" className="form-input" value={user?.role} disabled style={{ background: '#F1F5F9', color: '#64748B' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Department</label>
            <input type="text" className="form-input" value={user?.department || 'N/A'} disabled style={{ background: '#F1F5F9', color: '#64748B' }} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Phone Number (Indian Format)</label>
          <input type="text" className="form-input" placeholder="Enter 10-digit mobile number e.g. 9876543210" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Address</label>
          <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} required />
        </div>
        {user?.role === 'STUDENT' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Academic Background</label>
              <select className="form-input" value={academicBackground} onChange={e => setAcademicBackground(e.target.value)} required>
                <option value="">Select...</option>
                <option value="M.Tech Computer Science">M.Tech Computer Science</option>
                <option value="M.Sc Information Technology">M.Sc Information Technology</option>
                <option value="B.Tech Honours">B.Tech Honours</option>
                <option value="M.Phil">M.Phil</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Area of Research Interest</label>
              <input type="text" className="form-input" value={areaOfInterest} onChange={e => setAreaOfInterest(e.target.value)} required />
            </div>
          </>
        )}
        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8, background: '#059669' }}>
          {loading ? 'Saving...' : 'Update Details'}
        </button>
      </form>
    </div>
  );
};

// ── Main Dashboard ──
const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('registration');
  const { user } = useContext(AuthContext);
  const { thesis, milestones, loading, fetchMyThesis, createThesis, submitMilestone } = useContext(ThesisContext);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(user && !user.profileCompleted);

  useEffect(() => { 
    fetchMyThesis(); 
  }, []);

  useEffect(() => {
    if (thesis && thesis.status !== 'REGISTRATION_PENDING') {
      setActiveTab('overview');
    }
  }, [thesis]);

  const handleEnrollment = async (formData) => {
    await createThesis(formData);
    await fetchMyThesis();
  };

  const titles = { overview: 'Student Dashboard', registration: 'Thesis Registration', thesis: 'My Thesis', rac: 'RAC Progress', publications: 'Publications', changes: 'Request Changes', certificates: 'Certificates', milestones: 'Milestones', documents: 'Documents', meetings: 'Meetings', profile: 'Profile' };

  const renderStatusContent = () => {
    if (loading) return <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading...</div>;

    if (!thesis) {
      if (activeTab === 'registration') return <EnrollmentForm onSubmit={handleEnrollment} />;
      if (activeTab === 'profile') return <ProfileTab />;
      return (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 48 }}>
          <ClipboardList size={64} color="#9CA3AF" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>Registration Required</h3>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Please complete and submit your Thesis Registration details under the **Registration** tab first to unlock the student portal features.</p>
          <button className="btn-primary" onClick={() => setActiveTab('registration')}>Complete Thesis Registration</button>
        </div>
      );
    }

    if (thesis.status === 'REGISTRATION_PENDING') {
      if (activeTab === 'registration') {
        return (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: '#D97706' }}>
            <CheckCircle2 size={48} style={{ margin: '0 auto 12px' }} />
            <h3>Registration Submitted</h3>
            <p style={{ color: '#6b7280', marginTop: 8 }}>Your registration details have been submitted and are currently awaiting HOD/admin verification.</p>
          </div>
        );
      }
      if (activeTab === 'profile') return <ProfileTab />;
      return <WaitingRoom thesis={thesis} />;
    }

    switch (activeTab) {
      case 'overview': return <OverviewPage thesis={thesis} milestones={milestones} setActiveTab={setActiveTab} user={user} />;
      case 'registration':
        return (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: '#059669' }}>
            <CheckCircle2 size={48} style={{ margin: '0 auto 12px' }} />
            <h3>Registration Verified & Approved</h3>
            <p style={{ color: '#6b7280', marginTop: 8 }}>Your Ph.D. registration is officially approved and locked.</p>
          </div>
        );
      case 'rac': return <RACProgressTab thesis={thesis} />;
      case 'publications': return <PublicationsTab thesis={thesis} />;
      case 'changes': return <RequestChangesTab thesis={thesis} />;
      case 'certificates': return <CertificatesTab thesis={thesis} />;
      case 'milestones':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MilestoneTimeline currentStatus={thesis.status} />
            {(() => {
              if (thesis.status === 'COURSEWORK') return <CourseworkPhase thesis={thesis} />;
              if (thesis.status === 'SYNOPSIS_PENDING') return <SynopsisPhase thesis={thesis} milestones={milestones} onSubmit={submitMilestone} />;
              if (thesis.status === 'ACTIVE_RESEARCH') return <ActiveResearch thesis={thesis} milestones={milestones} onSubmit={submitMilestone} />;
              if (thesis.status === 'PRE_SUBMISSION') return <PreSubmission thesis={thesis} milestones={milestones} onSubmit={submitMilestone} />;
              if (thesis.status === 'SUBMITTED' || thesis.status === 'AWARDED') return <SubmittedView thesis={thesis} />;
              return <div className="card" style={{ padding: 32, color: '#6b7280' }}>No milestones yet.</div>;
            })()}
          </div>
        );
      case 'thesis':
        if (thesis.status === 'SUBMITTED') return <SubmittedView thesis={thesis} />;
        if (thesis.status === 'AWARDED') return <AwardedView thesis={thesis} />;
        return (
          <div className="card">
            <h3 className="card-title">Thesis Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[['Title', thesis.title],['Enrollment', thesis.enrollmentNumber],['Department', thesis.department],['Status', thesis.status],['Supervisor', thesis.supervisorId?.name || 'Pending'],['Start Date', thesis.startDate ? new Date(thesis.startDate).toLocaleDateString() : 'N/A']].map(([k, v]) => (
                <div key={k}><div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 4 }}>{k}</div><div style={{ fontWeight: 600, color: '#111827' }}>{v}</div></div>
              ))}
            </div>
          </div>
        );
      case 'profile': return <ProfileTab />;
      default: return <div className="card"><h3 className="card-title">{titles[activeTab]}</h3><p style={{ color: '#6b7280', marginTop: 8 }}>Content coming soon.</p></div>;
    }
  };

  return (
    <div className="app-container">
      <div className="mobile-overlay" onClick={() => document.body.classList.remove('sidebar-mobile-open')} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Floating warning banner */}
        {user && !user.profileCompleted && (
          <div style={{
            background: '#FEE2E2',
            color: '#DC2626',
            padding: '12px 24px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderBottom: '1px solid #FCA5A5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            zIndex: 999
          }}>
            <span>⚠️ Please complete your profile first before proceeding further.</span>
            <button 
              onClick={() => setIsOnboardingOpen(true)}
              style={{
                background: '#DC2626',
                color: 'white',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Complete Profile
            </button>
          </div>
        )}
        
        <Header title={titles[activeTab] || 'Dashboard'} />
        <div className="dashboard-area" style={{ flex: 1 }}>
          <div className="welcome-banner">
            <div><span className="welcome-text">Welcome, {user?.name || 'Scholar'}!</span><span className="welcome-subtext"> | Ph.D. Scholar Portal</span></div>
            <div className="brand-text">HPU ScholarSync</div>
          </div>
          {renderStatusContent()}
        </div>
      </div>
      <ProfileOnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
};

export default StudentDashboard;
