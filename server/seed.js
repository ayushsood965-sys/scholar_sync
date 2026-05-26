require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await User.deleteMany({});

    const users = [
      { name: 'Admin User', username: 'admin', password: 'admin', role: 'ADMIN' },
      { name: 'Student User', username: 'student', password: 'student', role: 'STUDENT', department: 'Computer Science' },
      { name: 'Dr. Faculty Supervisor', username: 'faculty', password: 'faculty', role: 'FACULTY', subRole: 'SUPERVISOR', department: 'Computer Science' },
      { name: 'Prof. HOD Faculty', username: 'hod', password: 'hod', role: 'FACULTY', subRole: 'HOD', department: 'Computer Science' },
    ];

    for (const user of users) {
      await User.create(user);
    }

    console.log('✅ Database seeded with admin, student, faculty (SUPERVISOR), hod (HOD) accounts!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
