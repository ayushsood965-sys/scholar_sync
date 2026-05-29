require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const thesisRoutes = require('./routes/thesisRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const lifecycleRoutes = require('./routes/lifecycleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const publicationRoutes = require('./routes/publicationRoutes');
const fs = require('fs');

const User = require('./models/User');
const Thesis = require('./models/Thesis');
const Milestone = require('./models/Milestone');
const Publication = require('./models/Publication');
const RACReview = require('./models/RACReview');
const ChangeRequest = require('./models/ChangeRequest');
const DRCMeeting = require('./models/DRCMeeting');
const Department = require('./models/Department');
const Notification = require('./models/Notification');

const app = express();

// Connect to database
connectDB().then(async () => {
  console.log('✅ Database connected.');
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Super Administrator',
        username: 'admin',
        password: 'admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        isVerified: true,
        profileCompleted: true
      });
      console.log('👑 Super Admin user auto-seeded (admin/admin)');
    } else {
      console.log('👑 Super Admin user already exists.');
    }
  } catch (err) {
    console.error('❌ Error during startup auto-seeding:', err);
  }
});

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/thesis', thesisRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/lifecycle', lifecycleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/publications', publicationRoutes);

// -------------------------------------------------------------
// SYSTEM UTILITY ROUTES (/clear-all & /seed)
// -------------------------------------------------------------

const UTILITY_PASSWORD = 'Ayush1994*';

// HTML Template Helper for stunning Glassmorphic UI
const renderAdminPage = (type, error = '', successData = null) => {
  const isClear = type === 'clear';
  const title = isClear ? 'System Clean Portal' : 'System Seeding Portal';
  const primaryColor = isClear ? '#ef4444' : '#10b981';
  const accentGradient = isClear 
    ? 'linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)' 
    : 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)';
  const shadowGlow = isClear 
    ? 'rgba(239, 68, 68, 0.25)' 
    : 'rgba(16, 185, 129, 0.25)';
  const description = isClear
    ? 'Deletes all records from the database and removes all uploaded PDF/DOCX files. This action resets the portal to a fresh state and is irreversible.'
    : 'Seeds the database with academic departments.';

  let contentHtml = '';

  if (successData) {
    // Show beautiful success page
    contentHtml = `
      <div class="success-icon" style="background: ${primaryColor}20; color: ${primaryColor};">
        ${isClear ? '🧹' : '🌱'}
      </div>
      <h2>${isClear ? 'System Reset Complete!' : 'System Seeded Successfully!'}</h2>
      <p class="desc" style="margin-bottom: 24px;">The request was authorized and completed without errors.</p>
      
      <div class="results-box">
        <h3>Summary of Operations</h3>
        <ul>
          ${successData.records ? successData.records.map(r => `<li><span>${r.name}</span><strong>${r.count} deleted</strong></li>`).join('') : ''}
          ${successData.seeded ? successData.seeded.map(s => `<li><span>${s.name}</span><strong>${s.status}</strong></li>`).join('') : ''}
        </ul>
        
        ${successData.files && successData.files.length > 0 ? `
          <h3 style="margin-top: 20px;">Deleted Document Files (${successData.files.length})</h3>
          <div class="files-scroll">
            ${successData.files.map(f => `<div class="file-tag">📄 ${f}</div>`).join('')}
          </div>
        ` : ''}
      </div>

      <a href="/" class="btn" style="background: ${accentGradient}; text-align: center; text-decoration: none; display: block; margin-top: 24px; box-shadow: 0 4px 14px ${shadowGlow};">
        Return to Portal Home
      </a>
    `;
  } else {
    // Show password prompt form
    contentHtml = `
      <div class="success-icon" style="background: ${primaryColor}20; color: ${primaryColor};">
        ${isClear ? '⚠️' : '⚙️'}
      </div>
      <h2>${title}</h2>
      <p class="desc">${description}</p>

      ${error ? `
        <div class="error-alert">
          <span>❌</span>
          <div style="flex: 1;">${error}</div>
        </div>
      ` : ''}

      <form method="POST" action="/${isClear ? 'clear-all' : 'seed'}" id="action-form">
        <div class="input-group">
          <label for="password">Enter Security Password</label>
          <div style="position: relative;">
            <input type="password" name="password" id="password" placeholder="••••••••••••" required autocomplete="off" />
            <button type="button" class="toggle-password" id="toggle-pw-btn" onclick="togglePasswordVisibility()">Show</button>
          </div>
        </div>

        <button type="submit" class="btn" style="background: ${accentGradient}; box-shadow: 0 4px 14px ${shadowGlow};">
          ${isClear ? 'Execute Full Clean' : 'Execute Seeding'}
        </button>
      </form>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | ScholarSync Hub</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        }

        body {
          background: linear-gradient(135deg, #0b0f19 0%, #161e31 100%);
          color: #f1f5f9;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow-x: hidden;
        }

        /* Beautiful glowing orbs */
        .orb {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(80px);
          z-index: -1;
          opacity: 0.15;
        }
        .orb-1 {
          top: 10%;
          left: 10%;
          background: ${primaryColor};
        }
        .orb-2 {
          bottom: 10%;
          right: 10%;
          background: #3b82f6;
        }

        .card {
          backdrop-filter: blur(16px) saturate(180%);
          background: rgba(30, 41, 59, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          border-radius: 24px;
          width: 100%;
          max-width: 500px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .success-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          font-size: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          align-self: flex-start;
          animation: float 3s ease-in-out infinite;
        }

        h2 {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .desc {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 32px;
          font-weight: 500;
        }

        .input-group {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
        }

        input[type="password"], input[type="text"] {
          width: 100%;
          padding: 16px;
          padding-right: 64px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
        }

        input[type="password"]:focus, input[type="text"]:focus {
          border-color: ${primaryColor};
          box-shadow: 0 0 0 4px ${primaryColor}15;
          background: rgba(15, 23, 42, 0.8);
        }

        .toggle-password {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s;
        }
        .toggle-password:hover {
          color: #ffffff;
        }

        .btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .btn:active {
          transform: translateY(0);
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 24px;
          color: #fca5a5;
          font-size: 14px;
          display: flex;
          gap: 12px;
          align-items: center;
          font-weight: 500;
        }

        .results-box {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 8px;
        }

        .results-box h3 {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .results-box ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .results-box li {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
          padding-bottom: 6px;
        }

        .results-box li:last-child {
          border: none;
          padding: 0;
        }

        .results-box span {
          color: #cbd5e1;
        }

        .results-box strong {
          color: #ffffff;
          font-weight: 600;
        }

        .files-scroll {
          max-height: 120px;
          overflow-y: auto;
          margin-top: 10px;
          padding-right: 4px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .files-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .files-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .file-tag {
          font-size: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 6px 10px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @media (max-width: 480px) {
          .card {
            padding: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>

      <div class="card">
        ${contentHtml}
      </div>

      <script>
        function togglePasswordVisibility() {
          var input = document.getElementById("password");
          var btn = document.getElementById("toggle-pw-btn");
          if (input.type === "password") {
            input.type = "text";
            btn.textContent = "Hide";
          } else {
            input.type = "password";
            btn.textContent = "Show";
          }
        }
      </script>
    </body>
    </html>
  `;
};

