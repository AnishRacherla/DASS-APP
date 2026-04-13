const mongoose = require('mongoose');

// Base Game Schema - Generalized for all game types
const gameSchema = new mongoose.Schema({
  // Game Identification
  gameType: {
    type: String,
    required: true,
    enum: ['quiz', 'balloon', 'memory', 'spelling', 'story', 'tracing', 'whack', 'scavenger']
  },
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },

  // Language and Level
  language: {
    type: String,
    required: true,
    enum: ['hindi', 'telugu', 'english']
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },

  // Game Content - Flexible structure for different game types
  gameData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
    // This can contain:
    // - For Quiz: questions array
    // - For Balloon: letters array with config
    // - For Memory: card pairs
    // - For Spelling: words to spell
    // etc.
  },

  // Game Configuration
  config: {
    timeLimit: {
      type: Number, // in seconds, 0 = no limit
      default: 0
    },
    pointsPerCorrect: {
      type: Number,
      default: 10
    },
    pointsPerIncorrect: {
      type: Number,
      default: -5
    },
    numberOfRounds: {
      type: Number,
      default: 5
    },
    speed: {
      type: String,
      enum: ['slow', 'medium', 'fast'],
      default: 'medium'
    }
  },

  // Media Assets
  assets: {
    images: [{
      name: String,
      url: String
    }],
    audio: [{
      name: String,
      url: String,
      data: Buffer,
      contentType: String
    }],
    videos: [{
      name: String,
      url: String
    }]
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
gameSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Game', gameSchema);
