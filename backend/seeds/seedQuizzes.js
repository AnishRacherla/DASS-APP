const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Function to read audio file and convert to Buffer
const readAudioFile = (language, fileName) => {
  try {
    const audioPath = path.join(__dirname, '../../', language, fileName);
    if (fs.existsSync(audioPath)) {
      return fs.readFileSync(audioPath);
    }
    console.log(`Audio file not found: ${audioPath}`);
    return null;
  } catch (error) {
    console.error(`Error reading audio file ${fileName}:`, error.message);
    return null;
  }
};

const hindiQuizzes = [
  {
    language: 'hindi',
    level: 1,
    planetName: 'Planet 1: Basic Letters',
    questions: [
      {
        questionId: 1,
        audioText: 'अ',
        audioFileName: 'hi_अ.mp3',
        correctAnswer: 'अ',
        options: ['अ', 'आ', 'इ', 'ई'],
        difficulty: 'easy'
      },
      {
        questionId: 2,
        audioText: 'क',
        audioFileName: 'hi_क.mp3',
        correctAnswer: 'क',
        options: ['क', 'ख', 'ग', 'घ'],
        difficulty: 'easy'
      },
      {
        questionId: 3,
        audioText: 'म',
        audioFileName: 'hi_म.mp3',
        correctAnswer: 'म',
        options: ['म', 'न', 'प', 'त'],
        difficulty: 'easy'
      },
      {
        questionId: 4,
        audioText: 'स',
        audioFileName: 'hi_स.mp3',
        correctAnswer: 'स',
        options: ['स', 'श', 'ष', 'ह'],
        difficulty: 'easy'
      },
      {
        questionId: 5,
        audioText: 'र',
        audioFileName: 'hi_र.mp3',
        correctAnswer: 'र',
        options: ['र', 'ल', 'व', 'य'],
        difficulty: 'easy'
      }
    ]
  },
  {
    language: 'hindi',
    level: 2,
    planetName: 'Planet 2: Vowel Practice',
    questions: [
      {
        questionId: 1,
        audioText: 'आ',
        audioFileName: 'hi_आ.mp3',
        correctAnswer: 'आ',
        options: ['आ', 'अ', 'ए', 'ओ'],
        difficulty: 'easy'
      },
      {
        questionId: 2,
        audioText: 'ख',
        audioFileName: 'hi_ख.mp3',
        correctAnswer: 'ख',
        options: ['ख', 'क', 'ग', 'घ'],
        difficulty: 'easy'
      },
      {
        questionId: 3,
        audioText: 'न',
        audioFileName: 'hi_न.mp3',
        correctAnswer: 'न',
        options: ['न', 'म', 'प', 'ब'],
        difficulty: 'easy'
      },
      {
        questionId: 4,
        audioText: 'ल',
        audioFileName: 'hi_ल.mp3',
        correctAnswer: 'ल',
        options: ['ल', 'र', 'व', 'य'],
        difficulty: 'easy'
      },
      {
        questionId: 5,
        audioText: 'ग',
        audioFileName: 'hi_ग.mp3',
        correctAnswer: 'ग',
        options: ['ग', 'घ', 'क', 'च'],
        difficulty: 'easy'
      }
    ]
  },
  {
    language: 'hindi',
    level: 3,
    planetName: 'Planet 3: Consonants',
    questions: [
      {
        questionId: 1,
        audioText: 'च',
        audioFileName: 'hi_च.mp3',
        correctAnswer: 'च',
        options: ['च', 'छ', 'ज', 'झ'],
        difficulty: 'medium'
      },
      {
        questionId: 2,
        audioText: 'ट',
        audioFileName: 'hi_ट.mp3',
        correctAnswer: 'ट',
        options: ['ट', 'ठ', 'ड', 'ढ'],
        difficulty: 'medium'
      },
      {
        questionId: 3,
        audioText: 'थ',
        audioFileName: 'hi_थ.mp3',
        correctAnswer: 'थ',
        options: ['थ', 'त', 'द', 'ध'],
        difficulty: 'medium'
      },
      {
        questionId: 4,
        audioText: 'भ',
        audioFileName: 'hi_भ.mp3',
        correctAnswer: 'भ',
        options: ['भ', 'ब', 'प', 'फ'],
        difficulty: 'medium'
      },
      {
        questionId: 5,
        audioText: 'श',
        audioFileName: 'hi_श.mp3',
        correctAnswer: 'श',
        options: ['श', 'ष', 'स', 'ह'],
        difficulty: 'medium'
      }
    ]
  }
];

