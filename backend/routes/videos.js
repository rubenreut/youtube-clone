const router = require('express').Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const Video = require('../models/Video');
const verifyToken = require('../middleware/auth');

// Configure AWS SDK v3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configure multer for S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        // Remove ACL since bucket might not have ACLs enabled
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'videos/' + uniqueName + path.extname(file.originalname));
        },
        contentType: multerS3.AUTO_CONTENT_TYPE
    }),
    limits: {
        fileSize: 250 * 1024 * 1024 // 250MB limit
    }
});


//GET all videos, when someone visit /videos, 
//gets all videos from mongoDB Video.find()
//res.json(videos) sends them back as JSON
router.get('/', async (req, res) => {
    try{
        const videos = await Video.find();
        res.json(videos);
    }
    catch(error){
        res.status(500).json({error: error.message});
    }
});

//POST upload video 

router.post('/upload', verifyToken, (req, res, next) => {
    upload.single('video')(req, res, function(err) {
        if (err) {
            console.error('Multer error:', err);
            return res.status(500).json({ error: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('File:', req.file);
        console.log('Body:', req.body);
        
        if(!req.file) {
            return res.status(400).json({error: 'No video file provided'});
        }

        
        // For now, we'll skip thumbnail generation with ffmpeg since it requires the video file locally
        // You can implement thumbnail generation later using AWS Lambda or a separate service
        
        // Create video document with S3 URL
        const newVideo = new Video({
            title: req.body.title,
            description: req.body.description,
            videoURL: req.file.location, // S3 URL from multer-s3
            thumbnailURL: 'https://via.placeholder.com/320x180', // Placeholder for now
            creator: req.userID,
            duration: 0
        });

        // Save video document
        await newVideo.save();
        res.json({message: 'Video Uploaded!', video: newVideo});
        
    }
    catch(error){
        console.error('Upload error:', error);
        res.status(500).json({error: error.message});
    }
});

//LIKE a video
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
        res.status(500).json({ error: error.message });
    }

});

//DISLIKE a video
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
                res.status(500).json({ error: error.message});
            }
    });

    //SEARCH videos
    router.get('/search', async(req, res) => {

        try{
            const {q} = req.query; //get search query from the url

            if(!q){
                return res.status(400).json({ error: 'Search query required'});
            }

            //search in title and description
            const videos = await Video.find({
                $or: [
                    {title: {$regex: q, $options: 'i'}},
                    { description: {$regex: q, $options: 'i'}},
                ]
            })
            .populate('creator', 'username channelName')
            .sort({ views: -1});

            res.json(videos);
        } catch(error) {
            res.status(500).json({ error: error.message});
        }
    });


    //Get single video
    router.get('/:id', async (req, res) => {
        try{
            const video = await Video.findById(req.params.id).populate('creator', 'username channelName profilePicture subscribers');

            if(!video){
                return res.status(404).json({ error: 'Video Not Found'});
            }

            //incremenet views
            video.views +=1;
            await video.save();

            res.json(video);
        }
        catch(error){
            res.status(500).json({ error: error.message});
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
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;



