require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Video = require('./models/Video');

// Sample video URLs (free/open source videos)
const sampleVideos = [
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        title: 'Big Buck Bunny',
        description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
        category: 'Entertainment'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
        title: 'Elephants Dream',
        description: 'The first Blender Open Movie from 2006.',
        category: 'Entertainment'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        title: 'For Bigger Blazes',
        description: 'HBO GO now icons Icons icons Icons icons Icons icons Icons.',
        category: 'Entertainment'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
        title: 'For Bigger Escapes',
        description: 'Introducing Chromecast. The easiest way to enjoy online video on your TV.',
        category: 'Entertainment'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
        title: 'For Bigger Fun',
        description: 'Introducing Chromecast. The easiest way to enjoy online video.',
        category: 'Entertainment'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
        title: 'For Bigger Joyrides',
        description: 'Introducing Chromecast. For your big icons.',
        category: 'Entertainment'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
        title: 'For Bigger Meltdowns',
        description: 'Introducing Chromecast. Watch Mail icons icons icons.',
        category: 'Entertainment'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
        title: 'Sintel',
        description: 'Sintel is a short computer animated film by the Blender Institute.',
        category: 'Entertainment'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
        title: 'Subaru Outback On Street And Dirt',
        description: 'Subaru Outback in action on street and dirt.',
        category: 'Sport'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
        title: 'Tears of Steel',
        description: 'Tears of Steel was realized with crowd-funding by the Blender Institute.',
        category: 'Entertainment'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/VolkswagenGTIReview.jpg',
        title: 'Volkswagen GTI Review',
        description: 'The Volkswagen Golf GTI is a hot hatchback.',
        category: 'Other'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WeAreGoingOnBullrun.jpg',
        title: 'We Are Going On Bullrun',
        description: 'We Are Going On Bullrun adventure documentary.',
        category: 'Sport'
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
        thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/WhatCarCanYouGetForAGrand.jpg',
        title: 'What Car Can You Get For A Grand',
        description: 'What Car Can You Get For A Grand? Find out!',
        category: 'Other'
    }
];

const channels = [
    {
        username: 'techreviewer',
        email: 'tech@example.com',
        password: 'password123',
        channelName: 'Tech Reviews Daily',
        channelDescription: 'Your daily dose of tech reviews and gadget news!'
    },
    {
        username: 'gamingpro',
        email: 'gaming@example.com',
        password: 'password123',
        channelName: 'Gaming Pro Channel',
        channelDescription: 'Epic gaming content, walkthroughs, and reviews.'
    },
    {
        username: 'musicvibes',
        email: 'music@example.com',
        password: 'password123',
        channelName: 'Music Vibes',
        channelDescription: 'Chill music, playlists, and music production tutorials.'
    },
    {
        username: 'naturelover',
        email: 'nature@example.com',
        password: 'password123',
        channelName: 'Nature & Wildlife',
        channelDescription: 'Beautiful nature documentaries and wildlife footage.'
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('Connected!');

        // Create users
        const createdUsers = [];
        for (const channel of channels) {
            // Check if user already exists
            const existing = await User.findOne({ email: channel.email });
            if (existing) {
                console.log(`User ${channel.username} already exists, skipping...`);
                createdUsers.push(existing);
                continue;
            }

            const hashedPassword = await bcrypt.hash(channel.password, 10);
            const user = new User({
                ...channel,
                password: hashedPassword
            });
            await user.save();
            console.log(`Created user: ${channel.channelName}`);
            createdUsers.push(user);
        }

        // Distribute videos among users (about 5 each)
        let videoIndex = 0;
        for (const user of createdUsers) {
            // Check how many videos user already has
            const existingVideos = await Video.countDocuments({ creator: user._id });
            if (existingVideos >= 3) {
                console.log(`User ${user.channelName} already has videos, skipping...`);
                continue;
            }

            const videosToCreate = 5;
            for (let i = 0; i < videosToCreate && videoIndex < sampleVideos.length; i++) {
                const videoData = sampleVideos[videoIndex];
                const video = new Video({
                    title: videoData.title,
                    description: videoData.description,
                    videoURL: videoData.url,
                    thumbnailURL: videoData.thumbnail,
                    creator: user._id,
                    category: videoData.category,
                    views: Math.floor(Math.random() * 10000),
                    duration: Math.floor(Math.random() * 600) + 60
                });
                await video.save();
                console.log(`Created video: ${videoData.title} for ${user.channelName}`);
                videoIndex++;
            }
        }

        console.log('\nSeeding complete!');
        console.log(`Created ${createdUsers.length} channels with videos.`);
        console.log('\nTest accounts (password: password123):');
        channels.forEach(c => console.log(`  - ${c.email}`));

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
}

seed();
