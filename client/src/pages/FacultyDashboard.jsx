import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Book, FileText, Calendar, User, LogOut, 
  Bell, CheckCircle2, XCircle, Clock, Users, CalendarDays,
  GraduationCap, BookOpen, MessageSquare
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

/* ─────────── Sidebar ─────────── */
const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { key: 'overview',  label: 'Dashboard',       Icon: Home },
    { key: 'reviews',   label: 'Pending Reviews',  Icon: FileText },
    { key: 'students',  label: 'My Students',      Icon: Users },
    { key: 'schedule',  label: 'Schedule',         Icon: Calendar },
    { key: 'profile',   label: 'Profile',          Icon: User },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A5D6A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
          </svg>
        </div>
        <h2>ScholarHub</h2>
      </div>
      <div className="sidebar-nav">
        {navItems.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`nav-item ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
          >
            <Icon className="nav-icon" /> {label}
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={handleLogout} style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', color: '#F87171' }}>
          <LogOut className="nav-icon" /> Logout
        </button>
      </div>
    </div>
  );
};

/* ─────────── Header ─────────── */
const Header = ({ title }) => {
  const { user } = useContext(AuthContext);
  const { notifications } = useContext(NotificationContext);
  const unreadCount = notifications.filter(n => !n.read).length;
  return (
    <div className="header">
      <div className="header-title">{title}</div>
      <div className="header-actions">
        <div className="notification-bell">
          <Bell size={20} />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </div>
        <div className="user-profile">
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" alt="Faculty" className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{user?.name || 'Dr. Faculty'}</span>
            <span className="user-dept">FACULTY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────── Overview Page ─────────── */
const OverviewPage = ({ user }) => {
  const stats = [
    { label: 'Assigned Students', value: '8', icon: GraduationCap, color: '#10B981' },
    { label: 'Pending Reviews', value: '3', icon: FileText, color: '#F59E0B' },
    { label: 'Approved Docs', value: '24', icon: CheckCircle2, color: '#3B82F6' },
    { label: 'Meetings This Week', value: '5', icon: Calendar, color: '#8B5CF6' },
  ];

  const recentActivity = [
    { student: 'Alice Smith', action: 'Submitted Chapter 3 for review', time: '2 hours ago', status: 'pending' },
    { student: 'Bob Johnson', action: 'Uploaded revised Synopsis', time: '1 day ago', status: 'pending' },
    { student: 'Carol White', action: 'Milestone: Pre-defense seminar approved', time: '3 days ago', status: 'approved' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={24} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111827' }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">Recent Student Activity</h3>
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex: 1.5 }}>Student</div>
            <div style={{ flex: 3 }}>Activity</div>
            <div style={{ flex: 1 }}>Time</div>
            <div style={{ flex: 0.8 }}>Status</div>
          </div>
          {recentActivity.map((item, i) => (
            <div key={i} className="file-item">
              <div className="file-name" style={{ flex: 1.5 }}>{item.student}</div>
              <div className="file-size" style={{ flex: 3 }}>{item.action}</div>
              <div className="file-date" style={{ flex: 1 }}>{item.time}</div>
              <div style={{ flex: 0.8 }}>
                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', background: item.status === 'pending' ? '#FEF3C7' : '#D1FAE5', color: item.status === 'pending' ? '#D97706' : '#059669', fontWeight: '600' }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────── Pending Reviews Page ─────────── */
const PendingReviews = () => {
  const [remarks, setRemarks] = useState({});
  const [statuses, setStatuses] = useState({});

  const submissions = [
    { id: 1, student: 'Alice Smith', document: 'Literature_Review_v2.pdf', type: 'Chapter Draft', date: 'Oct 26, 2024' },
    { id: 2, student: 'Bob Johnson', document: 'Methodology_Draft.docx', type: 'Synopsis', date: 'Oct 25, 2024' },
    { id: 3, student: 'David Lee', document: 'Research_Proposal_final.pdf', type: 'Proposal', date: 'Oct 24, 2024' },
  ];

  const handleAction = (id, action) => {
    setStatuses(prev => ({ ...prev, [id]: action }));
  };

  return (
    <div className="card documents-card">
      <h3 className="card-title">Pending Document Reviews</h3>
      <div className="file-list">
        <div className="file-header">
          <div style={{ flex: 1.5 }}>Student</div>
          <div style={{ flex: 2 }}>Document</div>
          <div style={{ flex: 1 }}>Type</div>
          <div style={{ flex: 1 }}>Date</div>
          <div style={{ flex: 2.5 }}>Review Action</div>
        </div>
        {submissions.map(sub => (
          <div key={sub.id} className="file-item" style={{ alignItems: 'flex-start', padding: '16px 0' }}>
            <div className="file-name" style={{ flex: 1.5 }}>{sub.student}</div>
            <div style={{ flex: 2, color: '#10B981', fontWeight: '500', fontSize: '0.9rem' }}>{sub.document}</div>
            <div className="file-date" style={{ flex: 1 }}>{sub.type}</div>
            <div className="file-date" style={{ flex: 1 }}>{sub.date}</div>
            <div style={{ flex: 2.5, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {statuses[sub.id] ? (
                <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', background: statuses[sub.id] === 'approved' ? '#D1FAE5' : '#FEE2E2', color: statuses[sub.id] === 'approved' ? '#059669' : '#DC2626', fontWeight: '600', display: 'inline-block' }}>
                  {statuses[sub.id] === 'approved' ? '✓ Approved' : '↩ Revision Requested'}
                </span>
              ) : (
                <>
                  <textarea
                    className="form-input"
                    placeholder="Add feedback / remarks..."
                    rows="2"
                    style={{ padding: '6px 8px', fontSize: '0.8rem', resize: 'vertical' }}
                    value={remarks[sub.id] || ''}
                    onChange={e => setRemarks(prev => ({ ...prev, [sub.id]: e.target.value }))}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleAction(sub.id, 'approved')} className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.8rem', flex: 1 }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => handleAction(sub.id, 'revision')} style={{ padding: '5px 12px', fontSize: '0.8rem', flex: 1, border: '1px solid #F87171', color: '#F87171', background: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      ↩ Request Revision
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── My Students Page ─────────── */
const MyStudents = () => {
  const students = [
    { name: 'Alice Smith', dept: 'CS', topic: 'AI in Healthcare', stage: 'Chapter 3', progress: 60, status: 'ON TRACK' },
    { name: 'Bob Johnson', dept: 'Physics', topic: 'Quantum Entanglement', stage: 'Synopsis', progress: 30, status: 'NEEDS REVIEW' },
    { name: 'Carol White', dept: 'Mathematics', topic: 'Graph Theory Applications', stage: 'Pre-defense', progress: 85, status: 'ON TRACK' },
    { name: 'David Lee', dept: 'CS', topic: 'Blockchain Security', stage: 'Proposal', progress: 15, status: 'NEW' },
  ];

  const statusColors = { 'ON TRACK': '#059669', 'NEEDS REVIEW': '#D97706', 'NEW': '#3B82F6' };
  const statusBg = { 'ON TRACK': '#D1FAE5', 'NEEDS REVIEW': '#FEF3C7', 'NEW': '#DBEAFE' };

  return (
    <div className="card documents-card">
      <h3 className="card-title">My Assigned Students</h3>
      <div className="file-list">
        <div className="file-header">
          <div style={{ flex: 1.5 }}>Name</div>
          <div style={{ flex: 1 }}>Department</div>
          <div style={{ flex: 2 }}>Research Topic</div>
          <div style={{ flex: 1 }}>Current Stage</div>
          <div style={{ flex: 1.5 }}>Progress</div>
          <div style={{ flex: 1 }}>Status</div>
        </div>
        {students.map((s, i) => (
          <div key={i} className="file-item">
            <div className="file-name" style={{ flex: 1.5 }}>{s.name}</div>
            <div className="file-date" style={{ flex: 1 }}>{s.dept}</div>
            <div style={{ flex: 2, fontSize: '0.85rem', color: '#374151' }}>{s.topic}</div>
            <div className="file-date" style={{ flex: 1 }}>{s.stage}</div>
            <div style={{ flex: 1.5 }}>
              <div style={{ background: '#E5E7EB', borderRadius: '9999px', height: '8px' }}>
                <div style={{ background: '#10B981', width: `${s.progress}%`, height: '8px', borderRadius: '9999px' }}></div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>{s.progress}%</div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', background: statusBg[s.status], color: statusColors[s.status], fontWeight: '600' }}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── Schedule Page ─────────── */
const Schedule = () => {
  const meetings = [
    { student: 'Alice Smith', type: 'Chapter Review', date: 'Nov 1, 2024', time: '10:00 AM', mode: 'In-Person' },
    { student: 'Bob Johnson', type: 'Synopsis Discussion', date: 'Nov 2, 2024', time: '2:00 PM', mode: 'Online' },
    { student: 'Carol White', type: 'Pre-defense Prep', date: 'Nov 4, 2024', time: '11:30 AM', mode: 'In-Person' },
    { student: 'David Lee', type: 'Initial Meeting', date: 'Nov 5, 2024', time: '3:00 PM', mode: 'Online' },
  ];

  return (
    <div className="card documents-card">
      <h3 className="card-title">Upcoming Meetings</h3>
      <div className="file-list">
        <div className="file-header">
          <div style={{ flex: 1.5 }}>Student</div>
          <div style={{ flex: 2 }}>Meeting Type</div>
          <div style={{ flex: 1 }}>Date</div>
          <div style={{ flex: 1 }}>Time</div>
          <div style={{ flex: 1 }}>Mode</div>
          <div style={{ flex: 1 }}>Action</div>
        </div>
        {meetings.map((m, i) => (
          <div key={i} className="file-item">
            <div className="file-name" style={{ flex: 1.5 }}>{m.student}</div>
            <div style={{ flex: 2, color: '#374151', fontSize: '0.85rem' }}>{m.type}</div>
            <div className="file-date" style={{ flex: 1 }}>{m.date}</div>
            <div className="file-date" style={{ flex: 1 }}>{m.time}</div>
            <div style={{ flex: 1 }}>
              <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', background: m.mode === 'Online' ? '#DBEAFE' : '#D1FAE5', color: m.mode === 'Online' ? '#1D4ED8' : '#059669' }}>
                {m.mode}
              </span>
            </div>
            <div className="file-actions" style={{ flex: 1 }}>
              <button className="btn-action">Join</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── Profile Page ─────────── */
const FacultyProfile = ({ user }) => (
  <div className="card" style={{ maxWidth: '600px' }}>
    <h3 className="card-title">My Profile</h3>
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" alt="Faculty" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user?.name || 'Dr. Faculty'}</div>
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Supervisor / Faculty</div>
      </div>
    </div>
    <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Full Name</label>
        <input type="text" className="form-input" defaultValue={user?.name || 'Dr. Faculty'} />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Email</label>
        <input type="email" className="form-input" defaultValue="faculty@scholarsync.edu" />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Department</label>
        <select className="form-input">
          <option>Computer Science</option>
          <option>Physics</option>
          <option>Mathematics</option>
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Research Interests</label>
        <textarea className="form-input" rows="3" defaultValue="Machine Learning, Data Science, Neural Networks"></textarea>
      </div>
      <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
    </form>
  </div>
);

/* ─────────── Main Component ─────────── */
const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useContext(AuthContext);

  const titles = {
    overview: 'Faculty Dashboard',
    reviews: 'Pending Reviews',
    students: 'My Students',
    schedule: 'Meeting Schedule',
    profile: 'My Profile',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPage user={user} />;
      case 'reviews':  return <PendingReviews />;
      case 'students': return <MyStudents />;
      case 'schedule': return <Schedule />;
      case 'profile':  return <FacultyProfile user={user} />;
      default: return null;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header title={titles[activeTab]} />
        <div className="dashboard-area">
          <div className="welcome-banner">
            <div>
              <span className="welcome-text">Welcome, {user?.name || 'Dr. Faculty'}!</span>
              <span className="welcome-subtext"> | Faculty Portal</span>
            </div>
            <div className="brand-text">ScholarSync</div>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
