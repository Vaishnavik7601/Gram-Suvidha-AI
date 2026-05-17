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

module.exports = router;
