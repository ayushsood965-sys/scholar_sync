import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, FileText, Users, Calendar, User, LogOut, Bell, CheckCircle2, XCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThesisContext } from '../context/ThesisContext';
import ProfileOnboardingModal from '../components/ProfileOnboardingModal';

const Sidebar = ({ activeTab, setActiveTab, subRole }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const supervisorItems = [
    { key: 'overview', label: 'Dashboard', Icon: Home },
    { key: 'scholars', label: 'My Scholars', Icon: Users },
    { key: 'reviews', label: 'Pending Reviews', Icon: FileText },
    { key: 'profile', label: 'Profile', Icon: User },
  ];
  const hodItems = [
    { key: 'overview', label: 'Dashboard', Icon: Home },
    { key: 'dept', label: 'Department Theses', Icon: Users },
    { key: 'drc', label: 'DRC Approvals', Icon: CheckCircle2 },
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
        {items.map(({ key, label, Icon }) => (
          <button key={key} className={`nav-item ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}
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

const Header = ({ title, user }) => {
  const { notifications } = useContext(NotificationContext);
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div className="header">
      <div className="header-title">{title}</div>
      <div className="header-actions">
        <div className="notification-bell"><Bell size={20} />{unread > 0 && <span className="notification-badge">{unread}</span>}</div>
        <div className="user-profile">
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" alt="Faculty" className="user-avatar" />
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
const ThesisReviewPanel = ({ thesis, milestones, onReview, onDRC, onSeminar, onFinalApprove, onClearCoursework, subRole, onClose }) => {
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(false);

  const act = async (fn) => { setLoading(true); try { await fn(); } catch (e) { alert(e.response?.data?.message || 'Error'); } finally { setLoading(false); } };

  const pendingMilestones = milestones.filter(m => m.status === 'SUBMITTED' || m.status === 'REVISION_REQUIRED');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 700, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{thesis.scholarId?.name} — {thesis.title?.substring(0, 50)}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

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
          {thesis.status === 'COURSEWORK' && (
            <button className="btn-primary" onClick={() => act(onClearCoursework)} disabled={loading} style={{ padding: '5px 14px', fontSize: '0.85rem', background: '#3B82F6' }}>✓ Clear Coursework & Unlock Synopsis Upload</button>
          )}
          {subRole === 'HOD' && thesis.status === 'SYNOPSIS_PENDING' && (() => {
            const synopsisMilestone = milestones.find(m => m.type === 'SYNOPSIS');
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 8 }}>
                {synopsisMilestone?.status !== 'APPROVED' ? (
                  <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', color: '#C53030', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                    ⚠️ Supervisor has not approved the Synopsis yet (Current Status: {synopsisMilestone?.status || 'PENDING'}). HOD DRC Approval is locked until supervisor approval is complete.
                  </div>
                ) : (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}>
                    ✅ Synopsis Approved by Supervisor! Ready for final DRC Clearance.
                  </div>
                )}
                <button className="btn-primary" onClick={() => act(onDRC)} disabled={synopsisMilestone?.status !== 'APPROVED' || loading} style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#059669', alignSelf: 'flex-start' }}>✓ DRC Approve → ACTIVE_RESEARCH</button>
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
const OverviewPage = ({ theses, user, onSelect }) => {
  const mine = theses.filter(t => t.status === 'ACTIVE_RESEARCH' || t.status === 'SYNOPSIS_PENDING' || t.status === 'PRE_SUBMISSION');
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[{ label: 'Total Assigned', value: theses.length, color: '#3B82F6' },
          { label: 'Active Research', value: theses.filter(t => t.status === 'ACTIVE_RESEARCH').length, color: '#059669' },
          { label: 'Pending Reviews', value: theses.filter(t => ['SYNOPSIS_PENDING','PRE_SUBMISSION'].includes(t.status)).length, color: '#D97706' }].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="card-title">Scholars Overview (Click any row to review & clear coursework)</h3>
        <div className="task-list">
          {theses.slice(0, 6).map(t => (
            <div key={t._id} className="task-item" style={{ cursor: 'pointer' }} onClick={() => onSelect(t._id)}>
              <div className="task-info" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="task-name">{t.scholarId?.name}</span>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{t.title?.substring(0, 50)}...</span>
              </div>
              {(() => {
                const badge = resolveDetailedStatus(t.status, t.synopsisStatus, t.finalSubStatus);
                return (
                  <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: badge.bg, color: badge.color }}>
                    {badge.text}
                  </span>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Profile Tab ──
const ProfileTab = () => {
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
  const [msg, setMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
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
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Phone Number</label>
          <input type="text" className="form-input" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
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
  const { user } = useContext(AuthContext);
  const { allTheses, loading, fetchAssignedTheses, fetchDeptTheses, fetchThesisById, reviewMilestone, drcApprove, seminarClear, finalApprove, clearCoursework } = useContext(ThesisContext);
  const [selectedThesisId, setSelectedThesisId] = useState(null);
  const [selectedThesisData, setSelectedThesisData] = useState(null);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(user && !user.profileCompleted);

  const subRole = user?.role === 'HOD' ? 'HOD' : user?.subRole;

  useEffect(() => {
    if (subRole === 'HOD') fetchDeptTheses();
    else fetchAssignedTheses();
  }, [subRole]);

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

  const titles = { overview: 'Faculty Dashboard', scholars: 'My Scholars', reviews: 'Pending Reviews', dept: 'Department Theses', drc: 'DRC & Seminar Approvals', profile: 'My Profile' };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPage theses={allTheses} user={user} onSelect={handleSelectThesis} />;
      case 'scholars': return <ScholarList theses={allTheses} onSelect={handleSelectThesis} title="My Assigned Scholars" />;
      case 'dept': return <ScholarList theses={allTheses} onSelect={handleSelectThesis} title="All Department Theses" />;
      case 'drc': return <DRCPage theses={allTheses} onSelect={handleSelectThesis} />;
      case 'reviews': return <ScholarList theses={allTheses.filter(t => ['SYNOPSIS_PENDING','ACTIVE_RESEARCH','PRE_SUBMISSION'].includes(t.status))} onSelect={handleSelectThesis} title="Scholars with Pending Documents" />;
      case 'profile': return <ProfileTab />;
      default: return <div className="card"><h3 className="card-title">{titles[activeTab]}</h3><p style={{ color: '#6b7280', marginTop: 8 }}>Content coming soon.</p></div>;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} subRole={subRole} />
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
          subRole={subRole}
          onClose={() => { setSelectedThesisId(null); setSelectedThesisData(null); }}
        />
      )}
      <ProfileOnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
};

export default FacultyDashboard;
