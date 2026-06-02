const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const seedWorkers = async () => {
  try {
    const User = require('./models/User');
    const workerCount = await User.countDocuments({ role: 'worker' });
    if (workerCount === 0) {
      console.log('Seeding initial field workers...');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('worker123', salt);

      const defaultWorkers = [
        { name: 'Rajesh Kumar', email: 'rajesh@panchayat.gov.in', phone: '9876543211', age: 35, role: 'worker', gender: 'Male', village: 'Mumbai North', password: hashedPassword },
        { name: 'Suresh Patil', email: 'suresh@panchayat.gov.in', phone: '9876543212', age: 42, role: 'worker', gender: 'Male', village: 'Mumbai South', password: hashedPassword },
        { name: 'Meena Tai', email: 'meena@panchayat.gov.in', phone: '9876543213', age: 38, role: 'worker', gender: 'Female', village: 'Andheri West', password: hashedPassword },
        { name: 'Gopal Yadav', email: 'gopal@panchayat.gov.in', phone: '9876543214', age: 45, role: 'worker', gender: 'Male', village: 'Kandivali', password: hashedPassword },
        { name: 'Laxmi Devi', email: 'laxmi@panchayat.gov.in', phone: '9876543215', age: 30, role: 'worker', gender: 'Female', village: 'Worli', password: hashedPassword }
      ];

      await User.insertMany(defaultWorkers);
      console.log('Successfully seeded initial field workers.');
    }
  } catch (error) {
    console.error('Failed to seed field workers:', error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedWorkers();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Please make sure you have added your MONGO_URI to the .env file in the backend folder.');
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/chat', require('./routes/chat'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Gram Suvidha API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
