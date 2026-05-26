import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, FileText, BarChart2, Settings, LogOut, Bell, CheckCircle2, User, GraduationCap, ShieldCheck, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThesisContext } from '../context/ThesisContext';
import axios from 'axios';
import ProfileOnboardingModal from '../components/ProfileOnboardingModal';

const API = 'http://localhost:5000/api';
const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });



const Header = ({ title }) => {
  const { user } = useContext(AuthContext);
  const { notifications } = useContext(NotificationContext);
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div className="header">
      <div className="header-title">{title}</div>
      <div className="header-actions">
        <div className="notification-bell"><Bell size={20} />{unread > 0 && <span className="notification-badge">{unread}</span>}</div>
        <div className="user-profile">
          <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" alt="Admin" className="user-avatar" />
          <div className="user-info"><span className="user-name">{user?.name || 'Admin'}</span><span className="user-dept">ADMIN</span></div>
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

// ── Scholar Detail Modal ──
const ScholarDetail = ({ thesisId, onClose, onAction }) => {
  const [data, setData] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [selSupervisor, setSelSupervisor] = useState('');
  const [auditNote, setAuditNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/thesis/${thesisId}`, getAuthHeader()).then(r => setData(r.data));
    axios.get(`${API}/auth/faculty`, getAuthHeader()).then(r => setFaculty(r.data)).catch(() => {});
  }, [thesisId]);

  const act = async (action, payload = {}) => {
    setLoading(true);
    try { await onAction(thesisId, action, payload); await axios.get(`${API}/thesis/${thesisId}`, getAuthHeader()).then(r => setData(r.data)); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
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
          {thesis.status === 'REGISTRATION_PENDING' && (
            <button className="btn-primary" onClick={() => act('verify')} disabled={loading} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>✓ Verify Enrollment → COURSEWORK</button>
          )}
          {(thesis.status === 'COURSEWORK' || thesis.status === 'REGISTRATION_PENDING') && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="form-input" style={{ padding: '5px 10px', height: 'auto' }} value={selSupervisor} onChange={e => setSelSupervisor(e.target.value)}>
                <option value="">Assign Supervisor...</option>
                {faculty.map(f => <option key={f._id} value={f._id}>{f.name} ({f.subRole})</option>)}
              </select>
              <button className="btn-primary" onClick={() => act('assign', { supervisorId: selSupervisor })} disabled={!selSupervisor || loading} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Assign</button>
            </div>
          )}
          {thesis.status === 'COURSEWORK' && (
            <button className="btn-primary" onClick={() => act('coursework')} disabled={loading} style={{ padding: '6px 16px', fontSize: '0.85rem', background: '#3B82F6' }}>✓ Clear Coursework → SYNOPSIS</button>
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
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Milestones</div>
            {milestones.map(m => (
              <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E5E7EB', fontSize: '0.9rem' }}>
                <span>{m.title}</span>
                <span style={{ fontWeight: 600, color: STATUS_COLOR[m.status] || '#374151' }}>{m.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Overview Page ──
const OverviewPage = ({ theses, onSelectThesis }) => {
  const counts = { total: theses.length, pending: theses.filter(t => t.status === 'REGISTRATION_PENDING').length, active: theses.filter(t => t.status === 'ACTIVE_RESEARCH').length, awarded: theses.filter(t => t.status === 'AWARDED').length };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[{ label: 'Total Scholars', value: counts.total, color: '#3B82F6', Icon: GraduationCap },
          { label: 'Pending Verification', value: counts.pending, color: '#D97706', Icon: Clock },
          { label: 'Active Research', value: counts.active, color: '#059669', Icon: CheckCircle2 },
          { label: 'Degrees Awarded', value: counts.awarded, color: '#8B5CF6', Icon: ShieldCheck }].map(({ label, value, color, Icon }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={24} color={color} />
            </div>
            <div><div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111827' }}>{value}</div><div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{label}</div></div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="card-title">Recent Submissions (Click any row to open & verify)</h3>
        <div className="file-list">
          <div className="file-header"><div style={{ flex: 2 }}>Scholar</div><div style={{ flex: 1.5 }}>Department</div><div style={{ flex: 2 }}>Title</div><div style={{ flex: 1.2 }}>Status</div></div>
          {theses.slice(0, 8).map(t => (
            <div key={t._id} className="file-item" style={{ cursor: 'pointer' }} onClick={() => onSelectThesis(t._id)}>
              <div className="file-name" style={{ flex: 2 }}>{t.scholarId?.name}</div>
              <div className="file-date" style={{ flex: 1.5 }}>{t.department}</div>
              <div style={{ flex: 2, fontSize: '0.85rem', color: '#374151' }}>{t.title?.substring(0, 40)}...</div>
              <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, background: STATUS_BG[t.status], color: STATUS_COLOR[t.status] }}>{t.status?.replace('_', ' ')}</span>
                {t.status === 'REGISTRATION_PENDING' && (
                  <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600 }}>Verify ➔</span>
                )}
              </div>
            </div>
          ))}
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
      alert(err.response?.data?.message || 'Failed to toggle account active status.');
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
            <div style={{ flex: 1 }}>Status</div>
            <div style={{ flex: 1 }}>Action</div>
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
                  background: u.isActive ? '#D1FAE5' : '#F3F4F6',
                  color: u.isActive ? '#065F46' : '#374151'
                }}>
                  {u.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <button 
                  onClick={() => handleToggleActive(u._id)}
                  style={{
                    background: u.isActive ? '#DC2626' : '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {u.isActive ? 'Disable ID' : 'Enable ID'}
                </button>
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

// ── Sidebar Overhaul for HOD ──
const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const items = [
    { key: 'overview', label: 'Department Overview', Icon: Home },
    { key: 'scholars', label: 'Manage Scholars', Icon: GraduationCap },
    { key: 'users', label: 'Manage Users', Icon: Users },
    { key: 'profile', label: 'My Profile', Icon: User },
    { key: 'evaluation', label: 'External Evaluation', Icon: FileText },
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

// ── Main ──
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedThesisId, setSelectedThesisId] = useState(null);
  const { allTheses, fetchAllTheses, verifyEnrollment, assignSupervisor, clearCoursework, awardDegree, updateAuditLog } = useContext(ThesisContext);
  const { user } = useContext(AuthContext);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(user && !user.profileCompleted);

  useEffect(() => { fetchAllTheses(); }, []);

  const handleAction = async (id, action, payload) => {
    if (action === 'verify') await verifyEnrollment(id);
    else if (action === 'assign') await assignSupervisor(id, payload.supervisorId);
    else if (action === 'coursework') await clearCoursework(id);
    else if (action === 'award') await awardDegree(id);
    else if (action === 'audit') await updateAuditLog(id, payload.action, payload.note);
    await fetchAllTheses();
  };

  const titles = { overview: 'Department Overview', scholars: 'Manage Scholars', users: 'Manage Users', profile: 'My Profile', evaluation: 'External Evaluation' };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPage theses={allTheses} onSelectThesis={setSelectedThesisId} />;
      case 'scholars': return <ManageScholars theses={allTheses} onSelectThesis={setSelectedThesisId} onAction={handleAction} />;
      case 'users': return <ManageUsers />;
      case 'profile': return <ProfileTab />;
      case 'evaluation': return <ExternalEvaluation theses={allTheses} onAuditLog={(id, action, note) => handleAction(id, 'audit', { action, note })} />;
      default: return <div className="card"><h3 className="card-title">{titles[activeTab]}</h3><p style={{ color: '#6b7280', marginTop: 8 }}>Content coming soon.</p></div>;
    }
  };

  return (
    <div className="app-container">
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
