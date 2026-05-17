const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending',
  },
  location: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
