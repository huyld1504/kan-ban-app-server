const mongoose = require('mongoose');
const {schemaOptions} = require('./modelOptions');

const sectionSchema = new mongoose.Schema({
    board: {
        type: mongoose.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    title: {
        type: String,
        default: ''
    }
}, schemaOptions);

module.exports = mongoose.model('Section', sectionSchema);