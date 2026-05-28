import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, FileText, BarChart2, Settings, LogOut, Bell, CheckCircle2, User, GraduationCap, ShieldCheck, Clock, XCircle, Layers, Award, Edit, File, Plus, Calendar } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThesisContext } from '../context/ThesisContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { API_BASE_URL, API_URL } from '../config';
import ProfileOnboardingModal from '../components/ProfileOnboardingModal';
import NotificationPanel from '../components/NotificationPanel';
import ThemeToggle from '../components/ThemeToggle';

const API = API_URL;
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });



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
        <ThemeToggle style={{ marginRight: '8px', color: '#475569' }} />
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
            <img src={`${API_BASE_URL}${user.avatarUrl}`} alt="Admin" className="user-avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <svg viewBox="0 0 100 100" className="user-avatar" style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8f0', display: 'block' }}>
              <circle cx="50" cy="35" r="20" fill="#94a3b8" />
              <path d="M15 85c0-13.8 11.2-25 25-25h20c13.8 0 25 11.2 25 25z" fill="#94a3b8" />
            </svg>
          )}
          <div className="user-info"><span className="user-name">{user?.name || 'Admin'}</span><span className="user-dept">{user?.role || 'ADMIN'}</span></div>
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

const STATUS_COLOR = { REGISTRATION_PENDING: '#D97706', COURSEWORK: '#3B82F6', SYNOPSIS_PENDING: '#8B5CF6', ACTIVE_RESEARCH: '#059669', PRE_SUBMISSION: '#EA580C', SUBMITTED: '#6B7280', AWARDED: '#10B981' };
const STATUS_BG = {
  REGISTRATION_PENDING: '#FFF3CD',
  COURSEWORK: '#E0F2FE',
  SYNOPSIS_PENDING: '#EDE9FE',
  ACTIVE_RESEARCH: '#D1FAE5',
  PRE_SUBMISSION: '#FFE8D6',
  SUBMITTED: '#F3F4F6',
  AWARDED: '#ECFDF5',
};

