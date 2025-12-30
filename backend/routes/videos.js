const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const Video = require('../models/Video');
const verifyToken = require('../middleware/auth');

// Feature flag for uploads
const UPLOADS_ENABLED = process.env.UPLOADS_ENABLED === 'true' || false;

// Configure Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Configure multer to use memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 250 * 1024 * 1024 // 250MB limit
    }
});

// Helper function to upload file to Supabase Storage
async function uploadToSupabase(file, bucket, folder) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${folder}/${uniqueName}${path.extname(file.originalname)}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}

// Helper function to escape regex special characters (prevents ReDoS)
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET all videos with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const category = req.query.category;

        // Build query
        const query = category ? { category } : {};

        const [videos, total] = await Promise.all([
            Video.find(query)
                .populate('creator', 'username channelName profilePicture')
                .sort({ uploadDate: -1 })
                .skip(skip)
                .limit(limit),
            Video.countDocuments(query)
        ]);

        res.json({
            videos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        });
    }
    catch(error){
        res.status(500).json({error: 'Failed to load videos'});
    }
});

// GET recommended videos (for sidebar)
router.get('/recommended/:videoId', async (req, res) => {
    try {
        const currentVideo = await Video.findById(req.params.videoId);
        if (!currentVideo) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Get videos from same category, excluding current video
        const recommended = await Video.find({
            _id: { $ne: req.params.videoId },
            $or: [
                { category: currentVideo.category },
                { creator: currentVideo.creator }
            ]
        })
        .populate('creator', 'username channelName profilePicture')
        .sort({ views: -1 })
        .limit(10);

        // If not enough videos, get random popular videos
        if (recommended.length < 5) {
            const additional = await Video.find({
                _id: { $nin: [req.params.videoId, ...recommended.map(v => v._id)] }
            })
            .populate('creator', 'username channelName profilePicture')
            .sort({ views: -1 })
            .limit(10 - recommended.length);

            recommended.push(...additional);
        }

        res.json(recommended);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load recommendations' });
    }
});

// POST upload video
router.post('/upload', verifyToken, upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
    // Check if uploads are enabled
    if (!UPLOADS_ENABLED) {
        return res.status(403).json({
            error: 'Video uploads are currently disabled',
            uploadsEnabled: false
        });
    }

    try {
        if(!req.files || !req.files.video) {
            return res.status(400).json({error: 'No video file provided'});
        }

        const videoFile = req.files.video[0];
        const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

        // Upload video to Supabase Storage
        const videoURL = await uploadToSupabase(videoFile, 'youtubevideos', 'videos');

        // Upload thumbnail if provided
        let thumbnailURL = 'https://via.placeholder.com/320x180';
        if (thumbnailFile) {
            thumbnailURL = await uploadToSupabase(thumbnailFile, 'youtubevideos', 'thumbnails');
        }

        // Create video document with Supabase URLs
        const newVideo = new Video({
            title: req.body.title,
            description: req.body.description,
            videoURL: videoURL,
            thumbnailURL: thumbnailURL,
            creator: req.userID,
            duration: 0
        });

        // Save video document
        await newVideo.save();
        res.json({message: 'Video Uploaded!', video: newVideo});

    }
    catch(error){
        console.error('Upload error:', error);
        res.status(500).json({error: 'Upload failed. Please try again.'});
    }
});

// LIKE a video
router.post('/:id/like', verifyToken, async (req, res) => {
    try{
        if(!req.userID) {
            return res.status(401).json({error: 'User ID not found in token'});
        }

        const video = await Video.findById(req.params.id);

        if(!video){
            return res.status(404).json({error: 'Video not found'});
        }

        const userId = req.userID.toString();

        // Check if already liked - handle null values in array
        const alreadyLiked = video.likes.some(id => id && id.toString() === userId);
        const dislikedIndex = video.dislikes.findIndex(id => id && id.toString() === userId);

        if(alreadyLiked){
            // Remove like - filter out nulls and the user's ID
            video.likes = video.likes.filter(id => id && id.toString() !== userId);
        }
        else{
            // Add like
            video.likes.push(req.userID);
            // Remove dislike if exists
            if(dislikedIndex > -1){
                video.dislikes.splice(dislikedIndex, 1);
            }
        }

        await video.save();
        res.json({
            likes: video.likes.length,
            dislikes: video.dislikes.length,
            userLiked: !alreadyLiked
        });
    }
    catch(error){
        res.status(500).json({ error: 'Failed to like video' });
    }

});

