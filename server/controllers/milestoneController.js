const Milestone = require('../models/Milestone');
const Thesis = require('../models/Thesis');
const RACReview = require('../models/RACReview');
const { createNotification } = require('./notificationController');

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

    if (thesis.supervisorId) {
      await createNotification({
        recipient: thesis.supervisorId,
        title: '⏳ Milestone Review Pending',
        message: `Scholar "${req.user.name}" has uploaded a document for milestone "${milestone.title}". Action needed: Please review and record your grade.`,
        type: 'PENDING_ACTION',
        link: 'overview'
      });
    }

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
    const thesis = await Thesis.findById(milestone.thesisId);
    if (thesis) {
      if (milestone.status === 'APPROVED') {
        await createNotification({
          recipient: thesis.scholarId,
          title: '🎉 Milestone Approved!',
          message: `Your supervisor "${req.user.name}" has APPROVED your submission for milestone "${milestone.title}".`,
          type: 'SUCCESSFUL_ACTION',
          link: 'overview'
        });
      } else {
        await createNotification({
          recipient: thesis.scholarId,
          title: '⚠️ Milestone Revision Required',
          message: `Your supervisor "${req.user.name}" has requested corrections for milestone "${milestone.title}". Feedback: "${comment || 'Please check supervisor comments.'}"`,
          type: 'PENDING_ACTION',
          link: 'overview'
        });
      }

      // Log the supervisor text feedback into the RACReview collection (Step 2)
      const racReview = new RACReview({
        scholarId: thesis.scholarId,
        thesisId: thesis._id,
        milestoneId: milestone._id,
        reviewerId: req.user._id,
        comments: comment || (action === 'APPROVE' ? 'Approved' : 'Revision Required'),
        status: action === 'APPROVE' ? 'SATISFACTORY' : 'UNSATISFACTORY',
        remarks: comment || '',
        racNumber: 1,
        scheduledDate: new Date()
      });
      await racReview.save();
    }

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

    const thesis = await Thesis.findById(thesisId);
    if (thesis) {
      await createNotification({
        recipient: thesis.scholarId,
        title: '🚀 New Deliverable Assigned',
        message: `A new milestone has been created for your Ph.D. track: "${title}". Due Date: ${dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'}.`,
        type: 'INFO',
        link: 'overview'
      });
    }

    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/milestones/defaulters — Admin fetches scholars whose progress reports are overdue (Step 5)
const getDefaulters = async (req, res) => {
  try {
    const overdueReports = await Milestone.find({
      type: '6_MONTH_REPORT',
      dueDate: { $lt: new Date() },
      status: 'PENDING'
    }).populate({
      path: 'thesisId',
      populate: { path: 'scholarId' }
    });

    const formatted = overdueReports.map(m => {
      const thesis = m.thesisId;
      const scholar = thesis?.scholarId;
      return {
        _id: m._id,
        milestoneTitle: m.title,
        dueDate: m.dueDate,
        status: m.status,
        scholarName: scholar ? scholar.name : 'Unknown Scholar',
        scholarDepartment: thesis ? thesis.department : 'N/A',
        enrollmentNumber: thesis ? thesis.enrollmentNumber : 'N/A'
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMilestones,
  submitDocument,
  reviewMilestone,
  createMilestone,
  getDefaulters
};