// ── Scholar Detail Modal ──
const ScholarDetail = ({ thesisId, onClose, onAction }) => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [selSupervisor, setSelSupervisor] = useState('');
  const [auditNote, setAuditNote] = useState('');
  const [loading, setLoading] = useState(false);

  // DRC variables
  const [drcMeetings, setDrcMeetings] = useState([]);
  const [showDrcSchedule, setShowDrcSchedule] = useState(false);
  const [drcForm, setDrcForm] = useState({ scheduledDate: '', scheduledTime: '', venue: '', committeeMembers: '', agenda: '' });
  const [showDrcResult, setShowDrcResult] = useState(false);
  const [selectedDrc, setSelectedDrc] = useState(null);
  const [drcResultForm, setDrcResultForm] = useState({ status: 'APPROVED', remarks: '' });

  const fetchDrcMeetings = async () => {
    try {
      const res = await axios.get(`${API}/lifecycle/drc/thesis/${thesisId}`, getAuthHeader());
      setDrcMeetings(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    axios.get(`${API}/thesis/${thesisId}`, getAuthHeader()).then(r => {
      setData(r.data);
      if (r.data?.thesis?.supervisorId) {
        setSelSupervisor(r.data.thesis.supervisorId._id || r.data.thesis.supervisorId);
      }
    });
    axios.get(`${API}/auth/faculty`, getAuthHeader()).then(r => setFaculty(r.data)).catch(() => {});
    fetchDrcMeetings();
  }, [thesisId]);

  const act = async (action, payload = {}) => {
    setLoading(true);
    try {
      await onAction(thesisId, action, payload);
      await axios.get(`${API}/thesis/${thesisId}`, getAuthHeader()).then(r => {
        setData(r.data);
        if (r.data?.thesis?.supervisorId) {
          setSelSupervisor(r.data.thesis.supervisorId._id || r.data.thesis.supervisorId);
        }
      });
      fetchDrcMeetings();
    }
    catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDrcScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!drcForm.scheduledDate || !drcForm.scheduledTime || !drcForm.venue) {
      return toast.warning('Please fill in Date, Time, and Venue');
    }
    setLoading(true);
    try {
      await axios.post(`${API}/lifecycle/drc/schedule`, { thesisId, ...drcForm }, getAuthHeader());
      toast.success('DRC meeting scheduled successfully!');
      setShowDrcSchedule(false);
      setDrcForm({ scheduledDate: '', scheduledTime: '', venue: '', committeeMembers: '', agenda: '' });
      fetchDrcMeetings();
      const r = await axios.get(`${API}/thesis/${thesisId}`, getAuthHeader());
      setData(r.data);
      if (onAction) onAction(thesisId, 'refresh_list');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule DRC meeting');
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
      toast.success(`DRC meeting successfully marked as ${drcResultForm.status}!`);
      setShowDrcResult(false);
      setSelectedDrc(null);
      setDrcResultForm({ status: 'APPROVED', remarks: '' });
      fetchDrcMeetings();
      const r = await axios.get(`${API}/thesis/${thesisId}`, getAuthHeader());
      setData(r.data);
      if (onAction) onAction(thesisId, 'refresh_list');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record DRC result');
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: 'white', padding: 32, borderRadius: 16 }}>Loading...</div></div>;

  const { thesis, milestones } = data;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 680, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{thesis.scholarId?.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[['Department', thesis.department],['Enrollment No.', thesis.enrollmentNumber],['Title', thesis.title],['Supervisor', thesis.supervisorId?.name || 'Unassigned']].map(([k, v]) => (
            <div key={k} style={{ background: '#F9FAFB', padding: 10, borderRadius: 8 }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{k}</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {(!thesis.enrollmentVerified || thesis.status === 'REGISTRATION_PENDING') && (
            <button className="btn-primary" onClick={() => act('verify')} disabled={loading} style={{ padding: '6px 16px', fontSize: '0.85rem', background: '#059669', color: 'white' }}>✓ Verify Enrollment → COURSEWORK</button>
          )}
          {thesis.status !== 'AWARDED' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="form-input" style={{ padding: '5px 10px', height: 'auto' }} value={selSupervisor} onChange={e => setSelSupervisor(e.target.value)} disabled={!!thesis.supervisorId}>
                <option value="">Assign Supervisor...</option>
                {faculty.filter(f => f.department === thesis.department).map(f => <option key={f._id} value={f._id}>{f.name} ({f.subRole})</option>)}
              </select>
              <button className="btn-primary" onClick={() => act('assign', { supervisorId: selSupervisor })} disabled={!selSupervisor || !!thesis.supervisorId || loading} style={{ padding: '6px 16px', fontSize: '0.85rem', opacity: thesis.supervisorId ? 0.6 : 1, cursor: thesis.supervisorId ? 'not-allowed' : 'pointer' }}>
                {thesis.supervisorId ? '✓ Supervisor Assigned' : 'Assign'}
              </button>
            </div>
          )}
          {thesis.status === 'COURSEWORK' && (
            <button className="btn-primary" onClick={() => act('coursework')} disabled={loading} style={{ padding: '6px 16px', fontSize: '0.85rem', background: '#3B82F6' }}>✓ Clear Coursework → SYNOPSIS</button>
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
                        {drcMeetings.length === 0 && !showDrcSchedule && (
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

                            {drc.status === 'SCHEDULED' && !showDrcResult && (
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
          {thesis.status === 'ACTIVE_RESEARCH' && (
            <button className="btn-primary" onClick={() => act('seminar')} disabled={loading} style={{ padding: '6px 16px', fontSize: '0.85rem', background: '#EA580C' }}>✓ Clear Seminar → PRE_SUBMISSION</button>
          )}
          {thesis.status === 'SUBMITTED' && (
            <button className="btn-primary" onClick={() => act('award')} disabled={loading} style={{ padding: '6px 16px', fontSize: '0.85rem', background: '#059669' }}>🎓 Award Degree</button>
          )}
        </div>

        {/* Audit Log */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Audit Log</div>
          <div style={{ maxHeight: 120, overflowY: 'auto', background: '#F9FAFB', borderRadius: 8, padding: 10 }}>
            {thesis.auditLog?.length ? thesis.auditLog.map((l, i) => (
              <div key={i} style={{ fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid #E5E7EB' }}>
                <strong>{l.action}</strong> — {l.note} <span style={{ color: '#9CA3AF' }}>({new Date(l.date).toLocaleDateString()})</span>
              </div>
            )) : <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>No audit entries yet.</div>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input className="form-input" style={{ flex: 1, padding: '5px 10px' }} placeholder="Add audit note (e.g. thesis dispatched to examiner)" value={auditNote} onChange={e => setAuditNote(e.target.value)} />
            <button className="btn-outline" onClick={() => act('audit', { action: 'MANUAL_NOTE', note: auditNote })} disabled={!auditNote || loading} style={{ padding: '5px 14px', fontSize: '0.85rem' }}>Add</button>
          </div>
        </div>

        {milestones?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, borderBottom: '2px solid #E5E7EB', paddingBottom: 6 }}>Academic Milestones History</div>
            {milestones.map(m => (
              <div key={m._id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: 12, marginBottom: 10, background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1F2937' }}>{m.title}</div>
                  <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: m.status === 'APPROVED' ? '#D1FAE5' : m.status === 'SUBMITTED' ? '#DBEAFE' : m.status === 'REVISION_REQUIRED' ? '#FEE2E2' : '#FEF3C7', color: m.status === 'APPROVED' ? '#059669' : m.status === 'SUBMITTED' ? '#2563EB' : m.status === 'REVISION_REQUIRED' ? '#DC2626' : '#D97706' }}>
                    {m.status}
                  </span>
                </div>
                {m.documentUrl && (
                  <a href={`${API_BASE_URL}${m.documentUrl}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', color: '#0284C7', fontSize: '0.82rem', fontWeight: 600, marginTop: 4, textDecoration: 'none' }}>
                    📄 View Submitted Document
                  </a>
                )}
                {m.comments?.length > 0 && (
                  <div style={{ background: '#FFFBEB', borderRadius: 6, padding: 8, marginTop: 8, borderLeft: '3px solid #F59E0B' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309' }}>Supervisor Reviews & Remarks:</div>
                    {m.comments.map((c, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', color: '#78350F', marginTop: 2 }}>
                        "{c.text}" — <span style={{ fontWeight: 600 }}>{c.authorName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Overview Page ──
const OverviewPage = ({ theses, onSelectThesis, user, setActiveTab }) => {
  const isHOD = user?.role === 'HOD';
  const counts = {
    total: theses.length,
    pending: theses.filter(t => t.status === 'REGISTRATION_PENDING').length,
    active: theses.filter(t => t.status === 'ACTIVE_RESEARCH').length,
    awarded: theses.filter(t => t.status === 'AWARDED').length
  };
  const awaitingDRC = theses.filter(t => t.status === 'SYNOPSIS_PENDING' && t.synopsisStatus === 'APPROVED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Welcome Banner Card */}
      <div className="card" style={{
        background: isHOD ? 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)' : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
        color: 'white',
        padding: '28px 24px',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: '#FFFFFF' }}>
          Welcome back, {user?.name || (isHOD ? 'HOD' : 'Admin')}!
        </h2>
        <p style={{ opacity: 0.9, fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4 }}>
          {isHOD ? (
            `Head of Department — ${user?.department || 'Department of Computer Science Engineering'} Central Console. Manage registration requests, supervisor allocations, RAC sessions, and schedule DRC evaluations.`
          ) : (
            `System Administrator — Master management console. Control platform users, configure database parameters, coordinate academic departments, and track global doctoral tracks.`
          )}
        </p>
      </div>

      {/* Role-Specific Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[
          { label: 'Total Scholars', value: counts.total, color: '#3B82F6', Icon: GraduationCap, bg: '#EFF6FF', border: '#DBEAFE' },
          { label: 'Awaiting Registration', value: counts.pending, color: '#F59E0B', Icon: Clock, bg: '#FFFBEB', border: '#FEF3C7' },
          { label: 'Active Research', value: counts.active, color: '#10B981', Icon: CheckCircle2, bg: '#ECFDF5', border: '#D1FAE5' },
          { label: 'Degrees Awarded', value: counts.awarded, color: '#8B5CF6', Icon: ShieldCheck, bg: '#F5F3FF', border: '#EDE9FE' }
        ].map(({ label, value, color, Icon, bg, border }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 16px', background: bg, border: `1px solid ${border}`, borderRadius: '12px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={24} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color, marginBottom: '2px' }}>{value}</div>
              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Center Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {/* Left Side: Main Submissions Overview */}
        <div className="card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📂 Scholars Summary Checklist</span>
          </h3>

          {theses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: '0.85rem' }}>
              No scholars currently registered in this department.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {theses.slice(0, 6).map(t => (
                <div
                  key={t._id}
                  onClick={() => onSelectThesis(t._id)}
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
                    <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, background: STATUS_BG[t.status], color: STATUS_COLOR[t.status] }}>
                      {t.status?.replace('_', ' ')}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              ))}
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
                  {counts.pending > 0 && (
                    <div style={{ background: '#FFF9E6', borderLeft: '4px solid #F59E0B', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#B45309' }}>
                      <strong>Registration Verification:</strong> There are {counts.pending} scholar(s) awaiting initial profile review & supervisor assignment.
                    </div>
                  )}
                  {awaitingDRC > 0 && (
                    <div style={{ background: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#1E40AF' }}>
                      <strong>DRC Meeting Scheduling:</strong> {awaitingDRC} scholar(s) have supervisor synopsis approvals and are ready for official committee evaluation.
                    </div>
                  )}
                  {counts.pending === 0 && awaitingDRC === 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#15803D', background: '#F0FDF4', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #10B981' }}>
                      ✅ Department workflow status is clean. All pending milestones are up to date!
                    </div>
                  )}
                </>
              ) : (
                <>
                  {counts.pending > 0 && (
                    <div style={{ background: '#FFF9E6', borderLeft: '4px solid #F59E0B', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#B45309' }}>
                      <strong>Pending Verification:</strong> {counts.pending} registration requests require system clearance.
                    </div>
                  )}
                  {counts.pending === 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#15803D', background: '#F0FDF4', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #10B981' }}>
                      ✅ No pending system registrations. System is clean!
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

// ── Manage Scholars ──
const ManageScholars = ({ theses, onSelectThesis, onAction }) => {
  const [filter, setFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const filtered = theses.filter(t =>
    (!filter || t.status === filter) &&
    (!deptFilter || t.department === deptFilter)
  );
  const depts = [...new Set(theses.map(t => t.department))];

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select className="form-input" style={{ padding: '6px 12px', height: 'auto', flex: 1 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['REGISTRATION_PENDING','COURSEWORK','SYNOPSIS_PENDING','ACTIVE_RESEARCH','PRE_SUBMISSION','SUBMITTED','AWARDED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-input" style={{ padding: '6px 12px', height: 'auto', flex: 1 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="card documents-card">
        <h3 className="card-title">Scholar Registrations ({filtered.length})</h3>
        <div className="file-list">
          <div className="file-header"><div style={{ flex: 1.5 }}>Scholar</div><div style={{ flex: 1 }}>Dept</div><div style={{ flex: 2 }}>Title</div><div style={{ flex: 1.2 }}>Supervisor</div><div style={{ flex: 1 }}>Status</div><div style={{ flex: 1.4 }}>Action</div></div>
          {filtered.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>No records found.</div>}
          {filtered.map(t => (
            <div key={t._id} className="file-item">
              <div className="file-name" style={{ flex: 1.5 }}>{t.scholarId?.name}</div>
              <div className="file-date" style={{ flex: 1 }}>{t.department}</div>
              <div style={{ flex: 2, fontSize: '0.85rem', color: '#374151' }}>{t.title?.substring(0, 35)}...</div>
              <div style={{ flex: 1.2, fontSize: '0.85rem', color: '#6b7280' }}>{t.supervisorId?.name || '—'}</div>
              <div style={{ flex: 1 }}>
                {(() => {
                  const badge = resolveDetailedStatus(t.status, t.synopsisStatus, t.finalSubStatus);
                  return (
                    <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, background: badge.bg, color: badge.color }}>
                      {badge.text}
                    </span>
                  );
                })()}
              </div>
              <div className="file-actions" style={{ flex: 1.4, display: 'flex', gap: 6 }}>
                <button className="btn-action" onClick={() => onSelectThesis(t._id)}>Open</button>
                {t.status === 'REGISTRATION_PENDING' && (
                  <button className="btn-action" style={{ background: '#059669', color: 'white' }} onClick={() => onAction(t._id, 'verify')}>Verify</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── External Evaluation ──
const ExternalEvaluation = ({ theses, onAuditLog }) => {
  const submitted = theses.filter(t => t.status === 'SUBMITTED');
  return (
    <div className="card documents-card">
      <h3 className="card-title">External Evaluation Tracker</h3>
      <p style={{ color: '#6b7280', marginBottom: 16, fontSize: '0.9rem' }}>Track submitted theses through the external examiner evaluation process.</p>
      {submitted.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>No submitted theses yet.</div>}
      {submitted.map(t => (
        <div key={t._id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.scholarId?.name}</div>
          <div style={{ fontSize: '0.85rem', color: '#374151', marginBottom: 12 }}>{t.title}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-outline" onClick={() => onAuditLog(t._id, 'DISPATCHED_TO_EXAMINER', 'Thesis dispatched to external examiner')} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>📤 Mark Dispatched</button>
            <button className="btn-outline" onClick={() => onAuditLog(t._id, 'EXAMINER_REPORT_RECEIVED', 'External examiner report received')} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>📥 Report Received</button>
          </div>
        </div>
      ))}
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
            src={`${API_BASE_URL}${user.avatarUrl}`} 
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

        {user?.role === 'HOD' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Office Room No.</label>
              <input type="text" className="form-input" value={officeRoom} onChange={e => setOfficeRoom(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Years of Service as HOD</label>
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

// ── Manage Department Users ──
const ManageUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/auth/dept-users`, getAuthHeader());
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch department directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (userId) => {
    try {
      await axios.put(`${API}/auth/users/${userId}/active`, {}, getAuthHeader());
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle account active status.');
    }
  };

  return (
    <div className="card documents-card">
      <h3 className="card-title">Department Directory & User Access</h3>
      <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 20 }}>
        Verify profiles and toggle user logins active or disabled to coordinate access boundaries within your department.
      </p>
      
      {error && <div style={{ color: '#DC2626', marginBottom: 16 }}>{error}</div>}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>Loading directory...</div>
      ) : (
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex: 2 }}>Name</div>
            <div style={{ flex: 1.5 }}>Email Address</div>
            <div style={{ flex: 1 }}>Role</div>
            <div style={{ flex: 1 }}>Profile</div>
            <div style={{ flex: 1 }}>Verification</div>
            <div style={{ flex: 1 }}>Status</div>
            <div style={{ flex: 2.2 }}>Action</div>
          </div>
          {users.map(u => (
            <div key={u._id} className="file-item" style={{ opacity: u.isActive ? 1 : 0.65 }}>
              <div className="file-name" style={{ flex: 2, fontWeight: 600 }}>{u.name}</div>
              <div style={{ flex: 1.5, fontSize: '0.85rem', color: '#64748B' }}>{u.username}</div>
              <div style={{ flex: 1 }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: u.role === 'HOD' ? '#FEF3C7' : u.role === 'FACULTY' ? '#DBEAFE' : '#E0F2FE',
                  color: u.role === 'HOD' ? '#D97706' : u.role === 'FACULTY' ? '#1D4ED8' : '#0369A1'
                }}>
                  {u.role}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: u.profileCompleted ? '#D1FAE5' : '#FEF2F2',
                  color: u.profileCompleted ? '#065F46' : '#991B1B'
                }}>
                  {u.profileCompleted ? 'Complete' : 'Incomplete'}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: u.isVerified ? '#D1FAE5' : '#FEF3C7',
                  color: u.isVerified ? '#065F46' : '#D97706'
                }}>
                  {u.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: u.isActive ? '#D1FAE5' : '#F3F4F6',
                  color: u.isActive ? '#065F46' : '#374151'
                }}>
                  {u.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div style={{ flex: 2.2, display: 'flex', gap: 6, alignItems: 'center' }}>
                <button 
                  onClick={() => handleToggleActive(u._id)}
                  style={{
                    background: u.isActive ? '#DC2626' : '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {u.isActive ? 'Disable ID' : 'Enable ID'}
                </button>
                {!u.isVerified && (u.role === 'STUDENT' || u.role === 'FACULTY') && (
                  <button 
                    onClick={async () => {
                      try {
                        await axios.put(`${API}/auth/users/${u._id}/verify`, {}, getAuthHeader());
                        toast.success("Account verified successfully!");
                        fetchUsers();
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Verification failed');
                      }
                    }}
                    style={{
                      background: '#2563EB',
                      color: 'white',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Verify ID
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Faculty Management ──
const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  useEffect(() => { axios.get(`${API}/auth/faculty`, getAuthHeader()).then(r => setFaculty(r.data)).catch(() => {}); }, []);
  return (
    <div className="card documents-card">
      <h3 className="card-title">Faculty Supervison Directory</h3>
      <div className="file-list">
        <div className="file-header"><div style={{ flex: 2 }}>Name</div><div style={{ flex: 1.5 }}>Department</div><div style={{ flex: 1 }}>Sub-Role</div><div style={{ flex: 1.5 }}>Username</div></div>
        {faculty.map(f => (
          <div key={f._id} className="file-item">
            <div className="file-name" style={{ flex: 2 }}>{f.name}</div>
            <div className="file-date" style={{ flex: 1.5 }}>{f.department || '—'}</div>
            <div style={{ flex: 1 }}><span style={{ padding: '3px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: f.subRole === 'HOD' ? '#FEF3C7' : '#DBEAFE', color: f.subRole === 'HOD' ? '#D97706' : '#1D4ED8' }}>{f.subRole || 'SUPERVISOR'}</span></div>
            <div style={{ flex: 1.5, fontSize: '0.85rem', color: '#6b7280' }}>{f.username}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── PhD Lifecycle Administration console ──
const PhDLifecycleConsole = ({ theses, fetchAllTheses }) => {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState('rac');
  const [scholars, setScholars] = useState([]);
  const [racs, setRacs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pubs, setPubs] = useState([]);
  const { user } = useContext(AuthContext);

  // Form states for scheduling
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [schedForm, setSchedForm] = useState({ thesisId: '', racNumber: 1, scheduledDate: '', committeeMembers: '' });

  const fetchData = async () => {
    try {
      const dept = user?.department;
      if (!dept) return;

      // Filter verified theses in HOD's department
      const filtered = theses.filter(t => t.department === dept && t.status !== 'REGISTRATION_PENDING');
      setScholars(filtered);

      // Fetch RACs for all scholars in dept
      const allRacs = [];
      for (const t of filtered) {
        const rRes = await axios.get(`${API}/lifecycle/rac/thesis/${t._id}`, getAuthHeader());
        // Attach student details
        rRes.data.forEach(r => { r.scholar = t.scholarId; r.title = t.title; });
        allRacs.push(...rRes.data);
      }
      setRacs(allRacs);

      // Fetch Change requests and publications
      const [reqRes, pubRes] = await Promise.all([
        axios.get(`${API}/lifecycle/change-requests/department/${dept}`, getAuthHeader()),
        axios.get(`${API}/lifecycle/publications/department/${dept}`, getAuthHeader())
      ]);
      setRequests(reqRes.data);
      setPubs(pubRes.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchData();
  }, [theses, user]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedForm.thesisId || !schedForm.scheduledDate) return toast.warning('Please complete the scheduling form.');
    try {
      await axios.post(`${API}/lifecycle/rac/schedule`, schedForm, getAuthHeader());
      toast.success('RAC review meeting scheduled successfully!');
      setShowScheduleForm(false);
      setSchedForm({ thesisId: '', racNumber: 1, scheduledDate: '', committeeMembers: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to schedule RAC.');
    }
  };

  const handleRACGrade = async (racId, status, remarks) => {
    try {
      await axios.put(`${API}/lifecycle/rac/${racId}/result`, { status, remarks }, getAuthHeader());
      toast.success(`RAC progress successfully graded as ${status}!`);
      fetchData();
    } catch (err) {
      toast.error('Failed to submit grade.');
    }
  };

  const handleRequestReview = async (reqId, status, remarks) => {
    try {
      await axios.put(`${API}/lifecycle/change-requests/${reqId}/review`, { status, remarks }, getAuthHeader());
      toast.success(`Modification request successfully ${status}!`);
      fetchData();
      fetchAllTheses();
    } catch (err) {
      toast.error('Failed to resolve request.');
    }
  };

  const handlePubVerify = async (pubId, status) => {
    try {
      await axios.put(`${API}/lifecycle/publications/${pubId}/verify`, { status }, getAuthHeader());
      toast.success(`Publication record successfully ${status === 'VERIFIED' ? 'Verified' : 'Rejected'}!`);
      fetchData();
    } catch (err) {
      toast.error('Failed to verify publication.');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 12, borderBottom: '2px solid #E5E7EB', paddingBottom: 12, marginBottom: 20 }}>
        {[['rac', 'RAC Reviews'], ['requests', 'Guide / Title Changes'], ['publications', 'Publications']].map(([k, label]) => (
          <button 
            key={k} 
            onClick={() => setActiveSubTab(k)} 
            style={{
              background: 'none', border: 'none', padding: '8px 16px', fontWeight: 600, cursor: 'pointer',
              color: activeSubTab === k ? '#059669' : '#64748B',
              borderBottom: activeSubTab === k ? '3px solid #059669' : 'none'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── SUB TAB: RAC REVIEWS ── */}
      {activeSubTab === 'rac' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, color: '#0F172A' }}>Doctoral Committee & Periodic RAC Reviews</h4>
            <button onClick={() => setShowScheduleForm(!showScheduleForm)} className="btn-primary" style={{ background: '#059669', display: 'flex', gap: 6, alignItems: 'center' }}>
              <Plus size={16} /> Schedule RAC Review
            </button>
          </div>

          {showScheduleForm && (
            <form onSubmit={handleScheduleSubmit} style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h4 style={{ margin: 0 }}>Schedule Research Advisory Committee (RAC) Session</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Select Scholar</label>
                  <select className="form-input" required value={schedForm.thesisId} onChange={e => setSchedForm({ ...schedForm, thesisId: e.target.value })}>
                    <option value="">Choose scholar...</option>
                    {scholars.map(s => <option key={s._id} value={s._id}>{s.scholarId?.name} — {s.title}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>RAC Session Number</label>
                  <select className="form-input" value={schedForm.racNumber} onChange={e => setSchedForm({ ...schedForm, racNumber: parseInt(e.target.value) })}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>RAC - {n}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Scheduled Date</label>
                  <input type="date" className="form-input" required value={schedForm.scheduledDate} onChange={e => setSchedForm({ ...schedForm, scheduledDate: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Committee Members (Separated by commas)</label>
                  <input type="text" className="form-input" placeholder="e.g. Dr. Verma, Prof. Sen, Dr. Kapoor" value={schedForm.committeeMembers} onChange={e => setSchedForm({ ...schedForm, committeeMembers: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowScheduleForm(false)} className="btn-outline" style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#133A26', padding: '8px 16px' }}>Save Schedule</button>
              </div>
            </form>
          )}

          <div className="file-list">
            <div className="file-header">
              <div style={{ flex: 1.8 }}>Scholar</div>
              <div style={{ flex: 0.8 }}>Session</div>
              <div style={{ flex: 1.2 }}>Date</div>
              <div style={{ flex: 1.5 }}>Report</div>
              <div style={{ flex: 1.2 }}>Status</div>
              <div style={{ flex: 2.2, textAlign: 'center' }}>Grading Actions</div>
            </div>
            {racs.map(r => (
              <div key={r._id} className="file-item">
                <div style={{ flex: 1.8 }}>
                  <div style={{ fontWeight: 700 }}>{r.scholar?.name || 'Academic Scholar'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                </div>
                <div style={{ flex: 0.8, fontWeight: 600, color: '#1E3A8A' }}>RAC-{r.racNumber}</div>
                <div style={{ flex: 1.2, fontSize: '0.85rem' }}>{new Date(r.scheduledDate).toLocaleDateString()}</div>
                <div style={{ flex: 1.5 }}>
                  {r.progressReportUrl ? (
                    <a href={r.progressReportUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}>
                      📄 View Report
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
                <div style={{ flex: 2.2, display: 'flex', gap: 6, justifyContent: 'center' }}>
                  {r.status === 'SCHEDULED' ? (
                    <>
                      <button 
                        onClick={() => {
                          const rem = prompt('Enter review remarks:');
                          if (rem !== null) handleRACGrade(r._id, 'SATISFACTORY', rem);
                        }}
                        className="btn-primary" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#059669' }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => {
                          const rem = prompt('Enter review remarks:');
                          if (rem !== null) handleRACGrade(r._id, 'UNSATISFACTORY', rem);
                        }}
                        className="btn-outline" 
                        style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#DC2626' }}
                      >
                        Fail
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Remarks: {r.remarks || 'None'}</span>
                  )}
                </div>
              </div>
            ))}
            {racs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>No scheduled RAC review meetings found.</div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB TAB: CHANGE REQUESTS ── */}
      {activeSubTab === 'requests' && (
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex: 1.8 }}>Scholar</div>
            <div style={{ flex: 1.2 }}>Type</div>
            <div style={{ flex: 1.8 }}>Current</div>
            <div style={{ flex: 2 }}>Proposed</div>
            <div style={{ flex: 1.8 }}>Reason</div>
            <div style={{ flex: 2.2, textAlign: 'center' }}>Actions</div>
          </div>
          {requests.map(r => (
            <div key={r._id} className="file-item" style={{ opacity: r.status === 'PENDING' ? 1 : 0.65 }}>
              <div style={{ flex: 1.8, fontWeight: 700 }}>{r.scholarId?.name || 'Scholar'}</div>
              <div style={{ flex: 1.2, fontSize: '0.85rem', fontWeight: 600, color: '#1E3A8A' }}>
                {r.type === 'TITLE_CHANGE' ? '📝 Title Change' : '🤝 Guide Change'}
              </div>
              <div style={{ flex: 1.8, fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.currentValue}</div>
              <div style={{ flex: 2, fontSize: '0.85rem', fontWeight: 600 }}>
                {r.type === 'GUIDE_CHANGE' ? (r.proposedValue) : r.proposedValue}
              </div>
              <div style={{ flex: 1.8, fontSize: '0.8rem' }}>{r.reason}</div>
              <div style={{ flex: 2.2, display: 'flex', gap: 6, justifyContent: 'center' }}>
                {r.status === 'PENDING' ? (
                  <>
                    <button 
                      onClick={() => {
                        const rem = prompt('Enter approval comments:');
                        if (rem !== null) handleRequestReview(r._id, 'APPROVED', rem);
                      }}
                      className="btn-primary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#059669' }}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => {
                        const rem = prompt('Enter rejection comments:');
                        if (rem !== null) handleRequestReview(r._id, 'REJECTED', rem);
                      }}
                      className="btn-outline" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#DC2626' }}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span style={{ 
                    padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                    background: r.status === 'APPROVED' ? '#D1FAE5' : '#FEE2E2',
                    color: r.status === 'APPROVED' ? '#065F46' : '#991B1B'
                  }}>
                    {r.status}
                  </span>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>No guide or title modification requests logged.</div>
          )}
        </div>
      )}

      {/* ── SUB TAB: PUBLICATIONS ── */}
      {activeSubTab === 'publications' && (
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex: 1.8 }}>Scholar</div>
            <div style={{ flex: 2.5 }}>Paper Title</div>
            <div style={{ flex: 1.8 }}>Journal</div>
            <div style={{ flex: 1 }}>ISSN</div>
            <div style={{ flex: 1.2 }}>Links</div>
            <div style={{ flex: 2.2, textAlign: 'center' }}>Verification Action</div>
          </div>
          {pubs.map(p => (
            <div key={p._id} className="file-item" style={{ opacity: p.status === 'PENDING' ? 1 : 0.65 }}>
              <div style={{ flex: 1.8, fontWeight: 700 }}>{p.scholarId?.name || 'Scholar'}</div>
              <div style={{ flex: 2.5, fontSize: '0.85rem', fontWeight: 600 }}>{p.title}</div>
              <div style={{ flex: 1.8, fontSize: '0.85rem' }}>{p.journalName}</div>
              <div style={{ flex: 1, fontSize: '0.8rem', color: '#64748B' }}>{p.issn || '—'}</div>
              <div style={{ flex: 1.2, display: 'flex', gap: 10 }}>
                {p.paperLink && <a href={p.paperLink} target="_blank" rel="noreferrer" title="Article"><File size={16} /></a>}
                {p.attachmentUrl && <a href={p.attachmentUrl} target="_blank" rel="noreferrer" title="Proof" style={{ color: '#059669' }}><Upload size={16} /></a>}
              </div>
              <div style={{ flex: 2.2, display: 'flex', gap: 6, justifyContent: 'center' }}>
                {p.status === 'PENDING' ? (
                  <>
                    <button 
                      onClick={() => handlePubVerify(p._id, 'VERIFIED')}
                      className="btn-primary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#059669' }}
                    >
                      Verify Paper
                    </button>
                    <button 
                      onClick={() => handlePubVerify(p._id, 'REJECTED')}
                      className="btn-outline" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#DC2626' }}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span style={{ 
                    padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                    background: p.status === 'VERIFIED' ? '#D1FAE5' : '#FEE2E2',
                    color: p.status === 'VERIFIED' ? '#065F46' : '#991B1B'
                  }}>
                    {p.status}
                  </span>
                )}
              </div>
            </div>
          ))}
          {pubs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>No scientific papers pending verification.</div>
          )}
        </div>
      )}
    </div>
  );
};

const HODChangeRequestsTab = ({ user }) => {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [remarks, setRemarks] = useState({});
  
  // Modal & Searchable Selector States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignedSupervisorId, setAssignedSupervisorId] = useState('');
  const [remarksText, setRemarksText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const fetchAllData = async () => {
    try {
      const [reqRes, facRes] = await Promise.all([
        axios.get(`${API}/lifecycle/change-requests/department/${user?.department}`, getAuthHeader()),
        axios.get(`${API}/auth/faculty`, getAuthHeader())
      ]);
      setRequests(reqRes.data);
      // Show ALL active faculty registered in ANY department
      setFaculty(facRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.department) {
      fetchAllData();
    }
  }, [user?.department]);

  const handleSelectRequest = (r) => {
    setSelectedRequest(r);
    setAssignedSupervisorId(r.proposedValue || '');
    setRemarksText(remarks[r._id] || r.remarks || '');
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleReviewInModal = async (status) => {
    if (!remarksText.trim()) {
      toast.warning('Please enter remarks/reasons before submitting your decision.');
      return;
    }

    setBtnLoading(true);
    const isGuideChange = selectedRequest.type === 'GUIDE_CHANGE';
    try {
      const body = { status, remarks: remarksText };
      if (status === 'APPROVED' && isGuideChange) {
        body.proposedValue = assignedSupervisorId || selectedRequest.proposedValue;
      }
      await axios.put(`${API}/lifecycle/change-requests/${selectedRequest._id}/review`, body, getAuthHeader());
      toast.success(`Modification request successfully ${status}!`);
      
      // Update local remarks dictionary
      setRemarks(prev => ({ ...prev, [selectedRequest._id]: remarksText }));
      setSelectedRequest(null);
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review request.');
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 40, fontWeight: 600, color: '#475569' }}>Loading change requests...</div>;
  }

  const sortedRequests = [...requests].sort((a, b) => (a.status === 'PENDING' ? -1 : 1));

  return (
    <div className="card" style={{ padding: 24, background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
      <h3 className="card-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
        Student Academic Modification Requests
      </h3>
      <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 20 }}>
        Review, reassign, approve, or reject student requests for Thesis Title modifications and Research Supervisor (Guide) reallocations.
      </p>

      {sortedRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748B', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0', fontStyle: 'italic' }}>
          No academic modification requests logged for your department.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', background: '#F8FAFC' }}>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569' }}>Scholar</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569' }}>Request Type</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569' }}>Current Value</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569' }}>Proposed Value</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569' }}>Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map(r => {
                const isPending = r.status === 'PENDING';
                const isGuideChange = r.type === 'GUIDE_CHANGE';
                const proposedFaculty = faculty.find(f => f._id === r.proposedValue);
                const proposedFacultyName = proposedFaculty ? `${proposedFaculty.name} (${proposedFaculty.department})` : r.proposedValue || 'New Faculty Member';
                
                return (
                  <tr 
                    key={r._id} 
                    style={{ 
                      borderBottom: '1px solid #E2E8F0', 
                      background: isPending ? '#FFFBEB' : 'white',
                      transition: 'background-color 0.2s' 
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0F172A' }}>
                      <div style={{ fontWeight: 700 }}>{r.scholarId?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>{r.scholarId?.username}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: isGuideChange ? '#1E3A8A' : '#047857' }}>
                      {isGuideChange ? '🤝 Supervisor Reallocation' : '📝 Title Modification'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{r.currentValue || 'None'}</td>
                    <td style={{ padding: '14px 16px', color: '#0F172A', fontWeight: 600 }}>
                      {isGuideChange ? proposedFacultyName : r.proposedValue}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 12, 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        background: r.status === 'APPROVED' ? '#ECFDF5' : r.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB', 
                        color: r.status === 'APPROVED' ? '#065F46' : r.status === 'REJECTED' ? '#991B1B' : '#B45309' 
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleSelectRequest(r)}
                        className="btn-primary" 
                        style={{ padding: '6px 14px', fontSize: '0.78rem', background: '#3B82F6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {isPending ? 'Review' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Popup overlay */}
      {selectedRequest && (() => {
        const isPending = selectedRequest.status === 'PENDING';
        const isGuideChange = selectedRequest.type === 'GUIDE_CHANGE';
        const proposedFaculty = faculty.find(f => f._id === selectedRequest.proposedValue);
        const proposedFacultyName = proposedFaculty ? `${proposedFaculty.name} (${proposedFaculty.department})` : selectedRequest.proposedValue || 'New Faculty Member';

        return (
          <div 
            onClick={() => setSelectedRequest(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div 
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                animation: 'fadeIn 0.2s ease-out',
                textAlign: 'left'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#FAFAFA' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📋</span> Review Academic Request
                </span>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#64748B', cursor: 'pointer', fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                {/* Scholar Details Banner */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{selectedRequest.scholarId?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{selectedRequest.scholarId?.username}</div>
                  </div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: 12, 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    background: selectedRequest.status === 'APPROVED' ? '#ECFDF5' : selectedRequest.status === 'REJECTED' ? '#FEF2F2' : '#FFFBEB', 
                    color: selectedRequest.status === 'APPROVED' ? '#065F46' : selectedRequest.status === 'REJECTED' ? '#991B1B' : '#B45309' 
                  }}>
                    {selectedRequest.status}
                  </span>
                </div>

                {/* Info Fields Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', marginBottom: 2 }}>Request Type</strong>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E3A8A' }}>
                      {isGuideChange ? '🤝 Supervisor Reallocation' : '📝 Title Modification'}
                    </span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', marginBottom: 2 }}>Current Value</strong>
                    <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>{selectedRequest.currentValue || 'None'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <strong style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', marginBottom: 2 }}>Proposed / New Value</strong>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      {isGuideChange ? proposedFacultyName : selectedRequest.proposedValue}
                    </span>
                  </div>
                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
                    <strong style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', marginBottom: 2 }}>Candidate Rationale</strong>
                    <span style={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>"{selectedRequest.reason}"</span>
                  </div>
                </div>

                {/* Form fields */}
                {isPending ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
                    {isGuideChange && (
                      <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                          Confirm or Reassign Supervisor (Active Institutional Faculty)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowSearchResults(!showSearchResults);
                            }}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              color: '#0F172A',
                              fontWeight: 600,
                              userSelect: 'none',
                              transition: 'border-color 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#94A3B8'}
                            onMouseOut={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                          >
                            <span>
                              {assignedSupervisorId 
                                ? (() => {
                                    const selected = faculty.find(f => f._id === assignedSupervisorId);
                                    return selected 
                                      ? `👨‍🏫 ${selected.name} (${selected.department})`
                                      : 'Select Faculty Member';
                                  })()
                                : 'Choose a supervisor...'
                              }
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                              {showSearchResults ? '▲' : '▼'}
                            </span>
                          </div>

                          {showSearchResults && (() => {
                            const activeFacultyList = faculty.filter(f => {
                              const isActive = f.isActive !== false;
                              const matchesSearch = 
                                f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                f.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                f.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                f.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
                              return isActive && matchesSearch;
                            });

                            return (
                              <div 
                                onClick={e => e.stopPropagation()}
                                style={{ 
                                  position: 'absolute', 
                                  top: '100%', 
                                  left: 0, 
                                  right: 0, 
                                  background: 'white', 
                                  border: '1px solid #CBD5E1', 
                                  borderRadius: 8, 
                                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                                  zIndex: 9999,
                                  marginTop: 4,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  overflow: 'hidden'
                                }}
                              >
                                <div style={{ padding: '10px 12px', borderBottom: '1px solid #E2E8F0', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
                                      Faculty Directory ({activeFacultyList.length} matches)
                                    </span>
                                    <button 
                                      type="button" 
                                      onClick={() => setShowSearchResults(false)} 
                                      style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: '#EF4444', cursor: 'pointer', fontWeight: 700 }}
                                    >
                                      Close
                                    </button>
                                  </div>
                                  
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <input 
                                      type="text" 
                                      className="form-input" 
                                      placeholder="Type name, department, or specialization..." 
                                      value={searchTerm} 
                                      onChange={e => setSearchTerm(e.target.value)}
                                      style={{ flex: 1, fontSize: '0.82rem', padding: '6px 10px', height: '36px', margin: 0 }}
                                      onClick={e => e.stopPropagation()}
                                    />
                                    <button 
                                      type="button" 
                                      className="btn-primary" 
                                      style={{ background: '#059669', padding: '6px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', height: '36px' }}
                                    >
                                      🔍 Search
                                    </button>
                                  </div>
                                </div>

                                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                  {activeFacultyList.length === 0 ? (
                                    <div style={{ padding: 16, fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
                                      No faculty members found.
                                    </div>
                                  ) : (
                                    activeFacultyList.map(f => (
                                      <div 
                                        key={f._id} 
                                        onClick={() => {
                                          setAssignedSupervisorId(f._id);
                                          setShowSearchResults(false);
                                        }}
                                        style={{ 
                                          padding: '10px 14px', 
                                          cursor: 'pointer', 
                                          borderBottom: '1px solid #F1F5F9', 
                                          background: assignedSupervisorId === f._id ? '#EFF6FF' : 'white',
                                          transition: 'background-color 0.2s',
                                          textAlign: 'left'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = assignedSupervisorId === f._id ? '#EFF6FF' : 'white'}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>{f.name}</span>
                                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '2px 6px', borderRadius: 4 }}>
                                            {f.department}
                                          </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>
                                          <span>{f.designation || 'Faculty Supervisor'}</span>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>HOD Decision Remarks / MoM Context</label>
                      <textarea 
                        className="form-input" 
                        rows="3" 
                        placeholder="Enter the official reason or remarks for HOD approval/rejection..." 
                        value={remarksText} 
                        onChange={e => setRemarksText(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                ) : (
                  selectedRequest.remarks && (
                    <div style={{ background: '#F8FAFC', borderLeft: '4px solid #64748B', padding: '12px 16px', fontSize: '0.85rem', color: '#475569', borderRadius: 4, marginTop: 8 }}>
                      <strong>HOD Decision Remarks:</strong> "{selectedRequest.remarks}"
                    </div>
                  )
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #E2E8F0', background: '#FAFAFA' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedRequest(null)}
                  className="btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  {isPending ? 'Cancel' : 'Close'}
                </button>
                
                {isPending && (
                  <>
                    <button 
                      type="button" 
                      onClick={() => handleReviewInModal('REJECTED')} 
                      disabled={btnLoading} 
                      className="btn-outline" 
                      style={{ padding: '8px 16px', fontSize: '0.85rem', borderColor: '#EF4444', color: '#EF4444' }}
                    >
                      ✗ Reject Modification
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleReviewInModal('APPROVED')} 
                      disabled={btnLoading} 
                      className="btn-primary" 
                      style={{ padding: '8px 20px', fontSize: '0.85rem', background: '#059669' }}
                    >
                      ✓ Approve {isGuideChange ? '& Reassign Guide' : 'Title Change'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// ── Defaulter Tracking Tab ──
const DefaultersTab = () => {
  const toast = useToast();
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortAsc, setSortAsc] = useState(true);
  const [remindingId, setRemindingId] = useState(null);

  const fetchDefaulters = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/milestones/defaulters`, getAuthHeader());
      setDefaulters(data);
    } catch (err) {
      console.error('Error fetching defaulters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaulters();
  }, []);

  const handleSendReminder = async (id) => {
    setRemindingId(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Academic warning notification and email reminder dispatched to scholar!');
    } catch (err) {
      toast.error('Failed to send reminder.');
    } finally {
      setRemindingId(null);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = defaulters.filter(d => {
    const term = searchTerm.toLowerCase();
    return (
      d.scholarName.toLowerCase().includes(term) ||
      d.enrollmentNumber.toLowerCase().includes(term) ||
      d.scholarDepartment.toLowerCase().includes(term) ||
      d.milestoneTitle.toLowerCase().includes(term)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (sortField === 'dueDate') {
      valA = new Date(valA);
      valB = new Date(valB);
    } else {
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
    }
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="card" style={{ padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>Progress Report Defaulters</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: 4 }}>
            Scholars who have missed their bi-annual 6-Month Progress Report submission deadlines.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '10px 16px', borderRadius: 10, alignItems: 'center' }}>
          <span style={{ fontSize: '1.5rem' }}>⏰</span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991B1B' }}>{defaulters.length}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#7F1D1D' }}>Active Defaulters</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Filter by name, department, enrollment no..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
          style={{ maxWidth: 400 }}
        />
        <button onClick={fetchDefaulters} className="btn-outline" style={{ display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Loading defaulter list...</div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, background: '#F8FAFC', borderRadius: 12, color: '#64748B' }}>
          <span style={{ fontSize: '2rem' }}>🎉</span>
          <p style={{ fontWeight: 700, marginTop: 10, color: '#334155' }}>No Defaulters Found</p>
          <p style={{ fontSize: '0.8rem', marginTop: 2 }}>All scholars in this department are up-to-date with progress reports.</p>
        </div>
      ) : (
        <div className="file-list" style={{ overflowX: 'auto' }}>
          <div className="file-header" style={{ fontWeight: 700, borderBottom: '2px solid #CBD5E1', paddingBottom: 12 }}>
            <div style={{ flex: 1.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => handleSort('scholarName')}>
              Scholar {sortField === 'scholarName' ? (sortAsc ? '▲' : '▼') : ''}
            </div>
            <div style={{ flex: 1.2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => handleSort('enrollmentNumber')}>
              Enrollment No. {sortField === 'enrollmentNumber' ? (sortAsc ? '▲' : '▼') : ''}
            </div>
            <div style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => handleSort('scholarDepartment')}>
              Dept {sortField === 'scholarDepartment' ? (sortAsc ? '▲' : '▼') : ''}
            </div>
            <div style={{ flex: 2 }}>Overdue Report</div>
            <div style={{ flex: 1.2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => handleSort('dueDate')}>
              Due Date {sortField === 'dueDate' ? (sortAsc ? '▲' : '▼') : ''}
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>Status</div>
            <div style={{ flex: 1, textAlign: 'center' }}>Action</div>
          </div>
          {sorted.map(d => (
            <div key={d._id} className="file-item" style={{ padding: '14px 8px', borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}>
              <div style={{ flex: 1.5, fontWeight: 700, color: '#1E293B' }}>{d.scholarName}</div>
              <div style={{ flex: 1.2, fontSize: '0.85rem', color: '#475569' }}>{d.enrollmentNumber}</div>
              <div style={{ flex: 1, fontSize: '0.85rem', color: '#475569' }}>{d.scholarDepartment}</div>
              <div style={{ flex: 2, fontSize: '0.85rem', fontWeight: 600, color: '#7F1D1D' }}>{d.milestoneTitle}</div>
              <div style={{ flex: 1.2, fontSize: '0.82rem', color: '#475569' }}>
                {new Date(d.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.72rem', background: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: 12, fontWeight: 700 }}>
                  OVERDUE
                </span>
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <button 
                  onClick={() => handleSendReminder(d._id)} 
                  disabled={remindingId === d._id}
                  className="btn-action" 
                  style={{ background: '#DC2626', display: 'flex', gap: 4, alignItems: 'center', padding: '5px 12px', fontSize: '0.75rem' }}
                >
                  <Bell size={12} /> {remindingId === d._id ? 'Sending...' : 'Remind'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Sidebar Overhaul for HOD ──
const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const items = [
    { key: 'overview', label: 'Department Overview', Icon: Home },
    { key: 'profile', label: 'My Profile', Icon: User },
    { key: 'scholars', label: 'Manage Scholars', Icon: GraduationCap },
    { key: 'lifecycle', label: 'PhD Lifecycle', Icon: Layers },
    { key: 'defaulters', label: 'Defaulter Tracking', Icon: Clock },
    { key: 'requests', label: 'Change Requests', Icon: Edit },
    { key: 'evaluation', label: 'External Evaluation', Icon: FileText },
    { key: 'users', label: 'Manage Users', Icon: Users },
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
      <div className="sidebar-nav">
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

// ── Main ──
// ── Main ──
const AdminDashboard = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedThesisId, setSelectedThesisId] = useState(null);
  const { allTheses, fetchAllTheses, verifyEnrollment, assignSupervisor, clearCoursework, awardDegree, updateAuditLog, drcApprove, seminarClear } = useContext(ThesisContext);
  const { user, fetchMe } = useContext(AuthContext);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(user && !user.profileCompleted);

  useEffect(() => { 
    fetchAllTheses(); 
    fetchMe();
  }, []);

  const handleAction = async (id, action, payload) => {
    if (action === 'verify') await verifyEnrollment(id);
    else if (action === 'assign') await assignSupervisor(id, payload.supervisorId);
    else if (action === 'coursework') await clearCoursework(id);
    else if (action === 'drc') await drcApprove(id);
    else if (action === 'seminar') await seminarClear(id);
    else if (action === 'award') await awardDegree(id);
    else if (action === 'audit') await updateAuditLog(id, payload.action, payload.note);
    await fetchAllTheses();
  };

  const titles = { overview: 'Department Overview', scholars: 'Manage Scholars', requests: 'Student Change Requests Desk', lifecycle: 'PhD Lifecycle Admin', users: 'Manage Users', profile: 'My Profile', evaluation: 'External Evaluation', defaulters: 'Progress Report Defaulter Tracking' };

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
                  toast.success("Your account has been approved! Reloading dashboard...");
                  window.location.reload();
                } else {
                  toast.warning("Your account is still unverified. Please contact HOD of your department in case of faculty and contact the super admin in case of HOD.");
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
      case 'overview': return <OverviewPage theses={allTheses} onSelectThesis={setSelectedThesisId} user={user} setActiveTab={setActiveTab} />;
      case 'scholars': return <ManageScholars theses={allTheses} onSelectThesis={setSelectedThesisId} onAction={handleAction} />;
      case 'lifecycle': return <PhDLifecycleConsole theses={allTheses} fetchAllTheses={fetchAllTheses} />;
      case 'requests': return <HODChangeRequestsTab user={user} />;
      case 'users': return <ManageUsers />;
      case 'defaulters': return <DefaultersTab />;
      case 'profile': return <ProfileTab />;
      case 'evaluation': return <ExternalEvaluation theses={allTheses} onAuditLog={(id, action, note) => handleAction(id, 'audit', { action, note })} />;
      default: return <div className="card"><h3 className="card-title">{titles[activeTab]}</h3><p style={{ color: '#6b7280', marginTop: 8 }}>Content coming soon.</p></div>;
    }
  };

  return (
    <div className="app-container">
      <div className="mobile-overlay" onClick={() => document.body.classList.remove('sidebar-mobile-open')} />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isVerified={user?.isVerified} />
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
        
        <Header title={titles[activeTab]} />
        <div className="dashboard-area" style={{ flex: 1 }}>
          <div className="welcome-banner">
            <div><span className="welcome-text">Welcome, {user?.name || 'HOD'}!</span><span className="welcome-subtext"> | {user?.role === 'HOD' ? `${user?.department} HOD Dashboard` : 'System Administration'}</span></div>
            <div className="brand-text">ScholarSync Admin</div>
          </div>
          {renderContent()}
        </div>
      </div>
      {selectedThesisId && <ScholarDetail thesisId={selectedThesisId} onClose={() => setSelectedThesisId(null)} onAction={handleAction} />}
      <ProfileOnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
};

export default AdminDashboard;
