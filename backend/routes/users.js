const router = require('express').Router();
const User = require('../models/User');
const Video = require('../models/Video');
const verifyToken = require('../middleware/auth');

// GET users channel with their videos - SPECIFIC ROUTE FIRST
router.get('/channels/:userId', async(req, res) => {
    try{
        // Get user info
        const user = await User.findById(req.params.userId).select('-password');
        
        if(!user){
            return res.status(404).json({error: 'Channel not found'});
        }

        // Get all videos by this user
        const videos = await Video.find({ creator: req.params.userId}).sort({uploadDate: -1});

        res.json({
            user: {
                id: user._id,
                username: user.username,
                channelName: user.channelName || user.username,
                subscribers: user.subscribers?.length || 0,
                createdAt: user.createdAt
            },
            videos: videos
        });
    }
    catch(error){
        console.error('Channel route error:', error);
        res.status(500).json({ error: error.message});
    }
});

// GET videos from subscribed channels
router.get('/me/subscriptions', verifyToken, async(req, res) => {
    try {
        const user = await User.findById(req.userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get videos from all subscribed channels
        const videos = await Video.find({
            creator: { $in: user.subscribedChannels }
        })
        .populate('creator', 'username channelName profilePicture')
        .sort({ uploadDate: -1 });

        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user's watch history
router.get('/me/history', verifyToken, async(req, res) => {
    try {
        const user = await User.findById(req.userID)
            .populate({
                path: 'watchHistory.video',
                populate: { path: 'creator', select: 'username channelName profilePicture' }
            });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return history sorted by most recent
        const history = user.watchHistory
            .filter(h => h.video) // Filter out deleted videos
            .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST add video to watch history
router.post('/me/history', verifyToken, async(req, res) => {
    try {
        const { videoId } = req.body;
        const user = await User.findById(req.userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove existing entry for this video (to update timestamp)
        user.watchHistory = user.watchHistory.filter(
            h => h.video.toString() !== videoId
        );

        // Add to beginning of history
        user.watchHistory.unshift({
            video: videoId,
            watchedAt: new Date()
        });

        // Keep only last 100 videos in history
        if (user.watchHistory.length > 100) {
            user.watchHistory = user.watchHistory.slice(0, 100);
        }

        await user.save();
        res.json({ message: 'Added to history' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user's library (uploads + liked videos)
router.get('/me/library', verifyToken, async(req, res) => {
    try {
        // Get user's uploaded videos
        const uploads = await Video.find({ creator: req.userID })
            .populate('creator', 'username channelName profilePicture')
            .sort({ uploadDate: -1 });

        // Get videos user has liked
        const likedVideos = await Video.find({
            likes: req.userID
        })
        .populate('creator', 'username channelName profilePicture')
        .sort({ uploadDate: -1 });

        res.json({
            uploads,
            likedVideos
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SUBSCRIBE/UNSUBSCRIBE to channel
router.post('/:id/subscribe', verifyToken, async(req, res) => {
    try{
        const channelToSubscribe = await User.findById(req.params.id);
        const currentUser = await User.findById(req.userID);

        if(!channelToSubscribe){
            return res.status(404).json({ error: 'Channel Not found'});
        }

        // Can't subscribe to your own channel
        if(req.params.id === req.userID){
            return res.status(400).json({error: 'Cannot subscribe to yourself.'});
        }

        // Check if already subscribed
        const isSubscribed = currentUser.subscribedChannels.includes(req.params.id);

        if(isSubscribed){
            // Unsubscribe
            currentUser.subscribedChannels = currentUser.subscribedChannels.filter(
                id => id.toString() !== req.params.id
            );

            channelToSubscribe.subscribers = channelToSubscribe.subscribers.filter(
                id => id.toString() !== req.userID
            );
        }
        else{
            // Subscribe
            currentUser.subscribedChannels.push(req.params.id);
            channelToSubscribe.subscribers.push(req.userID);
        }

        await currentUser.save();
        await channelToSubscribe.save();

        res.json({
            subscribed: !isSubscribed,
            subscriberCount: channelToSubscribe.subscribers.length
        });
        
    }
    catch (error){
        res.status(500).json({error: error.message});
    }
});

// GET user info by ID - GENERIC ROUTE LAST
router.get('/:id', async(req, res) => {
    try{
        const user = await User.findById(req.params.id).select('-password');

        if(!user){
            return res.status(404).json({ error: 'User not found'});
        }

        // Get user's videos
        const videos = await Video.find({ creator: req.params.id}).sort({uploadDate: -1});

        res.json({
            user: {
                id: user._id,
                username: user.username,
                channelName: user.channelName,
                channelDescription: user.channelDescription,
                subscriberCount: user.subscribers?.length || 0,
                profilePicture: user.profilePicture
            },
            videos: videos
        });
        
    }
    catch (error){
        res.status(500).json({ error: error.message});
    }
});

// DELETE video
router.delete('/videos/:id', verifyToken, async(req, res) => {
    try{
        const video = await Video.findById(req.params.id);

        if(!video){
            return res.status(404).json({ error: 'Video not found'});
        }

        // Check if user owns this video
        if(video.creator.toString() !== req.userID){
            return res.status(403).json({ error: 'You can only delete your own videos'});
        }

        // Delete the video from database
        await Video.findByIdAndDelete(req.params.id);

        res.json({message: 'Video deleted successfully'});
    }
    catch(error){
        res.status(500).json({ error: error.message});
    }
});

module.exports = router;