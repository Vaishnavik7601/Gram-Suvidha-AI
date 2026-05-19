const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// @route   GET /api/complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate('user', 'name email phone gender village');
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/complaints
router.post('/', async (req, res) => {
  try {
    const { user, category, description, location } = req.body;
    const complaint = await Complaint.create({
      user, category, description, location,
    });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint status and assigned worker
router.put('/:id', async (req, res) => {
  try {
    const { status, assigned } = req.body;
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (assigned !== undefined) updateData.assigned = assigned;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate('user', 'name email phone gender village');

    if (!updatedComplaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
