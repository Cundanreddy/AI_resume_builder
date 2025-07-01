import express from 'express';
import { resumeOperations } from '../database/sqlite.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user's resume
router.get('/', auth, async (req, res) => {
  try {
    const resume = resumeOperations.findByUserId(req.user.id);
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ resume });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update resume
router.post('/', auth, async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      userId: req.user.id
    };

    // Validate required fields
    if (!resumeData.personalInfo || !resumeData.summary) {
      return res.status(400).json({ message: 'Personal info and summary are required' });
    }

    const result = resumeOperations.create(resumeData);
    const resume = resumeOperations.findByUserId(req.user.id);

    res.json({ 
      message: 'Resume saved successfully',
      resume 
    });
  } catch (error) {
    console.error('Create/Update resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update resume
router.put('/', auth, async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      userId: req.user.id
    };

    const result = resumeOperations.create(resumeData);
    const resume = resumeOperations.findByUserId(req.user.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ 
      message: 'Resume updated successfully',
      resume 
    });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete resume
router.delete('/', auth, async (req, res) => {
  try {
    const result = resumeOperations.delete(req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 