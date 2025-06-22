const mongoose = require('mongoose');
const {schemaOptions} = require('./modelOptions');

const boardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    icon: {
        type: String,
        default: '👍'
    },
    title: {
        type: String,
        default: 'Untitled'
    },
    description: {
        type: String,
        default: `Add description here
            ❤️ You can add many description
            ❤️ Let's start...`
    },
    position: {
        type: Number
    },
    favorite: {
        type: Boolean,
        default: false
    },
    favoritePosition: {
        type: Number,
        default: 0
    }
}, schemaOptions);

module.exports = mongoose.model('Board', boardSchema);