const teluguQuizzes = [
  {
    language: 'telugu',
    level: 1,
    planetName: 'Planet 1: Basic Letters',
    questions: [
      {
        questionId: 1,
        audioText: 'అ',
        audioFileName: 'te_అ.mp3',
        correctAnswer: 'అ',
        options: ['అ', 'ఆ', 'ఇ', 'ఈ'],
        difficulty: 'easy'
      },
      {
        questionId: 2,
        audioText: 'క',
        audioFileName: 'te_క.mp3',
        correctAnswer: 'క',
        options: ['క', 'ఖ', 'గ', 'ఘ'],
        difficulty: 'easy'
      },
      {
        questionId: 3,
        audioText: 'మ',
        audioFileName: 'te_మ.mp3',
        correctAnswer: 'మ',
        options: ['మ', 'న', 'ప', 'త'],
        difficulty: 'easy'
      },
      {
        questionId: 4,
        audioText: 'స',
        audioFileName: 'te_స.mp3',
        correctAnswer: 'స',
        options: ['స', 'శ', 'ష', 'హ'],
        difficulty: 'easy'
      },
      {
        questionId: 5,
        audioText: 'ర',
        audioFileName: 'te_ర.mp3',
        correctAnswer: 'ర',
        options: ['ర', 'ల', 'వ', 'య'],
        difficulty: 'easy'
      }
    ]
  },
  {
    language: 'telugu',
    level: 2,
    planetName: 'Planet 2: Vowel Practice',
    questions: [
      {
        questionId: 1,
        audioText: 'ఆ',
        audioFileName: 'te_ఆ.mp3',
        correctAnswer: 'ఆ',
        options: ['ఆ', 'అ', 'ఎ', 'ఒ'],
        difficulty: 'easy'
      },
      {
        questionId: 2,
        audioText: 'ఖ',
        audioFileName: 'te_ఖ.mp3',
        correctAnswer: 'ఖ',
        options: ['ఖ', 'క', 'గ', 'ఘ'],
        difficulty: 'easy'
      },
      {
        questionId: 3,
        audioText: 'న',
        audioFileName: 'te_న.mp3',
        correctAnswer: 'న',
        options: ['న', 'మ', 'ప', 'బ'],
        difficulty: 'easy'
      },
      {
        questionId: 4,
        audioText: 'ల',
        audioFileName: 'te_ల.mp3',
        correctAnswer: 'ల',
        options: ['ల', 'ర', 'వ', 'య'],
        difficulty: 'easy'
      },
      {
        questionId: 5,
        audioText: 'గ',
        audioFileName: 'te_గ.mp3',
        correctAnswer: 'గ',
        options: ['గ', 'ఘ', 'క', 'చ'],
        difficulty: 'easy'
      }
    ]
  },
  {
    language: 'telugu',
    level: 3,
    planetName: 'Planet 3: Consonants',
    questions: [
      {
        questionId: 1,
        audioText: 'చ',
        audioFileName: 'te_చ.mp3',
        correctAnswer: 'చ',
        options: ['చ', 'ఛ', 'జ', 'ఝ'],
        difficulty: 'medium'
      },
      {
        questionId: 2,
        audioText: 'ట',
        audioFileName: 'te_ట.mp3',
        correctAnswer: 'ట',
        options: ['ట', 'ఠ', 'డ', 'ఢ'],
        difficulty: 'medium'
      },
      {
        questionId: 3,
        audioText: 'థ',
        audioFileName: 'te_థ.mp3',
        correctAnswer: 'థ',
        options: ['థ', 'త', 'ద', 'ధ'],
        difficulty: 'medium'
      },
      {
        questionId: 4,
        audioText: 'భ',
        audioFileName: 'te_భ.mp3',
        correctAnswer: 'భ',
        options: ['భ', 'బ', 'ప', 'ఫ'],
        difficulty: 'medium'
      },
      {
        questionId: 5,
        audioText: 'శ',
        audioFileName: 'te_శ.mp3',
        correctAnswer: 'శ',
        options: ['శ', 'ష', 'స', 'హ'],
        difficulty: 'medium'
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing quizzes
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes');

    // Add audio data to Hindi quizzes
    console.log('Loading Hindi audio files...');
    hindiQuizzes.forEach(quiz => {
      quiz.questions.forEach(question => {
        const audioBuffer = readAudioFile('hindi', question.audioFileName);
        if (audioBuffer) {
          question.audioData = audioBuffer;
          question.audioContentType = 'audio/mpeg';
        }
      });
    });

    // Insert Hindi quizzes
    await Quiz.insertMany(hindiQuizzes);
    console.log('Hindi quizzes seeded with audio data');

    // Add audio data to Telugu quizzes
    console.log('Loading Telugu audio files...');
    teluguQuizzes.forEach(quiz => {
      quiz.questions.forEach(question => {
        const audioBuffer = readAudioFile('telugu', question.audioFileName);
        if (audioBuffer) {
          question.audioData = audioBuffer;
          question.audioContentType = 'audio/mpeg';
        }
      });
    });

    // Insert Telugu quizzes
    await Quiz.insertMany(teluguQuizzes);
    console.log('Telugu quizzes seeded with audio data');

    console.log('Database seeding completed successfully with audio files!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