// GET Route handlers
const handleClearAllGet = (req, res) => {
  res.send(renderAdminPage('clear', req.query.error));
};

const handleSeedGet = (req, res) => {
  res.send(renderAdminPage('seed', req.query.error));
};

// POST Route handlers
const handleClearAllPost = async (req, res) => {
  const { password } = req.body;
  const isApi = req.xhr || req.headers.accept?.indexOf('json') > -1;

  if (password !== UTILITY_PASSWORD) {
    if (isApi) {
      return res.status(401).json({ success: false, message: 'Invalid utility password.' });
    }
    return res.redirect('/clear-all?error=Invalid%20Utility%20Password');
  }

  try {
    // Clear all Mongoose database collections
    const userRes = await User.deleteMany({});
    const thesisRes = await Thesis.deleteMany({});
    const milestoneRes = await Milestone.deleteMany({});
    const pubRes = await Publication.deleteMany({});
    const racRes = await RACReview.deleteMany({});
    const changeRes = await ChangeRequest.deleteMany({});
    const drcRes = await DRCMeeting.deleteMany({});
    const deptRes = await Department.deleteMany({});
    const notifRes = await Notification.deleteMany({});

    // Delete PDF and DOCX files in uploads/
    const path = require('path');
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'uploads');
    let deletedFiles = [];
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.pdf' || ext === '.docx') {
          fs.unlinkSync(path.join(uploadsDir, file));
          deletedFiles.push(file);
        }
      }
    }

    const successData = {
      records: [
        { name: 'Users', count: userRes.deletedCount },
        { name: 'Theses', count: thesisRes.deletedCount },
        { name: 'Milestones', count: milestoneRes.deletedCount },
        { name: 'Publications', count: pubRes.deletedCount },
        { name: 'RAC Reviews', count: racRes.deletedCount },
        { name: 'Change Requests', count: changeRes.deletedCount },
        { name: 'DRC Meetings', count: drcRes.deletedCount },
        { name: 'Departments', count: deptRes.deletedCount },
        { name: 'Notifications', count: notifRes.deletedCount }
      ],
      files: deletedFiles
    };

    if (isApi) {
      return res.json({ success: true, message: 'Database reset and clean completed successfully.', ...successData });
    }

    res.send(renderAdminPage('clear', '', successData));
  } catch (err) {
    console.error('Error clearing database:', err);
    if (isApi) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.redirect(`/clear-all?error=${encodeURIComponent(err.message)}`);
  }
};

