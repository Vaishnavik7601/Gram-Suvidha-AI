const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SchemeApplication = require('../models/SchemeApplication');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer storage configuration for profile photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'profile-' + req.user._id + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, age, role, villageId, gender } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name, email, phone, password, age, role: role || 'citizen', villageId, gender
    });

    if (user) {
      res.status(201).json({
        _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile & applications
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const applications = await SchemeApplication.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    res.json({
      user,
      applications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/auth/profile/photo
// @desc    Upload profile photo
router.post('/profile/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePhoto = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Profile photo updated successfully',
      profilePhoto: user.profilePhoto
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.age = req.body.age !== undefined ? req.body.age : user.age;
    user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
    
    // Regional fields
    user.village = req.body.village !== undefined ? req.body.village : user.village;
    user.taluk = req.body.taluk !== undefined ? req.body.taluk : user.taluk;
    user.district = req.body.district !== undefined ? req.body.district : user.district;
    user.state = req.body.state !== undefined ? req.body.state : user.state;
    user.country = req.body.country !== undefined ? req.body.country : user.country;
    user.pincode = req.body.pincode !== undefined ? req.body.pincode : user.pincode;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        role: user.role,
        profilePhoto: user.profilePhoto,
        gender: user.gender,
        villageId: user.villageId,
        village: user.village,
        taluk: user.taluk,
        district: user.district,
        state: user.state,
        country: user.country,
        pincode: user.pincode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/auth/workers
// @desc    Get all registered workers
router.get('/workers', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/auth/workers
// @desc    Register a new field worker
router.post('/workers', async (req, res) => {
  try {
    const { name, email, phone, age, gender, village } = req.body;
    
    const workerExists = await User.findOne({ email });
    if (workerExists) {
      return res.status(400).json({ message: 'Worker already exists with this email' });
    }

    const worker = await User.create({
      name,
      email,
      phone,
      age,
      gender,
      village,
      role: 'worker',
      password: 'worker123'
    });

    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
