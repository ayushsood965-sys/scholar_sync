const Meeting = require('../models/Meeting');
const Thesis = require('../models/Thesis');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// POST /api/meetings — Student requests a meeting
const requestMeeting = async (req, res) => {
  try {
    const { date, time, reason, attendees } = req.body;
    if (!date || !time || !reason) {
      return res.status(400).json({ message: 'Meeting date, time, and reason are required' });
    }

    // Find student's thesis
    const thesis = await Thesis.findOne({ scholarId: req.user._id });
    if (!thesis) return res.status(404).json({ message: 'Thesis context not found for this scholar.' });

    const newMeeting = await Meeting.create({
      scholarId: req.user._id,
      thesisId: thesis._id,
      date: new Date(date),
      time,
      reason,
      attendees: attendees || [],
      department: thesis.department,
      status: 'PENDING'
    });

    // Notify HOD
    const hod = await User.findOne({ department: thesis.department, role: 'HOD' });
    if (hod) {
      await createNotification({
        recipient: hod._id,
        title: '⏳ New Meeting Request Approval Pending',
        message: `Scholar "${req.user.name}" has requested a meeting on ${new Date(date).toLocaleDateString()} at ${time} and is awaiting your approval.`,
        type: 'PENDING_ACTION',
        link: 'meetings'
      });
    }

    res.status(201).json(newMeeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/meetings/me — Student fetches their own requested meetings
const getMyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ scholarId: req.user._id })
      .populate('attendees', 'name email username role subRole')
      .sort({ createdAt: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/meetings/dept — HOD fetches department meeting requests
const getDeptMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ department: req.user.department })
      .populate('scholarId', 'name email username profile')
      .populate('attendees', 'name email username role subRole')
      .sort({ createdAt: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/meetings/faculty — Faculty fetches meetings where they are in invite list
const getFacultyMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ 
      attendees: req.user._id, 
      status: 'APPROVED' 
    })
      .populate('scholarId', 'name email username profile')
      .populate('attendees', 'name email username role subRole')
      .sort({ createdAt: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/meetings/:id/respond — HOD approves/rejects meeting
const respondMeeting = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (APPROVED/REJECTED)' });
    }

    const meeting = await Meeting.findById(req.params.id)
      .populate('scholarId', 'name')
      .populate('attendees', 'name');
    if (!meeting) return res.status(404).json({ message: 'Meeting request not found.' });

    // HOD department check
    if (req.user.role === 'HOD' && meeting.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized. This meeting request belongs to another department.' });
    }

    meeting.status = status;
    meeting.remarks = remarks || '';
    await meeting.save();

    // 1. Notify Student
    await createNotification({
      recipient: meeting.scholarId._id,
      title: status === 'APPROVED' ? '✅ Meeting Request Approved!' : '❌ Meeting Request Rejected',
      message: status === 'APPROVED'
        ? `Your requested meeting on ${new Date(meeting.date).toLocaleDateString()} at ${meeting.time} has been APPROVED by the HOD.`
        : `Your requested meeting on ${new Date(meeting.date).toLocaleDateString()} at ${meeting.time} has been rejected: "${remarks || 'No remarks'}"`,
      type: status === 'APPROVED' ? 'SUCCESSFUL_ACTION' : 'PENDING_ACTION',
      link: 'meetings'
    });

    // 2. Notify all Attendees (if APPROVED)
    if (status === 'APPROVED') {
      await Promise.all(meeting.attendees.map(async (faculty) => {
        await createNotification({
          recipient: faculty._id,
          title: '📅 New Approved Meeting Invite',
          message: `Scholar "${meeting.scholarId.name}" has scheduled a meeting on ${new Date(meeting.date).toLocaleDateString()} at ${meeting.time}. Reason: "${meeting.reason}". You are invited to attend.`,
          type: 'INFO',
          link: 'meetings'
        });
      }));
    }

    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  requestMeeting,
  getMyMeetings,
  getDeptMeetings,
  getFacultyMeetings,
  respondMeeting
};
