const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { login, register, getFacultyList, updateProfile, toggleUserActive, getDeptUsers, getAllUsers, adminCreateUser, deleteUser, uploadAvatar, verifyUser, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.get('/faculty', protect, authorize('ADMIN', 'HOD', 'SUPER_ADMIN'), getFacultyList);
router.put('/profile', protect, updateProfile);
router.put('/profile/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/users/:id/active', protect, toggleUserActive);
router.put('/users/:id/verify', protect, verifyUser);
router.get('/dept-users', protect, getDeptUsers);
router.get('/all-users', protect, authorize('SUPER_ADMIN'), getAllUsers);
router.post('/create-user', protect, authorize('SUPER_ADMIN'), adminCreateUser);
router.delete('/users/:id', protect, authorize('SUPER_ADMIN'), deleteUser);

module.exports = router;
