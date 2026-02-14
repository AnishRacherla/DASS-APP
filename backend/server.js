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

// Serve audio files
app.use('/audio/hindi', express.static(path.join(__dirname, '../hindi')));
app.use('/audio/telugu', express.static(path.join(__dirname, '../telugu')));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/audio', require('./routes/audio'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access from other devices at: http://10.2.143.103:${PORT}`);
});
