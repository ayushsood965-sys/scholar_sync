const express = require('express');
const router = express.Router();
const { login, register, getFacultyList, updateProfile, toggleUserActive, getDeptUsers, getAllUsers, adminCreateUser, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/faculty', protect, authorize('ADMIN', 'HOD', 'SUPER_ADMIN'), getFacultyList);
router.put('/profile', protect, updateProfile);
router.put('/users/:id/active', protect, toggleUserActive);
router.get('/dept-users', protect, getDeptUsers);
router.get('/all-users', protect, authorize('SUPER_ADMIN'), getAllUsers);
router.post('/create-user', protect, authorize('SUPER_ADMIN'), adminCreateUser);
router.delete('/users/:id', protect, authorize('SUPER_ADMIN'), deleteUser);

module.exports = router;
