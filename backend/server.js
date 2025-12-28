console.log('Script is starting...');

require('dotenv').config();

// Log environment variables status (without exposing sensitive data)
console.log('Environment check:');
console.log('- MongoDB URI exists:', !!process.env.MONGODB_URI);
console.log('- JWT Secret exists:', !!process.env.JWT_SECRET);
console.log('- Supabase URL exists:', !!process.env.SUPABASE_URL);
console.log('- Supabase Key exists:', !!process.env.SUPABASE_SERVICE_KEY);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');

console.log('Creating Express app...');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads'));

// Routes
app.get("/", (req, res) => {
    res.json({ message: 'Youtube Clone Api is running!' });
});

// Seed endpoint - creates test data
app.post("/api/seed", async (req, res) => {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const Video = require('./models/Video');

    const sampleVideos = [
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg', title: 'Big Buck Bunny', description: 'Big Buck Bunny tells the story of a giant rabbit.', category: 'Entertainment' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg', title: 'Elephants Dream', description: 'The first Blender Open Movie from 2006.', category: 'Entertainment' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg', title: 'For Bigger Blazes', description: 'HBO GO now works icons icons.', category: 'Entertainment' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg', title: 'For Bigger Escapes', description: 'Introducing Chromecast.', category: 'Entertainment' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg', title: 'For Bigger Fun', description: 'Chromecast makes it easy.', category: 'Entertainment' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg', title: 'Sintel', description: 'A short animated film by Blender Institute.', category: 'Entertainment' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg', title: 'Subaru Outback Review', description: 'Subaru Outback on street and dirt.', category: 'Sport' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg', title: 'Tears of Steel', description: 'Tears of Steel sci-fi short film.', category: 'Entertainment' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg', title: 'Volkswagen GTI Review', description: 'The Volkswagen Golf GTI review.', category: 'Other' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg', title: 'We Are Going On Bullrun', description: 'Bullrun adventure documentary.', category: 'Sport' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WhatCarCanYouGetForAGrand.jpg', title: 'What Car For A Grand', description: 'What Car Can You Get For A Grand?', category: 'Other' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg', title: 'For Bigger Joyrides', description: 'Chromecast joyrides promo.', category: 'Entertainment' },
    ];

    const channels = [
        { username: 'techreviewer', email: 'tech@example.com', password: 'password123', channelName: 'Tech Reviews Daily', channelDescription: 'Your daily dose of tech reviews!' },
        { username: 'gamingpro', email: 'gaming@example.com', password: 'password123', channelName: 'Gaming Pro Channel', channelDescription: 'Epic gaming content and reviews.' },
        { username: 'musicvibes', email: 'music@example.com', password: 'password123', channelName: 'Music Vibes', channelDescription: 'Chill music and playlists.' },
        { username: 'naturelover', email: 'nature@example.com', password: 'password123', channelName: 'Nature & Wildlife', channelDescription: 'Beautiful nature documentaries.' }
    ];

    try {
        const createdUsers = [];
        for (const channel of channels) {
            let user = await User.findOne({ email: channel.email });
            if (!user) {
                const hashedPassword = await bcrypt.hash(channel.password, 10);
                user = new User({ ...channel, password: hashedPassword });
                await user.save();
            }
            createdUsers.push(user);
        }

        let videoIndex = 0;
        for (const user of createdUsers) {
            const existingVideos = await Video.countDocuments({ creator: user._id });
            if (existingVideos >= 3) continue;

            for (let i = 0; i < 3 && videoIndex < sampleVideos.length; i++) {
                const v = sampleVideos[videoIndex];
                const video = new Video({
                    title: v.title, description: v.description, videoURL: v.url,
                    thumbnailURL: v.thumbnail, creator: user._id, category: v.category,
                    views: Math.floor(Math.random() * 10000), duration: Math.floor(Math.random() * 600) + 60
                });
                await video.save();
                videoIndex++;
            }
        }

        res.json({ message: 'Seeding complete!', channels: channels.map(c => c.email) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3099;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Connect to MongoDB after server starts
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube-clone', {
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log('✅ MongoDB connected!');
}).catch((error) => {
    console.error('❌ MongoDB Error:', error.message);
    console.log('Server continues without database');
});