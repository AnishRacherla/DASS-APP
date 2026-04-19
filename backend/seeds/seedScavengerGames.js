const mongoose = require('mongoose');
const Game = require('../models/Game');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding scavenger games');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

// Audio paths use /audio/hindi_letters/{id}_Hindi.mp3 and /audio/telugu_letters/{id}_Telugu.mp3
// Letters spread across full image: corners, center, edges

const hindiScenes = [
    {
        scene: 'kitchen',
        title: 'Kitchen Hunt — रसोई में खोजो!',
        description: 'Find hidden consonants in the kitchen!',
        sceneImage: '/images/scavenger/kitchen.png',
        letters: [
            { letter: 'क', word: 'कटोरा', audioUrl: '/audio/hindi_letters/ka_Hindi.mp3', x: 15, y: 20, blendColor: '#8B6914' },
            { letter: 'च', word: 'चम्मच', audioUrl: '/audio/hindi_letters/cha_Hindi.mp3', x: 75, y: 15, blendColor: '#A0522D' },
            { letter: 'ग', word: 'गिलास', audioUrl: '/audio/hindi_letters/ga_Hindi.mp3', x: 85, y: 55, blendColor: '#6B8E23' },
            { letter: 'म', word: 'मटका', audioUrl: '/audio/hindi_letters/ma_Hindi.mp3', x: 30, y: 80, blendColor: '#CD853F' },
            { letter: 'त', word: 'तवा', audioUrl: '/audio/hindi_letters/ta1_Hindi.mp3', x: 50, y: 45, blendColor: '#696969' },
        ]
    },
    {
        scene: 'market',
        title: 'Market Hunt — बाज़ार में खोजो!',
        description: 'Find hidden consonants in the market!',
        sceneImage: '/images/scavenger/market.png',
        letters: [
            { letter: 'ब', word: 'बैग', audioUrl: '/audio/hindi_letters/ba_Hindi.mp3', x: 12, y: 30, blendColor: '#B22222' },
            { letter: 'प', word: 'पानी', audioUrl: '/audio/hindi_letters/pa_Hindi.mp3', x: 85, y: 25, blendColor: '#4682B4' },
            { letter: 'ज', word: 'जूता', audioUrl: '/audio/hindi_letters/ja_Hindi.mp3', x: 20, y: 75, blendColor: '#8B4513' },
            { letter: 'द', word: 'दुकान', audioUrl: '/audio/hindi_letters/da1_Hindi.mp3', x: 55, y: 15, blendColor: '#DAA520' },
            { letter: 'स', word: 'सेब', audioUrl: '/audio/hindi_letters/sa_Hindi.mp3', x: 70, y: 70, blendColor: '#228B22' },
        ]
    },
    {
        scene: 'garden',
        title: 'Garden Hunt — बगीचे में खोजो!',
        description: 'Find hidden consonants in the garden!',
        sceneImage: '/images/scavenger/garden.png',
        letters: [
            { letter: 'फ', word: 'फूल', audioUrl: '/audio/hindi_letters/pha_Hindi.mp3', x: 20, y: 25, blendColor: '#FF69B4' },
            { letter: 'न', word: 'नल', audioUrl: '/audio/hindi_letters/na_Hindi.mp3', x: 80, y: 40, blendColor: '#2E8B57' },
            { letter: 'ल', word: 'लता', audioUrl: '/audio/hindi_letters/la_Hindi.mp3', x: 10, y: 65, blendColor: '#556B2F' },
            { letter: 'र', word: 'रस्सी', audioUrl: '/audio/hindi_letters/ra_Hindi.mp3', x: 55, y: 15, blendColor: '#8B7355' },
            { letter: 'ह', word: 'हिरन', audioUrl: '/audio/hindi_letters/ha_Hindi.mp3', x: 85, y: 80, blendColor: '#6B8E23' },
            { letter: 'व', word: 'वृक्ष', audioUrl: '/audio/hindi_letters/va_Hindi.mp3', x: 40, y: 55, blendColor: '#228B22' },
        ]
    },
    {
        scene: 'bedroom',
        title: 'Bedroom Hunt — कमरे में खोजो!',
        description: 'Find hidden consonants in the bedroom!',
        sceneImage: '/images/scavenger/bedroom.png',
        letters: [
            { letter: 'ख', word: 'खिड़की', audioUrl: '/audio/hindi_letters/kha_Hindi.mp3', x: 15, y: 18, blendColor: '#87CEEB' },
            { letter: 'थ', word: 'थैला', audioUrl: '/audio/hindi_letters/tha_Hindi.mp3', x: 75, y: 75, blendColor: '#DEB887' },
            { letter: 'ध', word: 'धागा', audioUrl: '/audio/hindi_letters/dha_Hindi.mp3', x: 85, y: 30, blendColor: '#BC8F8F' },
            { letter: 'भ', word: 'भालू', audioUrl: '/audio/hindi_letters/bha_Hindi.mp3', x: 30, y: 60, blendColor: '#A0522D' },
            { letter: 'श', word: 'शीशा', audioUrl: '/audio/hindi_letters/sha_Hindi.mp3', x: 50, y: 85, blendColor: '#B0C4DE' },
        ]
    },
    {
        scene: 'playground',
        title: 'Playground Hunt — मैदान में खोजो!',
        description: 'Find hidden consonants in the playground!',
        sceneImage: '/images/scavenger/playground.png',
        letters: [
            { letter: 'घ', word: 'घड़ी', audioUrl: '/audio/hindi_letters/gha_Hindi.mp3', x: 12, y: 25, blendColor: '#DAA520' },
            { letter: 'छ', word: 'छतरी', audioUrl: '/audio/hindi_letters/chha_Hindi.mp3', x: 50, y: 12, blendColor: '#FF6347' },
            { letter: 'झ', word: 'झूला', audioUrl: '/audio/hindi_letters/jha_Hindi.mp3', x: 85, y: 45, blendColor: '#4169E1' },
            { letter: 'ड', word: 'डमरू', audioUrl: '/audio/hindi_letters/da2_Hindi.mp3', x: 25, y: 75, blendColor: '#CD853F' },
            { letter: 'य', word: 'यान', audioUrl: '/audio/hindi_letters/ya_Hindi.mp3', x: 70, y: 80, blendColor: '#32CD32' },
        ]
    }
];