const handleSeedPost = async (req, res) => {
  const { password } = req.body;
  const isApi = req.xhr || req.headers.accept?.indexOf('json') > -1;

  if (password !== UTILITY_PASSWORD) {
    if (isApi) {
      return res.status(401).json({ success: false, message: 'Invalid utility password.' });
    }
    return res.redirect('/seed?error=Invalid%20Utility%20Password');
  }

  try {
    // Seed Departments
    const departmentsToSeed = [
      { name: 'Department of Chemistry', code: 'CHEM' },
      { name: 'Department of Computer Science', code: 'CS' },
      { name: 'Department of Data Science and Artificial Intelligence', code: 'DSAI' },
      { name: 'Department of Electronics', code: 'ELEX' },
      { name: 'Department of Geography', code: 'GEOG' },
      { name: 'Department of Mathematics', code: 'MATH' },
      { name: 'Department of Physics', code: 'PHYS' },
      { name: 'Department of Archaeology (Ancient History & Archaeology)', code: 'ARCH' },
      { name: 'Department of Defence and Strategic Studies', code: 'DSS' },
      { name: 'Department of Economics', code: 'ECON' },
      { name: 'Department of History', code: 'HIST' },
      { name: 'Department of Journalism and Mass Communications', code: 'JMC' },
      { name: 'Department of Library and Information Science', code: 'LIS' },
      { name: 'Department of Life Long Learning', code: 'LLL' },
      { name: 'Department of Political Science', code: 'POL' },
      { name: 'Department of Population Studies', code: 'POPS' },
      { name: 'Department of Psychology', code: 'PSY' },
      { name: 'Department of Public Administration', code: 'PA' },
      { name: 'Department of Sociology and Social Work', code: 'SSW' },
      { name: 'Department of Yoga Studies', code: 'YS' },
      { name: 'Department of Bio Sciences', code: 'BIOS' },
      { name: 'Department of Bio Technology', code: 'BIOT' },
      { name: 'Department of Environmental Science', code: 'ENVS' },
      { name: 'Department of Forensic Science', code: 'FORS' },
      { name: 'Department of Microbiology', code: 'MICRO' },
      { name: 'Centre for Buddhist Studies', code: 'CBS' },
      { name: 'Department of English', code: 'ENG' },
      { name: 'Department of Hindi', code: 'HIN' },
      { name: 'Department of Modern European and Foreign Languages', code: 'MEFL' },
      { name: 'Department of Sanskrit', code: 'SKT' },
      { name: 'Department of Applied Sciences & Humanities', code: 'ASH' },
      { name: 'Department of Civil Engineering', code: 'CIVIL' },
      { name: 'Department of Computer Science Engineering', code: 'CSE' },
      { name: 'Department of Electrical Engineering', code: 'EE' },
      { name: 'Department of Electronics and Communication', code: 'ECE' },
      { name: 'Department of Information Technology', code: 'IT' },
      { name: 'Department of Commerce', code: 'COMM' },
      { name: 'Institute of Vocational Studies', code: 'IVS' },
      { name: 'International Institute of Management Studies (HPU Business School)', code: 'IIMS' },
      { name: 'Department of Education', code: 'EDU' },
      { name: 'Department of Physical Education', code: 'PE' },
      { name: 'Department of Teacher Education', code: 'TE' },
      { name: 'Department of Performing Arts (Music, Dance, and Dramatics)', code: 'DPA' },
      { name: 'Department of Visual Arts (Painting, Commercial Art, and Sculpture)', code: 'DVA' },
      { name: 'Department of Law', code: 'LAW' },
      { name: 'Department of Interdisciplinary Studies', code: 'IDS' }
    ];

    let deptsAdded = 0;
    for (const d of departmentsToSeed) {
      const exists = await Department.findOne({ $or: [{ name: d.name }, { code: d.code }] });
      if (!exists) {
        await Department.create(d);
        deptsAdded++;
      }
    }

    const successData = {
      seeded: [
        { name: 'Departments Seeded', status: `Seeded ${deptsAdded} new departments.` }
      ]
    };

    if (isApi) {
      return res.json({ success: true, message: 'Database seeding completed successfully.', ...successData });
    }

    res.send(renderAdminPage('seed', '', successData));
  } catch (err) {
    console.error('Seeding error:', err);
    if (isApi) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.redirect(`/seed?error=${encodeURIComponent(err.message)}`);
  }
};

// Root mount for HTML browser portals
app.get('/clear-all', handleClearAllGet);
app.post('/clear-all', handleClearAllPost);
app.get('/seed', handleSeedGet);
app.post('/seed', handleSeedPost);

// API aliases for programmatic utility hits
app.get('/api/clear-all', handleClearAllGet);
app.post('/api/clear-all', handleClearAllPost);
app.get('/api/seed', handleSeedGet);
app.post('/api/seed', handleSeedPost);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
