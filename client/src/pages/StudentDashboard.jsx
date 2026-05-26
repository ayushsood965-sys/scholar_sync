import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Book, Flag, FileText, Calendar, User, LogOut, Bell, ClipboardList, CheckCircle2, Clock, Upload, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ThesisContext } from '../context/ThesisContext';
import ProfileOnboardingModal from '../components/ProfileOnboardingModal';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const items = [
    { key: 'overview', label: 'Dashboard', Icon: Home },
    { key: 'registration', label: 'Registration', Icon: ClipboardList },
    { key: 'thesis', label: 'My Thesis', Icon: Book },
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
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" alt="Student" className="user-avatar" />
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
          borderColor: synopsisMilestone.status === 'PENDING' ? '#FDE68A' : synopsisMilestone.status === 'SUBMITTED' ? '#BFDBFE' : synopsisMilestone.status === 'A10B981' ? '#A7F3D0' : '#FCA5A5',
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
          <div style={{ background: '#F9FAFB', padding: 16, borderRadius: 8, color: '#374151' }}>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{thesis.abstract}</div>
            {synopsisMilestone.documentUrl && (
              <a href={`http://localhost:5000${synopsisMilestone.documentUrl}`} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: 12, color: '#0284C7', fontWeight: 600 }}>View Submitted Synopsis</a>
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
const OverviewPage = ({ thesis, milestones, setActiveTab }) => {
  const statusMap = {
    REGISTRATION_PENDING: { label: 'Awaiting Admin Verification', color: '#D97706', bg: '#FEF3C7', progress: 10 },
    COURSEWORK: { label: 'Coursework Phase', color: '#3B82F6', bg: '#DBEAFE', progress: 25 },
    SYNOPSIS_PENDING: { label: 'Synopsis Submission', color: '#8B5CF6', bg: '#EDE9FE', progress: 40 },
    ACTIVE_RESEARCH: { label: 'Active Research', color: '#059669', bg: '#D1FAE5', progress: 65 },
    PRE_SUBMISSION: { label: 'Pre-Submission', color: '#EA580C', bg: '#FED7AA', progress: 85 },
    SUBMITTED: { label: 'Under Evaluation', color: '#6B7280', bg: '#F3F4F6', progress: 95 },
    AWARDED: { label: 'Degree Awarded 🎓', color: '#059669', bg: '#D1FAE5', progress: 100 },
  };
  const s = statusMap[thesis.status] || statusMap['REGISTRATION_PENDING'];

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 className="card-title">Your Ph.D. Journey</h3>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: s.color }}>{s.label}</span>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{s.progress}%</span>
          </div>
          <div style={{ background: '#E5E7EB', borderRadius: 9999, height: 10 }}>
            <div style={{ background: s.color, width: `${s.progress}%`, height: 10, borderRadius: 9999, transition: 'width 0.5s' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[['Title', thesis.title],['Department', thesis.department],['Supervisor', thesis.supervisorId?.name || 'Pending']].map(([k, v]) => (
            <div key={k} style={{ background: '#F9FAFB', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{k}</div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {milestones.length > 0 && (
        <div className="card">
          <h3 className="card-title">Recent Milestones</h3>
          {milestones.slice(0, 3).map(m => (
            <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: '0.9rem' }}>{m.title}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: m.status === 'APPROVED' ? '#059669' : m.status === 'REVISION_REQUIRED' ? '#DC2626' : '#D97706' }}>{m.status}</span>
            </div>
          ))}
        </div>
      )}
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
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Phone Number</label>
          <input type="text" className="form-input" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
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

  const titles = { overview: 'Student Dashboard', registration: 'Thesis Registration', thesis: 'My Thesis', milestones: 'Milestones', documents: 'Documents', meetings: 'Meetings', profile: 'Profile' };

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
      case 'overview': return <OverviewPage thesis={thesis} milestones={milestones} setActiveTab={setActiveTab} />;
      case 'registration':
        return (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: '#059669' }}>
            <CheckCircle2 size={48} style={{ margin: '0 auto 12px' }} />
            <h3>Registration Verified & Approved</h3>
            <p style={{ color: '#6b7280', marginTop: 8 }}>Your Ph.D. registration is officially approved and locked.</p>
          </div>
        );
      case 'milestones':
        if (thesis.status === 'COURSEWORK') return <CourseworkPhase thesis={thesis} />;
        if (thesis.status === 'SYNOPSIS_PENDING') return <SynopsisPhase thesis={thesis} milestones={milestones} onSubmit={submitMilestone} />;
        if (thesis.status === 'ACTIVE_RESEARCH') return <ActiveResearch thesis={thesis} milestones={milestones} onSubmit={submitMilestone} />;
        if (thesis.status === 'PRE_SUBMISSION') return <PreSubmission thesis={thesis} milestones={milestones} onSubmit={submitMilestone} />;
        if (thesis.status === 'SUBMITTED' || thesis.status === 'AWARDED') return <SubmittedView thesis={thesis} />;
        return <div className="card" style={{ padding: 32, color: '#6b7280' }}>No milestones yet.</div>;
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