const teluguScenes = [
    {
        scene: 'kitchen',
        title: 'Kitchen Hunt — వంటగదిలో వెతకండి!',
        description: 'Find hidden consonants in the kitchen!',
        sceneImage: '/images/scavenger/kitchen.png',
        letters: [
            { letter: 'క', word: 'కత్తి', audioUrl: '/audio/telugu_letters/ka_Telugu.mp3', x: 15, y: 20, blendColor: '#8B6914' },
            { letter: 'చ', word: 'చెంచా', audioUrl: '/audio/telugu_letters/cha_Telugu.mp3', x: 75, y: 15, blendColor: '#A0522D' },
            { letter: 'గ', word: 'గిన్నె', audioUrl: '/audio/telugu_letters/ga_Telugu.mp3', x: 85, y: 55, blendColor: '#6B8E23' },
            { letter: 'మ', word: 'మంట', audioUrl: '/audio/telugu_letters/ma_Telugu.mp3', x: 30, y: 80, blendColor: '#CD853F' },
            { letter: 'త', word: 'తవా', audioUrl: '/audio/telugu_letters/da1_Telugu.mp3', x: 50, y: 45, blendColor: '#696969' },
        ]
    },
    {
        scene: 'market',
        title: 'Market Hunt — మార్కెట్‌లో వెతకండి!',
        description: 'Find hidden consonants in the market!',
        sceneImage: '/images/scavenger/market.png',
        letters: [
            { letter: 'బ', word: 'బ్యాగ్', audioUrl: '/audio/telugu_letters/ba_Telugu.mp3', x: 12, y: 30, blendColor: '#B22222' },
            { letter: 'ప', word: 'పండు', audioUrl: '/audio/telugu_letters/pa_Telugu.mp3', x: 85, y: 25, blendColor: '#4682B4' },
            { letter: 'జ', word: 'జామ', audioUrl: '/audio/telugu_letters/ja_Telugu.mp3', x: 20, y: 75, blendColor: '#8B4513' },
            { letter: 'ద', word: 'దుకాణం', audioUrl: '/audio/telugu_letters/da1_Telugu.mp3', x: 55, y: 15, blendColor: '#DAA520' },
            { letter: 'స', word: 'సేబు', audioUrl: '/audio/telugu_letters/sa_Telugu.mp3', x: 70, y: 70, blendColor: '#228B22' },
        ]
    },
    {
        scene: 'garden',
        title: 'Garden Hunt — తోటలో వెతకండి!',
        description: 'Find hidden consonants in the garden!',
        sceneImage: '/images/scavenger/garden.png',
        letters: [
            { letter: 'న', word: 'నల్ల', audioUrl: '/audio/telugu_letters/na_Telugu.mp3', x: 80, y: 40, blendColor: '#2E8B57' },
            { letter: 'ల', word: 'లత', audioUrl: '/audio/telugu_letters/la_Telugu.mp3', x: 10, y: 65, blendColor: '#556B2F' },
            { letter: 'ర', word: 'రాయి', audioUrl: '/audio/telugu_letters/ra_Telugu.mp3', x: 55, y: 15, blendColor: '#8B7355' },
            { letter: 'హ', word: 'హరిణం', audioUrl: '/audio/telugu_letters/ha_Telugu.mp3', x: 85, y: 80, blendColor: '#6B8E23' },
            { letter: 'వ', word: 'వనం', audioUrl: '/audio/telugu_letters/va_Telugu.mp3', x: 40, y: 55, blendColor: '#228B22' },
        ]
    },
    {
        scene: 'bedroom',
        title: 'Bedroom Hunt — గదిలో వెతకండి!',
        description: 'Find hidden consonants in the bedroom!',
        sceneImage: '/images/scavenger/bedroom.png',
        letters: [
            { letter: 'ఖ', word: 'కిటికీ', audioUrl: '/audio/telugu_letters/kha_Telugu.mp3', x: 15, y: 18, blendColor: '#87CEEB' },
            { letter: 'ధ', word: 'దారం', audioUrl: '/audio/telugu_letters/dha_Telugu.mp3', x: 85, y: 30, blendColor: '#BC8F8F' },
            { letter: 'భ', word: 'భల్లూకం', audioUrl: '/audio/telugu_letters/bha_Telugu.mp3', x: 30, y: 60, blendColor: '#A0522D' },
            { letter: 'ఘ', word: 'ఘంట', audioUrl: '/audio/telugu_letters/gha_Telugu.mp3', x: 50, y: 85, blendColor: '#B0C4DE' },
            { letter: 'చ', word: 'చెంచా', audioUrl: '/audio/telugu_letters/cha_Telugu.mp3', x: 75, y: 75, blendColor: '#DEB887' },
        ]
    },
    {
        scene: 'playground',
        title: 'Playground Hunt — ఆటస్థలంలో వెతకండి!',
        description: 'Find hidden consonants in the playground!',
        sceneImage: '/images/scavenger/playground.png',
        letters: [
            { letter: 'క', word: 'కత్తి', audioUrl: '/audio/telugu_letters/ka_Telugu.mp3', x: 12, y: 25, blendColor: '#DAA520' },
            { letter: 'జ', word: 'జామ', audioUrl: '/audio/telugu_letters/ja_Telugu.mp3', x: 50, y: 12, blendColor: '#FF6347' },
            { letter: 'బ', word: 'బంతి', audioUrl: '/audio/telugu_letters/ba_Telugu.mp3', x: 85, y: 45, blendColor: '#4169E1' },
            { letter: 'ద', word: 'దారం', audioUrl: '/audio/telugu_letters/da1_Telugu.mp3', x: 25, y: 75, blendColor: '#CD853F' },
            { letter: 'మ', word: 'మట్టి', audioUrl: '/audio/telugu_letters/ma_Telugu.mp3', x: 70, y: 80, blendColor: '#32CD32' },
        ]
    }
];

