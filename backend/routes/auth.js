const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SchemeApplication = require('../models/SchemeApplication');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration for profile photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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
    const { name, email, phone, password, age, role, villageId, village, gender } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      age,
      role: role || 'citizen',
      villageId,
      village,
      gender,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        villageId: user.villageId,
        village: user.village,
        token: generateToken(user._id),
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
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (role && user.role !== role) {
        return res.status(401).json({ message: 'Invalid email or password for selected role' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        villageId: user.villageId,
        village: user.village,
        token: generateToken(user._id),
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
    
    let admin = null;
    if (user.role === 'citizen' && user.villageId) {
      admin = await User.findOne({ role: 'admin', villageId: user.villageId }).select('name email phone');
    }
    
    const applications = await SchemeApplication.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    res.json({
      user,
      admin,
      applications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/auth/citizens
// @desc    Get all citizens for the logged-in admin's village
router.get('/citizens', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as an admin' });
    }
    
    if (!req.user.villageId) {
      return res.status(400).json({ message: 'Admin has no assigned village ID' });
    }
    
    const citizens = await User.find({ role: 'citizen', villageId: req.user.villageId }).select('-password -__v');
    res.json(citizens);
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
// @desc    Get all registered workers - filtered by admin's village
router.get('/workers', protect, async (req, res) => {
  try {
    let query = { role: 'worker' };
    // Admin sees only workers in their village
    if (req.user && req.user.role === 'admin' && req.user.villageId) {
      query.villageId = req.user.villageId;
    }
    const workers = await User.find(query).select('-password');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/auth/workers
// @desc    Register a new field worker - auto-assigns admin's villageId
router.post('/workers', protect, async (req, res) => {
  try {
    const { name, email, phone, age, gender, village } = req.body;

    const workerExists = await User.findOne({ email });
    if (workerExists) {
      return res.status(400).json({ message: 'Worker already exists with this email' });
    }

    // Inherit village details from the admin who is creating the worker
    const adminVillageId = (req.user && req.user.villageId) || '';
    const adminVillage = (req.user && req.user.village) || village || '';

    const worker = await User.create({
      name,
      email,
      phone,
      age,
      gender,
      village: adminVillage,
      villageId: adminVillageId,
      role: 'worker',
      password: 'worker123'
    });

    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/auth/workers/:id
// @desc    Update a worker (status or other fields)
router.put('/workers/:id', async (req, res) => {
  try {
    const updateData = {};
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.village !== undefined) updateData.village = req.body.village;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;

    const updated = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'Worker not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
