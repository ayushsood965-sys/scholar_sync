const mongoose = require('mongoose');

const PublicationSchema = new mongoose.Schema({
  scholarId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  thesisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thesis', required: true },
  title: { type: String, required: true },
  journalName: { type: String, required: true },
  issn: { type: String },
  publicationDate: { type: Date, required: true },
  paperLink: { type: String },
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
  attachmentUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Publication', PublicationSchema);
