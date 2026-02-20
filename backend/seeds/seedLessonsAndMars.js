const mongoose = require('mongoose');
require('dotenv').config();
const Lesson = require('../models/Lesson');
const MarsGame = require('../models/MarsGame');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for seeding'))
  .catch(err => console.log(err));

const lessons = [
  // Animals (10)
  { language: 'hindi', word: 'कुत्ता', imageUrl: '/images/hindi/dog.png', audioUrl: '/audio/hindi/Dog_Hindi.mp4.mp3', order: 1 },
  { language: 'hindi', word: 'बिल्ली', imageUrl: '/images/hindi/cat.png', audioUrl: '/audio/hindi/Cat_Hindi.mp4.mp3', order: 2 },
  { language: 'hindi', word: 'हाथी', imageUrl: '/images/hindi/elephant.png', audioUrl: '/audio/hindi/Elephant_Hindi.mp4.mp3', order: 3 },
  { language: 'hindi', word: 'शेर', imageUrl: '/images/hindi/lion.png', audioUrl: '/audio/hindi/Lion_Hindi.mp4.mp3', order: 4 },
  { language: 'hindi', word: 'ऊंट', imageUrl: '/images/hindi/camel.png', audioUrl: '/audio/hindi/Camel_Hindi.mp4.mp3', order: 5 },
  { language: 'hindi', word: 'पक्षी', imageUrl: '/images/hindi/bird.png', audioUrl: '/audio/hindi/Bird_Hindi.mp4.mp3', order: 6 },
  { language: 'hindi', word: 'मछली', imageUrl: '/images/hindi/fish.png', audioUrl: '/audio/hindi/Fish_Hindi.mp4.mp3', order: 7 },
  { language: 'hindi', word: 'गाय', imageUrl: '/images/hindi/cow.png', audioUrl: '/audio/hindi/Cow_Hindi.mp4.mp3', order: 8 },
  { language: 'hindi', word: 'खरगोश', imageUrl: '/images/hindi/rabbit.png', audioUrl: '/audio/hindi/Rabbit_Hindi.mp4.mp3', order: 9 },
  { language: 'hindi', word: 'बत्तख', imageUrl: '/images/hindi/duck.png', audioUrl: '/audio/hindi/Duck_Hindi.mp4.mp3', order: 10 },
  
  // Objects (10)
  { language: 'hindi', word: 'घर', imageUrl: '/images/hindi/house.png', audioUrl: '/audio/hindi/House_Hindi.mp4.mp3', order: 11 },
  { language: 'hindi', word: 'फूल', imageUrl: '/images/hindi/flower.png', audioUrl: '/audio/hindi/Flower_Hindi.mp4.mp3', order: 12 },
  { language: 'hindi', word: 'कार', imageUrl: '/images/hindi/car.png', audioUrl: '/audio/hindi/Car_Hindi.mp4.mp3', order: 13 },
  { language: 'hindi', word: 'कलम', imageUrl: '/images/hindi/pen.png', audioUrl: '/audio/hindi/Pen_Hindi.mp4.mp3', order: 14 },
  { language: 'hindi', word: 'गेंद', imageUrl: '/images/hindi/ball.png', audioUrl: '/audio/hindi/Ball_Hindi.mp4.mp3', order: 15 },
  { language: 'hindi', word: 'सूरज', imageUrl: '/images/hindi/sun.png', audioUrl: '/audio/hindi/Sun_Hindi.mp4.mp3', order: 16 },
  { language: 'hindi', word: 'चाँद', imageUrl: '/images/hindi/moon.png', audioUrl: '/audio/hindi/Moon_Hindi.mp4.mp3', order: 17 },
  { language: 'hindi', word: 'केला', imageUrl: '/images/hindi/banana.png', audioUrl: '/audio/hindi/Banana_Hindi.mp4.mp3', order: 18 },
  { language: 'hindi', word: 'आँख', imageUrl: '/images/hindi/eye.png', audioUrl: '/audio/hindi/Eyes_Hindi.mp4.mp3', order: 19 },
  { language: 'hindi', word: 'झंडा', imageUrl: '/images/hindi/flag.png', audioUrl: '/audio/hindi/Flag_Hindi.mp4.mp3', order: 20 },

  // Telugu - Same images, different words
  { language: 'telugu', word: 'కుక్క', imageUrl: '/images/telugu/dog.png', audioUrl: '/audio/telugu/Dog_Telugu.mp4.mp3', order: 1 },
  { language: 'telugu', word: 'పిల్లి', imageUrl: '/images/telugu/cat.png', audioUrl: '/audio/telugu/Cat_Telugu.mp4.mp3', order: 2 },
  { language: 'telugu', word: 'ఏనుగు', imageUrl: '/images/telugu/elephant.png', audioUrl: '/audio/telugu/Elephant_Telugu.mp4.mp3', order: 3 },
  { language: 'telugu', word: 'సింహం', imageUrl: '/images/telugu/lion.png', audioUrl: '/audio/telugu/Lion_Telugu.mp4.mp3', order: 4 },
  { language: 'telugu', word: 'ఒంటె', imageUrl: '/images/telugu/camel.png', audioUrl: '/audio/telugu/Camel_Telugu.mp4.mp3', order: 5 },
  { language: 'telugu', word: 'పక్షి', imageUrl: '/images/telugu/bird.png', audioUrl: '/audio/telugu/Bird_Telugu.mp4.mp3', order: 6 },
  { language: 'telugu', word: 'చేప', imageUrl: '/images/telugu/fish.png', audioUrl: '/audio/telugu/Fish_Telugu.mp4.mp3', order: 7 },
  { language: 'telugu', word: 'ఆవు', imageUrl: '/images/telugu/cow.png', audioUrl: '/audio/telugu/Cow_Telugu.mp4.mp3', order: 8 },
  { language: 'telugu', word: 'కుందేలు', imageUrl: '/images/telugu/rabbit.png', audioUrl: '/audio/telugu/Rabbit_Telugu.mp4.mp3', order: 9 },
  { language: 'telugu', word: 'బాతు', imageUrl: '/images/telugu/duck.png', audioUrl: '/audio/telugu/Duck_Telugu.mp4.mp3', order: 10 },
  
  { language: 'telugu', word: 'ఇల్లు', imageUrl: '/images/telugu/house.png', audioUrl: '/audio/telugu/House_Telugu.mp4.mp3', order: 11 },
  { language: 'telugu', word: 'పువ్వు', imageUrl: '/images/telugu/flower.png', audioUrl: '/audio/telugu/Flower_Telugu.mp4.mp3', order: 12 },
  { language: 'telugu', word: 'కారు', imageUrl: '/images/telugu/car.png', audioUrl: '/audio/telugu/Car_Telugu.mp4.mp3', order: 13 },
  { language: 'telugu', word: 'పెన్ను', imageUrl: '/images/telugu/pen.png', audioUrl: '/audio/telugu/Pen_Telugu.mp4.mp3', order: 14 },
  { language: 'telugu', word: 'బంతి', imageUrl: '/images/telugu/ball.png', audioUrl: '/audio/telugu/Ball_Telugu.mp4.mp3', order: 15 },
  { language: 'telugu', word: 'సూర్యుడు', imageUrl: '/images/telugu/sun.png', audioUrl: '/audio/telugu/Sun_Telugu.mp4.mp3', order: 16 },
  { language: 'telugu', word: 'చంద్రుడు', imageUrl: '/images/telugu/moon.png', audioUrl: '/audio/telugu/Moon_Telugu.mp4.mp3', order: 17 },
  { language: 'telugu', word: 'అరటిపండు', imageUrl: '/images/telugu/banana.png', audioUrl: '/audio/telugu/Banana_Telugu.mp4.mp3', order: 18 },
  { language: 'telugu', word: 'కన్ను', imageUrl: '/images/telugu/eye.png', audioUrl: '/audio/telugu/Eye_Telugu.mp4.mp3', order: 19 },
  { language: 'telugu', word: 'జెండా', imageUrl: '/images/telugu/flag.png', audioUrl: '/audio/telugu/Flag_telugu.mp4.mp3', order: 20 },
];

