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

const app = express();

// Connect to database
connectDB().then(async () => {
  try {
    const User = require('./models/User');
    
    // Auto-seed or reset Super Admin on EVERY startup
    const superAdmin = await User.findOne({ username: 'admin' });
    if (!superAdmin) {
      await User.create({
        name: 'Super Administrator',
        username: 'admin',
        password: 'admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        isVerified: true,
        profileCompleted: true
      });
      console.log('✅ Auto-seeded Super Admin account (admin/admin) successfully!');
    } else {
      // Force reset credentials and role on startup
      superAdmin.name = 'Super Administrator';
      superAdmin.role = 'SUPER_ADMIN';
      superAdmin.password = 'admin'; // Will trigger pre-save hashing
      superAdmin.isActive = true;
      superAdmin.isVerified = true;
      superAdmin.profileCompleted = true;
      await superAdmin.save();
      console.log('✅ Synchronized and restored Super Admin credentials (admin/admin)!');
    }

    // Seed default developer accounts if they do not exist
    const defaultUsers = [
      { name: 'Student User', username: 'student', password: 'student', role: 'STUDENT', department: 'Department of Computer Science', isVerified: true, profileCompleted: true },
      { name: 'Dr. Faculty Supervisor', username: 'faculty', password: 'faculty', role: 'FACULTY', subRole: 'SUPERVISOR', department: 'Department of Computer Science', isVerified: true, profileCompleted: true },
      { name: 'Prof. HOD Faculty', username: 'hod', password: 'hod', role: 'HOD', subRole: 'HOD', department: 'Department of Computer Science', isVerified: true, profileCompleted: true },
    ];
    for (const u of defaultUsers) {
      const exists = await User.findOne({ username: u.username });
      if (!exists) {
        await User.create(u);
        console.log(`✅ Auto-seeded test user: ${u.username} (${u.role})`);
      }
    }

    // Auto-seed registered thesis for test student if not present
    const Thesis = require('./models/Thesis');
    const studentUser = await User.findOne({ username: 'student' });
    if (studentUser) {
      const thesisExists = await Thesis.findOne({ scholarId: studentUser._id });
      if (!thesisExists) {
        await Thesis.create({
          scholarId: studentUser._id,
          department: 'Department of Computer Science',
          title: 'Automated Ph.D. Lifecycle Tracker',
          enrollmentNumber: 'PHD/CS/2026/007',
          abstract: 'An automated full-stack workflow automation framework for managing Ph.D research milestones and administrative processes.',
          status: 'REGISTRATION_PENDING',
          enrollmentVerified: false,
          courseworkCompleted: false,
          auditLog: [
            { action: 'REGISTRATION_SUBMITTED', note: 'Thesis registration details submitted by scholar.' }
          ]
        });
        console.log('✅ Auto-seeded thesis registration details for the test scholar!');
      }
    }

    // Auto-seed GNUMS departments list if they do not exist
    const Department = require('./models/Department');
    const departmentsToSeed = [
      // Faculty of Physical Sciences
      { name: 'Department of Chemistry', code: 'CHEM' },
      { name: 'Department of Computer Science', code: 'CS' },
      { name: 'Department of Data Science and Artificial Intelligence', code: 'DSAI' },
      { name: 'Department of Electronics', code: 'ELEX' },
      { name: 'Department of Geography', code: 'GEOG' },
      { name: 'Department of Mathematics', code: 'MATH' },
      { name: 'Department of Physics', code: 'PHYS' },

      // Faculty of Social Sciences
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

      // Faculty of Life Sciences
      { name: 'Department of Bio Sciences', code: 'BIOS' },
      { name: 'Department of Bio Technology', code: 'BIOT' },
      { name: 'Department of Environmental Science', code: 'ENVS' },
      { name: 'Department of Forensic Science', code: 'FORS' },
      { name: 'Department of Microbiology', code: 'MICRO' },

      // Faculty of Languages
      { name: 'Centre for Buddhist Studies', code: 'CBS' },
      { name: 'Department of English', code: 'ENG' },
      { name: 'Department of Hindi', code: 'HIN' },
      { name: 'Department of Modern European and Foreign Languages', code: 'MEFL' },
      { name: 'Department of Sanskrit', code: 'SKT' },

      // Faculty of Engineering and Technology (UIT)
      { name: 'Department of Applied Sciences & Humanities', code: 'ASH' },
      { name: 'Department of Civil Engineering', code: 'CIVIL' },
      { name: 'Department of Computer Science Engineering', code: 'CSE' },
      { name: 'Department of Electrical Engineering', code: 'EE' },
      { name: 'Department of Electronics and Communication', code: 'ECE' },
      { name: 'Department of Information Technology', code: 'IT' },

      // Faculty of Commerce & Management
      { name: 'Department of Commerce', code: 'COMM' },
      { name: 'Institute of Vocational Studies', code: 'IVS' },
      { name: 'International Institute of Management Studies (HPU Business School)', code: 'IIMS' },

      // Faculty of Education
      { name: 'Department of Education', code: 'EDU' },
      { name: 'Department of Physical Education', code: 'PE' },
      { name: 'Department of Teacher Education', code: 'TE' },

      // Faculty of Performing & Visual Arts
      { name: 'Department of Performing Arts (Music, Dance, and Dramatics)', code: 'DPA' },
      { name: 'Department of Visual Arts (Painting, Commercial Art, and Sculpture)', code: 'DVA' },

      // Faculty of Law
      { name: 'Department of Law', code: 'LAW' },

      // Faculty of Environment, Sustainability and Development Studies
      { name: 'Department of Interdisciplinary Studies', code: 'IDS' }
    ];

    let newDeptsCount = 0;
    for (const d of departmentsToSeed) {
      const exists = await Department.findOne({ $or: [{ name: d.name }, { code: d.code }] });
      if (!exists) {
        await Department.create(d);
        newDeptsCount++;
      }
    }
    if (newDeptsCount > 0) {
      console.log(`✅ Auto-seeded ${newDeptsCount} new departments successfully!`);
    }
  } catch (error) {
    console.error('Auto-seeding error:', error);
  }
});

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// Middleware
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
