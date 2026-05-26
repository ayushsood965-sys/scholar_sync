const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMilestones, submitDocument, reviewMilestone, createMilestone } = require('../controllers/milestoneController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/:thesisId', protect, getMilestones);
router.post('/create', protect, createMilestone);
router.post('/:id/submit', protect, upload.single('document'), submitDocument);
router.put('/:id/review', protect, reviewMilestone);

module.exports = router;
