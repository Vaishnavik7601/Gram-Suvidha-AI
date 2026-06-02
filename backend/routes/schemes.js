const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const SchemeApplication = require('../models/SchemeApplication');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append extension
  }
});

const upload = multer({ storage: storage });

const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find({});
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/schemes
router.post('/', protect, async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    res.status(201).json(scheme);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/schemes/apply
// @desc    Apply for a scheme with an ID proof
router.post('/apply', protect, upload.single('idProof'), async (req, res) => {
  try {
    const { schemeName, applicantName, age, idNumber, relationship } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'ID Proof is required' });
    }

    if (!idNumber) {
      return res.status(400).json({ message: 'ID Number is required' });
    }

    // Basic regex validation for Aadhar (12 digits) or PAN (ABCDE1234F)
    const aadharRegex = /^\d{12}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    const cleanId = idNumber.replace(/\s/g, '');
    if (!aadharRegex.test(cleanId) && !panRegex.test(cleanId)) {
      return res.status(400).json({ message: 'Invalid Aadhar or PAN number format' });
    }

    // Village isolation: citizen must have a villageId
    const citizenVillageId = req.user.villageId;
    if (!citizenVillageId) {
      return res.status(403).json({ message: 'Invalid Citizen: Your account is not linked to any village. Please update your profile.' });
    }

    // Check if there's at least one admin for the same village
    const adminForVillage = await User.findOne({ role: 'admin', villageId: citizenVillageId });
    if (!adminForVillage) {
      return res.status(403).json({ message: 'Invalid Citizen: No administrator found for your village. Please contact support.' });
    }

    const applicationId = `SCH-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const application = await SchemeApplication.create({
      applicationId,
      schemeName,
      applicantName,
      age: parseInt(age) || (req.user && req.user.age) || 0,
      idNumber: cleanId,
      idProofPath: `/uploads/${req.file.filename}`,
      relationship: relationship || 'Self',
      userId: req.user._id,
      villageId: citizenVillageId,
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/schemes/applications
// @desc    Get scheme applications - admin sees only their village's applications
router.get('/applications', protect, async (req, res) => {
  try {
    let query = {};
    // If the requester is an admin, filter by their villageId
    if (req.user.role === 'admin') {
      if (!req.user.villageId) {
        return res.status(403).json({ message: 'Admin account is not linked to any village.' });
      }
      query.villageId = req.user.villageId;
    } else if (req.user.role === 'citizen') {
      // Citizens only see their own applications
      query.userId = req.user._id;
    }

    const applications = await SchemeApplication.find(query).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/schemes/applications/:id
// @desc    Update scheme application status and benefit dates (admin only, same village)
router.put('/applications/:id', protect, async (req, res) => {
  try {
    const { status, availableFrom, expiresAt } = req.body;
    const application = await SchemeApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Village isolation check for admin
    if (req.user.role === 'admin' && application.villageId && req.user.villageId !== application.villageId) {
      return res.status(403).json({ message: 'Access denied: This application does not belong to your village.' });
    }

    if (status) application.status = status;
    if (availableFrom !== undefined) application.availableFrom = availableFrom ? new Date(availableFrom) : null;
    if (expiresAt !== undefined) application.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await application.save();

    res.json({
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
