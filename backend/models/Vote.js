const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  villageId: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

// Enforce one vote per citizen, per village, per year
voteSchema.index({ citizenId: 1, villageId: 1, year: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
