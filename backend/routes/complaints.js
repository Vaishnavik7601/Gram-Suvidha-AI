const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/complaints
// @desc    Get complaints - admins see only their village's complaints
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'admin') {
      if (!req.user.villageId) {
        return res.status(403).json({ message: 'Admin account is not linked to any village.' });
      }
      query.villageId = req.user.villageId;
    } else if (req.user.role === 'citizen') {
      // Citizens see only their own complaints
      query.user = req.user._id;
    }

    const complaints = await Complaint.find(query)
      .populate('user', 'name email phone gender village villageId')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/complaints
// @desc    Register a complaint - only if citizen belongs to same village as an admin
router.post('/', protect, async (req, res) => {
  try {
    const { category, description, location, priority } = req.body;

    console.log('Incoming complaint create request body:', req.body);

    // Basic validation
    if (!category || !description || !location) {
      return res.status(400).json({ message: 'Missing required fields', error: 'category, description and location are required' });
    }

    // Village isolation: citizen must have a villageId
    const citizenVillageId = req.user.villageId;
    if (!citizenVillageId) {
      return res.status(403).json({ message: 'Invalid Citizen: Your account is not linked to any village. Please update your profile.' });
    }

    // Check that an admin exists for the citizen's village
    const adminForVillage = await User.findOne({ role: 'admin', villageId: citizenVillageId });
    if (!adminForVillage) {
      return res.status(403).json({ message: 'Invalid Citizen: No administrator found for your village. Please contact support.' });
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      category,
      description,
      location,
      priority: priority || 'Medium',
      villageId: citizenVillageId,
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Error creating complaint:', error.stack || error.message);
    if (error && error.code === 11000) {
      return res.status(409).json({ message: 'Duplicate key error', error: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint status and assigned worker (admin only, same village)
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, assigned } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Village isolation check for admin
    if (req.user.role === 'admin' && complaint.villageId && req.user.villageId !== complaint.villageId) {
      return res.status(403).json({ message: 'Access denied: This complaint does not belong to your village.' });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (assigned !== undefined) updateData.assigned = assigned;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate('user', 'name email phone gender village villageId');

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