const marsGames = [
  // Level 1 - Hindi (3 images, 4 questions)
  {
    language: 'hindi',
    level: 1,
    title: 'Mars Level 1',
    description: 'Match the word with correct image (3 options)',
    isActive: true,
    questions: [
      {
        word: 'कुत्ता',
        audioUrl: '/audio/hindi/Dog_Hindi.mp4.mp3',
        images: ['/images/hindi/dog.png', '/images/hindi/cat.png', '/images/hindi/elephant.png'],
        correctImageIndex: 0
      },
      {
        word: 'शेर',
        audioUrl: '/audio/hindi/Lion_Hindi.mp4.mp3',
        images: ['/images/hindi/bird.png', '/images/hindi/lion.png', '/images/hindi/cow.png'],
        correctImageIndex: 1
      },
      {
        word: 'फूल',
        audioUrl: '/audio/hindi/Flower_Hindi.mp4.mp3',
        images: ['/images/hindi/house.png', '/images/hindi/car.png', '/images/hindi/flower.png'],
        correctImageIndex: 2
      },
      {
        word: 'सूरज',
        audioUrl: '/audio/hindi/Sun_Hindi.mp4.mp3',
        images: ['/images/hindi/sun.png', '/images/hindi/moon.png', '/images/hindi/ball.png'],
        correctImageIndex: 0
      }
    ]
  },
  
  // Level 2 - Hindi (4 images, 2 questions)
  {
    language: 'hindi',
    level: 2,
    title: 'Mars Level 2',
    description: 'Match the word with correct image (4 options)',
    isActive: true,
    questions: [
      {
        word: 'हाथी',
        audioUrl: '/audio/hindi/Elephant_Hindi.mp4.mp3',
        images: ['/images/hindi/dog.png', '/images/hindi/lion.png', '/images/hindi/elephant.png', '/images/hindi/camel.png'],
        correctImageIndex: 2
      },
      {
        word: 'केला',
        audioUrl: '/audio/hindi/Banana_Hindi.mp4.mp3',
        images: ['/images/hindi/flower.png', '/images/hindi/ball.png', '/images/hindi/banana.png', '/images/hindi/flag.png'],
        correctImageIndex: 2
      }
    ]
  },

  // Level 1 - Telugu (3 images, 4 questions)
  {
    language: 'telugu',
    level: 1,
    title: 'Mars Level 1',
    description: 'Match the word with correct image (3 options)',
    isActive: true,
    questions: [
      {
        word: 'కుక్క',
        audioUrl: '/audio/telugu/Dog_Telugu.mp4.mp3',
        images: ['/images/telugu/dog.png', '/images/telugu/cat.png', '/images/telugu/elephant.png'],
        correctImageIndex: 0
      },
      {
        word: 'సింహం',
        audioUrl: '/audio/telugu/Lion_Telugu.mp4.mp3',
        images: ['/images/telugu/bird.png', '/images/telugu/lion.png', '/images/telugu/cow.png'],
        correctImageIndex: 1
      },
      {
        word: 'పువ్వు',
        audioUrl: '/audio/telugu/Flower_Telugu.mp4.mp3',
        images: ['/images/telugu/house.png', '/images/telugu/car.png', '/images/telugu/flower.png'],
        correctImageIndex: 2
      },
      {
        word: 'సూర్యుడు',
        audioUrl: '/audio/telugu/Sun_Telugu.mp4.mp3',
        images: ['/images/telugu/sun.png', '/images/telugu/moon.png', '/images/telugu/ball.png'],
        correctImageIndex: 0
      }
    ]
  },
  
  // Level 2 - Telugu (4 images, 2 questions)
  {
    language: 'telugu',
    level: 2,
    title: 'Mars Level 2',
    description: 'Match the word with correct image (4 options)',
    isActive: true,
    questions: [
      {
        word: 'ఏనుగు',
        audioUrl: '/audio/telugu/Elephant_Telugu.mp4.mp3',
        images: ['/images/telugu/dog.png', '/images/telugu/lion.png', '/images/telugu/elephant.png', '/images/telugu/camel.png'],
        correctImageIndex: 2
      },
      {
        word: 'అరటిపండు',
        audioUrl: '/audio/telugu/Banana_Telugu.mp4.mp3',
        images: ['/images/telugu/flower.png', '/images/telugu/ball.png', '/images/telugu/banana.png', '/images/telugu/flag.png'],
        correctImageIndex: 2
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Lesson.deleteMany({});
    await MarsGame.deleteMany({});
    console.log('Cleared existing lessons and Mars games');

    // Insert lessons
    await Lesson.insertMany(lessons);
    console.log('✅ Seeded 40 lessons (20 Hindi + 20 Telugu)');

    // Insert Mars games
    await MarsGame.insertMany(marsGames);
    console.log('✅ Seeded 4 Mars games (2 levels × 2 languages)');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

