const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema ({

    title: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },

    description: {
        type: String,
        required: false,
        maxlength: 100,
        default: ''
    },

    videoURL: {
        type: String,
        required: true
    },

    thumbnailURL: {
        type: String,
        required: true
    },

    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    duration: {
        type: Number,
        default: 0
    },
    
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    category: {
        type: String,
        enum: ['Music', 'Gaming', 'Education', 'Entertainment', 'Sport', 'Comedy', 'News', 'Other'], // enum only allows these specific strings as input
        default: 'Other'
    },

    uploadDate: {
        type: Date,
        default: Date.now
    }
});


//search index for better search performance
videoSchema.index({
    title: 'text' , description: 'text', 
});

module.exports = mongoose.model('Video', videoSchema);