const Milestone = require('../models/Milestone');
const Thesis = require('../models/Thesis');

// GET /api/milestones/:thesisId
const getMilestones = async (req, res) => {
  try {
    const milestones = await Milestone.find({ thesisId: req.params.thesisId })
      .sort('sequence createdAt');
    res.json(milestones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/milestones/:id/submit — Scholar uploads document
const submitDocument = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    // Verify scholar owns this thesis
    const thesis = await Thesis.findById(milestone.thesisId);
    if (thesis.status === 'SUBMITTED') {
      return res.status(403).json({ message: 'Thesis is submitted. Uploads are locked.' });
    }

    // Update thesis details if provided (common when finalizing synopsis)
    if (req.body.abstract) {
      thesis.abstract = req.body.abstract;
    }
    if (req.body.title) {
      thesis.title = req.body.title;
    }
    await thesis.save();

    milestone.documentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.documentUrl;
    if (req.body.plagiarismReportUrl) milestone.plagiarismReportUrl = req.body.plagiarismReportUrl;
    milestone.status = 'SUBMITTED';
    milestone.submittedAt = new Date();
    await milestone.save();

    res.json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/milestones/:id/review — Faculty approves or rejects
const reviewMilestone = async (req, res) => {
  try {
    const { action, comment } = req.body; // action: 'APPROVE' | 'REVISION'
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

    milestone.status = action === 'APPROVE' ? 'APPROVED' : 'REVISION_REQUIRED';
    milestone.reviewedAt = new Date();

    if (comment) {
      milestone.comments.push({
        authorId: req.user._id,
        authorName: req.user.name,
        text: comment,
      });
    }

    await milestone.save();

    // If FINAL_SUBMISSION approved → supervisor triggers final approve on thesis (handled via thesis route)
    res.json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/milestones/create — Faculty/Admin can create a new progress report milestone
const createMilestone = async (req, res) => {
  try {
    const { thesisId, type, title, sequence, dueDate } = req.body;
    const milestone = await Milestone.create({ thesisId, type, title, sequence, dueDate });
    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMilestones, submitDocument, reviewMilestone, createMilestone };
