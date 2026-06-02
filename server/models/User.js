const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['STUDENT', 'FACULTY', 'HOD', 'ADMIN', 'SUPER_ADMIN'],
      default: 'STUDENT',
      required: true,
    },
    subRole: {
      type: String,
      enum: ['SUPERVISOR', 'HOD', null],
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    profile: {
      phoneNumber: { type: String, default: '' },
      address: { type: String, default: '' },
      academicBackground: { type: String, default: '' },
      areaOfInterest: { type: String, default: '' },
      designation: { type: String, default: '' },
      specialization: { type: String, default: '' },
      officeRoom: { type: String, default: '' },
      yearsOfService: { type: Number, default: 0 },
      additionalResponsibilities: { type: String, default: '' },
      dob: { type: String, default: '' },
      gender: { type: String, default: '' },
      category: { type: String, default: '' },
      fatherName: { type: String, default: '' },
      motherName: { type: String, default: '' },
      nationality: { type: String, default: '' },
      admissionDate: { type: String, default: '' },
      enrollmentNumber: { type: String, default: '' },
      phdMode: { type: String, default: '' },
      preferredGuideId: { type: String, default: '' },
      thesisTitle: { type: String, default: '' },
      thesisSummary: { type: String, default: '' },
      thesisKeywords: { type: String, default: '' },
      qualifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
