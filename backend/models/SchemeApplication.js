const mongoose = require('mongoose');

const schemeApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
  },
  schemeName: {
    type: String,
    required: true,
  },
  applicantName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
  },
  idProofPath: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Application Submitted', 'Approved', 'Rejected', 'Too Late', 'In Progress'],
    default: 'Pending',
  },
  relationship: {
    type: String,
    enum: ['Self', 'Father', 'Mother', 'Spouse', 'Sibling', 'Daughter', 'Son'],
    default: 'Self',
  },
  availableFrom: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  villageId: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const SchemeApplication = mongoose.model('SchemeApplication', schemeApplicationSchema);

module.exports = SchemeApplication;
