const express = require('express');
const router = express.Router();
const Update = require('../models/Update');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/updates
// @desc    Get all updates for user's village
// @access  Private (Citizen, Worker, Admin)
router.get('/', protect, async (req, res) => {
  try {
    const villageId = req.user.villageId;
    if (!villageId) {
      return res.status(400).json({ message: 'User is not associated with any village.' });
    }

    const updates = await Update.find({ villageId })
      .populate('createdAdmin', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/updates
// @desc    Create a village update
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Administrators only.' });
    }

    const { title, category, description, date } = req.body;
    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Title, category, and description are required.' });
    }

    const villageId = req.user.villageId;
    if (!villageId) {
      return res.status(400).json({ message: 'Admin account has no village ID configured.' });
    }

    const update = await Update.create({
      title,
      category,
      description,
      date: date || new Date(),
      villageId,
      createdAdmin: req.user._id,
    });

    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/updates/:id
// @desc    Edit a village update
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Administrators only.' });
    }

    const update = await Update.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ message: 'Update announcement not found.' });
    }

    if (update.villageId !== req.user.villageId) {
      return res.status(403).json({ message: 'Access denied: Announcement belongs to another village.' });
    }

    const { title, category, description, date } = req.body;
    if (title !== undefined) update.title = title;
    if (category !== undefined) update.category = category;
    if (description !== undefined) update.description = description;
    if (date !== undefined) update.date = date;

    await update.save();
    res.json(update);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   DELETE /api/updates/:id
// @desc    Delete a village update
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Administrators only.' });
    }

    const update = await Update.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ message: 'Update announcement not found.' });
    }

    if (update.villageId !== req.user.villageId) {
      return res.status(403).json({ message: 'Access denied: Announcement belongs to another village.' });
    }

    await update.deleteOne();
    res.json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
