import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Book, Flag, FileText, Calendar, User, LogOut, Bell, CloudUpload, PlusCircle, CalendarDays, CheckCircle2, ClipboardList } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const navItems = [
    { key: 'overview',      label: 'Dashboard',    Icon: Home },
    { key: 'registration',  label: 'Registration', Icon: ClipboardList },
    { key: 'thesis',        label: 'My Thesis',    Icon: Book },
    { key: 'milestones',    label: 'Milestones',   Icon: Flag },
    { key: 'documents',     label: 'Documents',    Icon: FileText },
    { key: 'meetings',      label: 'Meetings',     Icon: Calendar },
    { key: 'profile',       label: 'Profile',      Icon: User },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'8px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A5D6A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
          </svg>
        </div>
        <h2>ScholarHub</h2>
      </div>
      <div className="sidebar-nav">
        {navItems.map(({ key, label, Icon }) => (
          <button key={key} className={`nav-item ${activeTab===key?'active':''}`} onClick={() => setActiveTab(key)}
            style={{ background:'none', border:'none', width:'100%', cursor:'pointer', textAlign:'left' }}>
            <Icon className="nav-icon" /> {label}
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={() => { logout(); navigate('/'); }}
          style={{ background:'none', border:'none', width:'100%', cursor:'pointer', textAlign:'left', color:'#F87171' }}>
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
        <div className="notification-bell">
          <Bell size={20} />
          {unread > 0 && <span className="notification-badge">{unread}</span>}
        </div>
        <div className="user-profile">
          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" alt="Student" className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{user?.name || 'Student'}</span>
            <span className="user-dept">STUDENT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Overview ── */
const OverviewPage = ({ setActiveTab }) => {
  const steps = [
    { label: 'Admissions', status: 'completed' },
    { label: 'Coursework', status: 'completed' },
    { label: 'Proposal\nDefense', status: 'completed' },
    { label: 'Pre-PhD Def', status: 'completed' },
    { label: 'Dissertation\nWork', status: 'active', sublabel: '70%' },
    { label: 'Thesis\nSubmission', status: 'pending' },
    { label: 'Final\nDefense', status: 'pending' },
  ];
  const quickStats = [
    { label: 'Overall Progress', value: '68%', color: '#10B981' },
    { label: 'Docs Uploaded', value: '12', color: '#3B82F6' },
    { label: 'Pending Reviews', value: '2', color: '#F59E0B' },
    { label: 'Days to Deadline', value: '142', color: '#8B5CF6' },
  ];
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {quickStats.map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding:'20px', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', fontWeight:'bold', color }}>{value}</div>
            <div style={{ fontSize:'0.8rem', color:'#6b7280', marginTop:'4px' }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="card timeline-card">
        <h3 className="card-title">Ph.D. Journey Timeline</h3>
        <div className="timeline-container">
          <div className="timeline-track"></div>
          <div className="timeline-progress" style={{ width:'60%' }}></div>
          {steps.map((step, idx) => (
            <div key={idx} className="timeline-step">
              <div className={`step-indicator ${step.status}`}>
                {step.status==='completed' && <CheckCircle2 size={20} />}
              </div>
              <div className="step-label" style={{ whiteSpace:'pre-line' }}>{step.label}</div>
              {step.sublabel && <div className="step-sublabel">{step.sublabel}</div>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginTop:'16px' }}>
        <div className="card">
          <h3 className="card-title">Upcoming Deadlines</h3>
          <div className="task-list">
            {[{ name:'Chapter 6 Draft Due', date:'Apr 25' },{ name:'Meeting with Advisor', date:'Apr 18' },{ name:'Synopsis Revision', date:'May 2' }].map((t,i) => (
              <div key={i} className="task-item">
                <div className="task-info"><CalendarDays className="task-icon" size={18}/><span className="task-name">{t.name}</span></div>
                <span className="task-date">{t.date}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">Quick Actions</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {[['📝 Submit Registration','registration'],['📄 Upload Document','documents'],['📅 Schedule Meeting','meetings'],['🎯 View Milestones','milestones']].map(([label, tab]) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="btn-outline" style={{ textAlign:'left', padding:'10px 16px' }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Registration ── */
const RegistrationForm = () => {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div className="card" style={{ maxWidth:'600px', margin:'0 auto', textAlign:'center', padding:'40px' }}>
      <CheckCircle2 size={60} color="#10B981" style={{ margin:'0 auto 16px' }} />
      <h3 style={{ color:'#111827', fontSize:'1.4rem', marginBottom:'8px' }}>Registration Submitted!</h3>
      <p style={{ color:'#6b7280' }}>Your thesis registration is under review. The admin will assign a supervisor shortly.</p>
    </div>
  );
  return (
    <div className="card" style={{ maxWidth:'800px', margin:'0 auto' }}>
      <h3 className="card-title">Thesis Registration</h3>
      <p style={{ color:'#6b7280', marginBottom:'24px' }}>Fill in your enrollment details and proposed research topic to begin your Ph.D. journey.</p>
      <form style={{ display:'flex', flexDirection:'column', gap:'20px' }} onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="Your full name" required />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Enrollment Number</label>
            <input type="text" className="form-input" placeholder="e.g., 2024-CS-001" required />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Department</label>
            <select className="form-input">
              <option>Computer Science</option><option>Physics</option><option>Mathematics</option><option>Biology</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Date of Admission</label>
            <input type="date" className="form-input" />
          </div>
        </div>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Tentative Research Topic</label>
          <input type="text" className="form-input" placeholder="e.g., Quantum Computing in Cryptography" required />
        </div>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Research Abstract</label>
          <textarea className="form-input" rows="5" placeholder="Provide a brief summary of your proposed research..." required></textarea>
        </div>
        <div className="form-group" style={{ marginBottom:0 }}>
          <label className="form-label">Preferred Supervisor (Optional)</label>
          <select className="form-input">
            <option value="">No preference</option><option>Dr. Alan Turing</option><option>Dr. Marie Curie</option><option>Dr. Faculty</option>
          </select>
        </div>
        <button type="submit" className="btn-primary" style={{ alignSelf:'flex-start', marginTop:'10px' }}>Submit Registration</button>
      </form>
    </div>
  );
};

/* ── My Thesis ── */
const MyThesis = () => (
  <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
    <div className="card">
      <h3 className="card-title">Thesis Overview</h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        {[['Title','AI-Driven Solutions for Sustainable Development'],['Department','Computer Science'],['Enrollment No.','2024-CS-042'],['Admission Date','Jan 15, 2024'],['Supervisor','Dr. R. Gupta'],['Co-Supervisor','Dr. A. Sharma'],['Current Stage','Dissertation Work'],['Expected Completion','Dec 2027']].map(([k,v]) => (
          <div key={k}>
            <div style={{ fontSize:'0.8rem', color:'#6b7280', marginBottom:'4px' }}>{k}</div>
            <div style={{ fontWeight:'600', color:'#111827' }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
    <div className="card">
      <h3 className="card-title">Chapter Progress</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {[{ ch:'Chapter 1 – Introduction', pct:100, status:'Approved' },{ ch:'Chapter 2 – Literature Review', pct:100, status:'Approved' },{ ch:'Chapter 3 – Methodology', pct:85, status:'Under Review' },{ ch:'Chapter 4 – Implementation', pct:60, status:'In Progress' },{ ch:'Chapter 5 – Results', pct:20, status:'In Progress' },{ ch:'Chapter 6 – Conclusion', pct:0, status:'Pending' }].map(({ ch, pct, status }) => (
          <div key={ch}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
              <span style={{ fontSize:'0.9rem', color:'#374151' }}>{ch}</span>
              <span style={{ fontSize:'0.8rem', color: status==='Approved'?'#059669': status==='Under Review'?'#D97706':'#6b7280' }}>{status}</span>
            </div>
            <div style={{ background:'#E5E7EB', borderRadius:'9999px', height:'8px' }}>
              <div style={{ background: pct===100?'#10B981':'#3B82F6', width:`${pct}%`, height:'8px', borderRadius:'9999px', transition:'width 0.5s' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Milestones ── */
const Milestones = () => {
  const items = [
    { phase:'Phase 1 – Registration', tasks:[{ name:'Submit Enrollment Form', done:true },{ name:'Supervisor Assignment', done:true }] },
    { phase:'Phase 2 – Coursework', tasks:[{ name:'Complete 4 Core Courses', done:true },{ name:'Submit Coursework Report', done:true }] },
    { phase:'Phase 3 – Synopsis', tasks:[{ name:'Write Research Synopsis', done:true },{ name:'DRC Approval', done:false }] },
    { phase:'Phase 4 – Research', tasks:[{ name:'Chapter 1-3 Draft', done:true },{ name:'6-Month Progress Report', done:false },{ name:'Chapter 4-6 Draft', done:false }] },
    { phase:'Phase 5 – Submission', tasks:[{ name:'Pre-Submission Seminar', done:false },{ name:'Final Thesis Submission', done:false },{ name:'Final Defense', done:false }] },
  ];
  return (
    <div className="card documents-card">
      <h3 className="card-title">Milestone Tracker</h3>
      {items.map(({ phase, tasks }) => (
        <div key={phase} style={{ marginBottom:'24px' }}>
          <div style={{ fontWeight:'700', color:'#133A26', marginBottom:'10px', fontSize:'0.95rem' }}>{phase}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {tasks.map(({ name, done }) => (
              <div key={name} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background: done?'#F0FDF4':'#F9FAFB', borderRadius:'8px', border:`1px solid ${done?'#BBF7D0':'#E5E7EB'}` }}>
                <div style={{ width:'20px', height:'20px', borderRadius:'50%', background: done?'#10B981':'#E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {done && <span style={{ color:'white', fontSize:'12px' }}>✓</span>}
                </div>
                <span style={{ color: done?'#059669':'#374151', fontWeight: done?'500':'400' }}>{name}</span>
                <span style={{ marginLeft:'auto', fontSize:'0.75rem', color: done?'#059669':'#9CA3AF' }}>{done?'Completed':'Pending'}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Documents ── */
const Documents = () => {
  const files = [
    { name:'Thesis_Draft_Ch5.pdf', size:'12 MB', date:'Apr 10, 2024', status:'Under Review' },
    { name:'Research_Paper_V3.1.docx', size:'8 MB', date:'Apr 08, 2024', status:'Approved' },
    { name:'Synopsis_Final.pdf', size:'3.2 MB', date:'Mar 15, 2024', status:'Approved' },
    { name:'Literature_Review.docx', size:'5.6 MB', date:'Feb 20, 2024', status:'Revision Required' },
  ];
  const statusColors = { 'Approved':'#059669', 'Under Review':'#D97706', 'Revision Required':'#DC2626' };
  const statusBg = { 'Approved':'#D1FAE5', 'Under Review':'#FEF3C7', 'Revision Required':'#FEE2E2' };
  return (
    <div className="card documents-card">
      <h3 className="card-title">Documents Repository</h3>
      <div className="upload-zone">
        <CloudUpload className="upload-icon" />
        <div className="upload-title">Drag & Drop Files Here</div>
        <div className="upload-subtitle">PDF, DOCX, or PPTX up to 50MB</div>
        <button className="btn-upload"><PlusCircle size={16}/> Upload New Document</button>
      </div>
      <div className="recent-uploads">
        <div className="recent-uploads-title">My Documents</div>
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex:2.5 }}>Name</div><div style={{ flex:1 }}>Size</div><div style={{ flex:1 }}>Date</div><div style={{ flex:1.2 }}>Status</div><div style={{ flex:1 }}>Action</div>
          </div>
          {files.map((f, i) => (
            <div key={i} className="file-item" style={{ borderBottom: i<files.length-1?undefined:'none' }}>
              <div className="file-name" style={{ flex:2.5 }}>{f.name}</div>
              <div className="file-size" style={{ flex:1 }}>{f.size}</div>
              <div className="file-date" style={{ flex:1 }}>{f.date}</div>
              <div style={{ flex:1.2 }}><span style={{ padding:'3px 8px', borderRadius:'12px', fontSize:'0.75rem', background:statusBg[f.status], color:statusColors[f.status], fontWeight:'600' }}>{f.status}</span></div>
              <div className="file-actions" style={{ flex:1 }}><button className="btn-action">View</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Meetings ── */
const Meetings = () => {
  const meetings = [
    { advisor:'Dr. R. Gupta', type:'Chapter 3 Review', date:'Nov 1, 2024', time:'10:00 AM', mode:'In-Person', location:'Room 204' },
    { advisor:'Dr. A. Sharma', type:'Co-supervisor Check-in', date:'Nov 5, 2024', time:'3:00 PM', mode:'Online', location:'Google Meet' },
    { advisor:'Dr. R. Gupta', type:'Monthly Progress', date:'Nov 15, 2024', time:'11:00 AM', mode:'In-Person', location:'Room 204' },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      <div className="card documents-card">
        <h3 className="card-title">Upcoming Meetings</h3>
        <div className="file-list">
          <div className="file-header">
            <div style={{ flex:1.5 }}>Advisor</div><div style={{ flex:1.5 }}>Type</div><div style={{ flex:1 }}>Date</div><div style={{ flex:1 }}>Time</div><div style={{ flex:1 }}>Mode</div><div style={{ flex:1 }}>Action</div>
          </div>
          {meetings.map((m, i) => (
            <div key={i} className="file-item">
              <div className="file-name" style={{ flex:1.5 }}>{m.advisor}</div>
              <div style={{ flex:1.5, fontSize:'0.85rem', color:'#374151' }}>{m.type}</div>
              <div className="file-date" style={{ flex:1 }}>{m.date}</div>
              <div className="file-date" style={{ flex:1 }}>{m.time}</div>
              <div style={{ flex:1 }}><span style={{ padding:'3px 8px', borderRadius:'12px', fontSize:'0.75rem', background:m.mode==='Online'?'#DBEAFE':'#D1FAE5', color:m.mode==='Online'?'#1D4ED8':'#059669' }}>{m.mode}</span></div>
              <div className="file-actions" style={{ flex:1 }}><button className="btn-action">Join</button></div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ maxWidth:'500px' }}>
        <h3 className="card-title">Request a Meeting</h3>
        <form style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Supervisor</label><select className="form-input"><option>Dr. R. Gupta</option><option>Dr. A. Sharma</option></select></div>
          <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Preferred Date</label><input type="date" className="form-input"/></div>
          <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Purpose</label><input type="text" className="form-input" placeholder="e.g., Chapter 4 discussion"/></div>
          <button type="button" className="btn-primary" style={{ alignSelf:'flex-start' }}>Request Meeting</button>
        </form>
      </div>
    </div>
  );
};

/* ── Profile ── */
const Profile = ({ user }) => (
  <div className="card" style={{ maxWidth:'600px' }}>
    <h3 className="card-title">My Profile</h3>
    <div style={{ display:'flex', gap:'24px', alignItems:'center', marginBottom:'24px' }}>
      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" alt="Student" style={{ width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover' }}/>
      <div>
        <div style={{ fontSize:'1.2rem', fontWeight:'bold' }}>{user?.name || 'Student'}</div>
        <div style={{ color:'#6b7280', fontSize:'0.9rem' }}>Ph.D. Scholar</div>
      </div>
    </div>
    <form style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Full Name</label><input type="text" className="form-input" defaultValue={user?.name||'Student'}/></div>
        <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Enrollment No.</label><input type="text" className="form-input" defaultValue="2024-CS-042"/></div>
        <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Email</label><input type="email" className="form-input" defaultValue="student@scholarsync.edu"/></div>
        <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Department</label><select className="form-input"><option>Computer Science</option><option>Physics</option></select></div>
      </div>
      <div className="form-group" style={{ marginBottom:0 }}><label className="form-label">Change Password</label><input type="password" className="form-input" placeholder="New password"/></div>
      <button type="button" className="btn-primary" style={{ alignSelf:'flex-start' }}>Save Changes</button>
    </form>
  </div>
);

/* ── Main ── */
const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useContext(AuthContext);

  const titles = { overview:'Student Dashboard', registration:'Thesis Registration', thesis:'My Thesis', milestones:'Milestones', documents:'Documents', meetings:'Meetings', profile:'My Profile' };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':     return <OverviewPage setActiveTab={setActiveTab} />;
      case 'registration': return <RegistrationForm />;
      case 'thesis':       return <MyThesis />;
      case 'milestones':   return <Milestones />;
      case 'documents':    return <Documents />;
      case 'meetings':     return <Meetings />;
      case 'profile':      return <Profile user={user} />;
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
              <span className="welcome-text">Welcome, {user?.name || 'Student'}!</span>
              <span className="welcome-subtext"> | Ph.D. Scholar Portal</span>
            </div>
            <div className="brand-text">HPU ScholarSync</div>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
