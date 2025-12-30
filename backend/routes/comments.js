const router = require('express').Router();
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/auth');

// GET comments for a video (with replies)
router.get('/video/:videoId', async(req, res) => {
    try {
        // Get top-level comments (no parent)
        const comments = await Comment.find({
            video: req.params.videoId,
            parentComment: null
        })
        .populate('author', 'username channelName profilePicture')
        .sort({ createdAt: -1 });

        // Get reply counts for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replyCount = await Comment.countDocuments({
                    parentComment: comment._id
                });
                return {
                    ...comment.toObject(),
                    replyCount
                };
            })
        );

        res.json(commentsWithReplies);
    }
    catch(error) {
        res.status(500).json({error: 'Failed to load comments'});
    }
});

// GET replies for a comment
router.get('/:commentId/replies', async(req, res) => {
    try {
        const replies = await Comment.find({
            parentComment: req.params.commentId
        })
        .populate('author', 'username channelName profilePicture')
        .sort({ createdAt: 1 }); // Oldest first for replies

        res.json(replies);
    }
    catch(error) {
        res.status(500).json({error: 'Failed to load replies'});
    }
});

// POST new comment
router.post('/', verifyToken, async(req, res) => {
    try {
        // Accept both field names for compatibility
        const content = req.body.content || req.body.text;
        const videoId = req.body.videoId || req.body.video;
        const parentCommentId = req.body.parentCommentId || null;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        const newComment = new Comment({
            content: content.trim(),
            author: req.userID,
            video: videoId,
            parentComment: parentCommentId
        });

        await newComment.save();

        const populatedComment = await Comment.findById(newComment._id)
            .populate('author', 'username channelName profilePicture');

        res.json({
            message: parentCommentId ? 'Reply posted' : 'Comment posted',
            comment: populatedComment
        });
    } catch (error) {
        res.status(500).json({error: 'Failed to post comment'});
    }
});

// LIKE a comment
router.post('/:id/like', verifyToken, async(req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const userId = req.userID.toString();
        const alreadyLiked = comment.likes.some(id => id && id.toString() === userId);

        if (alreadyLiked) {
            comment.likes = comment.likes.filter(id => id && id.toString() !== userId);
        } else {
            comment.likes.push(req.userID);
        }

        await comment.save();
        res.json({
            likes: comment.likes.length,
            userLiked: !alreadyLiked
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to like comment' });
    }
});

// DELETE a comment
router.delete('/:id', verifyToken, async(req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user owns this comment
        if (comment.author.toString() !== req.userID) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        // Delete all replies to this comment
        await Comment.deleteMany({ parentComment: req.params.id });

        // Delete the comment itself
        await Comment.findByIdAndDelete(req.params.id);

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;
