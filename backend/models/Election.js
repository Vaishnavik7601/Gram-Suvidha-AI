const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  villageId: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

// Ensure one election config per village per year
electionSchema.index({ villageId: 1, year: 1 }, { unique: true });

const Election = mongoose.model('Election', electionSchema);

module.exports = Election;
