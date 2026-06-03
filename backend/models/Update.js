const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Election', 'Result', 'Water Dispute', 'Electricity', 'Other'],
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  villageId: {
    type: String,
    required: true,
    index: true,
  },
  createdAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Update = mongoose.model('Update', updateSchema);

module.exports = Update;
