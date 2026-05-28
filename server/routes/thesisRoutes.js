const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createThesis, getMyThesis, getAllTheses, getThesisById,
  verifyEnrollment, assignSupervisor, clearCoursework, awardDegree, updateAuditLog,
  getAssignedTheses, getDeptTheses, drcApprove, seminarClear, finalApprove, toggleAnnualRAC,
} = require('../controllers/thesisController');

// Scholar
router.post('/', protect, authorize('STUDENT'), createThesis);
router.get('/me', protect, authorize('STUDENT'), getMyThesis);

// Admin & HOD Department Admins
router.get('/all', protect, authorize('ADMIN', 'HOD'), getAllTheses);
router.put('/:id/verify', protect, authorize('ADMIN', 'HOD'), verifyEnrollment);
router.put('/:id/assign', protect, authorize('ADMIN', 'HOD'), assignSupervisor);
router.put('/:id/coursework', protect, authorize('ADMIN', 'HOD', 'FACULTY'), clearCoursework);
router.put('/:id/award', protect, authorize('ADMIN', 'HOD'), awardDegree);
router.put('/:id/audit', protect, authorize('ADMIN', 'HOD'), updateAuditLog);
router.put('/:id/annual-rac', protect, authorize('ADMIN', 'HOD'), toggleAnnualRAC);

// Faculty
router.get('/assigned', protect, authorize('FACULTY'), getAssignedTheses);
router.get('/dept', protect, authorize('FACULTY'), getDeptTheses);
router.put('/:id/drc', protect, authorize('FACULTY'), drcApprove);
router.put('/:id/seminar', protect, authorize('FACULTY'), seminarClear);
router.put('/:id/final-approve', protect, authorize('FACULTY'), finalApprove);

// Shared (admin + faculty can view single thesis)
router.get('/:id', protect, getThesisById);

module.exports = router;
