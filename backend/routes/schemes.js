const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const SchemeApplication = require('../models/SchemeApplication');
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
    cb(null, 'uploads/');
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

    const application = await SchemeApplication.create({
      schemeName,
      applicantName,
      age: parseInt(age),
      idNumber: cleanId,
      idProofPath: `/uploads/${req.file.filename}`,
      relationship: relationship || 'Self',
      userId: req.user._id
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/schemes/applications
// @desc    Get all scheme applications (for admin)
router.get('/applications', async (req, res) => {
  try {
    const applications = await SchemeApplication.find({}).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/schemes/applications/:id
// @desc    Update scheme application status and benefit dates (for admin)
router.put('/applications/:id', async (req, res) => {
  try {
    const { status, availableFrom, expiresAt } = req.body;
    const application = await SchemeApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
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
