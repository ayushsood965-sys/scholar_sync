const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Check if account is active
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been disabled. Please contact your department HOD.' });
    }

    if (await user.matchPassword(password)) {
      res.json({
        _id: user._id, name: user.name, username: user.username,
        role: user.role, subRole: user.subRole, department: user.department,
        isActive: user.isActive, profileCompleted: user.profileCompleted, profile: user.profile,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, username, password, role, department } = req.body;
  try {
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Constraint: Only one HOD can exist per department
    if (role === 'HOD') {
      const activeHod = await User.findOne({ role: 'HOD', department, isActive: true });
      if (activeHod) {
        return res.status(400).json({ 
          message: 'HOD already exists for this department. Please disable the existing HOD\'s ID before creating a new one.' 
        });
      }
    }

    const user = await User.create({ 
      name, username, password, role: role || 'STUDENT', department 
    });

    res.status(201).json({
      _id: user._id, name: user.name, username: user.username,
      role: user.role, subRole: user.subRole, department: user.department,
      isActive: user.isActive, profileCompleted: user.profileCompleted, profile: user.profile,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/faculty — list all faculty (for admin supervisor dropdown)
const getFacultyList = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'FACULTY' }).select('name username subRole department isActive');
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/profile — Update Profile Details
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profile = { ...user.profile, ...req.body };
    user.profileCompleted = true;
    await user.save();

    res.json({
      _id: user._id, name: user.name, username: user.username,
      role: user.role, subRole: user.subRole, department: user.department,
      isActive: user.isActive, profileCompleted: user.profileCompleted, profile: user.profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/users/:id/active — Toggle user activity (HOD / Super Admin action)
const toggleUserActive = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // HODs, ADMINs, or SUPER_ADMINs can toggle active status
    if (!['HOD', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (req.user.role === 'HOD' && req.user.department !== targetUser.department) {
      return res.status(403).json({ message: 'Not authorized. Can only manage users in your own department.' });
    }

    targetUser.isActive = !targetUser.isActive;
    await targetUser.save();

    res.json({ message: `User account is now ${targetUser.isActive ? 'active' : 'disabled'}.`, user: targetUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/dept-users — Get all users inside HOD's department
const getDeptUsers = async (req, res) => {
  try {
    if (req.user.role !== 'HOD' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Action restricted to HOD.' });
    }
    const query = req.user.role === 'ADMIN' ? {} : { department: req.user.department };
    const users = await User.find(query).select('name username role department isActive profileCompleted');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/all-users — Get all users across the institution (Super Admin only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Action restricted to Super Admin.' });
    }
    const users = await User.find().select('name username role subRole department isActive profileCompleted profile');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/create-user — Super Admin creates a new user directly
const adminCreateUser = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Action restricted to Super Admin.' });
    }
    const { name, username, password, role, subRole, department } = req.body;
    if (!name || !username || !password || !role) {
      return res.status(400).json({ message: 'Name, Username, Password, and Role are required' });
    }

    // Check duplicate username
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: 'Username / Email already registered' });
    }

    // Unique HOD constraint check
    if (role === 'HOD' || (role === 'FACULTY' && subRole === 'HOD')) {
      const activeHOD = await User.findOne({
        department,
        $or: [{ role: 'HOD' }, { role: 'FACULTY', subRole: 'HOD' }],
        isActive: true
      });
      if (activeHOD) {
        return res.status(400).json({
          message: 'HOD already exists for this department. Please disable the existing HOD\'s ID before creating a new one.'
        });
      }
    }

    const newUser = await User.create({
      name,
      username,
      password,
      role,
      subRole: role === 'FACULTY' ? (subRole || 'SUPERVISOR') : null,
      department,
      isActive: true,
      profileCompleted: false
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/auth/users/:id — Super Admin deletes user
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Action restricted to Super Admin.' });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, register, getFacultyList, updateProfile, toggleUserActive, getDeptUsers, getAllUsers, adminCreateUser, deleteUser };
