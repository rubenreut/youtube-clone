const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 1400,
        trim: true
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    }, // this is for replies - if null then its main comment

    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Comment', commentSchema);