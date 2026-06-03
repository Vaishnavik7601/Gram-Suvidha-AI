const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/elections/config
// @desc    Get current year's election configuration for user's village
// @access  Private (Citizen, Worker, Admin)
router.get('/config', protect, async (req, res) => {
  try {
    const villageId = req.user.villageId;
    if (!villageId) {
      return res.status(400).json({ message: 'User is not associated with any village.' });
    }

    const year = req.query.year || new Date().getFullYear();
    const config = await Election.findOne({ villageId, year });

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/elections/config
// @desc    Configure/schedule election dates for current year
// @access  Private (Admin only)
router.post('/config', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Administrators only.' });
    }

    const { startDate, endDate, year: targetYear } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and End date are required.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ message: 'Start date cannot be after End date.' });
    }

    const villageId = req.user.villageId;
    if (!villageId) {
      return res.status(400).json({ message: 'Admin account has no village ID configured.' });
    }

    const year = targetYear || new Date().getFullYear();

    // Check if configuration already exists, update it, otherwise create new
    let config = await Election.findOne({ villageId, year });
    if (config) {
      config.startDate = start;
      config.endDate = end;
      await config.save();
    } else {
      config = await Election.create({
        villageId,
        year,
        startDate: start,
        endDate: end,
      });
    }

    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/elections/admins
// @desc    Get all candidate administrators in user's village
// @access  Private (Citizen, Worker, Admin)
router.get('/admins', protect, async (req, res) => {
  try {
    const villageId = req.user.villageId;
    if (!villageId) {
      return res.status(400).json({ message: 'User is not associated with any village.' });
    }

    const admins = await User.find({ role: 'admin', villageId })
      .select('name email phone profilePhoto status');

    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/elections/vote
// @desc    Cast a vote for a village administrator
// @access  Private (Citizen only)
router.post('/vote', protect, async (req, res) => {
  try {
    if (req.user.role !== 'citizen') {
      return res.status(403).json({ message: 'Access denied: Only citizens can vote.' });
    }

    const { adminId } = req.body;
    if (!adminId) {
      return res.status(400).json({ message: 'Administrator ID is required.' });
    }

    const villageId = req.user.villageId;
    if (!villageId) {
      return res.status(403).json({ message: 'Your account is not linked to any village.' });
    }

    const year = new Date().getFullYear();

    // 1. Check if election configuration exists for this year
    const electionConfig = await Election.findOne({ villageId, year });
    if (!electionConfig) {
      return res.status(400).json({ message: 'Elections are not configured for this year.' });
    }

    // 2. Check if current date is within the voting window
    const now = new Date();
    if (now < new Date(electionConfig.startDate) || now > new Date(electionConfig.endDate)) {
      return res.status(400).json({ message: 'Voting is currently disabled. The election period is inactive.' });
    }

    // 3. Check if citizen has already voted in this village for this year
    const existingVote = await Vote.findOne({ citizenId: req.user._id, villageId, year });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this year\'s election.' });
    }

    // 4. Validate that candidate is an admin in the same village
    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== 'admin' || adminUser.villageId !== villageId) {
      return res.status(400).json({ message: 'Invalid administrator selected for voting.' });
    }

    // 5. Cast the vote
    const vote = await Vote.create({
      citizenId: req.user._id,
      adminId,
      villageId,
      year,
    });

    res.status(201).json({ message: 'Vote cast successfully!', vote });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/elections/results
// @desc    Get election results (vote counts per admin) for user's village
// @access  Private (Citizen, Worker, Admin)
router.get('/results', protect, async (req, res) => {
  try {
    const villageId = req.user.villageId;
    if (!villageId) {
      return res.status(400).json({ message: 'User is not associated with any village.' });
    }

    const year = req.query.year || new Date().getFullYear();

    // Find all admins in this village
    const admins = await User.find({ role: 'admin', villageId })
      .select('name email phone profilePhoto');

    // Aggregate votes for each admin
    const results = await Promise.all(
      admins.map(async (admin) => {
        const votes = await Vote.countDocuments({ adminId: admin._id, villageId, year });
        return {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          profilePhoto: admin.profilePhoto,
          votes,
        };
      })
    );

    // Sort results by vote count descending
    results.sort((a, b) => b.votes - a.votes);

    // Check if current user has voted
    let hasVoted = false;
    let votedFor = null;
    if (req.user.role === 'citizen') {
      const existingVote = await Vote.findOne({ citizenId: req.user._id, villageId, year });
      if (existingVote) {
        hasVoted = true;
        votedFor = existingVote.adminId;
      }
    }

    const totalVotes = await Vote.countDocuments({ villageId, year });

    res.json({
      results,
      hasVoted,
      votedFor,
      totalVotes,
      year,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
