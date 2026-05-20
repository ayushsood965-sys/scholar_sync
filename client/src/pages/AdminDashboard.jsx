import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, FileText, User, LogOut, Bell,
  Users, Settings, BarChart2, CheckCircle2,
  GraduationCap, Clock, ShieldCheck
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

/* ─────────── Sidebar ─────────── */
const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { key: 'overview',  label: 'System Overview', Icon: Home },
    { key: 'scholars',  label: 'Manage Scholars',  Icon: GraduationCap },
    { key: 'faculty',   label: 'Manage Faculty',   Icon: Users },
    { key: 'reports',   label: 'Reports',          Icon: BarChart2 },
    { key: 'settings',  label: 'System Settings',  Icon: Settings },
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
          <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" alt="Admin" className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{user?.name || 'Admin'}</span>
            <span className="user-dept">ADMIN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────── Overview Page ─────────── */
const OverviewPage = () => {
  const stats = [
    { label: 'Total Scholars', value: '128', icon: GraduationCap, color: '#10B981' },
    { label: 'Active Faculty',  value: '32',  icon: Users,         color: '#3B82F6' },
    { label: 'Pending Registrations', value: '7', icon: Clock,    color: '#F59E0B' },
    { label: 'Approved Theses', value: '18', icon: ShieldCheck,   color: '#8B5CF6' },
  ];

  const recentActivity = [
    { user: 'Alice Smith (Student)',   action: 'Submitted thesis registration',           time: '1 hour ago' },
    { user: 'Dr. Faculty (Supervisor)', action: 'Approved Chapter 3 for Bob Johnson',    time: '3 hours ago' },
    { user: 'Bob Johnson (Student)',   action: 'Uploaded revised synopsis document',      time: '5 hours ago' },
    { user: 'Carol White (Student)',   action: 'Milestone: Pre-defense seminar completed', time: '1 day ago' },
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
        <h3 className="card-title">Recent System Activity</h3>
        <div className="task-list">
          {recentActivity.map((item, i) => (
            <div key={i} className="task-item">
              <div className="task-info" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <span className="task-name" style={{ fontWeight: 'bold' }}>{item.user}</span>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.action}</span>
              </div>
              <span className="task-date">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────── Manage Scholars Page ─────────── */
const ManageScholars = () => {
  const [scholars, setScholars] = useState([
    { id: 1, name: 'Alice Smith', dept: 'CS', topic: 'AI in Healthcare', status: 'PENDING', supervisor: '' },
    { id: 2, name: 'Bob Johnson', dept: 'Physics', topic: 'Quantum Entanglement', status: 'PENDING', supervisor: '' },
    { id: 3, name: 'Carol White', dept: 'Math', topic: 'Graph Theory', status: 'ACTIVE', supervisor: 'Dr. Alan Turing' },
  ]);

  const [assignments, setAssignments] = useState({});

  const handleAssign = (id) => {
    const sup = assignments[id];
    if (!sup) return;
    setScholars(prev => prev.map(s => s.id === id ? { ...s, status: 'ACTIVE', supervisor: sup } : s));
  };

  const statusColor = { PENDING: '#D97706', ACTIVE: '#059669' };
  const statusBg = { PENDING: '#FEF3C7', ACTIVE: '#D1FAE5' };

  return (
    <div className="card documents-card">
      <h3 className="card-title">Scholar Management</h3>
      <div className="file-list">
        <div className="file-header">
          <div style={{ flex: 1.5 }}>Scholar</div>
          <div style={{ flex: 1 }}>Dept</div>
          <div style={{ flex: 2 }}>Research Topic</div>
          <div style={{ flex: 1.5 }}>Assigned Supervisor</div>
          <div style={{ flex: 1.5 }}>Assign / Status</div>
        </div>
        {scholars.map(s => (
          <div key={s.id} className="file-item" style={{ alignItems: 'center' }}>
            <div className="file-name" style={{ flex: 1.5 }}>{s.name}</div>
            <div className="file-date" style={{ flex: 1 }}>{s.dept}</div>
            <div style={{ flex: 2, fontSize: '0.85rem', color: '#374151' }}>{s.topic}</div>
            <div style={{ flex: 1.5, fontSize: '0.85rem', color: '#6b7280' }}>{s.supervisor || '—'}</div>
            <div style={{ flex: 1.5, display: 'flex', gap: '6px', alignItems: 'center' }}>
              {s.status === 'PENDING' ? (
                <>
                  <select
                    className="form-input"
                    style={{ padding: '4px 6px', height: 'auto', fontSize: '0.8rem', flex: 1 }}
                    value={assignments[s.id] || ''}
                    onChange={e => setAssignments(prev => ({ ...prev, [s.id]: e.target.value }))}
                  >
                    <option value="">Select...</option>
                    <option>Dr. Alan Turing</option>
                    <option>Dr. Marie Curie</option>
                    <option>Dr. Faculty</option>
                  </select>
                  <button onClick={() => handleAssign(s.id)} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Assign</button>
                </>
              ) : (
                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', background: statusBg[s.status], color: statusColor[s.status], fontWeight: '600' }}>
                  {s.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── Manage Faculty Page ─────────── */
const ManageFaculty = () => {
  const faculty = [
    { name: 'Dr. Alan Turing', dept: 'CS', students: 4, email: 'turing@scholarsync.edu', status: 'ACTIVE' },
    { name: 'Dr. Marie Curie', dept: 'Physics', students: 3, email: 'curie@scholarsync.edu', status: 'ACTIVE' },
    { name: 'Dr. Faculty', dept: 'CS', students: 2, email: 'faculty@scholarsync.edu', status: 'ACTIVE' },
  ];

  return (
    <div className="card documents-card">
      <h3 className="card-title">Faculty Management</h3>
      <div className="file-list">
        <div className="file-header">
          <div style={{ flex: 2 }}>Name</div>
          <div style={{ flex: 1 }}>Department</div>
          <div style={{ flex: 2 }}>Email</div>
          <div style={{ flex: 1 }}>Students</div>
          <div style={{ flex: 1 }}>Status</div>
          <div style={{ flex: 1 }}>Action</div>
        </div>
        {faculty.map((f, i) => (
          <div key={i} className="file-item">
            <div className="file-name" style={{ flex: 2 }}>{f.name}</div>
            <div className="file-date" style={{ flex: 1 }}>{f.dept}</div>
            <div style={{ flex: 2, fontSize: '0.85rem', color: '#6b7280' }}>{f.email}</div>
            <div className="file-date" style={{ flex: 1 }}>{f.students}</div>
            <div style={{ flex: 1 }}>
              <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', background: '#D1FAE5', color: '#059669', fontWeight: '600' }}>ACTIVE</span>
            </div>
            <div className="file-actions" style={{ flex: 1 }}>
              <button className="btn-action">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── Reports Page ─────────── */
const Reports = () => {
  const reports = [
    { title: 'Monthly Scholar Progress Report', date: 'Oct 2024', type: 'PDF' },
    { title: 'Faculty Activity Summary', date: 'Oct 2024', type: 'PDF' },
    { title: 'Thesis Submission Statistics', date: 'Q3 2024', type: 'Excel' },
    { title: 'Annual Research Output', date: 'FY 2024', type: 'PDF' },
  ];

  return (
    <div className="card documents-card">
      <h3 className="card-title">System Reports</h3>
      <div className="file-list">
        <div className="file-header">
          <div style={{ flex: 3 }}>Report Name</div>
          <div style={{ flex: 1 }}>Period</div>
          <div style={{ flex: 1 }}>Format</div>
          <div style={{ flex: 1 }}>Action</div>
        </div>
        {reports.map((r, i) => (
          <div key={i} className="file-item">
            <div className="file-name" style={{ flex: 3 }}>{r.title}</div>
            <div className="file-date" style={{ flex: 1 }}>{r.date}</div>
            <div style={{ flex: 1 }}>
              <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', background: r.type === 'PDF' ? '#FEE2E2' : '#D1FAE5', color: r.type === 'PDF' ? '#DC2626' : '#059669' }}>
                {r.type}
              </span>
            </div>
            <div className="file-actions" style={{ flex: 1 }}>
              <button className="btn-action">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── Settings Page ─────────── */
const SystemSettings = () => (
  <div className="card" style={{ maxWidth: '600px' }}>
    <h3 className="card-title">System Settings</h3>
    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Institution Name</label>
        <input type="text" className="form-input" defaultValue="Himachal Pradesh University" />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Academic Year</label>
        <select className="form-input">
          <option>2024-2025</option>
          <option>2023-2024</option>
        </select>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Max Students per Supervisor</label>
        <input type="number" className="form-input" defaultValue="5" />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Default Thesis Duration (Years)</label>
        <input type="number" className="form-input" defaultValue="4" />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Save Settings</button>
        <button type="button" className="btn-outline" style={{ alignSelf: 'flex-start' }}>Reset Defaults</button>
      </div>
    </form>
  </div>
);

/* ─────────── Main Component ─────────── */
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useContext(AuthContext);

  const titles = {
    overview: 'Admin Dashboard',
    scholars: 'Manage Scholars',
    faculty:  'Manage Faculty',
    reports:  'Reports',
    settings: 'System Settings',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPage />;
      case 'scholars': return <ManageScholars />;
      case 'faculty':  return <ManageFaculty />;
      case 'reports':  return <Reports />;
      case 'settings': return <SystemSettings />;
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
              <span className="welcome-text">System Administration</span>
              <span className="welcome-subtext"> | {user?.name || 'Admin'}</span>
            </div>
            <div className="brand-text">ScholarSync Admin</div>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
