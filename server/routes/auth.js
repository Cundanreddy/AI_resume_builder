import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { userOperations } from '../database/sqlite.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Sign up
router.post('/signup', upload.single('photo'), async (req, res) => {
  try {
    const { fullName, email, mobile, password, language, termsAccepted } = req.body;

    // Validation
    if (!fullName || !password || !language) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    if (!email && !mobile) {
      return res.status(400).json({ message: 'Either email or mobile number is required' });
    }

    if (termsAccepted !== 'true') {
      return res.status(400).json({ message: 'You must accept the terms and conditions' });
    }

    // Check if user already exists
    const existingUser = userOperations.findByEmailOrMobile(email || mobile);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or mobile number' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userData = {
      fullName,
      password: hashedPassword,
      language,
      ...(email && { email }),
      ...(mobile && { mobile })
    };

    if (req.file) {
      userData.photo = `/uploads/${req.file.filename}`;
    }

    const result = userOperations.create(userData);
    const user = userOperations.findById(result.lastInsertRowid);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = { ...user };
    delete userResponse.password;
    delete userResponse.otpCode;
    delete userResponse.otpExpires;

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Delete uploaded file if user creation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Sign in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email or mobile
    const user = userOperations.findByEmailOrMobile(email);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = { ...user };
    delete userResponse.password;
    delete userResponse.otpCode;
    delete userResponse.otpExpires;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const userResponse = { ...req.user };
    delete userResponse.password;
    delete userResponse.otpCode;
    delete userResponse.otpExpires;

    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    const user = userOperations.findByEmailOrMobile(mobile);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    userOperations.updateOTP(user.id, otp, otpExpires);

    // In production, send SMS using a service like Twilio
    console.log(`OTP for ${mobile}: ${otp}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required' });
    }

    const user = userOperations.findByEmailOrMobile(mobile);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otpCode !== otp || new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    userOperations.verifyMobile(user.id);

    res.json({ message: 'Mobile number verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 