function buildScavengerGame(sceneData, language, level) {
    return {
        gameType: 'scavenger',
        gameId: `scavenger-${language}-${sceneData.scene}-${level}`,
        title: sceneData.title,
        description: sceneData.description,
        language,
        level,
        difficulty: sceneData.letters.length <= 5 ? 'easy' : 'medium',
        gameData: {
            scene: sceneData.scene,
            sceneImage: sceneData.sceneImage,
            lettersCount: sceneData.letters.length,
            letters: sceneData.letters
        },
        config: {
            timeLimit: 0,
            pointsPerCorrect: 10,
            pointsPerIncorrect: 0,
            numberOfRounds: 1
        },
        assets: { images: [], audio: [], videos: [] },
        isActive: true
    };
}

const scavengerGames = [];
hindiScenes.forEach((scene, idx) => {
    scavengerGames.push(buildScavengerGame(scene, 'hindi', idx + 1));
});
teluguScenes.forEach((scene, idx) => {
    scavengerGames.push(buildScavengerGame(scene, 'telugu', idx + 1));
});

const seedScavengerGames = async () => {
    try {
        await connectDB();
        await Game.deleteMany({ gameType: 'scavenger' });
        console.log('Cleared existing scavenger games');

        await Game.insertMany(scavengerGames);
        console.log(`Seeded ${scavengerGames.length} scavenger games successfully!`);

        const count = await Game.countDocuments({ gameType: 'scavenger' });
        console.log(`Total scavenger games in database: ${count}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding scavenger games:', error);
        process.exit(1);
    }
};

seedScavengerGames();
