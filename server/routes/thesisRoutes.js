const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createThesis, getMyThesis, getAllTheses, getThesisById,
  verifyEnrollment, assignSupervisor, clearCoursework, awardDegree, updateAuditLog,
  getAssignedTheses, getDeptTheses, drcApprove, scheduleSeminar, seminarClear, finalApprove, toggleAnnualRAC,
  dispatchThesis, scheduleViva, recordViva, transferThesis
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
router.put('/:id/annual-rac', protect, authorize('ADMIN', 'HOD', 'FACULTY'), toggleAnnualRAC);
router.put('/:id/dispatch', protect, authorize('ADMIN', 'HOD'), dispatchThesis);
router.put('/:id/schedule-viva', protect, authorize('ADMIN', 'HOD'), scheduleViva);
router.put('/:id/record-viva', protect, authorize('ADMIN', 'HOD'), recordViva);
router.put('/:id/transfer', protect, authorize('ADMIN', 'HOD', 'FACULTY'), transferThesis);

// Faculty
router.get('/assigned', protect, authorize('FACULTY'), getAssignedTheses);
router.get('/dept', protect, authorize('FACULTY'), getDeptTheses);
router.put('/:id/drc', protect, authorize('FACULTY'), drcApprove);
router.put('/:id/schedule-seminar', protect, authorize('FACULTY'), scheduleSeminar);
router.put('/:id/seminar', protect, authorize('FACULTY'), seminarClear);
router.put('/:id/final-approve', protect, authorize('FACULTY'), finalApprove);

// Shared (admin + faculty can view single thesis)
router.get('/:id', protect, getThesisById);

module.exports = router;
