const mongoose = require('mongoose');

const RACReviewSchema = new mongoose.Schema({
  scholarId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  thesisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thesis', required: true },
  racNumber: { type: Number, required: true }, // 1 to 6
  scheduledDate: { type: Date, required: true },
  committeeMembers: { type: String, default: '' },
  progressReportUrl: { type: String },
  status: { type: String, enum: ['SCHEDULED', 'SATISFACTORY', 'UNSATISFACTORY'], default: 'SCHEDULED' },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('RACReview', RACReviewSchema);
