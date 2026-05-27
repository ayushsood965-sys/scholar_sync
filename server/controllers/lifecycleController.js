const Thesis = require('../models/Thesis');
const User = require('../models/User');
const Publication = require('../models/Publication');
const ChangeRequest = require('../models/ChangeRequest');
const RACReview = require('../models/RACReview');
const DRCMeeting = require('../models/DRCMeeting');
const Milestone = require('../models/Milestone');

// ── RAC MEETINGS ──
const scheduleRAC = async (req, res) => {
  try {
    const { thesisId, racNumber, scheduledDate, committeeMembers } = req.body;
    const thesis = await Thesis.findById(thesisId);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    const newRAC = new RACReview({
      scholarId: thesis.scholarId,
      thesisId,
      racNumber,
      scheduledDate,
      committeeMembers,
      status: 'SCHEDULED'
    });

    await newRAC.save();

    // Log to thesis audit
    thesis.auditLog.push({
      action: 'RAC_SCHEDULED',
      note: `RAC-${racNumber} scheduled for ${new Date(scheduledDate).toDateString()}`
    });
    await thesis.save();

    res.status(201).json(newRAC);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const uploadRACReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { progressReportUrl } = req.body;
    const rac = await RACReview.findById(id);
    if (!rac) return res.status(404).json({ message: 'RAC meeting not found' });

    rac.progressReportUrl = progressReportUrl;
    await rac.save();

    res.json(rac);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const submitRACResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const rac = await RACReview.findById(id);
    if (!rac) return res.status(404).json({ message: 'RAC meeting not found' });

    rac.status = status;
    rac.remarks = remarks;
    await rac.save();

    // Log to thesis audit
    const thesis = await Thesis.findById(rac.thesisId);
    if (thesis) {
      thesis.auditLog.push({
        action: 'RAC_REVIEWED',
        note: `RAC-${rac.racNumber} marked ${status}. Remarks: ${remarks}`
      });
      await thesis.save();
    }

    res.json(rac);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRACs = async (req, res) => {
  try {
    const { thesisId } = req.params;
    const racs = await RACReview.find({ thesisId }).sort('racNumber');
    res.json(racs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── CHANGE REQUESTS ──
const submitChangeRequest = async (req, res) => {
  try {
    const { thesisId, type, proposedValue, reason } = req.body;
    const thesis = await Thesis.findById(thesisId);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    let currentValue = '';
    if (type === 'TITLE_CHANGE') {
      currentValue = thesis.title;
    } else if (type === 'GUIDE_CHANGE') {
      const supervisor = await User.findById(thesis.supervisorId);
      currentValue = supervisor ? supervisor.name : 'None';
    }

    const newRequest = new ChangeRequest({
      scholarId: thesis.scholarId,
      thesisId,
      type,
      currentValue,
      proposedValue,
      reason,
      status: 'PENDING'
    });

    await newRequest.save();

    thesis.auditLog.push({
      action: 'CHANGE_REQUESTED',
      note: `Requested ${type.replace('_', ' ')}: ${proposedValue}`
    });
    await thesis.save();

    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const reviewChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // 'APPROVED' or 'REJECTED'
    const request = await ChangeRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Change request not found' });

    request.status = status;
    request.remarks = remarks;
    await request.save();

    const thesis = await Thesis.findById(request.thesisId);
    if (thesis) {
      if (status === 'APPROVED') {
        if (request.type === 'TITLE_CHANGE') {
          thesis.title = request.proposedValue;
        } else if (request.type === 'GUIDE_CHANGE') {
          thesis.supervisorId = request.proposedValue;
        }
      }
      thesis.auditLog.push({
        action: 'CHANGE_RESOLVED',
        note: `Change request for ${request.type.replace('_', ' ')} was ${status}. Remarks: ${remarks}`
      });
      await thesis.save();
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getChangeRequests = async (req, res) => {
  try {
    const { thesisId } = req.params;
    const requests = await ChangeRequest.find({ thesisId }).sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDeptChangeRequests = async (req, res) => {
  try {
    const { department } = req.params;
    // Find all theses in dept
    const theses = await Thesis.find({ department });
    const thesisIds = theses.map(t => t._id);
    const requests = await ChangeRequest.find({ thesisId: { $in: thesisIds } }).populate('scholarId').sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUBLICATIONS ──
const submitPublication = async (req, res) => {
  try {
    const { thesisId, title, journalName, issn, publicationDate, paperLink, attachmentUrl } = req.body;
    const thesis = await Thesis.findById(thesisId);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    const newPub = new Publication({
      scholarId: thesis.scholarId,
      thesisId,
      title,
      journalName,
      issn,
      publicationDate,
      paperLink,
      attachmentUrl
    });

    await newPub.save();

    thesis.auditLog.push({
      action: 'PUBLICATION_SUBMITTED',
      note: `Logged publication: "${title}" in ${journalName}`
    });
    await thesis.save();

    res.status(201).json(newPub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyPublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'VERIFIED' or 'REJECTED'
    const pub = await Publication.findById(id);
    if (!pub) return res.status(404).json({ message: 'Publication not found' });

    pub.status = status;
    await pub.save();

    const thesis = await Thesis.findById(pub.thesisId);
    if (thesis) {
      thesis.auditLog.push({
        action: 'PUBLICATION_VERIFIED',
        note: `Publication "${pub.title}" marked ${status}`
      });
      await thesis.save();
    }

    res.json(pub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPublications = async (req, res) => {
  try {
    const { thesisId } = req.params;
    const pubs = await Publication.find({ thesisId }).sort('-publicationDate');
    res.json(pubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDeptPublications = async (req, res) => {
  try {
    const { department } = req.params;
    const theses = await Thesis.find({ department });
    const thesisIds = theses.map(t => t._id);
    const pubs = await Publication.find({ thesisId: { $in: thesisIds } }).populate('scholarId').sort('-createdAt');
    res.json(pubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PREMIUM PRINTABLE DYNAMIC CERTIFICATES ──
const generateCertificate = async (req, res) => {
  try {
    const { thesisId, type } = req.params;
    const thesis = await Thesis.findById(thesisId);
    if (!thesis) return res.status(404).send('Thesis record not found');

    const scholar = await User.findById(thesis.scholarId);
    const supervisor = await User.findById(thesis.supervisorId);

    let titleText = '';
    let bodyText = '';
    let extraTable = '';

    if (type === 'REGISTRATION') {
      titleText = 'Certificate of PhD Registration';
      bodyText = `This is to certify that Mr./Ms. <strong>${scholar?.name || 'Academic Scholar'}</strong> has been officially registered as a Doctor of Philosophy (Ph.D.) candidate in the department of <strong>${thesis.department}</strong> on this date <strong>${new Date(thesis.createdAt).toLocaleDateString()}</strong> under the enrollment ID <strong>${thesis.enrollmentNo || 'PENDING'}</strong>.<br/><br/>The registered thesis research topic has been approved as: <i>"${thesis.title}"</i>.`;
    } else if (type === 'COURSEWORK') {
      titleText = 'Certificate of Course Work Completion';
      bodyText = `This is to certify that <strong>${scholar?.name || 'Academic Scholar'}</strong> has successfully satisfied all academic course work requirements of the Doctor of Philosophy degree program in <strong>${thesis.department}</strong> as verified on <strong>${new Date().toLocaleDateString()}</strong>. The candidate completed all core and elective subjects under the assigned supervisor <strong>Prof. ${supervisor?.name || 'Academic Guide'}</strong>.`;
    } else if (type === 'PUBLICATIONS') {
      titleText = 'Certificate of Research Publications';
      const pubs = await Publication.find({ thesisId, status: 'VERIFIED' });
      bodyText = `This document certifies that <strong>${scholar?.name || 'Academic Scholar'}</strong> has actively contributed to the scientific community and successfully logged the following verified peer-reviewed publications as part of their PhD journey:`;
      if (pubs.length > 0) {
        extraTable = `
          <table style="width:100%; border-collapse: collapse; margin-top:20px; font-family:'Outfit',sans-serif; font-size:0.9rem;">
            <thead>
              <tr style="background:#f1f5f9; color:#0f172a; text-align:left;">
                <th style="padding:10px; border:1px solid #cbd5e1;">Paper Title</th>
                <th style="padding:10px; border:1px solid #cbd5e1;">Journal Name</th>
                <th style="padding:10px; border:1px solid #cbd5e1;">ISSN</th>
                <th style="padding:10px; border:1px solid #cbd5e1;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${pubs.map(p => `
                <tr>
                  <td style="padding:10px; border:1px solid #cbd5e1; font-weight:600;">${p.title}</td>
                  <td style="padding:10px; border:1px solid #cbd5e1;">${p.journalName}</td>
                  <td style="padding:10px; border:1px solid #cbd5e1;">${p.issn || '—'}</td>
                  <td style="padding:10px; border:1px solid #cbd5e1;">${new Date(p.publicationDate).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else {
        extraTable = `<div style="text-align:center; padding:20px; color:#64748b; font-style:italic;">No verified publications logged yet.</div>`;
      }
    } else if (type === 'RAC') {
      titleText = 'Research Progress & RAC Verification';
      const racs = await RACReview.find({ thesisId, status: 'SATISFACTORY' });
      bodyText = `This is to certify that the Research Advisory Committee (RAC) has reviewed the ongoing doctoral work of <strong>${scholar?.name || 'Academic Scholar'}</strong>. The candidate has presented satisfactory progress reports across the required assessment sessions.`;
      if (racs.length > 0) {
        extraTable = `
          <div style="margin-top:20px; font-weight:600; color:#0f172a; text-align:center;">
            Verified RAC Clearances: 
            ${racs.map(r => `<span style="display:inline-block; background:#d1fae5; color:#065f46; padding:4px 12px; margin:4px; border-radius:12px; font-size:0.8rem;">RAC-${r.racNumber} Satisfactory</span>`).join('')}
          </div>
        `;
      }
    } else {
      return res.status(400).send('Invalid certificate type');
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${titleText}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
          <style>
            body {
              background: #f8fafc;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: 'Outfit', sans-serif;
              min-height: 100vh;
            }
            .certificate-container {
              background: white;
              border: 16px double #d97706;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
              width: 800px;
              padding: 60px;
              position: relative;
              border-radius: 4px;
            }
            .certificate-header {
              text-align: center;
              margin-bottom: 30px;
            }
            .university-title {
              font-family: 'Cinzel', serif;
              font-size: 2.2rem;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 5px 0;
              letter-spacing: 2px;
            }
            .university-subtitle {
              color: #d97706;
              font-size: 0.95rem;
              text-transform: uppercase;
              letter-spacing: 3px;
              font-weight: 800;
              margin: 0;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.04;
              pointer-events: none;
              width: 320px;
            }
            .certificate-divider {
              height: 2px;
              background: linear-gradient(to right, transparent, #d97706, transparent);
              margin: 20px auto;
              width: 80%;
            }
            .certificate-title {
              font-family: 'Cinzel', serif;
              color: #1e3a8a;
              font-size: 1.6rem;
              text-align: center;
              font-weight: 800;
              margin-top: 10px;
              margin-bottom: 25px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .certificate-body {
              color: #334155;
              font-size: 1.05rem;
              line-height: 1.8;
              text-align: center;
              margin-bottom: 40px;
              padding: 0 20px;
            }
            .certificate-footer {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              border-top: 1px dashed #cbd5e1;
              padding-top: 20px;
            }
            .signature-box {
              text-align: center;
              width: 220px;
            }
            .signature-line {
              height: 1px;
              background: #64748b;
              margin-bottom: 10px;
            }
            .signature-title {
              font-size: 0.8rem;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .gold-seal {
              position: absolute;
              bottom: 40px;
              left: 50%;
              transform: translateX(-50%);
              width: 80px;
              height: 80px;
            }
            @media print {
              body { background: white; padding: 0; }
              .certificate-container { border: 16px double #d97706; box-shadow: none; width: 100%; box-sizing: border-box; }
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <svg class="watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <circle cx="12" cy="11" r="3"/>
              <path d="m9 17 3-3 3 3"/>
            </svg>
            <div class="certificate-header">
              <h1 class="university-title">ScholarSync</h1>
              <p class="university-subtitle">Doctoral Research Board of Excellence</p>
              <div class="certificate-divider"></div>
            </div>
            
            <h2 class="certificate-title">${titleText}</h2>
            
            <div class="certificate-body">
              ${bodyText}
              ${extraTable}
            </div>
            
            <div class="certificate-footer">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-title">Research Supervisor</div>
              </div>
              <div class="signature-box" style="visibility:${thesis.enrollmentVerified ? 'visible' : 'hidden'}">
                <div style="font-family:'Cinzel',serif; color:#d97706; font-size:0.9rem; font-weight:800; margin-bottom:5px;">VERIFIED</div>
                <div class="signature-line"></div>
                <div class="signature-title">Head of Department</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              // Auto trigger print dialogue for user convenience
              // window.print();
            }
          </script>
        </body>
      </html>
    `;

    res.send(htmlContent);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// ── DRC MEETINGS ──
const scheduleDRC = async (req, res) => {
  try {
    const { thesisId, scheduledDate, scheduledTime, venue, committeeMembers, agenda } = req.body;
    const thesis = await Thesis.findById(thesisId);
    if (!thesis) return res.status(404).json({ message: 'Thesis not found' });

    const newDRC = new DRCMeeting({
      scholarId: thesis.scholarId,
      thesisId,
      scheduledDate,
      scheduledTime,
      venue,
      committeeMembers,
      agenda,
      status: 'SCHEDULED'
    });

    await newDRC.save();

    // Log to thesis audit
    thesis.auditLog.push({
      action: 'DRC_SCHEDULED',
      note: `DRC meeting scheduled for ${new Date(scheduledDate).toDateString()} at ${scheduledTime} in ${venue}`
    });
    await thesis.save();

    res.status(201).json(newDRC);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const submitDRCResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // 'APPROVED' or 'REVISION_REQUIRED'
    const drc = await DRCMeeting.findById(id);
    if (!drc) return res.status(404).json({ message: 'DRC meeting not found' });

    drc.status = status;
    drc.remarks = remarks;
    await drc.save();

    // Log to thesis audit and perform status transitions
    const thesis = await Thesis.findById(drc.thesisId);
    if (thesis) {
      if (status === 'APPROVED') {
        thesis.status = 'ACTIVE_RESEARCH';
        thesis.startDate = new Date();
        thesis.auditLog.push({
          action: 'DRC_APPROVED',
          note: `DRC approved. Remarks: ${remarks}`
        });
        await thesis.save();

        // Update synopsis milestone to APPROVED
        const synopsis = await Milestone.findOne({ thesisId: thesis._id, type: 'SYNOPSIS' });
        if (synopsis) {
          synopsis.status = 'APPROVED';
          await synopsis.save();
        }

        // Auto-create first 6-month progress report milestone
        const existingReport = await Milestone.findOne({ thesisId: thesis._id, type: 'PROGRESS_REPORT' });
        if (!existingReport) {
          await Milestone.create({
            thesisId: thesis._id,
            type: 'PROGRESS_REPORT',
            title: '6-Month Progress Report #1',
            status: 'PENDING',
            sequence: 1,
            dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          });
        }
      } else {
        thesis.auditLog.push({
          action: 'DRC_REVISION_REQUIRED',
          note: `DRC marked Revision Required. Remarks: ${remarks}`
        });
        await thesis.save();

        // Update synopsis milestone back to REVISION_REQUIRED
        const synopsis = await Milestone.findOne({ thesisId: thesis._id, type: 'SYNOPSIS' });
        if (synopsis) {
          synopsis.status = 'REVISION_REQUIRED';
          await synopsis.save();
        }
      }
    }

    res.json(drc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDRCMeetings = async (req, res) => {
  try {
    const { thesisId } = req.params;
    const drcMeetings = await DRCMeeting.find({ thesisId }).sort('-createdAt');
    res.json(drcMeetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  scheduleRAC,
  uploadRACReport,
  submitRACResult,
  getRACs,
  submitChangeRequest,
  reviewChangeRequest,
  getChangeRequests,
  getDeptChangeRequests,
  submitPublication,
  verifyPublication,
  getPublications,
  getDeptPublications,
  generateCertificate,
  scheduleDRC,
  submitDRCResult,
  getDRCMeetings
};
