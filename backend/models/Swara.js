const mongoose = require('mongoose');

const swaraSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    letter: {
        type: String,
        required: true
    },
    word: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    audio: {
        type: String,
        required: true
    }
}, {
    collection: 'swaras'
});

module.exports = mongoose.model('Swara', swaraSchema);
