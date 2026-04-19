const express = require('express');
const router = express.Router();
const Swara = require('../models/Swara');

// @desc    Get all swaras sorted by id
// @route   GET /api/swaras
router.get('/', async (req, res) => {
    try {
        const swaras = await Swara.find({}).sort({ id: 1 }).select('-_id -__v');
        res.status(200).json(swaras);
    } catch (error) {
        console.error('Error fetching swaras:', error.message);
        res.status(500).json({ message: 'Server error while fetching swaras' });
    }
});

module.exports = router;
