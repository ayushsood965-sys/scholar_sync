require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected for seeding...');

    // Clear existing users
    await User.deleteMany();

    const users = [
      {
        name: 'System Admin',
        username: 'admin',
        password: 'admin',
        role: 'ADMIN',
      },
      {
        name: 'John Student',
        username: 'student',
        password: 'student',
        role: 'STUDENT',
      },
      {
        name: 'Dr. Faculty',
        username: 'faculty',
        password: 'faculty',
        role: 'FACULTY',
      },
    ];

    for (const user of users) {
      await User.create(user);
    }
    console.log('Database seeded with admin, student, and faculty accounts!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
