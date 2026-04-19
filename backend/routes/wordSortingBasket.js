const express = require('express');
const router = express.Router();
const WordSortingItem = require('../models/WordSortingItem');

// GET all sorting words  — /api/word-sorting-basket/words?language=hindi&category=fruits
router.get('/words', async (req, res) => {
  try {
    const filter = {};
    if (req.query.language) filter.language = req.query.language;
    if (req.query.category) filter.category = req.query.category;
    res.json(await WordSortingItem.find(filter).sort({ category: 1, order: 1, word: 1 }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET grouped categories  — /api/word-sorting-basket/categories
router.get('/categories', async (req, res) => {
  try {
    const { language } = req.query;
    const filter = language ? { language } : {};
    const categories = await WordSortingItem.distinct('category', filter);
    res.json(categories.sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET summary counts — /api/word-sorting-basket/summary
router.get('/summary', async (req, res) => {
  try {
    const [hindiCount, teluguCount, categoryCounts] = await Promise.all([
      WordSortingItem.countDocuments({ language: 'hindi' }),
      WordSortingItem.countDocuments({ language: 'telugu' }),
      WordSortingItem.aggregate([
        { $group: { _id: { language: '$language', category: '$category' }, count: { $sum: 1 } } },
        { $sort: { '_id.language': 1, '_id.category': 1 } },
      ]),
    ]);

    res.json({
      counts: {
        hindi: hindiCount,
        telugu: teluguCount,
      },
      categories: categoryCounts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;