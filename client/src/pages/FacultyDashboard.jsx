import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, FileText, Users, Calendar, User, LogOut, Bell, CheckCircle2, XCircle, Layers, Award, Upload, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThesisContext } from '../context/ThesisContext';
import ProfileOnboardingModal from '../components/ProfileOnboardingModal';
import NotificationPanel from '../components/NotificationPanel';

const Sidebar = ({ activeTab, setActiveTab, subRole, isVerified }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const supervisorItems = [
    { key: 'overview', label: 'Dashboard', Icon: Home },
    { key: 'scholars', label: 'My Scholars', Icon: Users },
    { key: 'rac', label: 'RAC Progress', Icon: Layers },
    { key: 'reviews', label: 'Pending Reviews', Icon: FileText },
    { key: 'profile', label: 'Profile', Icon: User },
  ];
  const hodItems = [
    { key: 'overview', label: 'Dashboard', Icon: Home },
    { key: 'registrations', label: 'Registration Requests', Icon: ShieldCheck },
    { key: 'dept', label: 'Department Theses', Icon: Users },
    { key: 'drc', label: 'DRC Approvals', Icon: CheckCircle2 },
    { key: 'rac', label: 'RAC Progress', Icon: Layers },
    { key: 'profile', label: 'Profile', Icon: User },
  ];
  const items = subRole === 'HOD' ? hodItems : supervisorItems;
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
        {subRole && <div style={{ textAlign: 'center', fontSize: '0.7rem', background: subRole === 'HOD' ? '#FEF3C7' : '#DBEAFE', color: subRole === 'HOD' ? '#D97706' : '#1D4ED8', borderRadius: 6, padding: '2px 8px', margin: '4px auto', width: 'fit-content' }}>{subRole}</div>}
      </div>
      <div className="sidebar-nav">
        {items.map(({ key, label, Icon }) => {
          const disabled = !isVerified && key !== 'profile';
          return (
            <button 
              key={key} 
              className={`nav-item ${activeTab === key ? 'active' : ''}`} 
              onClick={() => { if (!disabled) { setActiveTab(key); document.body.classList.remove('sidebar-mobile-open'); } }}
              disabled={disabled}
              style={{ 
                background: 'none', 
                border: 'none', 
                width: '100%', 
                cursor: disabled ? 'not-allowed' : 'pointer', 
                textAlign: 'left',
                opacity: disabled ? 0.45 : 1
              }}
            >
              <Icon className="nav-icon" /> {label} {disabled && '🔒'}
            </button>
          );
        })}
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

const Header = ({ title, user }) => {
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
            <img src={`http://localhost:5000${user.avatarUrl}`} alt="Faculty" className="user-avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <svg viewBox="0 0 100 100" className="user-avatar" style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', display: 'block' }}>
              <circle cx="50" cy="35" r="20" fill="#94a3b8" />
              <path d="M15 85c0-13.8 11.2-25 25-25h20c13.8 0 25 11.2 25 25z" fill="#94a3b8" />
            </svg>
          )}
          <div className="user-info"><span className="user-name">{user?.name || 'Faculty'}</span><span className="user-dept">{user?.subRole || 'FACULTY'}</span></div>
        </div>
      </div>
    </div>
  );
};

const resolveDetailedStatus = (status, synopsisStatus, finalSubStatus) => {
  if (status === 'REGISTRATION_PENDING') return { text: 'Awaiting Verification', color: '#D97706', bg: '#FFF3CD' };
  if (status === 'COURSEWORK') return { text: 'Coursework Phase', color: '#0284C7', bg: '#E0F2FE' };
  if (status === 'SYNOPSIS_PENDING') {
    if (synopsisStatus === 'SUBMITTED') return { text: 'Synopsis Submitted (Under Review)', color: '#2563EB', bg: '#DBEAFE' };
    if (synopsisStatus === 'APPROVED') return { text: 'Synopsis Approved (Awaiting DRC)', color: '#059669', bg: '#D1FAE5' };
    if (synopsisStatus === 'REVISION_REQUIRED') return { text: 'Synopsis Correction Needed', color: '#DC2626', bg: '#FEE2E2' };
    return { text: 'Synopsis Pending Upload', color: '#7C3AED', bg: '#EDE9FE' };
  }
  if (status === 'ACTIVE_RESEARCH') return { text: 'Active Research', color: '#059669', bg: '#D1FAE5' };
  if (status === 'PRE_SUBMISSION') {
    if (finalSubStatus === 'SUBMITTED') return { text: 'Thesis Submitted (Awaiting Review)', color: '#2563EB', bg: '#DBEAFE' };
    if (finalSubStatus === 'REVISION_REQUIRED') return { text: 'Thesis Revision Required', color: '#DC2626', bg: '#FEE2E2' };
    return { text: 'Pre-Submission Seminar Cleared', color: '#D97706', bg: '#FFF3CD' };
  }
  if (status === 'SUBMITTED') return { text: 'Awaiting Degree Award', color: '#4B5563', bg: '#F3F4F6' };
  if (status === 'AWARDED') return { text: 'Degree Awarded! 🎉', color: '#10B981', bg: '#ECFDF5' };
  return { text: status?.replace(/_/g, ' '), color: '#374151', bg: '#F3F4F6' };
};

