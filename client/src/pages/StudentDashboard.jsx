import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Book, Flag, FileText, Calendar, User, LogOut, Bell, ClipboardList, CheckCircle2, Clock, Upload, Lock, Award, Edit, File, Layers, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThesisContext } from '../context/ThesisContext';
import { useToast } from '../context/ToastContext';
import ProfileOnboardingModal from '../components/ProfileOnboardingModal';
import NotificationPanel from '../components/NotificationPanel';
import axios from 'axios';
import { API_BASE_URL, API_URL } from '../config';
import ThemeToggle from '../components/ThemeToggle';

const API = API_URL;
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const MilestoneTimeline = ({ thesis, milestones = [] }) => {
  const [drcMeetings, setDrcMeetings] = useState([]);
  const [racSessions, setRacSessions] = useState([]);

  const currentStatus = thesis?.status || 'REGISTRATION_PENDING';

  useEffect(() => {
    if (thesis?._id && currentStatus === 'SYNOPSIS_PENDING') {
      axios.get(`${API}/lifecycle/drc/thesis/${thesis._id}`, getAuthHeader())
        .then(res => {
          if (Array.isArray(res.data)) {
            setDrcMeetings(res.data);
          }
        })
        .catch(() => {});
    }
    if (thesis?._id && currentStatus === 'ACTIVE_RESEARCH') {
      axios.get(`${API}/lifecycle/rac/thesis/${thesis._id}`, getAuthHeader())
        .then(res => {
          if (Array.isArray(res.data)) {
            setRacSessions(res.data);
          }
        })
        .catch(() => {});
    }
  }, [thesis?._id, currentStatus]);

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

  const renderSubStepSection = (title, steps) => {
    return (
      <div style={{ marginTop: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📋</span> {title}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {steps.map((step, idx) => {
            const isSuccess = step.status === 'SUCCESS';
            const isDanger = step.status === 'DANGER';
            const isWarning = step.status === 'WARNING';
            
            let bg = '#F1F5F9';
            let border = '#CBD5E1';
            let color = '#475569';
            let icon = '⚪';

            if (isSuccess) {
              bg = '#ECFDF5';
              border = '#A7F3D0';
              color = '#047857';
              icon = '✅';
            } else if (isDanger) {
              bg = '#FEF2F2';
              border = '#FCA5A5';
              color = '#B91C1C';
              icon = '❌';
            } else if (isWarning) {
              bg = '#FFFBEB';
              border = '#FDE68A';
              color = '#B45309';
              icon = '⏳';
            }

            return (
              <div 
                key={idx} 
                style={{ 
                  background: bg, 
                  border: `1px solid ${border}`, 
                  borderRadius: '10px', 
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{step.label}</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDetailedSubProgression = () => {
    if (currentStatus === 'SYNOPSIS_PENDING') {
      const synopsis = milestones?.find(m => m.type === 'SYNOPSIS');
      
      const step1Uploaded = synopsis && ['SUBMITTED', 'REVISION_REQUIRED', 'APPROVED'].includes(synopsis.status);
      const step2Approved = synopsis?.status === 'APPROVED';
      const step2Revision = synopsis?.status === 'REVISION_REQUIRED';
      const step2Submitted = synopsis?.status === 'SUBMITTED';

      const activeDrc = drcMeetings.find(m => m.status === 'SCHEDULED');
      const drcApproved = drcMeetings.some(m => m.status === 'APPROVED');
      const drcRevision = drcMeetings.some(m => m.status === 'REVISION_REQUIRED');

      const step3Scheduled = drcMeetings.length > 0;
      const step3AwaitingSchedule = step2Approved && !step3Scheduled;

      const step4Approved = drcApproved;
      const step4Revision = drcRevision;
      const step4Scheduled = activeDrc && !drcApproved && !drcRevision;

      const subSteps = [
        {
          label: 'Synopsis Document Drafted',
          desc: step1Uploaded 
            ? 'Research title, abstract, and proposal PDF uploaded.' 
            : 'Prepare your draft synopsis and upload for advisor review.',
          status: step1Uploaded ? 'SUCCESS' : 'PENDING'
        },
        {
          label: 'Supervisor Sign-off',
          desc: step2Approved 
            ? 'Approved and recommended by your Research Advisor.' 
            : step2Revision 
            ? `Correction needed: "${synopsis.comments?.[synopsis.comments.length - 1]?.text || 'Check remarks'}"`
            : step2Submitted 
            ? 'Awaiting your supervisor\'s review and evaluation.' 
            : 'Awaiting synopsis document upload.',
          status: step2Approved ? 'SUCCESS' : step2Revision ? 'DANGER' : step2Submitted ? 'WARNING' : 'PENDING'
        },
        {
          label: 'DRC Meeting Scheduling',
          desc: drcApproved || drcRevision
            ? 'DRC evaluation session successfully concluded.'
            : activeDrc 
            ? `Scheduled: ${new Date(activeDrc.scheduledDate).toLocaleDateString()} at ${activeDrc.scheduledTime} in ${activeDrc.venue}.` 
            : step3AwaitingSchedule 
            ? 'Supervisor approved! HOD will schedule the DRC evaluation board shortly.' 
            : 'Awaiting supervisor approval before committee scheduling.',
          status: (drcApproved || drcRevision || activeDrc) ? 'SUCCESS' : step3AwaitingSchedule ? 'WARNING' : 'PENDING'
        },
        {
          label: 'DRC Panel Evaluation',
          desc: drcApproved 
            ? 'Synopsis officially approved by the Departmental Research Committee!' 
            : drcRevision 
            ? `Panel revisions required: "${drcMeetings.find(m => m.status === 'REVISION_REQUIRED')?.remarks || 'Check feedback'}"`
            : activeDrc 
            ? 'Awaiting presentation defense and grading outcome.' 
            : 'DRC evaluation panel will convene after scheduling.',
          status: drcApproved ? 'SUCCESS' : drcRevision ? 'DANGER' : activeDrc ? 'WARNING' : 'PENDING'
        }
      ];

      return renderSubStepSection("Research Synopsis & DRC Progression Details", subSteps);
    }

    if (currentStatus === 'ACTIVE_RESEARCH') {
      const reports = milestones?.filter(m => m.type === 'PROGRESS_REPORT') || [];
      const approvedCount = reports.filter(r => r.status === 'APPROVED').length;
      
      const subSteps = [
        {
          label: 'Research Advisor Allocation',
          desc: thesis.supervisorId ? `Supervisor: ${thesis.supervisorId.name}.` : 'Supervisor allocation pending verification.',
          status: thesis.supervisorId ? 'SUCCESS' : 'WARNING'
        },
        {
          label: 'Periodic RAC Evaluations',
          desc: racSessions.length > 0 
            ? `Concluded ${racSessions.filter(r => r.status === 'SATISFACTORY').length} RAC review panels successfully.`
            : 'Schedule your periodic RAC progress evaluation within 6 months.',
          status: racSessions.some(r => r.status === 'SATISFACTORY') ? 'SUCCESS' : 'WARNING'
        },
        {
          label: 'Progress Reports Deliverables',
          desc: reports.length > 0 
            ? `Cleared ${approvedCount} of ${reports.length} scheduled progress reports.` 
            : 'No progress reports assigned yet.',
          status: approvedCount > 0 ? 'SUCCESS' : 'PENDING'
        }
      ];

      return renderSubStepSection("Active Research & RAC Progression Details", subSteps);
    }

    if (currentStatus === 'PRE_SUBMISSION') {
      const preMilestone = milestones?.find(m => m.type === 'PRE_SUBMISSION');
      const uploaded = preMilestone && ['SUBMITTED', 'REVISION_REQUIRED', 'APPROVED'].includes(preMilestone.status);
      const approved = preMilestone?.status === 'APPROVED';
      const revision = preMilestone?.status === 'REVISION_REQUIRED';
      const submitted = preMilestone?.status === 'SUBMITTED';

      const subSteps = [
        {
          label: 'Pre-Submission Seminar Defense',
          desc: 'Seminar successfully cleared in front of department experts.',
          status: 'SUCCESS'
        },
        {
          label: 'Package Upload (Publications & Rough Draft)',
          desc: uploaded 
            ? 'Draft package uploaded successfully.' 
            : 'Upload draft thesis, plagiarism certificate, and publication proofs.',
          status: uploaded ? 'SUCCESS' : 'PENDING'
        },
        {
          label: 'Advisor Final Sign-off',
          desc: approved 
            ? 'Approved by advisor. Ready for digital sign-off and dispatch.' 
            : revision 
            ? `Revisions required: "${preMilestone.comments?.[preMilestone.comments.length - 1]?.text || 'Check feedback'}"`
            : submitted 
            ? 'Under evaluation by your Research Advisor.' 
            : 'Awaiting package upload for supervisor signature.',
          status: approved ? 'SUCCESS' : revision ? 'DANGER' : submitted ? 'WARNING' : 'PENDING'
        }
      ];

      return renderSubStepSection("Pre-Submission Progression Details", subSteps);
    }

    return null;
  };

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

      {/* Dynamic Detailed Sub-Progression Checklist */}
      {renderDetailedSubProgression()}
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, isVerified }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const items = [
    { key: 'overview', label: 'Dashboard', Icon: Home },
    { key: 'profile', label: 'Profile', Icon: User },
    { key: 'thesis', label: 'My Thesis', Icon: Book },
    { key: 'milestones', label: 'Milestones', Icon: Flag },
    { key: 'rac', label: 'RAC Progress', Icon: Layers },
    { key: 'sixMonthReports', label: '6-Month Reports', Icon: Calendar },
    { key: 'chapterDrafts', label: 'Chapter Drafts', Icon: FileText },
    { key: 'researchOutputs', label: 'Research Outputs', Icon: Award },
    { key: 'publications', label: 'Publications', Icon: File },
    { key: 'meetings', label: 'Meetings', Icon: Calendar },
    { key: 'documents', label: 'Documents', Icon: FileText },
    { key: 'changes', label: 'Request Changes', Icon: Edit },
    { key: 'certificates', label: 'Certificates', Icon: Award },
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
            <img src={`${API_BASE_URL}${user.avatarUrl}`} alt="Student" className="user-avatar" style={{ objectFit: 'cover' }} />
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
  const toast = useToast();
  const [form, setForm] = useState({ 
    enrollmentNumber: '', 
    department: user?.department || '', 
    title: '', 
    abstract: '' 
  });
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/departments`)
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
      toast.error(err.response?.data?.message || 'Error'); 
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
  const toast = useToast();
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
    if (!file) return toast.warning('Please select a synopsis document');
    if (!title.trim()) return toast.warning('Please enter your finalized research title');
    if (!abstract.trim()) return toast.warning('Please enter your finalized research abstract');
    setLoading(true);
    try {
      await onSubmit(synopsisMilestone._id, file, title, abstract);
      toast.success('Synopsis and finalized research outline submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
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
                <a href={`${API_BASE_URL}${synopsisMilestone.documentUrl}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 12, color: '#0284C7', fontWeight: 600 }}>View Submitted Synopsis</a>
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
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const statusColor = { PENDING: '#D97706', SUBMITTED: '#3B82F6', APPROVED: '#059669', REVISION_REQUIRED: '#DC2626' };
  const statusBg = { PENDING: '#FEF3C7', SUBMITTED: '#DBEAFE', APPROVED: '#D1FAE5', REVISION_REQUIRED: '#FEE2E2' };

  const handleSubmit = async () => {
    if (!file) return toast.warning('Please select a file');
    setLoading(true);
    try { await onSubmit(milestone._id, file); setFile(null); }
    catch (e) { toast.error(e.response?.data?.message || 'Upload failed'); }
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
          <a href={`${API_BASE_URL}${milestone.documentUrl}`} target="_blank" rel="noreferrer" style={{ color: '#10B981', fontSize: '0.85rem' }}>📄 View Submitted Document</a>
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

  const synopsisMilestone = milestones.find(m => m.type === 'SYNOPSIS');
  const isSynopsisRevision = thesis.status === 'SYNOPSIS_PENDING' && synopsisMilestone?.status === 'REVISION_REQUIRED';

  const preMilestone = milestones.find(m => m.type === 'PRE_SUBMISSION');
  const isPreSubmissionRevision = thesis.status === 'PRE_SUBMISSION' && preMilestone?.status === 'REVISION_REQUIRED';

  const statusMap = {
    REGISTRATION_PENDING: { label: 'Awaiting Admin Verification', color: '#D97706', bg: '#FEF3C7', progress: 10, nextAction: 'Wait for HOD to verify your enrollment and assign a department supervisor.' },
    COURSEWORK: { label: 'Coursework Phase', color: '#3B82F6', bg: '#DBEAFE', progress: 25, nextAction: 'Focus on completing your doctoral coursework syllabus and clear your coursework exams.' },
    SYNOPSIS_PENDING: isSynopsisRevision ? {
      label: 'Synopsis Correction Needed',
      color: '#DC2626',
      bg: '#FEE2E2',
      progress: 40,
      nextAction: `Your supervisor requested corrections. Feedback: "${synopsisMilestone.comments?.[synopsisMilestone.comments.length - 1]?.text || 'Please check supervisor comments.'}". Go to "Research Synopsis" to re-upload your revised proposal.`
    } : {
      label: 'Synopsis Submission',
      color: '#8B5CF6',
      bg: '#EDE9FE',
      progress: 40,
      nextAction: 'Upload your research synopsis proposal PDF. Ensure similarity indexing is within permissible limits.'
    },
    ACTIVE_RESEARCH: { label: 'Active Research', color: '#059669', bg: '#D1FAE5', progress: 65, nextAction: 'Submit periodic 6-month progress reports to your Research Advisory Committee (RAC) and publish research papers.' },
    PRE_SUBMISSION: isPreSubmissionRevision ? {
      label: 'Thesis Revision Required',
      color: '#DC2626',
      bg: '#FEE2E2',
      progress: 85,
      nextAction: `Your supervisor requested thesis revisions. Feedback: "${preMilestone.comments?.[preMilestone.comments.length - 1]?.text || 'Please check supervisor comments.'}". Go to "Pre-Submission Package" to re-upload your revised package.`
    } : {
      label: 'Pre-Submission',
      color: '#EA580C',
      bg: '#FED7AA',
      progress: 85,
      nextAction: 'Prepare for your pre-submission seminar and defense colloquium in front of department experts.'
    },
    SUBMITTED: { label: 'Under Evaluation', color: '#6B7280', bg: '#F3F4F6', progress: 95, nextAction: 'Your final thesis is under review by external examiners. Updates will be visible here shortly.' },
    AWARDED: { label: 'Degree Awarded 🎓', color: '#059669', bg: '#D1FAE5', progress: 100, nextAction: 'Congratulations! Your Ph.D. degree has been officially awarded by the Academic Council.' },
  };

  const s = statusMap[thesis.status] || statusMap['REGISTRATION_PENDING'];
  const activeDrc = drcMeetings.find(m => m.status === 'SCHEDULED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Milestone Timeline */}
      <MilestoneTimeline thesis={thesis} milestones={milestones} />

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
  const toast = useToast();
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
    if (!reportUrl) return toast.warning('Please enter report URL or document link.');
    try {
      await axios.put(`${API}/lifecycle/rac/${racId}/report`, { progressReportUrl: reportUrl }, getAuthHeader());
      toast.success('Progress report submitted successfully!');
      setUploadingId(null);
      setReportUrl('');
      fetchRACs();
    } catch (err) {
      toast.error('Upload failed.');
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
  const toast = useToast();
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
      toast.success('Publication logged successfully and pending review!');
      setShowForm(false);
      setForm({ title: '', journalName: '', issn: '', publicationDate: '', paperLink: '', attachmentUrl: '' });
      fetchPubs();
    } catch (err) {
      toast.error('Error logging publication.');
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
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [faculty, setFaculty] = useState([]);
  const [form, setForm] = useState({ type: 'TITLE_CHANGE', proposedValue: '', reason: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

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
    if (!form.proposedValue) return toast.warning('Please enter proposed value.');
    try {
      await axios.post(`${API}/lifecycle/change-requests`, { ...form, thesisId: thesis._id }, getAuthHeader());
      toast.success('Change request submitted successfully!');
      setShowForm(false);
      setForm({ type: 'TITLE_CHANGE', proposedValue: '', reason: '' });
      fetchRequests();
    } catch (err) {
      toast.error('Error submitting request.');
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
              <select className="form-input" value={form.type} onChange={e => { setForm({ ...form, type: e.target.value, proposedValue: '' }); setSearchTerm(''); setShowSearchResults(false); }}>
                <option value="TITLE_CHANGE">Thesis Title Modification</option>
                <option value="GUIDE_CHANGE">Supervisor Reallocation</option>
              </select>
            </div>
            <div>
              {form.type === 'TITLE_CHANGE' ? (
                <>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Proposed New Title</label>
                  <input type="text" className="form-input" required placeholder="Enter the exact new thesis topic title..." value={form.proposedValue} onChange={e => setForm({ ...form, proposedValue: e.target.value })} />
                </>
              ) : (
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Choose Proposed Research Guide (Active Faculty)
                  </label>
                  {/* Select Box Trigger */}
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
                      color: form.proposedValue ? '#0F172A' : '#64748B',
                      fontWeight: form.proposedValue ? 600 : 400,
                      userSelect: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#94A3B8'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#CBD5E1'}
                  >
                    <span>
                      {form.proposedValue 
                        ? (() => {
                            const selected = faculty.find(f => f._id === form.proposedValue);
                            return selected 
                              ? `👨‍🏫 ${selected.name} (${selected.department})`
                              : 'Select Faculty Member'
                          })()
                        : 'Choose an active supervisor...'
                      }
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      {showSearchResults ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Dropdown panel */}
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
                          zIndex: 99,
                          marginTop: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Search input and button inside the dropdown */}
                        <div style={{ padding: '10px 12px', borderBottom: '1px solid #E2E8F0', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                              Active Faculty Directory ({activeFacultyList.length} matches)
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
                              onClick={() => {
                                // Searching is live as you type, but this button explicitly confirms and handles search
                              }}
                              className="btn-primary" 
                              style={{ background: '#059669', padding: '6px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', height: '36px' }}
                            >
                              🔍 Search
                            </button>
                          </div>
                        </div>

                        {/* List of active faculties */}
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {activeFacultyList.length === 0 ? (
                            <div style={{ padding: 16, fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
                              No active faculty members found.
                            </div>
                          ) : (
                            activeFacultyList.map(f => (
                              <div 
                                key={f._id} 
                                onClick={() => {
                                  setForm({ ...form, proposedValue: f._id });
                                  setShowSearchResults(false);
                                }}
                                style={{ 
                                  padding: '10px 14px', 
                                  cursor: 'pointer', 
                                  borderBottom: '1px solid #F1F5F9', 
                                  background: form.proposedValue === f._id ? '#EFF6FF' : 'white',
                                  transition: 'background-color 0.2s',
                                  textAlign: 'left'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = form.proposedValue === f._id ? '#EFF6FF' : 'white'}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>{f.name}</span>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '2px 6px', borderRadius: 4 }}>
                                    {f.department}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>
                                  <span>{f.designation || 'Faculty Supervisor'}</span>
                                  {f.specialization && <span>Focus: {f.specialization}</span>}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
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
        <h3 className="card-title">H.P. University Academic Credentials</h3>
        <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
          Upon formal HOD reviews and supervisor clearances, download official printable registration, coursework, progress, and publication credentials certified by Himachal Pradesh University.
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
                  href={`${API_URL}/lifecycle/certificates/${thesis._id}/${c.type}`} 
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

// ── Phase 5 Active Research Tab views ──
const SixMonthReportsTab = ({ thesis, milestones = [], onSubmit }) => {
  const toast = useToast();
  const reports = milestones.filter(m => m.type === '6_MONTH_REPORT') || [];
  const [file, setFile] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (id) => {
    if (!file) return toast.warning('Please choose a PDF document first.');
    setLoading(true);
    try {
      await onSubmit(id, file);
      toast.success('6-Month Progress Report submitted successfully!');
      setFile(null);
      setUploadingId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">6-Month Progress Reports Timeline</h3>
      <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 24 }}>
        Chronological portal for uploading mandatory periodic progress reports. Track supervisor reviews and advisory committee clearances.
      </p>

      {reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748B', background: '#F8FAFC', borderRadius: 12 }}>
          <span>⏳</span> No 6-month progress report milestones assigned yet. Your supervisor/admin will allocate these deliverables.
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '3px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {reports.map((report, idx) => {
            const isSubmitted = ['SUBMITTED', 'APPROVED', 'REVISION_REQUIRED'].includes(report.status);
            const isApproved = report.status === 'APPROVED';
            const isRevision = report.status === 'REVISION_REQUIRED';
            const isPending = report.status === 'PENDING';

            let dotBg = '#CBD5E1';
            let titleColor = '#475569';
            if (isApproved) { dotBg = '#10B981'; titleColor = '#065F46'; }
            else if (isRevision) { dotBg = '#EF4444'; titleColor = '#B91C1C'; }
            else if (isSubmitted) { dotBg = '#3B82F6'; titleColor = '#1D4ED8'; }

            return (
              <div key={report._id} style={{ position: 'relative' }}>
                {/* Timeline Dot */}
                <div style={{
                  position: 'absolute',
                  left: '-34px',
                  top: '4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: dotBg,
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 0 0 2px ' + dotBg
                }} />

                {/* Content Panel */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: titleColor }}>
                        {report.title}
                      </h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                        Due Date: {report.dueDate ? new Date(report.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: isApproved ? '#D1FAE5' : isRevision ? '#FEE2E2' : isSubmitted ? '#DBEAFE' : '#FEF3C7',
                      color: isApproved ? '#065F46' : isRevision ? '#991B1B' : isSubmitted ? '#1D4ED8' : '#D97706'
                    }}>
                      {report.status}
                    </span>
                  </div>

                  {/* Document Link */}
                  {report.documentUrl && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem' }}>📄</span>
                      <a href={`${API_BASE_URL}${report.documentUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}>
                        View Submitted Report
                      </a>
                    </div>
                  )}

                  {/* Comments Panel */}
                  {report.comments?.length > 0 && (
                    <div style={{ marginTop: '16px', padding: '12px', background: '#FFFBEB', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B45309', marginBottom: '6px' }}>Advisory Committee Feedback:</div>
                      {report.comments.map((c, i) => (
                        <div key={i} style={{ fontSize: '0.82rem', color: '#78350F', fontStyle: 'italic', marginBottom: '4px' }}>
                          "{c.text}" — <span style={{ fontWeight: 600 }}>{c.authorName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submission Form */}
                  {(isPending || isRevision) && (
                    <div style={{ marginTop: '16px', borderTop: '1px dashed #CBD5E1', paddingTop: '16px' }}>
                      {uploadingId === report._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Select Progress Report PDF</label>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ fontSize: '0.85rem' }} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => setUploadingId(null)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Cancel</button>
                              <button onClick={() => handleUpload(report._id)} className="btn-primary" disabled={loading} style={{ background: '#133A26', padding: '6px 16px', fontSize: '0.8rem' }}>
                                {loading ? 'Submitting...' : 'Upload & Submit'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setUploadingId(report._id); setFile(null); }} className="btn-primary" style={{ background: '#133A26', padding: '6px 14px', fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <Upload size={14} /> Submit Report
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ChapterDraftsTab = ({ thesis, milestones = [], onSubmit }) => {
  const toast = useToast();
  const drafts = milestones.filter(m => m.type === 'CHAPTER_DRAFT') || [];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateAndUpload = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return toast.warning('Please enter the chapter title.');
    if (!file) return toast.warning('Please select a PDF document.');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/milestones/create`, {
        thesisId: thesis._id,
        type: 'CHAPTER_DRAFT',
        title: newTitle.trim(),
        sequence: drafts.length + 1
      }, getAuthHeader());

      await onSubmit(res.data._id, file);

      toast.success('Chapter Draft uploaded successfully!');
      setNewTitle('');
      setFile(null);
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload chapter draft.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>Chapter Drafts Workspace</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: 4 }}>
            Iteratively submit your PhD thesis chapter drafts for adviser review and track text revisions and approval.
          </p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ background: '#059669', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Plus size={16} /> Upload Draft
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateAndUpload} style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ margin: 0, color: '#0F172A' }}>Upload Chapter Draft</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Chapter Title (e.g. Chapter 1: Introduction)</label>
              <input type="text" className="form-input" required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Chapter 1: Literature Review" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Chapter Document Proof (PDF)</label>
              <input type="file" accept=".pdf" required onChange={e => setFile(e.target.files[0])} style={{ fontSize: '0.85rem', marginTop: '6px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-outline" style={{ padding: '8px 16px' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ background: '#133A26', padding: '8px 16px' }}>
              {loading ? 'Submitting...' : 'Upload & Submit Draft'}
            </button>
          </div>
        </form>
      )}

      {drafts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748B', background: '#F8FAFC', borderRadius: 8 }}>
          No chapter drafts uploaded yet. Complete your outline and upload the first draft!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {drafts.map(d => (
            <div key={d._id} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>{d.title}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                    Uploaded at: {d.submittedAt ? new Date(d.submittedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                  background: d.status === 'APPROVED' ? '#D1FAE5' : d.status === 'REVISION_REQUIRED' ? '#FEE2E2' : d.status === 'SUBMITTED' ? '#DBEAFE' : '#FEF3C7',
                  color: d.status === 'APPROVED' ? '#065F46' : d.status === 'REVISION_REQUIRED' ? '#991B1B' : d.status === 'SUBMITTED' ? '#1D4ED8' : '#D97706'
                }}>
                  {d.status}
                </span>
              </div>

              {d.documentUrl && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>📄</span>
                  <a href={`${API_BASE_URL}${d.documentUrl}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}>
                    View Uploaded Chapter
                  </a>
                </div>
              )}

              {d.comments?.length > 0 && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#FFFBEB', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B45309', marginBottom: '6px' }}>Supervisor Feedback:</div>
                  {d.comments.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.82rem', color: '#78350F', fontStyle: 'italic', marginBottom: '4px' }}>
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
  );
};

const ResearchOutputsTab = ({ thesis }) => {
  const toast = useToast();
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', journalName: '', issn: '', publicationDate: '', paperLink: '', type: 'JOURNAL', doiUrl: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPubs = async () => {
    try {
      const res = await axios.get(`${API_URL}/publications/thesis/${thesis._id}`, getAuthHeader());
      setPubs(res.data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => { fetchPubs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.journalName.trim()) return toast.warning('Please enter paper title and publisher details.');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('thesisId', thesis._id);
      formData.append('title', form.title);
      formData.append('journalName', form.journalName);
      formData.append('issn', form.issn);
      formData.append('publicationDate', form.publicationDate);
      formData.append('paperLink', form.paperLink);
      formData.append('type', form.type);
      formData.append('doiUrl', form.doiUrl);
      if (file) formData.append('document', file);

      await axios.post(`${API_URL}/publications`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Scientific Publication logged successfully & pending verification!');
      setShowForm(false);
      setForm({ title: '', journalName: '', issn: '', publicationDate: '', paperLink: '', type: 'JOURNAL', doiUrl: '' });
      setFile(null);
      fetchPubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error logging publication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 className="card-title" style={{ margin: 0 }}>Research Outputs Vault</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: 4 }}>
            Log peer-reviewed journal articles, conference papers, and patents logged during your doctoral tenure.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ background: '#059669', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Plus size={16} /> Log Paper
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h4 style={{ margin: 0, color: '#0F172A' }}>Log Scientific Output</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Paper Title *</label>
              <input type="text" className="form-input" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enter exact title of publication" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Journal / Conference Name *</label>
              <input type="text" className="form-input" required value={form.journalName} onChange={e => setForm({ ...form, journalName: e.target.value })} placeholder="e.g. IEEE Transactions on Software Engineering" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Publication Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="JOURNAL">Peer-Reviewed Journal</option>
                <option value="CONFERENCE">International Conference</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>ISSN / ISBN</label>
              <input type="text" className="form-input" value={form.issn} onChange={e => setForm({ ...form, issn: e.target.value })} placeholder="e.g. 1234-567X" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Publication Date *</label>
              <input type="date" className="form-input" required value={form.publicationDate} onChange={e => setForm({ ...form, publicationDate: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>DOI URL / Paper Link</label>
              <input type="text" className="form-input" value={form.paperLink} onChange={e => setForm({ ...form, paperLink: e.target.value })} placeholder="e.g. https://doi.org/10.1145/..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Exact DOI String</label>
              <input type="text" className="form-input" value={form.doiUrl} onChange={e => setForm({ ...form, doiUrl: e.target.value })} placeholder="e.g. 10.1145/12345" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Upload Publication Proof (PDF copy of article) *</label>
            <input type="file" accept=".pdf" required onChange={e => setFile(e.target.files[0])} style={{ fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ padding: '8px 16px' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ background: '#133A26', padding: '8px 16px' }}>
              {submitting ? 'Submitting...' : 'Log Research Output'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>Loading outputs...</div>
      ) : pubs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748B', background: '#F8FAFC', borderRadius: 8 }}>
          No peer-reviewed papers or outputs logged in this vault yet.
        </div>
      ) : (
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex: 2.5 }}>Paper Title</div>
            <div style={{ flex: 1.5 }}>Journal/Conference</div>
            <div style={{ flex: 1 }}>ISSN</div>
            <div style={{ flex: 1.2 }}>DOI</div>
            <div style={{ flex: 1 }}>Status</div>
            <div style={{ flex: 1, textAlign: 'center' }}>Links</div>
          </div>
          {pubs.map(p => (
            <div key={p._id} className="file-item">
              <div style={{ flex: 2.5, fontWeight: 700 }}>{p.title}</div>
              <div style={{ flex: 1.5, fontSize: '0.85rem' }}>{p.journalName} <span style={{ fontSize: '0.72rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>{p.type}</span></div>
              <div style={{ flex: 1, fontSize: '0.85rem', color: '#64748B' }}>{p.issn || '—'}</div>
              <div style={{ flex: 1.2, fontSize: '0.8rem', color: '#0F172A', fontFamily: 'monospace' }}>{p.doiUrl || '—'}</div>
              <div style={{ flex: 1 }}>
                <span style={{
                  padding: '4px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                  background: p.status === 'VERIFIED' ? '#D1FAE5' : p.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                  color: p.status === 'VERIFIED' ? '#065F46' : p.status === 'REJECTED' ? '#991B1B' : '#D97706'
                }}>
                  {p.status}
                </span>
              </div>
              <div style={{ flex: 1, display: 'flex', gap: 8, justifyContent: 'center' }}>
                {(p.paperLink || p.doiUrl) && <a href={p.paperLink || `https://doi.org/${p.doiUrl}`} target="_blank" rel="noreferrer" title="Publisher Link" style={{ color: '#2563EB' }}><File size={16} /></a>}
                {p.documentUrl && <a href={`${API_BASE_URL}${p.documentUrl}`} target="_blank" rel="noreferrer" title="View Article PDF" style={{ color: '#059669' }}><Upload size={16} /></a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileTab = () => {
  const { user, updateProfile, uploadAvatar, uploadProfileDocument } = useContext(AuthContext);
  const { thesis, createThesis, fetchMyThesis } = useContext(ThesisContext);
  const toast = useToast();
  const [subTab, setSubTab] = useState('general'); // general | academic | guide
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState('');
  const [selectedFileNames, setSelectedFileNames] = useState({});

  // Common ERP fields
  const [dob, setDob] = useState(user?.profile?.dob ? user.profile.dob.split('T')[0] : '');
  const [gender, setGender] = useState(user?.profile?.gender || '');
  const [category, setCategory] = useState(user?.profile?.category || '');
  const [fatherName, setFatherName] = useState(user?.profile?.fatherName || '');
  const [motherName, setMotherName] = useState(user?.profile?.motherName || '');
  const [nationality, setNationality] = useState(user?.profile?.nationality || 'Indian');
  const [admissionDate, setAdmissionDate] = useState(user?.profile?.admissionDate ? user.profile.admissionDate.split('T')[0] : '');
  const [enrollmentNumber, setEnrollmentNumber] = useState(user?.profile?.enrollmentNumber || '');
  const [phdMode, setPhdMode] = useState(user?.profile?.phdMode || '');
  const [specialization, setSpecialization] = useState(user?.profile?.specialization || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.profile?.phoneNumber || '');
  const [address, setAddress] = useState(user?.profile?.address || '');
  const [areaOfInterest, setAreaOfInterest] = useState(user?.profile?.areaOfInterest || '');
  const [academicBackground, setAcademicBackground] = useState(user?.profile?.academicBackground || '');

  // Class 10
  const [class10Roll, setClass10Roll] = useState(user?.profile?.qualifications?.class10?.rollNo || '');
  const [class10Board, setClass10Board] = useState(user?.profile?.qualifications?.class10?.board || '');
  const [class10School, setClass10School] = useState(user?.profile?.qualifications?.class10?.school || '');
  const [class10Marks, setClass10Marks] = useState(user?.profile?.qualifications?.class10?.marksObtained || '');
  const [class10Total, setClass10Total] = useState(user?.profile?.qualifications?.class10?.totalMarks || '');
  const [class10Percentage, setClass10Percentage] = useState(user?.profile?.qualifications?.class10?.percentage || '');

  // Class 12
  const [class12Roll, setClass12Roll] = useState(user?.profile?.qualifications?.class12?.rollNo || '');
  const [class12Board, setClass12Board] = useState(user?.profile?.qualifications?.class12?.board || '');
  const [class12School, setClass12School] = useState(user?.profile?.qualifications?.class12?.school || '');
  const [class12Marks, setClass12Marks] = useState(user?.profile?.qualifications?.class12?.marksObtained || '');
  const [class12Total, setClass12Total] = useState(user?.profile?.qualifications?.class12?.totalMarks || '');
  const [class12Percentage, setClass12Percentage] = useState(user?.profile?.qualifications?.class12?.percentage || '');

  // Graduation
  const [gradRoll, setGradRoll] = useState(user?.profile?.qualifications?.graduation?.rollNo || '');
  const [gradDegree, setGradDegree] = useState(user?.profile?.qualifications?.graduation?.degree || '');
  const [gradCollege, setGradCollege] = useState(user?.profile?.qualifications?.graduation?.college || '');
  const [gradUniversity, setGradUniversity] = useState(user?.profile?.qualifications?.graduation?.university || '');
  const [gradMarks, setGradMarks] = useState(user?.profile?.qualifications?.graduation?.marksObtained || '');
  const [gradTotal, setGradTotal] = useState(user?.profile?.qualifications?.graduation?.totalMarks || '');
  const [gradPercentage, setGradPercentage] = useState(user?.profile?.qualifications?.graduation?.percentage || '');

  // Post Graduation
  const [pgRoll, setPgRoll] = useState(user?.profile?.qualifications?.postGraduation?.rollNo || '');
  const [pgDegree, setPgDegree] = useState(user?.profile?.qualifications?.postGraduation?.degree || '');
  const [pgCollege, setPgCollege] = useState(user?.profile?.qualifications?.postGraduation?.college || '');
  const [pgUniversity, setPgUniversity] = useState(user?.profile?.qualifications?.postGraduation?.university || '');
  const [pgMarks, setPgMarks] = useState(user?.profile?.qualifications?.postGraduation?.marksObtained || '');
  const [pgTotal, setPgTotal] = useState(user?.profile?.qualifications?.postGraduation?.totalMarks || '');
  const [pgPercentage, setPgPercentage] = useState(user?.profile?.qualifications?.postGraduation?.percentage || '');

  // NET JRF
  const [netJrfQualified, setNetJrfQualified] = useState(user?.profile?.qualifications?.netJrf?.qualified ? 'YES' : 'NO');
  const [netJrfCertNumber, setNetJrfCertNumber] = useState(user?.profile?.qualifications?.netJrf?.certNumber || '');
  const [netJrfRoll, setNetJrfRoll] = useState(user?.profile?.qualifications?.netJrf?.rollNo || '');
  const [netJrfRank, setNetJrfRank] = useState(user?.profile?.qualifications?.netJrf?.rank || '');
  const [netJrfScore, setNetJrfScore] = useState(user?.profile?.qualifications?.netJrf?.score || '');
  const [netJrfIssueDate, setNetJrfIssueDate] = useState(user?.profile?.qualifications?.netJrf?.issueDate ? user.profile.qualifications.netJrf.issueDate.split('T')[0] : '');

  // Other Exam
  const [otherDetails, setOtherDetails] = useState(user?.profile?.qualifications?.other?.details || '');

  // Guide Selection
  const [preferredGuideId, setPreferredGuideId] = useState(user?.profile?.preferredGuideId || '');
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    if (user?.profile) {
      setDob(user.profile.dob ? user.profile.dob.split('T')[0] : '');
      setGender(user.profile.gender || '');
      setCategory(user.profile.category || '');
      setFatherName(user.profile.fatherName || '');
      setMotherName(user.profile.motherName || '');
      setNationality(user.profile.nationality || 'Indian');
      setAdmissionDate(user.profile.admissionDate ? user.profile.admissionDate.split('T')[0] : '');
      setEnrollmentNumber(user.profile.enrollmentNumber || '');
      setPhdMode(user.profile.phdMode || '');
      setSpecialization(user.profile.specialization || '');
      setPhoneNumber(user.profile.phoneNumber || '');
      setAddress(user.profile.address || '');
      setAreaOfInterest(user.profile.areaOfInterest || '');
      setAcademicBackground(user.profile.academicBackground || '');
      setPreferredGuideId(user.profile.preferredGuideId || '');

      // Class 10
      const q = user.profile.qualifications;
      setClass10Roll(q?.class10?.rollNo || '');
      setClass10Board(q?.class10?.board || '');
      setClass10School(q?.class10?.school || '');
      setClass10Marks(q?.class10?.marksObtained || '');
      setClass10Total(q?.class10?.totalMarks || '');
      setClass10Percentage(q?.class10?.percentage || '');

      // Class 12
      setClass12Roll(q?.class12?.rollNo || '');
      setClass12Board(q?.class12?.board || '');
      setClass12School(q?.class12?.school || '');
      setClass12Marks(q?.class12?.marksObtained || '');
      setClass12Total(q?.class12?.totalMarks || '');
      setClass12Percentage(q?.class12?.percentage || '');

      // Graduation
      setGradRoll(q?.graduation?.rollNo || '');
      setGradDegree(q?.graduation?.degree || '');
      setGradCollege(q?.graduation?.college || '');
      setGradUniversity(q?.graduation?.university || '');
      setGradMarks(q?.graduation?.marksObtained || '');
      setGradTotal(q?.graduation?.totalMarks || '');
      setGradPercentage(q?.graduation?.percentage || '');

      // Post Graduation
      setPgRoll(q?.postGraduation?.rollNo || '');
      setPgDegree(q?.postGraduation?.degree || '');
      setPgCollege(q?.postGraduation?.college || '');
      setPgUniversity(q?.postGraduation?.university || '');
      setPgMarks(q?.postGraduation?.marksObtained || '');
      setPgTotal(q?.postGraduation?.totalMarks || '');
      setPgPercentage(q?.postGraduation?.percentage || '');

      // NET JRF
      setNetJrfQualified(q?.netJrf?.qualified ? 'YES' : 'NO');
      setNetJrfCertNumber(q?.netJrf?.certNumber || '');
      setNetJrfRoll(q?.netJrf?.rollNo || '');
      setNetJrfRank(q?.netJrf?.rank || '');
      setNetJrfScore(q?.netJrf?.score || '');
      setNetJrfIssueDate(q?.netJrf?.issueDate ? q.netJrf.issueDate.split('T')[0] : '');

      // Other
      setOtherDetails(q?.other?.details || '');
    }
  }, [user]);

  useEffect(() => {
    axios.get(`${API_URL}/auth/faculty`, getAuthHeader())
      .then(res => {
        if (Array.isArray(res.data)) {
          // Only show faculties registered in scholar's department
          const deptFac = res.data.filter(f => f.department === user?.department);
          setFaculties(deptFac);
        }
      })
      .catch(err => console.error('Error fetching department faculty:', err));
  }, [user?.department]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    const res = await uploadAvatar(file);
    setAvatarLoading(false);
    if (res.success) {
      toast.success('Profile picture updated successfully!');
    } else {
      toast.error('Failed to upload profile picture: ' + res.message);
    }
  };

  const handleDocUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFileNames(prev => ({ ...prev, [docType]: file.name }));
    setUploadingDoc(docType);
    const res = await uploadProfileDocument(file, docType);
    setUploadingDoc('');
    if (res.success) {
      toast.success(`${docType.replace(/([A-Z])/g, ' $1').toUpperCase()} Certificate uploaded successfully!`);
    } else {
      toast.error(`Upload failed: ${res.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanedPhone = phoneNumber.trim().replace(/[\s\-()]/g, '');
    const indianPhoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(cleanedPhone)) {
      toast.error('Please enter a valid 10-digit Indian phone number (starts with 6-9).');
      setLoading(false);
      return;
    }

    const payload = {
      dob,
      gender,
      category,
      fatherName,
      motherName,
      nationality,
      admissionDate,
      enrollmentNumber,
      phdMode,
      specialization,
      phoneNumber,
      address,
      areaOfInterest,
      academicBackground,
      preferredGuideId,
      qualifications: {
        class10: {
          rollNo: class10Roll,
          board: class10Board,
          school: class10School,
          marksObtained: class10Marks,
          totalMarks: class10Total,
          percentage: class10Percentage,
          certificateUrl: user?.profile?.qualifications?.class10?.certificateUrl
        },
        class12: {
          rollNo: class12Roll,
          board: class12Board,
          school: class12School,
          marksObtained: class12Marks,
          totalMarks: class12Total,
          percentage: class12Percentage,
          certificateUrl: user?.profile?.qualifications?.class12?.certificateUrl
        },
        graduation: {
          rollNo: gradRoll,
          degree: gradDegree,
          college: gradCollege,
          university: gradUniversity,
          marksObtained: gradMarks,
          totalMarks: gradTotal,
          percentage: gradPercentage,
          certificateUrl: user?.profile?.qualifications?.graduation?.certificateUrl
        },
        postGraduation: {
          rollNo: pgRoll,
          degree: pgDegree,
          college: pgCollege,
          university: pgUniversity,
          marksObtained: pgMarks,
          totalMarks: pgTotal,
          percentage: pgPercentage,
          certificateUrl: user?.profile?.qualifications?.postGraduation?.certificateUrl
        },
        netJrf: {
          qualified: netJrfQualified === 'YES',
          certNumber: netJrfCertNumber,
          rollNo: netJrfRoll,
          rank: netJrfRank,
          score: netJrfScore,
          issueDate: netJrfIssueDate,
          certificateUrl: user?.profile?.qualifications?.netJrf?.certificateUrl
        },
        other: {
          details: otherDetails,
          certificateUrl: user?.profile?.qualifications?.other?.certificateUrl
        }
      }
    };

    const res = await updateProfile(payload);
    setLoading(false);
    if (res.success) {
      let msg = 'PhD Scholar profile details updated successfully!';
      if (subTab === 'general') msg = 'General Information saved successfully!';
      else if (subTab === 'academic') msg = 'Academic details saved successfully!';
      else if (subTab === 'guide') msg = 'Preferred guide details saved successfully!';
      toast.success(msg);
    } else {
      toast.error('Failed to update profile: ' + res.message);
    }
  };

  const saveSection = async (sectionKey) => {
    setLoading(true);
    let sectionData = {};
    
    if (sectionKey === 'class10') {
      sectionData = {
        rollNo: class10Roll,
        board: class10Board,
        school: class10School,
        marksObtained: class10Marks,
        totalMarks: class10Total,
        percentage: class10Percentage,
        certificateUrl: user?.profile?.qualifications?.class10?.certificateUrl
      };
    } else if (sectionKey === 'class12') {
      sectionData = {
        rollNo: class12Roll,
        board: class12Board,
        school: class12School,
        marksObtained: class12Marks,
        totalMarks: class12Total,
        percentage: class12Percentage,
        certificateUrl: user?.profile?.qualifications?.class12?.certificateUrl
      };
    } else if (sectionKey === 'graduation') {
      sectionData = {
        rollNo: gradRoll,
        degree: gradDegree,
        college: gradCollege,
        university: gradUniversity,
        marksObtained: gradMarks,
        totalMarks: gradTotal,
        percentage: gradPercentage,
        certificateUrl: user?.profile?.qualifications?.graduation?.certificateUrl
      };
    } else if (sectionKey === 'postGraduation') {
      sectionData = {
        rollNo: pgRoll,
        degree: pgDegree,
        college: pgCollege,
        university: pgUniversity,
        marksObtained: pgMarks,
        totalMarks: pgTotal,
        percentage: pgPercentage,
        certificateUrl: user?.profile?.qualifications?.postGraduation?.certificateUrl
      };
    } else if (sectionKey === 'netJrf') {
      sectionData = {
        qualified: netJrfQualified === 'YES',
        certNumber: netJrfCertNumber,
        rollNo: netJrfRoll,
        rank: netJrfRank,
        score: netJrfScore,
        issueDate: netJrfIssueDate,
        certificateUrl: user?.profile?.qualifications?.netJrf?.certificateUrl
      };
    } else if (sectionKey === 'other') {
      sectionData = {
        details: otherDetails,
        certificateUrl: user?.profile?.qualifications?.other?.certificateUrl
      };
    }

    const payload = {
      ...user?.profile,
      qualifications: {
        ...user?.profile?.qualifications,
        [sectionKey]: sectionData
      }
    };

    const res = await updateProfile(payload);
    setLoading(false);
    if (res.success) {
      const prettyName = sectionKey === 'netJrf' ? 'NET JRF' : sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      toast.success(`${prettyName} details saved successfully!`);
    } else {
      toast.error(`Failed to save details: ${res.message}`);
    }
  };

  const getDocBadge = (docType, certUrl) => {
    if (uploadingDoc === docType) {
      return <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', fontWeight: 600 }}>Uploading...</span>;
    }
    if (certUrl) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', background: '#D1FAE5', color: '#059669', fontWeight: 600 }}>✓ Uploaded</span>
          <a 
            href={`${API_BASE_URL}${certUrl}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              fontSize: '0.75rem', 
              color: '#2563EB', 
              fontWeight: 600, 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px',
              background: '#EFF6FF',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #BFDBFE'
            }}
          >
            <FileText size={12} /> View File
          </a>
        </div>
      );
    }
    return <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', background: '#F3F4F6', color: '#6B7280', fontWeight: 600 }}>Pending Upload</span>;
  };

  const getUploadButton = (docType, certUrl) => {
    const isUploaded = !!certUrl;
    const currentSelectedName = selectedFileNames[docType];
    let displayFileName = '';
    if (currentSelectedName) {
      displayFileName = currentSelectedName;
    } else if (certUrl) {
      const parts = certUrl.split('/');
      displayFileName = parts[parts.length - 1];
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '6px', 
          background: isUploaded ? '#D97706' : '#4B5563', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: '6px', 
          fontSize: '0.75rem', 
          fontWeight: 600, 
          cursor: 'pointer', 
          display: 'block', 
          textAlign: 'center',
          transition: 'all 0.2s',
          boxShadow: isUploaded ? '0 2px 4px rgba(217, 119, 6, 0.2)' : 'none'
        }}>
          {isUploaded ? '🔄 Reupload Certificate (PDF)' : '📤 Upload Certificate (PDF)'}
          <input type="file" accept=".pdf,image/*" onChange={e => handleDocUpload(e, docType)} style={{ display: 'none' }} />
        </label>
        {displayFileName && (
          <div style={{ fontSize: '0.7rem', color: '#4B5563', fontStyle: 'italic', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>📄 File:</span>
            <span style={{ fontWeight: 600 }}>{displayFileName}</span>
          </div>
        )}
      </div>
    );
  };

  const handleProfileRegistrationSubmit = async () => {
    // 1. General & ERP Details check
    if (
      !dob || !gender || !category || !fatherName || !motherName || !nationality || 
      !admissionDate || !enrollmentNumber || !phdMode || !specialization || 
      !phoneNumber || !address || !areaOfInterest
    ) {
      toast.error('please fill in all the details before submitting the form.');
      return;
    }

    // 2. Qualifications check (Class 10, 12, Graduation, Post-Graduation details and certificates)
    const q = user?.profile?.qualifications;
    if (
      !class10Roll || !class10Board || !class10School || !class10Marks || !class10Total || !class10Percentage || !q?.class10?.certificateUrl ||
      !class12Roll || !class12Board || !class12School || !class12Marks || !class12Total || !class12Percentage || !q?.class12?.certificateUrl ||
      !gradRoll || !gradDegree || !gradCollege || !gradUniversity || !gradMarks || !gradTotal || !gradPercentage || !q?.graduation?.certificateUrl ||
      !pgRoll || !pgDegree || !pgCollege || !pgUniversity || !pgMarks || !pgTotal || !pgPercentage || !q?.postGraduation?.certificateUrl
    ) {
      toast.error('please fill in all the details before submitting the form.');
      return;
    }

    // 3. NET JRF details & certificate check if qualified
    if (netJrfQualified === 'YES') {
      if (!netJrfCertNumber || !netJrfRoll || !netJrfRank || !netJrfScore || !netJrfIssueDate || !q?.netJrf?.certificateUrl) {
        toast.error('please fill in all the details before submitting the form.');
        return;
      }
    }

    // 4. Preferred Guide preference check
    if (!preferredGuideId) {
      toast.error('please fill in all the details before submitting the form.');
      return;
    }

    try {
      setRegistering(true);
      await createThesis({});
      await fetchMyThesis();
      toast.success('Your PhD Profile Dossier has been successfully submitted to the HOD for verification and supervisor assignment!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit registration.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 850, margin: '0 auto', padding: '24px' }}>
      {/* Dynamic Profile Registration Status Banner */}
      {!thesis ? (
        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderLeft: '4px solid #3B82F6',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.85rem',
          color: '#1E3A8A',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>ℹ️ Ph.D. Profile Verification Pending Submission</div>
          <div>Please fill out your complete profile information: <strong>General Info</strong>, <strong>Qualifications (with certificates)</strong>, and <strong>Preferred Guide Selection</strong>. Once completed, click the green <strong>🚀 Submit PhD Profile for HOD Registration Approval</strong> button at the very bottom!</div>
        </div>
      ) : thesis.status === 'REGISTRATION_PENDING' ? (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderLeft: '4px solid #D97706',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.85rem',
          color: '#78350F',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>⏳ Ph.D. Profile Submitted & Awaiting Approval</div>
          <div>Your academic dossier has been forwarded to the HOD of {thesis.department} for verification and supervisor assignment. You will be notified once verified!</div>
        </div>
      ) : (
        <div style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderLeft: '4px solid #059669',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.85rem',
          color: '#065F46',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>✅ Ph.D. Profile Registration Verified & Approved</div>
          <div>Your academic background, certificates, and enrollment parameters are officially approved and locked. Your supervisor assignment is complete!</div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
        {user?.avatarUrl ? (
          <img 
            src={`${API_BASE_URL}${user.avatarUrl}`} 
            alt="Avatar Preview" 
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #133A26', background: '#F8FAFC' }} 
          />
        ) : (
          <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e2e8f0', display: 'block', border: '3px solid #133A26' }}>
            <circle cx="50" cy="35" r="20" fill="#133A26" />
            <path d="M15 85c0-13.8 11.2-25 25-25h20c13.8 0 25 11.2 25 25z" fill="#133A26" />
          </svg>
        )}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>{user?.name}</h2>
          <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '4px 0 12px' }}>Ph.D. Scholar • {user?.department}</p>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#133A26', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            {avatarLoading ? 'Uploading...' : '📷 Change Profile Picture'}
            <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} disabled={avatarLoading} />
          </label>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #F3F4F6', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setSubTab('general')}
          style={{ 
            padding: '10px 16px', 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            background: 'none', 
            border: 'none', 
            borderBottom: subTab === 'general' ? '3px solid #133A26' : '3px solid transparent', 
            color: subTab === 'general' ? '#133A26' : '#6B7280', 
            cursor: 'pointer', 
            transition: 'all 0.2s' 
          }}
        >
          👤 General Information
        </button>
        <button 
          onClick={() => setSubTab('academic')}
          style={{ 
            padding: '10px 16px', 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            background: 'none', 
            border: 'none', 
            borderBottom: subTab === 'academic' ? '3px solid #133A26' : '3px solid transparent', 
            color: subTab === 'academic' ? '#133A26' : '#6B7280', 
            cursor: 'pointer', 
            transition: 'all 0.2s' 
          }}
        >
          🎓 Academic Qualifications
        </button>
        <button 
          onClick={() => setSubTab('guide')}
          style={{ 
            padding: '10px 16px', 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            background: 'none', 
            border: 'none', 
            borderBottom: subTab === 'guide' ? '3px solid #133A26' : '3px solid transparent', 
            color: subTab === 'guide' ? '#133A26' : '#6B7280', 
            cursor: 'pointer', 
            transition: 'all 0.2s' 
          }}
        >
          🤝 Preferred Guide Preference
        </button>
      </div>

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* --- Tab 1: General Information --- */}
        {subTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#133A26', margin: '0 0 8px 0' }}>Personal & Institutional ERP Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Full Name</label>
                <input type="text" className="form-input" value={user?.name} disabled style={{ background: '#F1F5F9', color: '#64748B' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>University Email (ID)</label>
                <input type="text" className="form-input" value={user?.username} disabled style={{ background: '#F1F5F9', color: '#64748B' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Date of Birth <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="date" className="form-input" value={dob} onChange={e => setDob(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>University Enrollment Number <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="text" className="form-input" placeholder="Enter enrollment number" value={enrollmentNumber} onChange={e => setEnrollmentNumber(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Gender <span style={{ color: '#EF4444' }}>*</span></label>
                <select className="form-input" value={gender} onChange={e => setGender(e.target.value)} required>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Social Category <span style={{ color: '#EF4444' }}>*</span></label>
                <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="">Select Category...</option>
                  <option value="General">General / Unreserved</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Father's Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="text" className="form-input" placeholder="Father's full name" value={fatherName} onChange={e => setFatherName(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Mother's Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="text" className="form-input" placeholder="Mother's full name" value={motherName} onChange={e => setMotherName(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Nationality <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="text" className="form-input" placeholder="e.g. Indian" value={nationality} onChange={e => setNationality(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Date of Admission <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="date" className="form-input" value={admissionDate} onChange={e => setAdmissionDate(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Mode of Ph.D. <span style={{ color: '#EF4444' }}>*</span></label>
                <select className="form-input" value={phdMode} onChange={e => setPhdMode(e.target.value)} required>
                  <option value="">Select Mode...</option>
                  <option value="Full-time">Full-time Regular</option>
                  <option value="Part-time">Part-time / Sponsored</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Area of Specialization <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="text" className="form-input" placeholder="e.g. Machine Learning, Structural Bio" value={specialization} onChange={e => setSpecialization(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Area of Research Interest <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="text" className="form-input" placeholder="Specific research title domain" value={areaOfInterest} onChange={e => setAreaOfInterest(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Phone Number (Indian Format) <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="text" className="form-input" placeholder="Enter 10-digit mobile number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Full Residential Address <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="text" className="form-input" placeholder="Street, City, State, ZIP" value={address} onChange={e => setAddress(e.target.value)} required />
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 2: Academic Qualifications --- */}
        {subTab === 'academic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Class 10 Card */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', background: '#F9FAFB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#133A26', margin: 0 }}>Class 10 (Secondary) Details</h4>
                {getDocBadge('class10', user?.profile?.qualifications?.class10?.certificateUrl)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Roll Number</label>
                  <input type="text" className="form-input" placeholder="Roll No" value={class10Roll} onChange={e => setClass10Roll(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Board of Examination</label>
                  <input type="text" className="form-input" placeholder="e.g. CBSE, ICSE" value={class10Board} onChange={e => setClass10Board(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>School Name</label>
                  <input type="text" className="form-input" placeholder="School Name" value={class10School} onChange={e => setClass10School(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Marks Obtained</label>
                  <input type="number" step="0.01" className="form-input" placeholder="Marks" value={class10Marks} onChange={e => setClass10Marks(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Total Marks</label>
                  <input type="number" step="0.01" className="form-input" placeholder="Total" value={class10Total} onChange={e => setClass10Total(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Percentage (%)</label>
                  <input type="text" className="form-input" placeholder="e.g. 92.5%" value={class10Percentage} onChange={e => setClass10Percentage(e.target.value)} />
                </div>
                <div>
                  {getUploadButton('class10', user?.profile?.qualifications?.class10?.certificateUrl)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  onClick={() => saveSection('class10')}
                  disabled={loading}
                  style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}
                >
                  💾 Save Class 10 Details
                </button>
              </div>
            </div>

            {/* Class 12 Card */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', background: '#F9FAFB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#133A26', margin: 0 }}>Class 12 (Higher Secondary) Details</h4>
                {getDocBadge('class12', user?.profile?.qualifications?.class12?.certificateUrl)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Roll Number</label>
                  <input type="text" className="form-input" placeholder="Roll No" value={class12Roll} onChange={e => setClass12Roll(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Board of Examination</label>
                  <input type="text" className="form-input" placeholder="e.g. CBSE, State Board" value={class12Board} onChange={e => setClass12Board(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>School/College Name</label>
                  <input type="text" className="form-input" placeholder="School/College Name" value={class12School} onChange={e => setClass12School(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Marks Obtained</label>
                  <input type="number" step="0.01" className="form-input" placeholder="Marks" value={class12Marks} onChange={e => setClass12Marks(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Total Marks</label>
                  <input type="number" step="0.01" className="form-input" placeholder="Total" value={class12Total} onChange={e => setClass12Total(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Percentage (%)</label>
                  <input type="text" className="form-input" placeholder="e.g. 88.2%" value={class12Percentage} onChange={e => setClass12Percentage(e.target.value)} />
                </div>
                <div>
                  {getUploadButton('class12', user?.profile?.qualifications?.class12?.certificateUrl)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  onClick={() => saveSection('class12')}
                  disabled={loading}
                  style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}
                >
                  💾 Save Class 12 Details
                </button>
              </div>
            </div>

            {/* Graduation Card */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', background: '#F9FAFB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#133A26', margin: 0 }}>Graduation Details</h4>
                {getDocBadge('graduation', user?.profile?.qualifications?.graduation?.certificateUrl)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Roll No / Enroll No</label>
                  <input type="text" className="form-input" placeholder="Roll No" value={gradRoll} onChange={e => setGradRoll(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Degree (e.g. B.Tech, B.Sc)</label>
                  <input type="text" className="form-input" placeholder="e.g. B.Tech CSE" value={gradDegree} onChange={e => setGradDegree(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>College Name</label>
                  <input type="text" className="form-input" placeholder="College Name" value={gradCollege} onChange={e => setGradCollege(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>University Name</label>
                  <input type="text" className="form-input" placeholder="University" value={gradUniversity} onChange={e => setGradUniversity(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>CGPA / Marks Obtained</label>
                  <input type="number" step="0.01" className="form-input" placeholder="Marks" value={gradMarks} onChange={e => setGradMarks(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Total Max Marks / Scale</label>
                  <input type="number" step="0.01" className="form-input" placeholder="Total scale" value={gradTotal} onChange={e => setGradTotal(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Percentage / CGPA (%)</label>
                  <input type="text" className="form-input" placeholder="e.g. 8.4 CGPA" value={gradPercentage} onChange={e => setGradPercentage(e.target.value)} />
                </div>
                <div>
                  {getUploadButton('graduation', user?.profile?.qualifications?.graduation?.certificateUrl)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  onClick={() => saveSection('graduation')}
                  disabled={loading}
                  style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}
                >
                  💾 Save Graduation Details
                </button>
              </div>
            </div>

            {/* Post Graduation Card */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', background: '#F9FAFB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#133A26', margin: 0 }}>Post-Graduation Details</h4>
                {getDocBadge('postGraduation', user?.profile?.qualifications?.postGraduation?.certificateUrl)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Roll No / Enroll No</label>
                  <input type="text" className="form-input" placeholder="Roll No" value={pgRoll} onChange={e => setPgRoll(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>PG Degree (e.g. M.Tech, M.Sc)</label>
                  <input type="text" className="form-input" placeholder="e.g. M.Tech CSE" value={pgDegree} onChange={e => setPgDegree(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>College Name</label>
                  <input type="text" className="form-input" placeholder="College Name" value={pgCollege} onChange={e => setPgCollege(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>University Name</label>
                  <input type="text" className="form-input" placeholder="University" value={pgUniversity} onChange={e => setPgUniversity(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>CGPA / Marks Obtained</label>
                  <input type="number" step="0.01" className="form-input" placeholder="Marks" value={pgMarks} onChange={e => setPgMarks(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Total Max Marks / Scale</label>
                  <input type="number" step="0.01" className="form-input" placeholder="Total scale" value={pgTotal} onChange={e => setPgTotal(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Percentage / CGPA (%)</label>
                  <input type="text" className="form-input" placeholder="e.g. 9.1 CGPA" value={pgPercentage} onChange={e => setPgPercentage(e.target.value)} />
                </div>
                <div>
                  {getUploadButton('postGraduation', user?.profile?.qualifications?.postGraduation?.certificateUrl)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  onClick={() => saveSection('postGraduation')}
                  disabled={loading}
                  style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}
                >
                  💾 Save Post-Graduation Details
                </button>
              </div>
            </div>

            {/* NET JRF Qualifications */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', background: '#F9FAFB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#133A26', margin: 0 }}>National Entrance Examinations (NET / JRF / GATE)</h4>
                {getDocBadge('netJrf', user?.profile?.qualifications?.netJrf?.certificateUrl)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Have you qualified NET JRF?</label>
                  <select className="form-input" value={netJrfQualified} onChange={e => setNetJrfQualified(e.target.value)}>
                    <option value="NO">No</option>
                    <option value="YES">Yes</option>
                  </select>
                </div>
                {netJrfQualified === 'YES' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Certification / Award Letter Number</label>
                      <input type="text" className="form-input" placeholder="Cert Number" value={netJrfCertNumber} onChange={e => setNetJrfCertNumber(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Roll Number / Reg Number</label>
                      <input type="text" className="form-input" placeholder="Roll No" value={netJrfRoll} onChange={e => setNetJrfRoll(e.target.value)} />
                    </div>
                  </>
                )}
              </div>
              {netJrfQualified === 'YES' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>All India Rank (AIR)</label>
                    <input type="text" className="form-input" placeholder="AIR Rank" value={netJrfRank} onChange={e => setNetJrfRank(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Normalized Score / Percentile</label>
                    <input type="text" className="form-input" placeholder="Score" value={netJrfScore} onChange={e => setNetJrfScore(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Date of Certificate Issue</label>
                    <input type="date" className="form-input" value={netJrfIssueDate} onChange={e => setNetJrfIssueDate(e.target.value)} />
                  </div>
                  <div>
                    {getUploadButton('netJrf', user?.profile?.qualifications?.netJrf?.certificateUrl)}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  onClick={() => saveSection('netJrf')}
                  disabled={loading}
                  style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}
                >
                  💾 Save NET JRF Details
                </button>
              </div>
            </div>

            {/* Other Achievements Card */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', background: '#F9FAFB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#133A26', margin: 0 }}>Other Qualifications / Fellowships (DST INSPIRE, NFSC, RGNF, etc.)</h4>
                {getDocBadge('other', user?.profile?.qualifications?.other?.certificateUrl)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Academic/Fellowship Details</label>
                  <input type="text" className="form-input" placeholder="Describe fellowship/awards or additional exams cleared" value={otherDetails} onChange={e => setOtherDetails(e.target.value)} />
                </div>
                <div>
                  {getUploadButton('other', user?.profile?.qualifications?.other?.certificateUrl)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  onClick={() => saveSection('other')}
                  disabled={loading}
                  style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)', transition: 'all 0.2s' }}
                >
                  💾 Save Other Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 3: Preferred Guide Selection --- */}
        {subTab === 'guide' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#133A26', margin: '0 0 8px 0' }}>Advisor & Guide Preference of {user?.department}</h3>
            <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: '0 0 12px 0' }}>
              Please select your preferred guide for Ph.D. supervision from the list of registered faculty members in your department. 
              This selection acts as your institutional preference for thesis allotment.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Preferred supervisor / Guide</label>
              <select 
                className="form-input" 
                value={preferredGuideId} 
                onChange={e => setPreferredGuideId(e.target.value)}
              >
                <option value="">Select Preferred Guide...</option>
                {faculties.map(fac => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name} ({fac.subRole === 'HOD' ? 'HOD / ' : ''}Faculty)
                  </option>
                ))}
              </select>
            </div>

            {preferredGuideId && (
              <div style={{ padding: '16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', marginTop: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#065F46', fontWeight: 600 }}>
                  ✓ You have selected <strong>{faculties.find(f => f._id === preferredGuideId)?.name}</strong> as your preferred guide. 
                  This preference will be recorded and audited during your DRC enrollment clearance.
                </span>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
          <button 
            type="submit" 
            disabled={loading || (thesis && thesis.status !== 'REGISTRATION_PENDING')} 
            className="btn-primary" 
            style={{ flex: 1, background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? 'Saving Changes...' : '💾 Save PhD Profile Details'}
          </button>

          {!thesis && (
            <button 
              type="button"
              disabled={registering}
              onClick={handleProfileRegistrationSubmit}
              className="btn-primary" 
              style={{ flex: 1.2, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
            >
              {registering ? 'Submitting...' : '🚀 Submit PhD Profile for HOD Approval'}
            </button>
          )}

          {thesis && thesis.status === 'REGISTRATION_PENDING' && (
            <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', color: '#D97706', fontSize: '0.85rem', fontWeight: 700, padding: '10px 16px' }}>
              ⏳ Awaiting HOD Verification & Supervisor
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

// ── Main Dashboard ──
const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useContext(AuthContext);
  const { thesis, milestones, loading, fetchMyThesis, submitMilestone } = useContext(ThesisContext);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(user && !user.profileCompleted);

  useEffect(() => { 
    fetchMyThesis(); 
  }, []);

  useEffect(() => {
    if (thesis && thesis.status !== 'REGISTRATION_PENDING') {
      setActiveTab('overview');
    }
  }, [thesis]);

  const titles = { 
    overview: 'Student Dashboard', 
    thesis: 'My Thesis', 
    rac: 'RAC Progress', 
    publications: 'Publications', 
    sixMonthReports: '6-Month Progress Reports',
    chapterDrafts: 'Chapter Drafts Workspace',
    researchOutputs: 'Research Outputs Vault',
    changes: 'Request Changes', 
    certificates: 'Certificates', 
    milestones: 'Milestones', 
    documents: 'Documents', 
    meetings: 'Meetings', 
    profile: 'Profile' 
  };

  const renderStatusContent = () => {
    if (loading) return <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading...</div>;

    if (!thesis) {
      if (activeTab === 'profile') return <ProfileTab />;
      return (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: 48 }}>
          <ClipboardList size={64} color="#9CA3AF" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>Ph.D. Profile Dossier Required</h3>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Please complete all required details in the **Profile** tab and click **Submit PhD Profile for HOD Approval** to register and unlock the student portal features.</p>
          <button className="btn-primary" onClick={() => setActiveTab('profile')}>Go to Profile Tab</button>
        </div>
      );
    }

    if (thesis.status === 'REGISTRATION_PENDING') {
      if (activeTab === 'profile') return <ProfileTab />;
      return <WaitingRoom thesis={thesis} />;
    }

    switch (activeTab) {
      case 'overview': return <OverviewPage thesis={thesis} milestones={milestones} setActiveTab={setActiveTab} user={user} />;
      case 'rac': return <RACProgressTab thesis={thesis} />;
      case 'publications': return <PublicationsTab thesis={thesis} />;
      case 'sixMonthReports': return <SixMonthReportsTab thesis={thesis} milestones={milestones} onSubmit={submitMilestone} />;
      case 'chapterDrafts': return <ChapterDraftsTab thesis={thesis} milestones={milestones} onSubmit={submitMilestone} />;
      case 'researchOutputs': return <ResearchOutputsTab thesis={thesis} />;
      case 'changes': return <RequestChangesTab thesis={thesis} />;
      case 'certificates': return <CertificatesTab thesis={thesis} />;
      case 'milestones':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <MilestoneTimeline thesis={thesis} milestones={milestones} />
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isVerified={thesis && thesis.status !== 'REGISTRATION_PENDING'} />
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
