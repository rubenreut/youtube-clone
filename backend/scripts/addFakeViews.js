// Script to add fake views to existing videos
// Run with: node scripts/addFakeViews.js

require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('../models/Video');

const MONGODB_URI = process.env.MONGODB_URI;

async function addFakeViews() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all videos
        const videos = await Video.find({});
        console.log(`Found ${videos.length} videos`);

        for (const video of videos) {
            // Generate random views between 100 and 500,000
            const fakeViews = Math.floor(Math.random() * 500000) + 100;

            // Generate random duration between 30 seconds and 20 minutes
            const fakeDuration = Math.floor(Math.random() * 1170) + 30;

            await Video.findByIdAndUpdate(video._id, {
                views: fakeViews,
                duration: fakeDuration
            });

            console.log(`Updated "${video.title}": ${fakeViews.toLocaleString()} views, ${Math.floor(fakeDuration / 60)}:${(fakeDuration % 60).toString().padStart(2, '0')} duration`);
        }

        console.log('\nDone! All videos updated with fake views and durations.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addFakeViews();