// DISLIKE a video
router.post('/:id/dislike', verifyToken, async (req, res) => {
        try{
            if(!req.userID) {
                return res.status(401).json({error: 'User ID not found in token'});
            }

            const video = await Video.findById(req.params.id);

            if(!video){
                return res.status(404).json({ error: 'Video not found'});
            }

            // Convert userID string to ObjectId for comparison
            const userId = req.userID.toString();

            // Check if already disliked
            const alreadyDisliked = video.dislikes.some(id => id.toString() === userId);
            const likedIndex = video.likes.findIndex(id => id.toString() === userId);

            if(alreadyDisliked){
                // Remove dislike
                video.dislikes = video.dislikes.filter(id => id.toString() !== userId);
            }
            else{
                // Add dislike
                video.dislikes.push(req.userID);
                // Remove like if exists
                if(likedIndex > -1){
                    video.likes.splice(likedIndex, 1);
                }
            }

            await video.save();
            res.json({
                likes: video.likes.length,
                dislikes: video.dislikes.length,
                userDisliked: !alreadyDisliked
            });

        }
        catch(error){
                res.status(500).json({ error: 'Failed to dislike video'});
            }
    });

    // SEARCH videos (with ReDoS protection)
    router.get('/search', async(req, res) => {

        try{
            const {q} = req.query; // get search query from the url

            if(!q){
                return res.status(400).json({ error: 'Search query required'});
            }

            // Limit search query length to prevent abuse
            if(q.length > 100){
                return res.status(400).json({ error: 'Search query too long'});
            }

            // Escape special regex characters to prevent ReDoS attacks
            const safeQuery = escapeRegex(q);

            // Search in title and description with pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const [videos, total] = await Promise.all([
                Video.find({
                    $or: [
                        {title: {$regex: safeQuery, $options: 'i'}},
                        {description: {$regex: safeQuery, $options: 'i'}},
                    ]
                })
                .populate('creator', 'username channelName')
                .sort({ views: -1})
                .skip(skip)
                .limit(limit),
                Video.countDocuments({
                    $or: [
                        {title: {$regex: safeQuery, $options: 'i'}},
                        {description: {$regex: safeQuery, $options: 'i'}},
                    ]
                })
            ]);

            res.json({
                videos,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasMore: page * limit < total
                }
            });
        } catch(error) {
            res.status(500).json({ error: 'Search failed'});
        }
    });


    // Get single video
    router.get('/:id', async (req, res) => {
        try{
            const video = await Video.findById(req.params.id).populate('creator', 'username channelName profilePicture subscribers');

            if(!video){
                return res.status(404).json({ error: 'Video Not Found'});
            }

            // increment views
            video.views +=1;
            await video.save();

            res.json(video);
        }
        catch(error){
            res.status(500).json({ error: 'Failed to load video'});
        }
    });

// UPDATE/EDIT a video
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Check if user owns this video
        if (video.creator.toString() !== req.userID) {
            return res.status(403).json({ error: 'You can only edit your own videos' });
        }

        // Update fields
        if (req.body.title) video.title = req.body.title;
        if (req.body.description !== undefined) video.description = req.body.description;
        if (req.body.category !== undefined) video.category = req.body.category;

        await video.save();

        res.json({ message: 'Video updated successfully', video });
    } catch(error) {
        res.status(500).json({ error: 'Failed to update video' });
    }
});

// DELETE a video
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Check if user owns this video
        if (video.creator.toString() !== req.userID) {
            return res.status(403).json({ error: 'You can only delete your own videos' });
        }

        // Delete the video from database
        await Video.findByIdAndDelete(req.params.id);

        res.json({ message: 'Video deleted successfully' });
    } catch(error) {
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

module.exports = router;
