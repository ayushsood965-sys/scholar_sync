require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const thesisRoutes = require('./routes/thesisRoutes');
const milestoneRoutes = require('./routes/milestoneRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
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
        profileCompleted: true
      });
      console.log('✅ Auto-seeded Super Admin account (admin/admin) successfully!');
    } else {
      // Force reset credentials and role on startup
      superAdmin.name = 'Super Administrator';
      superAdmin.role = 'SUPER_ADMIN';
      superAdmin.password = 'admin'; // Will trigger pre-save hashing
      superAdmin.isActive = true;
      superAdmin.profileCompleted = true;
      await superAdmin.save();
      console.log('✅ Synchronized and restored Super Admin credentials (admin/admin)!');
    }

    const count = await User.countDocuments();
    // Seed default developer accounts if database is empty (excluding admin)
    if (count <= 1) {
      console.log('Auto-seeding default developer accounts...');
      const defaultUsers = [
        { name: 'Student User', username: 'student', password: 'student', role: 'STUDENT', department: 'Computer Science' },
        { name: 'Dr. Faculty Supervisor', username: 'faculty', password: 'faculty', role: 'FACULTY', subRole: 'SUPERVISOR', department: 'Computer Science' },
        { name: 'Prof. HOD Faculty', username: 'hod', password: 'hod', role: 'FACULTY', subRole: 'HOD', department: 'Computer Science' },
      ];
      for (const u of defaultUsers) {
        await User.create(u);
      }
      console.log('✅ Auto-seeded default developer accounts successfully!');
    }

    // Auto-seed default departments if none exist
    const Department = require('./models/Department');
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      console.log('Auto-seeding default departments...');
      const defaultDepts = [
        { name: 'Computer Science', code: 'CS' },
        { name: 'Electrical Engineering', code: 'EE' },
        { name: 'Mechanical Engineering', code: 'ME' },
        { name: 'Criminology', code: 'CRM' },
        { name: 'Physics', code: 'PHY' },
      ];
      for (const d of defaultDepts) {
        await Department.create(d);
      }
      console.log('✅ Auto-seeded default departments successfully!');
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
