const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images and audio)
app.use('/images', express.static(path.join(__dirname, 'assets/images')));
app.use('/audio/hindi', express.static(path.join(__dirname, 'assets/audio/hindi')));
app.use('/audio/telugu', express.static(path.join(__dirname, 'assets/audio/telugu')));
app.use('/audio/hindi_letters', express.static(path.join(__dirname, 'assets/audio/hindi_letters')));
app.use('/audio/telugu_letters', express.static(path.join(__dirname, 'assets/audio/telugu_letters')));
app.use('/audio/swara', express.static(path.join(__dirname, 'assets/audio/swara')));
app.use('/audio/storyTime', express.static(path.join(__dirname, 'assets/audio/storyTime')));
app.use('/audio/shabd', express.static(path.join(__dirname, 'assets/audio/shabd')));
app.use('/images/swara', express.static(path.join(__dirname, 'assets/images/swara')));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/audio', require('./routes/audio'));
app.use('/api/balloon', require('./routes/balloonGame'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/mars-game', require('./routes/marsGame'));
app.use('/api/whack', require('./routes/whackGame'));
app.use('/api/akshara', require('./routes/aksharaGame'));
app.use('/api/word-sorting-basket', require('./routes/wordSortingBasket'));
app.use('/api/swaras', require('./routes/swaraGame'));
app.use('/api/consonant', require('./routes/consonantQuiz'));
app.use('/api/scavenger', require('./routes/scavengerGame'));
app.use('/api/matra-game', require('./routes/matraGame'));
app.use('/api/word-jumble', require('./routes/wordJumble'));
app.use('/api/shabd', require('./routes/shabdGame'));
app.use('/api/fill-story', require('./routes/fillStory'));
app.use('/api/crossword', require('./routes/crosswordGame'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access from other devices at: http://10.2.143.103:${PORT}`);
});
