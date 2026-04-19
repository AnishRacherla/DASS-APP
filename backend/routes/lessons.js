const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');

// Get all lessons by language
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const lessons = await Lesson.find({ language }).sort({ order: 1 });
    
    res.json({ success: true, lessons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
