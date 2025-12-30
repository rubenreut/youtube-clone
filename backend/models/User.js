const mongoose = require('mongoose');

//user schema

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String, 
        required: true,
        minlength: 6
    },

    channelName: {
        type: String,
        required: true,
        maxlength: 50,
        minlength: 5
    },

    channelDescription: {
        type: String,
        default: '',
        maxlength: 1000
    },

    profilePicture: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },

    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    subscribedChannels: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }],

    watchHistory: [{
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        },

        watchedAt:{
            type: Date,
            default: Date.now
        }
    }],

    watchLater: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);