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
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg', title: 'How 3D Animation Works - A Deep Dive', description: 'Learn the fundamentals of 3D animation, rendering techniques, and how modern animated films are created using computer graphics.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg', title: 'The Science of Dreams and Consciousness', description: 'Exploring the neuroscience behind dreams, REM sleep, and what happens in our brains when we sleep.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg', title: 'Chemistry of Fire - How Combustion Works', description: 'Understanding the chemical reactions behind fire, combustion, and why different materials burn differently.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg', title: 'Physics of Space Travel Explained', description: 'How rockets work, orbital mechanics, and the physics challenges of interplanetary travel.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg', title: 'The Mathematics Behind Music', description: 'Discover how mathematical patterns create harmony, rhythm, and why certain sounds are pleasing to our ears.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg', title: 'Digital Art and Open Source Animation', description: 'How open source software is revolutionizing the animation industry and enabling independent creators.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg', title: 'Engineering Behind All-Wheel Drive Systems', description: 'Technical breakdown of AWD technology, differentials, and how modern vehicles handle various terrains.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg', title: 'Visual Effects in Modern Cinema', description: 'Behind the scenes look at VFX pipelines, CGI integration, and how blockbuster movies create impossible scenes.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg', title: 'Internal Combustion Engines Explained', description: 'How car engines work - pistons, timing, fuel injection, and the engineering that powers millions of vehicles.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg', title: 'Geography of the American Southwest', description: 'Exploring the geological formations, climate patterns, and unique ecosystems of the American desert regions.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WhatCarCanYouGetForAGrand.jpg', title: 'Economics of Used Car Markets', description: 'Understanding depreciation curves, market dynamics, and the economics behind vehicle pricing.', category: 'Education' },
        { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg', title: 'The Psychology of Thrill-Seeking', description: 'Why some people seek adrenaline rushes - the neuroscience of dopamine, risk assessment, and sensation seeking.', category: 'Education' },
    ];

    const channels = [
        { username: 'scienceexplained', email: 'science@example.com', password: 'password123', channelName: 'Science Explained', channelDescription: 'Making complex science accessible to everyone. New videos every week!' },
        { username: 'techinsights', email: 'tech@example.com', password: 'password123', channelName: 'Tech Insights', channelDescription: 'Deep dives into technology, engineering, and innovation.' },
        { username: 'learnwithme', email: 'learn@example.com', password: 'password123', channelName: 'Learn With Me', channelDescription: 'Educational content for curious minds of all ages.' },
        { username: 'curiositylab', email: 'curiosity@example.com', password: 'password123', channelName: 'Curiosity Lab', channelDescription: 'Experiments, explanations, and explorations of the world around us.' }
    ];

    try {
        // First, get all existing users to use for fake likes
        const allUsers = await User.find().select('_id');
        const userIds = allUsers.map(u => u._id);

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

        // Update userIds with newly created users
        const updatedUserIds = [...userIds, ...createdUsers.map(u => u._id)];

        let videoIndex = 0;
        for (const user of createdUsers) {
            const existingVideos = await Video.countDocuments({ creator: user._id });
            if (existingVideos >= 3) continue;

            for (let i = 0; i < 3 && videoIndex < sampleVideos.length; i++) {
                const v = sampleVideos[videoIndex];

                // Generate random likes from existing users
                const numLikes = Math.floor(Math.random() * Math.min(updatedUserIds.length, 50)) + 5;
                const shuffled = [...updatedUserIds].sort(() => 0.5 - Math.random());
                const fakeLikes = shuffled.slice(0, numLikes);

                const video = new Video({
                    title: v.title,
                    description: v.description,
                    videoURL: v.url,
                    thumbnailURL: v.thumbnail,
                    creator: user._id,
                    category: v.category,
                    views: Math.floor(Math.random() * 50000) + 1000,
                    likes: fakeLikes,
                    duration: Math.floor(Math.random() * 600) + 120
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