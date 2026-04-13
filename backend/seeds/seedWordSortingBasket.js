const mongoose = require('mongoose');
require('dotenv').config();
const WordSortingItem = require('../models/WordSortingItem');

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/literacy_game';

const items = [
  // Hindi - Fruits
  { language: 'hindi', word: 'सेब', category: 'fruits', meaning: 'apple', emoji: '🍎', order: 1, levelIntroduced: 1 },
  { language: 'hindi', word: 'केला', category: 'fruits', meaning: 'banana', emoji: '🍌', order: 2, levelIntroduced: 1 },
  { language: 'hindi', word: 'आम', category: 'fruits', meaning: 'mango', emoji: '🥭', order: 3, levelIntroduced: 1 },
  { language: 'hindi', word: 'अंगूर', category: 'fruits', meaning: 'grapes', emoji: '🍇', order: 4, levelIntroduced: 1 },
  { language: 'hindi', word: 'संतरा', category: 'fruits', meaning: 'orange', emoji: '🍊', order: 5, levelIntroduced: 1 },

  // Hindi - Animals
  { language: 'hindi', word: 'कुत्ता', category: 'animals', meaning: 'dog', emoji: '🐶', order: 6, levelIntroduced: 1 },
  { language: 'hindi', word: 'बिल्ली', category: 'animals', meaning: 'cat', emoji: '🐱', order: 7, levelIntroduced: 1 },
  { language: 'hindi', word: 'हाथी', category: 'animals', meaning: 'elephant', emoji: '🐘', order: 8, levelIntroduced: 1 },
  { language: 'hindi', word: 'शेर', category: 'animals', meaning: 'lion', emoji: '🦁', order: 9, levelIntroduced: 1 },
  { language: 'hindi', word: 'गाय', category: 'animals', meaning: 'cow', emoji: '🐄', order: 10, levelIntroduced: 1 },

  // Hindi - Pets
  { language: 'hindi', word: 'तोता', category: 'pets', meaning: 'parrot', emoji: '🦜', order: 11, levelIntroduced: 2 },
  { language: 'hindi', word: 'खरगोश', category: 'pets', meaning: 'rabbit', emoji: '🐰', order: 12, levelIntroduced: 2 },
  { language: 'hindi', word: 'मछली', category: 'pets', meaning: 'fish', emoji: '🐟', order: 13, levelIntroduced: 2 },
  { language: 'hindi', word: 'कछुआ', category: 'pets', meaning: 'turtle', emoji: '🐢', order: 14, levelIntroduced: 2 },
  { language: 'hindi', word: 'चूहा', category: 'pets', meaning: 'mouse', emoji: '🐭', order: 15, levelIntroduced: 2 },

  // Hindi - Vegetables
  { language: 'hindi', word: 'गाजर', category: 'vegetables', meaning: 'carrot', emoji: '🥕', order: 16, levelIntroduced: 2 },
  { language: 'hindi', word: 'आलू', category: 'vegetables', meaning: 'potato', emoji: '🥔', order: 17, levelIntroduced: 2 },
  { language: 'hindi', word: 'टमाटर', category: 'vegetables', meaning: 'tomato', emoji: '🍅', order: 18, levelIntroduced: 2 },
  { language: 'hindi', word: 'प्याज', category: 'vegetables', meaning: 'onion', emoji: '🧅', order: 19, levelIntroduced: 2 },
  { language: 'hindi', word: 'भिंडी', category: 'vegetables', meaning: 'okra', emoji: '🌱', order: 20, levelIntroduced: 2 },

  // Hindi - Birds
  { language: 'hindi', word: 'कौआ', category: 'birds', meaning: 'crow', emoji: '🐦', order: 21, levelIntroduced: 3 },
  { language: 'hindi', word: 'मोर', category: 'birds', meaning: 'peacock', emoji: '🦚', order: 22, levelIntroduced: 3 },
  { language: 'hindi', word: 'चिड़िया', category: 'birds', meaning: 'sparrow', emoji: '🐤', order: 23, levelIntroduced: 3 },
  { language: 'hindi', word: 'कबूतर', category: 'birds', meaning: 'pigeon', emoji: '🕊️', order: 24, levelIntroduced: 3 },
  { language: 'hindi', word: 'मुर्गी', category: 'birds', meaning: 'hen', emoji: '🐔', order: 25, levelIntroduced: 3 },

  // Hindi - Vehicles
  { language: 'hindi', word: 'कार', category: 'vehicles', meaning: 'car', emoji: '🚗', order: 26, levelIntroduced: 3 },
  { language: 'hindi', word: 'बस', category: 'vehicles', meaning: 'bus', emoji: '🚌', order: 27, levelIntroduced: 3 },
  { language: 'hindi', word: 'साइकिल', category: 'vehicles', meaning: 'bicycle', emoji: '🚲', order: 28, levelIntroduced: 3 },
  { language: 'hindi', word: 'ट्रेन', category: 'vehicles', meaning: 'train', emoji: '🚆', order: 29, levelIntroduced: 3 },
  { language: 'hindi', word: 'ट्रक', category: 'vehicles', meaning: 'truck', emoji: '🚚', order: 30, levelIntroduced: 3 },

  // Telugu - Fruits
  { language: 'telugu', word: 'సేపు', category: 'fruits', meaning: 'apple', emoji: '🍎', order: 1, levelIntroduced: 1 },
  { language: 'telugu', word: 'అరటి', category: 'fruits', meaning: 'banana', emoji: '🍌', order: 2, levelIntroduced: 1 },
  { language: 'telugu', word: 'మామిడి', category: 'fruits', meaning: 'mango', emoji: '🥭', order: 3, levelIntroduced: 1 },
  { language: 'telugu', word: 'ద్రాక్ష', category: 'fruits', meaning: 'grapes', emoji: '🍇', order: 4, levelIntroduced: 1 },
  { language: 'telugu', word: 'నారింజ', category: 'fruits', meaning: 'orange', emoji: '🍊', order: 5, levelIntroduced: 1 },

  // Telugu - Animals
  { language: 'telugu', word: 'కుక్క', category: 'animals', meaning: 'dog', emoji: '🐶', order: 6, levelIntroduced: 1 },
  { language: 'telugu', word: 'పిల్లి', category: 'animals', meaning: 'cat', emoji: '🐱', order: 7, levelIntroduced: 1 },
  { language: 'telugu', word: 'ఏనుగు', category: 'animals', meaning: 'elephant', emoji: '🐘', order: 8, levelIntroduced: 1 },
  { language: 'telugu', word: 'సింహం', category: 'animals', meaning: 'lion', emoji: '🦁', order: 9, levelIntroduced: 1 },
  { language: 'telugu', word: 'ఆవు', category: 'animals', meaning: 'cow', emoji: '🐄', order: 10, levelIntroduced: 1 },

  // Telugu - Pets
  { language: 'telugu', word: 'చిలుక', category: 'pets', meaning: 'parrot', emoji: '🦜', order: 11, levelIntroduced: 2 },
  { language: 'telugu', word: 'కుందేలు', category: 'pets', meaning: 'rabbit', emoji: '🐰', order: 12, levelIntroduced: 2 },
  { language: 'telugu', word: 'చేప', category: 'pets', meaning: 'fish', emoji: '🐟', order: 13, levelIntroduced: 2 },
  { language: 'telugu', word: 'తాబేలు', category: 'pets', meaning: 'turtle', emoji: '🐢', order: 14, levelIntroduced: 2 },
  { language: 'telugu', word: 'ఎలుక', category: 'pets', meaning: 'mouse', emoji: '🐭', order: 15, levelIntroduced: 2 },

  // Telugu - Vegetables
  { language: 'telugu', word: 'క్యారెట్', category: 'vegetables', meaning: 'carrot', emoji: '🥕', order: 16, levelIntroduced: 2 },
  { language: 'telugu', word: 'బంగాళదుంప', category: 'vegetables', meaning: 'potato', emoji: '🥔', order: 17, levelIntroduced: 2 },
  { language: 'telugu', word: 'టమాటా', category: 'vegetables', meaning: 'tomato', emoji: '🍅', order: 18, levelIntroduced: 2 },
  { language: 'telugu', word: 'ఉల్లిపాయ', category: 'vegetables', meaning: 'onion', emoji: '🧅', order: 19, levelIntroduced: 2 },
  { language: 'telugu', word: 'బెండకాయ', category: 'vegetables', meaning: 'okra', emoji: '🌱', order: 20, levelIntroduced: 2 },

  // Telugu - Birds
  { language: 'telugu', word: 'కాకి', category: 'birds', meaning: 'crow', emoji: '🐦', order: 21, levelIntroduced: 3 },
  { language: 'telugu', word: 'నెమలి', category: 'birds', meaning: 'peacock', emoji: '🦚', order: 22, levelIntroduced: 3 },
  { language: 'telugu', word: 'చిలక', category: 'birds', meaning: 'sparrow', emoji: '🐤', order: 23, levelIntroduced: 3 },
  { language: 'telugu', word: 'పావురం', category: 'birds', meaning: 'pigeon', emoji: '🕊️', order: 24, levelIntroduced: 3 },
  { language: 'telugu', word: 'కోడి', category: 'birds', meaning: 'hen', emoji: '🐔', order: 25, levelIntroduced: 3 },

  // Telugu - Vehicles
  { language: 'telugu', word: 'కారు', category: 'vehicles', meaning: 'car', emoji: '🚗', order: 26, levelIntroduced: 3 },
  { language: 'telugu', word: 'బస్సు', category: 'vehicles', meaning: 'bus', emoji: '🚌', order: 27, levelIntroduced: 3 },
  { language: 'telugu', word: 'సైకిల్', category: 'vehicles', meaning: 'bicycle', emoji: '🚲', order: 28, levelIntroduced: 3 },
  { language: 'telugu', word: 'రైలు', category: 'vehicles', meaning: 'train', emoji: '🚆', order: 29, levelIntroduced: 3 },
  { language: 'telugu', word: 'ట్రక్', category: 'vehicles', meaning: 'truck', emoji: '🚚', order: 30, levelIntroduced: 3 },
];

async function seedWordSortingBasket() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected for word sorting basket seeding');

    await WordSortingItem.deleteMany({});
    console.log('Cleared existing word sorting basket data');

    await WordSortingItem.insertMany(items);
    console.log(`Seeded ${items.length} word sorting items`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding word sorting basket data:', error);
    process.exit(1);
  }
}

seedWordSortingBasket();