// ── Thesis Detail + Milestone Review Panel ──
const ThesisReviewPanel = ({ thesis, milestones, onReview, onDRC, onSeminar, onFinalApprove, onClearCoursework, onVerify, onAssign, subRole, onClose }) => {
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(false);

  // DRC variables
  const [drcMeetings, setDrcMeetings] = useState([]);
  const [showDrcSchedule, setShowDrcSchedule] = useState(false);
  const [drcForm, setDrcForm] = useState({ scheduledDate: '', scheduledTime: '', venue: '', committeeMembers: '', agenda: '' });
  const [showDrcResult, setShowDrcResult] = useState(false);
  const [selectedDrc, setSelectedDrc] = useState(null);
  const [drcResultForm, setDrcResultForm] = useState({ status: 'APPROVED', remarks: '' });

  // Faculty and assignment variables
  const [faculty, setFaculty] = useState([]);
  const [selSupervisor, setSelSupervisor] = useState(thesis.supervisorId?._id || '');

  useEffect(() => {
    if (subRole === 'HOD') {
      axios.get(`${API}/auth/faculty`, getAuthHeader())
        .then(r => setFaculty(r.data.filter(f => f.department === thesis.department)))
        .catch(() => {});
    }
  }, [subRole, thesis.department]);

  const fetchDrcMeetings = async () => {
    try {
      const res = await axios.get(`${API}/lifecycle/drc/thesis/${thesis._id}`, getAuthHeader());
      setDrcMeetings(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchDrcMeetings();
  }, [thesis._id]);

  const act = async (fn) => { setLoading(true); try { await fn(); } catch (e) { alert(e.response?.data?.message || 'Error'); } finally { setLoading(false); } };

  const handleDrcScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!drcForm.scheduledDate || !drcForm.scheduledTime || !drcForm.venue) {
      return alert('Please fill in Date, Time, and Venue');
    }
    setLoading(true);
    try {
      await axios.post(`${API}/lifecycle/drc/schedule`, { thesisId: thesis._id, ...drcForm }, getAuthHeader());
      alert('DRC meeting scheduled successfully!');
      setShowDrcSchedule(false);
      setDrcForm({ scheduledDate: '', scheduledTime: '', venue: '', committeeMembers: '', agenda: '' });
      fetchDrcMeetings();
      if (onDRC) await onDRC();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule DRC meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleDrcResultSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDrc) return;
    setLoading(true);
    try {
      await axios.put(`${API}/lifecycle/drc/${selectedDrc._id}/result`, drcResultForm, getAuthHeader());
      alert(`DRC meeting successfully marked as ${drcResultForm.status}!`);
      setShowDrcResult(false);
      setSelectedDrc(null);
      setDrcResultForm({ status: 'APPROVED', remarks: '' });
      fetchDrcMeetings();
      if (onDRC) await onDRC();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record DRC result');
    } finally {
      setLoading(false);
    }
  };

  const synopsisMilestone = milestones.find(m => m.type === 'SYNOPSIS');
  const finalSubMilestone = milestones.find(m => m.type === 'FINAL_SUBMISSION');
  const isSynopsisPendingUpload = thesis.status === 'SYNOPSIS_PENDING' && (!synopsisMilestone || synopsisMilestone.status === 'PENDING');
  const isFinalPendingUpload = thesis.status === 'PRE_SUBMISSION' && (!finalSubMilestone || finalSubMilestone.status === 'PENDING');
  const pendingMilestones = milestones.filter(m => m.status === 'SUBMITTED' || m.status === 'REVISION_REQUIRED');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 700, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{thesis.scholarId?.name} — {thesis.title?.substring(0, 50)}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        {isSynopsisPendingUpload && (
          <div style={{
            background: '#FFF9E6',
            borderLeft: '4px solid #F59E0B',
            color: '#B45309',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️ Synopsis upload is currently pending at the candidate's end. No document has been submitted yet.</span>
          </div>
        )}
        {isFinalPendingUpload && (
          <div style={{
            background: '#FFF9E6',
            borderLeft: '4px solid #F59E0B',
            color: '#B45309',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️ Final thesis digital upload is currently pending at the candidate's end. No document has been submitted yet.</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {(() => {
            const synopsisMilestone = milestones.find(m => m.type === 'SYNOPSIS');
            const finalSubMilestone = milestones.find(m => m.type === 'FINAL_SUBMISSION');
            const badge = resolveDetailedStatus(thesis.status, synopsisMilestone?.status, finalSubMilestone?.status);
            return (
              <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600, background: badge.bg, color: badge.color }}>
                {badge.text}
              </span>
            );
          })()}
          {subRole === 'HOD' && (!thesis.enrollmentVerified || thesis.status === 'REGISTRATION_PENDING') && (
            <button className="btn-primary" onClick={() => act(onVerify)} disabled={loading} style={{ padding: '5px 14px', fontSize: '0.85rem', background: '#059669' }}>✓ Verify Enrollment & Move to Coursework</button>
          )}
          {subRole === 'HOD' && thesis.status !== 'AWARDED' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="form-input" style={{ padding: '5px 10px', height: 'auto', fontSize: '0.85rem' }} value={selSupervisor} onChange={e => setSelSupervisor(e.target.value)}>
                <option value="">Assign/Change Department Supervisor...</option>
                {faculty.filter(f => f.department === thesis.department).map(f => <option key={f._id} value={f._id}>{f.name} ({f.designation || f.subRole || 'Supervisor'})</option>)}
              </select>
              <button className="btn-primary" onClick={() => act(() => onAssign(selSupervisor))} disabled={!selSupervisor || loading} style={{ padding: '5px 14px', fontSize: '0.85rem' }}>Assign</button>
            </div>
          )}
          {thesis.status === 'COURSEWORK' && (
            <button className="btn-primary" onClick={() => act(onClearCoursework)} disabled={loading} style={{ padding: '5px 14px', fontSize: '0.85rem', background: '#3B82F6' }}>✓ Clear Coursework & Unlock Synopsis Upload</button>
          )}
          {thesis.status === 'SYNOPSIS_PENDING' && (() => {
            const synopsisMilestone = milestones.find(m => m.type === 'SYNOPSIS');
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 8 }}>
                {synopsisMilestone?.status !== 'APPROVED' ? (
                  <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', color: '#C53030', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                    ⚠️ Supervisor has not approved the Synopsis yet (Current Status: {synopsisMilestone?.status || 'PENDING'}). DRC Scheduling is locked until supervisor approval is complete.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                      ✅ Synopsis Approved by Supervisor! Ready for DRC Meeting Scheduling & Review.
                    </div>

                    {/* DRC Meetings List */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 14, borderRadius: 10, width: '100%' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>📆 Departmental Research Committee (DRC) Status</span>
                        {subRole === 'HOD' && drcMeetings.length === 0 && !showDrcSchedule && (
                          <button type="button" className="btn-primary" onClick={() => setShowDrcSchedule(true)} style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#3B82F6' }}>+ Schedule Meeting</button>
                        )}
                      </div>

                      {drcMeetings.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>No DRC meeting scheduled yet.</div>
                      ) : (
                        drcMeetings.map((drc, idx) => (
                          <div key={drc._id} style={{ borderBottom: idx < drcMeetings.length - 1 ? '1px solid #E2E8F0' : 'none', paddingBottom: idx < drcMeetings.length - 1 ? 10 : 0, paddingTop: idx > 0 ? 10 : 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>DRC Session</span>
                              <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, background: drc.status === 'APPROVED' ? '#D1FAE5' : drc.status === 'REVISION_REQUIRED' ? '#FEE2E2' : '#FEF3C7', color: drc.status === 'APPROVED' ? '#065F46' : drc.status === 'REVISION_REQUIRED' ? '#991B1B' : '#92400E' }}>
                                {drc.status}
                              </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: '0.78rem', color: '#475569' }}>
                              <div><strong>Date:</strong> {new Date(drc.scheduledDate).toLocaleDateString()}</div>
                              <div><strong>Time:</strong> {drc.scheduledTime}</div>
                              <div style={{ gridColumn: 'span 2' }}><strong>Venue:</strong> {drc.venue}</div>
                              {drc.committeeMembers && <div style={{ gridColumn: 'span 2' }}><strong>Committee:</strong> {drc.committeeMembers}</div>}
                              {drc.agenda && <div style={{ gridColumn: 'span 2' }}><strong>Agenda:</strong> {drc.agenda}</div>}
                              {drc.remarks && <div style={{ gridColumn: 'span 2', background: '#FFFBEB', padding: 6, borderRadius: 6, color: '#92400E', borderLeft: '3px solid #F59E0B', marginTop: 4 }}><strong>Remarks:</strong> {drc.remarks}</div>}
                            </div>

                            {subRole === 'HOD' && drc.status === 'SCHEDULED' && !showDrcResult && (
                              <button type="button" className="btn-primary" onClick={() => { setSelectedDrc(drc); setShowDrcResult(true); }} style={{ marginTop: 10, padding: '5px 12px', fontSize: '0.75rem', background: '#059669' }}>📝 Record DRC Outcome</button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* DRC Schedule Form */}
                    {showDrcSchedule && (
                      <form onSubmit={handleDrcScheduleSubmit} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B' }}>Schedule DRC Meeting</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Meeting Date</label>
                            <input type="date" className="form-input" style={{ width: '100%', padding: '6px' }} value={drcForm.scheduledDate} onChange={e => setDrcForm({...drcForm, scheduledDate: e.target.value})} required />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Meeting Time</label>
                            <input type="text" className="form-input" style={{ width: '100%', padding: '6px' }} placeholder="e.g. 11:00 AM" value={drcForm.scheduledTime} onChange={e => setDrcForm({...drcForm, scheduledTime: e.target.value})} required />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Venue</label>
                          <input type="text" className="form-input" style={{ width: '100%', padding: '6px' }} placeholder="e.g. Committee Room 1" value={drcForm.venue} onChange={e => setDrcForm({...drcForm, venue: e.target.value})} required />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Committee Panel Members</label>
                          <input type="text" className="form-input" style={{ width: '100%', padding: '6px' }} placeholder="e.g. Dr. A. Sen (HOD), Prof. M. Roy" value={drcForm.committeeMembers} onChange={e => setDrcForm({...drcForm, committeeMembers: e.target.value})} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Agenda / Focus Areas</label>
                          <textarea className="form-input" style={{ width: '100%', padding: '6px', resize: 'vertical' }} rows="2" placeholder="e.g. Synopsis evaluation and research feasibility review." value={drcForm.agenda} onChange={e => setDrcForm({...drcForm, agenda: e.target.value})} />
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button type="button" className="btn-outline" onClick={() => setShowDrcSchedule(false)} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Cancel</button>
                          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '4px 14px', fontSize: '0.75rem', background: '#3B82F6' }}>Schedule Event</button>
                        </div>
                      </form>
                    )}

                    {/* DRC Result Grading Form */}
                    {showDrcResult && selectedDrc && (
                      <form onSubmit={handleDrcResultSubmit} style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#065F46' }}>Record DRC Meeting Outcome</div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#047857', display: 'block', marginBottom: 4 }}>Committee Decision</label>
                          <select className="form-input" style={{ width: '100%', padding: '6px' }} value={drcResultForm.status} onChange={e => setDrcResultForm({...drcResultForm, status: e.target.value})} required>
                            <option value="APPROVED">APPROVED (Move Candidate to ACTIVE_RESEARCH)</option>
                            <option value="REVISION_REQUIRED">REVISION REQUIRED (Revert Synopsis to Candidate)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#047857', display: 'block', marginBottom: 4 }}>Minutes of Meeting / Remarks</label>
                          <textarea className="form-input" style={{ width: '100%', padding: '6px', resize: 'vertical' }} rows="3" placeholder="Enter comments or required modifications..." value={drcResultForm.remarks} onChange={e => setDrcResultForm({...drcResultForm, remarks: e.target.value})} required />
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button type="button" className="btn-outline" onClick={() => { setShowDrcResult(false); setSelectedDrc(null); }} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Cancel</button>
                          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '4px 14px', fontSize: '0.75rem', background: '#059669' }}>Submit Decision</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
          {subRole === 'HOD' && thesis.status === 'ACTIVE_RESEARCH' && (
            <button className="btn-primary" onClick={() => act(onSeminar)} disabled={loading} style={{ padding: '5px 14px', fontSize: '0.85rem', background: '#EA580C' }}>✓ Seminar Cleared → PRE_SUBMISSION</button>
          )}
          {subRole !== 'HOD' && thesis.status === 'PRE_SUBMISSION' && milestones.find(m => m.type === 'FINAL_SUBMISSION' && m.status === 'SUBMITTED') && (
            <button className="btn-primary" onClick={() => act(onFinalApprove)} disabled={loading} style={{ padding: '5px 14px', fontSize: '0.85rem', background: '#8B5CF6' }}>✓ Final Digital Approval → SUBMITTED</button>
          )}
        </div>

        {pendingMilestones.length > 0 ? (
          <div>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Submitted Documents for Review</div>
            {pendingMilestones.map(m => (
              <div key={m._id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>{m.title}</div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: m.status === 'SUBMITTED' ? '#3B82F6' : '#DC2626' }}>{m.status}</span>
                </div>
                {m.documentUrl && <a href={`http://localhost:5000${m.documentUrl}`} target="_blank" rel="noreferrer" style={{ color: '#10B981', fontSize: '0.85rem', display: 'block', marginBottom: 10 }}>📄 View Document</a>}
                {m.comments?.length > 0 && (
                  <div style={{ background: '#FEF3C7', padding: 8, borderRadius: 6, marginBottom: 8, fontSize: '0.82rem' }}>
                    Previous feedback: "{m.comments[m.comments.length - 1].text}"
                  </div>
                )}
                <textarea className="form-input" placeholder="Add remarks (required for revision)..." rows="2" value={remarks[m._id] || ''} onChange={e => setRemarks(r => ({ ...r, [m._id]: e.target.value }))} style={{ marginBottom: 8, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={() => act(() => onReview(m._id, 'APPROVE', remarks[m._id]))} disabled={loading} style={{ flex: 1, padding: '6px', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={14} style={{ marginRight: 4 }} />Approve
                  </button>
                  <button onClick={() => act(() => onReview(m._id, 'REVISION', remarks[m._id]))} disabled={loading}
                    style={{ flex: 1, padding: '6px', fontSize: '0.85rem', border: '1px solid #F87171', color: '#DC2626', background: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    <XCircle size={14} style={{ marginRight: 4 }} />Request Revision
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 24, color: '#9CA3AF' }}>No documents pending review for this scholar.</div>
        )}
      </div>
    </div>
  );
};

// ── Scholar List ──
const ScholarList = ({ theses, onSelect, title }) => (
  <div className="card documents-card">
    <h3 className="card-title">{title}</h3>
    {theses.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>No records found.</div>}
    <div className="file-list">
      {theses.length > 0 && <div className="file-header"><div style={{ flex: 1.5 }}>Scholar</div><div style={{ flex: 1 }}>Dept</div><div style={{ flex: 2 }}>Title</div><div style={{ flex: 1.2 }}>Status</div><div style={{ flex: 0.8 }}>Action</div></div>}
      {theses.map(t => (
        <div key={t._id} className="file-item">
          <div className="file-name" style={{ flex: 1.5 }}>{t.scholarId?.name}</div>
          <div className="file-date" style={{ flex: 1 }}>{t.department}</div>
          <div style={{ flex: 2, fontSize: '0.85rem', color: '#374151' }}>{t.title?.substring(0, 40)}...</div>
          <div style={{ flex: 1.2 }}>
            {(() => {
              const badge = resolveDetailedStatus(t.status, t.synopsisStatus, t.finalSubStatus);
              return (
                <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, background: badge.bg, color: badge.color }}>
                  {badge.text}
                </span>
              );
            })()}
          </div>
          <div className="file-actions" style={{ flex: 0.8 }}><button className="btn-action" onClick={() => onSelect(t._id)}>Review</button></div>
        </div>
      ))}
    </div>
  </div>
);

// ── DRC Page (HOD) ──
const DRCPage = ({ theses, onSelect }) => {
  const pending = theses.filter(t => t.status === 'SYNOPSIS_PENDING' || t.status === 'ACTIVE_RESEARCH');
  return (
    <div>
      <div className="card" style={{ marginBottom: 16, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <h3 style={{ color: '#059669', marginBottom: 8 }}>HOD Actions</h3>
        <p style={{ color: '#065F46', fontSize: '0.9rem' }}>
          <strong>DRC Approval:</strong> Click "Review" on a scholar with SYNOPSIS_PENDING status to approve after DRC meeting.<br />
          <strong>Seminar Clearance:</strong> Click "Review" on a scholar with ACTIVE_RESEARCH status to clear their pre-submission seminar.
        </p>
      </div>
      <ScholarList theses={pending} onSelect={onSelect} title="Scholars Awaiting HOD Action" />
    </div>
  );
};

// ── Overview ──
const OverviewPage = ({ theses, user, onSelect, setActiveTab }) => {
  const isHOD = user?.subRole === 'HOD';

  // HOD specific metrics
  const totalScholars = theses.length;
  const awaitingReg = theses.filter(t => t.status === 'REGISTRATION_PENDING').length;
  const activeResearch = theses.filter(t => t.status === 'ACTIVE_RESEARCH').length;
  const pendingReviews = theses.filter(t => ['SYNOPSIS_PENDING', 'PRE_SUBMISSION'].includes(t.status)).length;
  const awaitingDRC = theses.filter(t => t.status === 'SYNOPSIS_PENDING' && t.synopsisStatus === 'APPROVED').length;

  // Advisor specific metrics
  const myScholars = theses;
  const activeSupervision = myScholars.filter(t => t.status === 'ACTIVE_RESEARCH').length;
  const myPendingApprovals = myScholars.filter(t => ['SYNOPSIS_PENDING', 'PRE_SUBMISSION'].includes(t.status)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Welcome Banner Card */}
      <div className="card" style={{
        background: isHOD ? 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)' : 'linear-gradient(135deg, #133A26 0%, #059669 100%)',
        color: 'white',
        padding: '28px 24px',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: '#FFFFFF' }}>
          Welcome back, {user?.name}!
        </h2>
        <p style={{ opacity: 0.9, fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4 }}>
          {isHOD ? (
            `Head of Department — ${user?.department || 'Department of Computer Science Engineering'} Central Console. Manage registration requests, supervisor allocations, RAC sessions, and schedule DRC evaluations.`
          ) : (
            `Doctoral Supervisor — Research Advisor console. Track scholar research deliverables, approve synopsis submissions, complete RAC reviews, and clear final digital thesis submissions.`
          )}
        </p>
      </div>

      {/* Role-Specific Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {isHOD ? (
          <>
            {[
              { label: 'Total Department Scholars', value: totalScholars, color: '#3B82F6', bg: '#EFF6FF', border: '#DBEAFE' },
              { label: 'Awaiting Registration', value: awaitingReg, color: '#F59E0B', bg: '#FFFBEB', border: '#FEF3C7' },
              { label: 'Active Research', value: activeResearch, color: '#10B981', bg: '#ECFDF5', border: '#D1FAE5' },
              { label: 'Pending HOD Reviews', value: pendingReviews, color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2' }
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} className="card" style={{ textAlign: 'center', padding: '20px 16px', background: bg, border: `1px solid ${border}`, borderRadius: '12px' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color, marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </>
        ) : (
          <>
            {[
              { label: 'Assigned Scholars', value: myScholars.length, color: '#10B981', bg: '#ECFDF5', border: '#D1FAE5' },
              { label: 'Active Research', value: activeSupervision, color: '#3B82F6', bg: '#EFF6FF', border: '#DBEAFE' },
              { label: 'Pending My Approval', value: myPendingApprovals, color: '#F59E0B', bg: '#FFFBEB', border: '#FEF3C7' },
              { label: 'Total Publications Logged', value: myScholars.reduce((acc, t) => acc + (t.publications?.length || 0), 0), color: '#8B5CF6', bg: '#F5F3FF', border: '#EDE9FE' }
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} className="card" style={{ textAlign: 'center', padding: '20px 16px', background: bg, border: `1px solid ${border}`, borderRadius: '12px' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color, marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Action Center Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {/* Left Side: Main Tasks Overview */}
        <div className="card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📂 Scholars Summary Checklist</span>
          </h3>

          {theses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: '0.85rem' }}>
              No scholars currently assigned under this department.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {theses.slice(0, 6).map(t => {
                const badge = resolveDetailedStatus(t.status, t.synopsisStatus, t.finalSubStatus);
                return (
                  <div
                    key={t._id}
                    onClick={() => onSelect(t._id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{t.scholarId?.name || 'Academic Scholar'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: '380px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.title || 'No Research Title Declared'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, background: badge.bg, color: badge.color }}>
                        {badge.text}
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Quick Alerts & Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <NotificationPanel user={user} onTabChange={setActiveTab} />
          <div className="card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
              🔔 Action Needed
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isHOD ? (
                <>
                  {awaitingReg > 0 && (
                    <div style={{ background: '#FFF9E6', borderLeft: '4px solid #F59E0B', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#B45309' }}>
                      <strong>Registration Verification:</strong> There are {awaitingReg} scholar(s) awaiting initial profile review & supervisor assignment.
                    </div>
                  )}
                  {awaitingDRC > 0 && (
                    <div style={{ background: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#1E40AF' }}>
                      <strong>DRC Meeting Scheduling:</strong> {awaitingDRC} scholar(s) have supervisor synopsis approvals and are ready for official committee evaluation.
                    </div>
                  )}
                  {awaitingReg === 0 && awaitingDRC === 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#15803D', background: '#F0FDF4', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #10B981' }}>
                      ✅ Department workflow status is clean. All pending milestones are up to date!
                    </div>
                  )}
                </>
              ) : (
                <>
                  {myPendingApprovals > 0 && (
                    <div style={{ background: '#FFF9E6', borderLeft: '4px solid #F59E0B', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#B45309' }}>
                      <strong>Pending Deliverables:</strong> You have {myPendingApprovals} pending synopsis proposal(s) or pre-submission seminar draft(s) awaiting review.
                    </div>
                  )}
                  {myPendingApprovals === 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#15803D', background: '#F0FDF4', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #10B981' }}>
                      ✅ All assigned scholars’ reviews are up to date. You have no pending submissions.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Supervisor RAC clearance view ──
const SupervisorRACConsole = ({ theses }) => {
  const [racs, setRacs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRacs = async () => {
    try {
      const allRacs = [];
      for (const t of theses) {
        const rRes = await axios.get(`${API}/lifecycle/rac/thesis/${t._id}`, getAuthHeader());
        rRes.data.forEach(r => { r.scholar = t.scholarId; r.title = t.title; });
        allRacs.push(...rRes.data);
      }
      setRacs(allRacs);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchRacs();
  }, [theses]);

  const handleAddRemarks = async (racId) => {
    const rem = prompt('Enter your Supervisor clearance/recommendation remarks for this RAC session:');
    if (rem === null) return;
    try {
      await axios.put(`${API}/lifecycle/rac/${racId}/remarks`, { remarks: rem }, getAuthHeader());
      alert('Remarks saved successfully!');
      fetchRacs();
    } catch (err) {
      alert('Failed to save remarks.');
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Research Advisory Committee (RAC) Schedule & Clearance</h3>
      <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 20 }}>
        Review periodic doctoral committee milestones and add your supervisor evaluation remarks for your assigned PhD scholars.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>Loading RAC records...</div>
      ) : racs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748B', background: '#F8FAFC', borderRadius: 8 }}>
          No scheduled RAC review meetings found for your scholars.
        </div>
      ) : (
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex: 2 }}>Scholar</div>
            <div style={{ flex: 1 }}>Session</div>
            <div style={{ flex: 1.5 }}>Scheduled Date</div>
            <div style={{ flex: 1.8 }}>Progress Report</div>
            <div style={{ flex: 1.2 }}>Status</div>
            <div style={{ flex: 2.2, textAlign: 'center' }}>Supervisor Action</div>
          </div>
          {racs.map(r => (
            <div key={r._id} className="file-item">
              <div style={{ flex: 2 }}>
                <div style={{ fontWeight: 700 }}>{r.scholar?.name || 'Scholar'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
              </div>
              <div style={{ flex: 1, fontWeight: 600, color: '#1E3A8A' }}>RAC-{r.racNumber}</div>
              <div style={{ flex: 1.5, fontSize: '0.85rem' }}>{new Date(r.scheduledDate).toLocaleDateString()}</div>
              <div style={{ flex: 1.8 }}>
                {r.progressReportUrl ? (
                  <a href={r.progressReportUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}>
                    📄 View Progress Report
                  </a>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>Pending submission</span>
                )}
              </div>
              <div style={{ flex: 1.2 }}>
                <span style={{ 
                  padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                  background: r.status === 'SATISFACTORY' ? '#D1FAE5' : r.status === 'UNSATISFACTORY' ? '#FEE2E2' : '#FEF3C7',
                  color: r.status === 'SATISFACTORY' ? '#065F46' : r.status === 'UNSATISFACTORY' ? '#991B1B' : '#D97706'
                }}>
                  {r.status}
                </span>
              </div>
              <div style={{ flex: 2.2, display: 'flex', justifyContent: 'center' }}>
                <button 
                  onClick={() => handleAddRemarks(r._id)} 
                  className="btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#2563EB' }}
                >
                  {r.remarks ? 'Edit Remarks' : 'Add Remarks'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Profile Tab ──
const ProfileTab = () => {
  const { user, updateProfile, uploadAvatar } = useContext(AuthContext);
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
      designation: user.role === 'FACULTY' ? designation : undefined,
      specialization: user.role === 'FACULTY' ? specialization : undefined,
      officeRoom: ['FACULTY', 'HOD'].includes(user.role) ? officeRoom : undefined,
      yearsOfService: user.role === 'HOD' ? Number(yearsOfService) : undefined,
      additionalResponsibilities: user.role === 'HOD' ? additionalResponsibilities : undefined,
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
        <div style={{
          padding: 12,
          borderRadius: 8,
          background: msg.includes('successfully') ? '#E8F5E9' : '#FFEBEE',
          color: msg.includes('successfully') ? '#2E7D32' : '#C62828',
          marginBottom: 16,
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
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

        {user?.role === 'FACULTY' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Designation</label>
              <select className="form-input" value={designation} onChange={e => setDesignation(e.target.value)} required>
                <option value="">Select...</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Professor Emeritus">Professor Emeritus</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Area of Specialization</label>
              <input type="text" className="form-input" value={specialization} onChange={e => setSpecialization(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Office Room No.</label>
              <input type="text" className="form-input" value={officeRoom} onChange={e => setOfficeRoom(e.target.value)} required />
            </div>
          </>
        )}

        {user?.role === 'HOD' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Office Room No.</label>
              <input type="text" className="form-input" value={officeRoom} onChange={e => setOfficeRoom(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Years of Service</label>
              <input type="number" className="form-input" value={yearsOfService} onChange={e => setYearsOfService(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Additional Responsibilities</label>
              <input type="text" className="form-input" value={additionalResponsibilities} onChange={e => setAdditionalResponsibilities(e.target.value)} />
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
const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, fetchMe } = useContext(AuthContext);
  const { allTheses, loading, fetchAssignedTheses, fetchDeptTheses, fetchThesisById, reviewMilestone, drcApprove, seminarClear, finalApprove, clearCoursework, verifyEnrollment, assignSupervisor } = useContext(ThesisContext);
  const [selectedThesisId, setSelectedThesisId] = useState(null);
  const [selectedThesisData, setSelectedThesisData] = useState(null);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(user && !user.profileCompleted);

  const subRole = user?.role === 'HOD' ? 'HOD' : user?.subRole;

  useEffect(() => {
    if (subRole === 'HOD') fetchDeptTheses();
    else fetchAssignedTheses();
  }, [subRole]);

  useEffect(() => {
    // Dynamic background update on mount
    fetchMe();
  }, []);

  const handleSelectThesis = async (id) => {
    setSelectedThesisId(id);
    const data = await fetchThesisById(id);
    setSelectedThesisData(data);
  };

  const handleReview = async (milestoneId, action, comment) => {
    await reviewMilestone(milestoneId, action, comment);
    const data = await fetchThesisById(selectedThesisId);
    setSelectedThesisData(data);
  };

  const handleHODAction = async (fn) => {
    await fn(selectedThesisId);
    const data = await fetchThesisById(selectedThesisId);
    setSelectedThesisData(data);
    if (subRole === 'HOD') fetchDeptTheses(); else fetchAssignedTheses();
  };

  const titles = { overview: 'Faculty Dashboard', registrations: 'Registration Requests', scholars: 'My Scholars', rac: 'RAC Progress Schedule', reviews: 'Pending Reviews', dept: 'Department Theses', drc: 'DRC & Seminar Approvals', profile: 'My Profile' };

  const renderContent = () => {
    if (!user?.isVerified) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
          <div className="card" style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: '40px 32px', borderLeft: '8px solid #DC2626', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 64, height: 64, background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <XCircle size={32} color="#DC2626" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: 12 }}>Account Unverified</h2>
            <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
              account is not verified. Please contact HOD of your deaprtment in case of faculty and contact the super admin in case of HOD.
            </p>
            <button 
              onClick={async () => {
                const fresh = await fetchMe();
                if (fresh?.isVerified) {
                  alert("Your account has been approved! Reloading dashboard...");
                  window.location.reload();
                } else {
                  alert("Your account is still unverified. Please contact HOD of your department in case of faculty and contact the super admin in case of HOD.");
                }
              }}
              className="btn-primary"
              style={{ background: '#059669', border: 'none', padding: '10px 20px', fontSize: '0.85rem' }}
            >
              🔄 Check Status
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': return <OverviewPage theses={allTheses} user={user} onSelect={handleSelectThesis} setActiveTab={setActiveTab} />;
      case 'registrations': return <ScholarList theses={allTheses.filter(t => t.status === 'REGISTRATION_PENDING')} onSelect={handleSelectThesis} title="Scholars Awaiting Registration Approval" />;
      case 'scholars': return <ScholarList theses={allTheses} onSelect={handleSelectThesis} title="My Assigned Scholars" />;
      case 'rac': return <SupervisorRACConsole theses={allTheses} />;
      case 'dept': return <ScholarList theses={allTheses} onSelect={handleSelectThesis} title="All Department Theses" />;
      case 'drc': return <DRCPage theses={allTheses} onSelect={handleSelectThesis} />;
      case 'reviews': return (
        <ScholarList
          theses={allTheses.filter(t => {
            if (t.status === 'SYNOPSIS_PENDING') {
              return t.synopsisStatus === 'SUBMITTED';
            }
            if (t.status === 'PRE_SUBMISSION') {
              return t.finalSubStatus === 'SUBMITTED';
            }
            return t.status === 'ACTIVE_RESEARCH';
          })}
          onSelect={handleSelectThesis}
          title="Scholars Awaiting Review"
        />
      );
      case 'profile': return <ProfileTab />;
      default: return <div className="card"><h3 className="card-title">{titles[activeTab]}</h3><p style={{ color: '#6b7280', marginTop: 8 }}>Content coming soon.</p></div>;
    }
  };

  return (
    <div className="app-container">
      <div className="mobile-overlay" onClick={() => document.body.classList.remove('sidebar-mobile-open')} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} subRole={subRole} isVerified={user?.isVerified} />
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
        
        <Header title={titles[activeTab]} user={user} />
        <div className="dashboard-area" style={{ flex: 1 }}>
          <div className="welcome-banner">
            <div><span className="welcome-text">Welcome, {user?.name || 'Faculty'}!</span><span className="welcome-subtext"> | {subRole === 'HOD' ? 'Head of Department Portal' : 'Supervisor Portal'}</span></div>
            <div className="brand-text">ScholarSync Faculty</div>
          </div>
          {renderContent()}
        </div>
      </div>
      {selectedThesisId && selectedThesisData && (
        <ThesisReviewPanel
          thesis={selectedThesisData.thesis}
          milestones={selectedThesisData.milestones}
          onReview={handleReview}
          onDRC={() => handleHODAction(drcApprove)}
          onSeminar={() => handleHODAction(seminarClear)}
          onFinalApprove={() => handleHODAction(finalApprove)}
          onClearCoursework={() => handleHODAction(clearCoursework)}
          onVerify={() => handleHODAction(verifyEnrollment)}
          onAssign={(supervisorId) => handleHODAction(() => assignSupervisor(selectedThesisId, supervisorId))}
          subRole={subRole}
          onClose={() => { setSelectedThesisId(null); setSelectedThesisData(null); }}
        />
      )}
      <ProfileOnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
};

export default FacultyDashboard;
