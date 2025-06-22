const mongoose = require('mongoose');
const {schemaOptions} = require('./modelOptions');

const taskSchema = new mongoose.Schema({
    section: {
        type: mongoose.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    position: {
        type: Number
    }
}, schemaOptions);

module.exports = mongoose.model('Task', taskSchema);