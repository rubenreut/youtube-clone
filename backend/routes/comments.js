const router = require('express').Router();
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/auth');

// GET comments for a video

router.get('/video/:videoId', async(req, res) => {
    try{
        const comments = await Comment.find({
            video: req.params.videoId,
            parentComment: null
        })
        .populate('author', 'username channelName profilePicture')
        .sort({ createdAt: -1});

        res.json(comments);
    }
    catch(error) {
        res.status(500).json({error: error.message});
    } 
});

//POST new comment
router.post('/', verifyToken, async(req, res) => {
    try{
        // Accept both field names for compatibility
        const content = req.body.content || req.body.text;
        const videoId = req.body.videoId || req.body.video;
        const parentCommentId = req.body.parentCommentId;

        const newComment = new Comment({
            content,
            author: req.userID,  // Fixed: was req.userId, should be req.userID
            video: videoId,
            parentComment: parentCommentId || null
        });

        await newComment.save();

        const populatedComment = await Comment.findById(newComment._id).populate('author', 'username channelName');

        res.json({
            message: 'Comment posted',
            comment: populatedComment
        });
    } catch (error){
        res.status(500).json({error: error.message});
    }
});

module.exports = router;