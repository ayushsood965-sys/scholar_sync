const Thesis = require('../models/Thesis');
const Milestone = require('../models/Milestone');
const User = require('../models/User');

const augmentThesesWithMilestones = async (theses) => {
  const augmented = [];
  for (let thesis of theses) {
    const thesisObj = thesis.toObject();
    const synopsis = await Milestone.findOne({ thesisId: thesis._id, type: 'SYNOPSIS' });
    thesisObj.synopsisStatus = synopsis ? synopsis.status : null;
    
    const finalSub = await Milestone.findOne({ thesisId: thesis._id, type: 'FINAL_SUBMISSION' });
    thesisObj.finalSubStatus = finalSub ? finalSub.status : null;
    
    augmented.push(thesisObj);
  }
  return augmented;
};

// ── SCHOLAR ──────────────────────────────────────────────
// POST /api/thesis — Create thesis registration
const createThesis = async (req, res) => {
  try {
    const existing = await Thesis.findOne({ scholarId: req.user._id });
    if (existing) return res.status(400).json({ message: 'Thesis already registered' });

    const { department, title, enrollmentNumber, abstract } = req.body;
    const thesis = await Thesis.create({
      scholarId: req.user._id,
      department, title, enrollmentNumber, abstract,
      status: 'REGISTRATION_PENDING',
    });
    res.status(201).json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/thesis/me — Scholar fetches their thesis + milestones
const getMyThesis = async (req, res) => {
  try {
    const thesis = await Thesis.findOne({ scholarId: req.user._id })
      .populate('supervisorId', 'name username department subRole');
    if (!thesis) return res.status(404).json({ message: 'No thesis found' });

    const milestones = await Milestone.find({ thesisId: thesis._id }).sort('sequence createdAt');
    res.json({ thesis, milestones });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── ADMIN ──────────────────────────────────────────────
const getAllTheses = async (req, res) => {
  try {
    const { status, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    // HODs can only view theses in their own department
    if (req.user.role === 'HOD') {
      filter.department = req.user.department;
    }

    const theses = await Thesis.find(filter)
      .populate('scholarId', 'name username')
      .populate('supervisorId', 'name username')
      .sort('-createdAt');
    const augmented = await augmentThesesWithMilestones(theses);
    res.json(augmented);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/thesis/:id — Single thesis detail
const getThesisById = async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id)
      .populate('scholarId', 'name username email')
      .populate('supervisorId', 'name username subRole department');
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    // HOD department check
    if (req.user.role === 'HOD' && thesis.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized to view theses outside your department' });
    }

    const milestones = await Milestone.find({ thesisId: thesis._id }).sort('sequence createdAt');
    res.json({ thesis, milestones });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/thesis/:id/verify — Admin verifies enrollment → COURSEWORK
const verifyEnrollment = async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    // HOD department check
    if (req.user.role === 'HOD' && thesis.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized. This scholar belongs to another department.' });
    }

    thesis.enrollmentVerified = true;
    thesis.status = 'COURSEWORK';
    thesis.auditLog.push({ action: 'ENROLLMENT_VERIFIED', note: `Verified by HOD on ${new Date().toDateString()}` });
    await thesis.save();
    res.json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/thesis/:id/assign — Admin assigns supervisor
const assignSupervisor = async (req, res) => {
  try {
    const { supervisorId } = req.body;
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    // HOD department check
    if (req.user.role === 'HOD' && thesis.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized. This scholar belongs to another department.' });
    }

    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== 'FACULTY') {
      return res.status(400).json({ message: 'Invalid supervisor' });
    }

    thesis.supervisorId = supervisorId;
    thesis.auditLog.push({ action: 'SUPERVISOR_ASSIGNED', note: `Assigned ${supervisor.name}` });
    await thesis.save();
    res.json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/thesis/:id/coursework — Admin/Faculty clears coursework → SYNOPSIS_PENDING
const clearCoursework = async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    // If faculty, verify they are the assigned supervisor or the HOD of the same department
    if (req.user.role === 'FACULTY') {
      const isSupervisor = thesis.supervisorId && thesis.supervisorId.toString() === req.user._id.toString();
      const isHodInDept = (req.user.subRole === 'HOD' || req.user.role === 'HOD') && thesis.department === req.user.department;
      if (!isSupervisor && !isHodInDept) {
        return res.status(403).json({ message: 'Not authorized to clear coursework for this scholar' });
      }
    } else if (req.user.role === 'HOD' && thesis.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized. This scholar belongs to another department.' });
    }

    thesis.courseworkCompleted = true;
    thesis.status = 'SYNOPSIS_PENDING';
    thesis.auditLog.push({ 
      action: 'COURSEWORK_CLEARED', 
      note: `Coursework marked complete by ${req.user.role === 'HOD' ? 'HOD' : req.user.role === 'ADMIN' ? 'admin' : `${req.user.subRole || 'SUPERVISOR'} ${req.user.name}`}` 
    });
    await thesis.save();

    // Auto-create synopsis milestone
    const existingSynopsis = await Milestone.findOne({ thesisId: thesis._id, type: 'SYNOPSIS' });
    if (!existingSynopsis) {
      await Milestone.create({
        thesisId: thesis._id,
        type: 'SYNOPSIS',
        title: 'Research Synopsis',
        status: 'PENDING',
        sequence: 1,
      });
    }

    res.json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/thesis/:id/award — Admin awards degree
const awardDegree = async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    // HOD department check
    if (req.user.role === 'HOD' && thesis.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized. This scholar belongs to another department.' });
    }

    thesis.status = 'AWARDED';
    thesis.awardedAt = new Date();
    thesis.auditLog.push({ action: 'DEGREE_AWARDED', note: req.body.note || 'Degree awarded after successful viva' });
    await thesis.save();
    res.json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/thesis/:id/audit — Admin updates audit log
const updateAuditLog = async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    // HOD department check
    if (req.user.role === 'HOD' && thesis.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized. This scholar belongs to another department.' });
    }

    thesis.auditLog.push({ action: req.body.action, note: req.body.note });
    await thesis.save();
    res.json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── FACULTY ──────────────────────────────────────────────
// GET /api/thesis/assigned — Faculty fetches their assigned theses
const getAssignedTheses = async (req, res) => {
  try {
    const theses = await Thesis.find({ supervisorId: req.user._id })
      .populate('scholarId', 'name username')
      .sort('-updatedAt');
    const augmented = await augmentThesesWithMilestones(theses);
    res.json(augmented);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/thesis/dept — HOD fetches all theses in their department
const getDeptTheses = async (req, res) => {
  try {
    const theses = await Thesis.find({ department: req.user.department })
      .populate('scholarId', 'name username')
      .populate('supervisorId', 'name username')
      .sort('-updatedAt');
    const augmented = await augmentThesesWithMilestones(theses);
    res.json(augmented);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/thesis/:id/drc — HOD DRC approval → ACTIVE_RESEARCH
const drcApprove = async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    // HOD department check
    if (req.user.role === 'HOD' && thesis.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized. This scholar belongs to another department.' });
    }

    thesis.status = 'ACTIVE_RESEARCH';
    thesis.startDate = new Date();
    thesis.auditLog.push({ action: 'DRC_APPROVED', note: `DRC approved by HOD ${req.user.name}` });
    await thesis.save();

    // Auto-create first 6-month progress report milestone
    await Milestone.create({
      thesisId: thesis._id,
      type: 'PROGRESS_REPORT',
      title: '6-Month Progress Report #1',
      status: 'PENDING',
      sequence: 1,
      dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    });

    res.json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/thesis/:id/seminar — HOD seminar clearance → PRE_SUBMISSION
const seminarClear = async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    // HOD department check
    if (req.user.role === 'HOD' && thesis.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized. This scholar belongs to another department.' });
    }

    thesis.status = 'PRE_SUBMISSION';
    thesis.auditLog.push({ action: 'SEMINAR_CLEARED', note: `Pre-submission seminar cleared by HOD ${req.user.name}` });
    await thesis.save();

    // Auto-create pre-submission milestone
    await Milestone.create({
      thesisId: thesis._id,
      type: 'PRE_SUBMISSION',
      title: 'Pre-Submission Package (Publications + Plagiarism Report + Rough Draft)',
      status: 'PENDING',
      sequence: 99,
    });

    res.json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/thesis/:id/final-approve — Supervisor final digital approval → SUBMITTED
const finalApprove = async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    thesis.status = 'SUBMITTED';
    thesis.submittedAt = new Date();
    thesis.auditLog.push({ action: 'FINAL_APPROVED', note: `Final digital approval by supervisor ${req.user.name}` });
    await thesis.save();
    res.json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createThesis, getMyThesis, getAllTheses, getThesisById,
  verifyEnrollment, assignSupervisor, clearCoursework, awardDegree, updateAuditLog,
  getAssignedTheses, getDeptTheses, drcApprove, seminarClear, finalApprove,
};
