const mongoose = require('mongoose');
require('dotenv').config();
const Swara = require('../models/Swara');

const swaraData = [
    { id: 1, letter: 'अ', word: 'अमरूद', image: '/images/swara/a.png', audio: '/audio/swara/a_se_amarood.mp3' },
    { id: 2, letter: 'आ', word: 'आम', image: '/images/swara/aa.png', audio: '/audio/swara/aa_se_aam.mp3' },
    { id: 3, letter: 'इ', word: 'इमली', image: '/images/swara/i.png', audio: '/audio/swara/i_se_imli.mp3' },
    { id: 4, letter: 'ई', word: 'ईख', image: '/images/swara/ee.png', audio: '/audio/swara/ee_se_eekh.mp3' },
    { id: 5, letter: 'उ', word: 'उल्लू', image: '/images/swara/u.png', audio: '/audio/swara/u_se_ullu.mp3' },
    { id: 6, letter: 'ऊ', word: 'ऊन', image: '/images/swara/oo.png', audio: '/audio/swara/oo_se_oon.mp3' },
    { id: 7, letter: 'ऋ', word: 'ऋषि', image: '/images/swara/ri.png', audio: '/audio/swara/ri_se_rishi.mp3' },
    { id: 8, letter: 'ए', word: 'एड़ी', image: '/images/swara/edi.png', audio: '/audio/swara/e_se_edi.mp3' },
    { id: 9, letter: 'ऐ', word: 'ऐनक', image: '/images/swara/ai.png', audio: '/audio/swara/ai_se_ainak.mp3' },
    { id: 10, letter: 'ओ', word: 'ओखली', image: '/images/swara/o.png', audio: '/audio/swara/o_se_okhli.mp3' },
    { id: 11, letter: 'औ', word: 'औरत', image: '/images/swara/au.png', audio: '/audio/swara/au_se_aurat.mp3' },
    { id: 12, letter: 'अं', word: 'अंगूर', image: '/images/swara/an.png', audio: '/audio/swara/an_se_angoor.mp3' },
    { id: 13, letter: 'अः', word: 'प्रातः', image: '/images/swara/ah.png', audio: '/audio/swara/ah_se_pratah.mp3' }
];

const seedSwaras = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Swara.deleteMany({});
        console.log('🗑️  Cleared existing swaras');

        // Insert all 13 swaras
        const result = await Swara.insertMany(swaraData);
        console.log(`✅ Seeded ${result.length} swaras successfully!`);

        // Verify
        const swaras = await Swara.find({}).sort({ id: 1 });
        console.log('\n📋 Seeded swaras:');
        swaras.forEach((s) => {
            console.log(`   ${s.id}. ${s.letter} — ${s.word}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Database seeded and connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedSwaras();
