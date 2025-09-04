const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');
const verifyToken = require('../middleware/auth');

//where it will store the video 

const storage = multer.diskStorage ({
    destination: (req, file, cb) => {
        cb(null,'uploads/videos/');
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9); //original file name gets replaced with date and random number for security
        cb(null, uniqueName + path.extname(file.originalname)); //gets file extension
    }
});

const upload = multer ({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024
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

router.post('/upload',verifyToken, upload.single('video'), async (req, res) => {
    try {
        const { title, description } = req.body;

        const newVideo = new Video({
            title: req.body.title,
            description:req.body.description,
            videoURL: `/uploads/videos/${req.file.filename}`,
            thumbnailURL: '/uploads/thumbnails/default.jpg',
            creator: req.userID || 'uknown channel',
            duration: 0
        });

        await newVideo.save();
        res.json({message: 'Video Uploaded!', video: newVideo});
        
    }
    catch(error){
        res.status(500).json({error: error.message});
    }
});

//LIKE a video
router.post('/:id/like', verifyToken, async (req, res) => {
    try{
        const video = await Video.findById(req.params.id);

        if(!video){
            return res.status(404).json({error: 'Video not found'});
        }

        const alreadyLiked = video.likes.includes(req.userId);
        const dislikedIndex = video.dislikes.indexOf(req.userId);

        if(alreadyLiked){
            video.likes = video.likes.filter(id => id.toString() !== req.userId);
        }
        else{
            //add like
            video.likes.push(req.userId);
            //remove dislike if exists
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
        res.status(500).json({ error: error.message});
    }

});

//DISLIKE a video
router.post('/:id/dislike', verifyToken, async (req, res) => {
        try{
            const video = await Video.findById(req.params.id);

            if(!video){
                return res.status(404).json({ error: 'Video not found'});
            }

            //check if already disliked
            const alreadyDisliked = video.dislikes.includes(req.userId);
            const likedIndex = video.likes.indexOf(req.userId);

            if(alreadyDisliked){
                //Remove dislike
                video.dislikes = video.dislikes.filter( id => id.toString() !== req.userId);
            }
            else{
                //add dislike 
                video.dislikes.push(req.userId);
                //remove like if exists
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
            video.view +=1;
            await video.save();

            res.json(video);
        }
        catch(error){
            res.status(500).json({ error: error.message});
        }
    });

module.exports = router;



