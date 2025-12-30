import API_URL from '../config';
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { formatTimeAgo, formatViewCount, formatSubscriberCount } from '../utils/formatters';

function VideoPage(){
    const{id} = useParams();
    const[video, setVideo] = useState(null);
    const[comments, setComments] = useState([]);
    const[newComment, setNewComment] = useState('');
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState('');
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [showCommentButtons, setShowCommentButtons] = useState(false);
    const [recommended, setRecommended] = useState([]);
    const [inWatchLater, setInWatchLater] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [likingVideo, setLikingVideo] = useState(false);

    // Reply states
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [expandedReplies, setExpandedReplies] = useState({});
    const [replies, setReplies] = useState({});
    const [submittingReply, setSubmittingReply] = useState(false);

    const fetchVideo = useCallback(async() => {
        try{
            const response = await axios.get(`${API_URL}/api/videos/${id}`);
            setVideo(response.data);
            setLoading(false);
        }
        catch(err){
            setError('Failed to load video');
            setLoading(false);
        }
    }, [id]);

    const fetchComments = useCallback(async () => {
        try{
            const response = await axios.get(`${API_URL}/api/comments/video/${id}`);
            setComments(response.data);
        }
        catch(err){
            console.error('Failed to load comments');
        }
    }, [id]);

    const fetchRecommended = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/videos/recommended/${id}`);
            setRecommended(response.data);
        } catch (err) {
            console.error('Failed to load recommendations');
        }
    }, [id]);

    const checkWatchLater = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get(`${API_URL}/api/users/me/watch-later`, {
                headers: { 'auth-token': token }
            });
            const isInList = response.data.some(v => v._id === id);
            setInWatchLater(isInList);
        } catch (err) {
            // Silently fail
        }
    }, [id]);

    const addToHistory = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await axios.post(`${API_URL}/api/users/me/history`,
                { videoId: id },
                { headers: { 'auth-token': token } }
            );
        } catch (err) {
            // Silently fail - history tracking shouldn't break the video page
        }
    }, [id]);

    useEffect(() => {
        fetchVideo();
        fetchComments();
        fetchRecommended();
        addToHistory();
        checkWatchLater();
    }, [fetchVideo, fetchComments, fetchRecommended, addToHistory, checkWatchLater]);

    const handleWatchLater = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to use Watch Later');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/users/me/watch-later`,
                { videoId: id },
                { headers: { 'auth-token': token } }
            );
            setInWatchLater(response.data.added);
        } catch (err) {
            setError('Failed to update Watch Later');
        }
    };

    const handleLike = async () => {
        if (likingVideo) return;

        const token = localStorage.getItem('token');
        if(!token) {
            setError('Please login to like videos');
            return;
        }

        setLikingVideo(true);
        try{
            const response = await axios.post(`${API_URL}/api/videos/${id}/like`, {}, {
                headers: {'auth-token': token}
            });

            setVideo(prev => ({
                ...prev,
                likes: Array(response.data.likes).fill(null),
                dislikes: Array(response.data.dislikes).fill(null)
            }));

            setLiked(response.data.userLiked);
            if(response.data.userLiked && disliked) {
                setDisliked(false);
            }
        }
        catch(err){
            if(err.response?.status === 401) {
                setError('Please login to like videos');
            } else {
                setError('Error liking video');
            }
        } finally {
            setLikingVideo(false);
        }
    };

    const handleDislike = async() => {
        if (likingVideo) return;

        const token = localStorage.getItem('token');
        if(!token) {
            setError('Please login to dislike videos');
            return;
        }

        setLikingVideo(true);
        try{
            const response = await axios.post(`${API_URL}/api/videos/${id}/dislike`, {}, {
                headers: { 'auth-token': token}
            });

            setVideo(prev => ({
                ...prev,
                likes: Array(response.data.likes).fill(null),
                dislikes: Array(response.data.dislikes).fill(null)
            }));

            setDisliked(response.data.userDisliked);
            if(response.data.userDisliked && liked) {
                setLiked(false);
            }
        }
        catch(err){
            if(err.response?.status === 401) {
                setError('Please login to dislike videos');
            } else {
                setError('Error disliking video');
            }
        } finally {
            setLikingVideo(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (submittingComment || !newComment.trim()) return;

        setSubmittingComment(true);
        try{
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to comment');
                return;
            }

            await axios.post(`${API_URL}/api/comments`, {
                video: id,
                text: newComment
            }, {
                headers: {'auth-token': token}
            });
            setNewComment('');
            setShowCommentButtons(false);
            fetchComments();
        }
        catch(err){
            setError('Please login to comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const fetchReplies = async (commentId) => {
        try {
            const response = await axios.get(`${API_URL}/api/comments/${commentId}/replies`);
            setReplies(prev => ({ ...prev, [commentId]: response.data }));
        } catch (err) {
            console.error('Failed to load replies');
        }
    };

    const toggleReplies = (commentId) => {
        if (expandedReplies[commentId]) {
            setExpandedReplies(prev => ({ ...prev, [commentId]: false }));
        } else {
            setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
            if (!replies[commentId]) {
                fetchReplies(commentId);
            }
        }
    };

    const handleReplySubmit = async (commentId) => {
        if (submittingReply || !replyText.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to reply');
            return;
        }

        setSubmittingReply(true);
        try {
            await axios.post(`${API_URL}/api/comments`, {
                video: id,
                text: replyText,
                parentCommentId: commentId
            }, {
                headers: { 'auth-token': token }
            });

            setReplyText('');
            setReplyingTo(null);
            fetchReplies(commentId);
            fetchComments(); // Refresh to update reply counts
        } catch (err) {
            setError('Failed to post reply');
        } finally {
            setSubmittingReply(false);
        }
    };

    // Clear error after 3 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    if(loading) return <div className="loading">Loading...</div>
    if(!video) return <div className="error">Video Not Found</div>

    return (
        <div className="video-page">
            {error && <div className="error-toast">{error}</div>}

            <div className="video-container">
                <div className="video-main">
                    <video
                        width="100%"
                        controls
                        src={video.videoURL.startsWith('http') ? video.videoURL : `${API_URL}${video.videoURL}`}
                    />

                    <div className="video-info">
                        <h1>{video.title}</h1>
                        <div className="channel-info-card">
                            <Link to={`/channel/${video.creator._id}`} className="channel-info-link">
                                <div className="channel-avatar-large">
                                    {video.creator?.profilePicture &&
                                     !video.creator.profilePicture.includes('placeholder') ? (
                                        <img src={video.creator.profilePicture} alt={video.creator.channelName}/>
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {video.creator?.channelName?.charAt(0).toUpperCase() || 'C'}
                                        </div>
                                    )}
                                </div>
                                <div className="channel-details">
                                    <h3>{video.creator?.channelName || 'Unknown channel'}</h3>
                                    <p>{formatSubscriberCount(video.creator?.subscribers?.length || 0)}</p>
                                </div>
                            </Link>
                        </div>
                        <div className="video-stats">
                            <span>{formatViewCount(video.views || 0)} views • {formatTimeAgo(video.uploadDate)}</span>
                            <div className="video-actions">
                                <button
                                    onClick={handleLike}
                                    className={liked ? 'liked' : ''}
                                    disabled={likingVideo}
                                >
                                    👍 {video.likes?.length || 0}
                                </button>
                                <button
                                    onClick={handleDislike}
                                    className={disliked ? 'disliked' : ''}
                                    disabled={likingVideo}
                                >
                                    👎 {video.dislikes?.length || 0}
                                </button>
                                <button
                                    onClick={handleWatchLater}
                                    className={inWatchLater ? 'active' : ''}
                                >
                                    {inWatchLater ? '✓ Saved' : '+ Watch Later'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="video-description">
                        <p>{video.description || 'No description available'}</p>
                    </div>

                    <div className="comments-section">
                        <div className="comments-header">
                            <h3>{comments.length} Comments</h3>
                        </div>

                        <div className="comment-form">
                            <div className="user-avatar">U</div>
                            <div className="comment-input-wrapper">
                                <input
                                    className="comment-input"
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onFocus={() => setShowCommentButtons(true)}
                                />
                                {showCommentButtons && (
                                    <div className="comment-buttons">
                                        <button
                                            className="cancel-btn"
                                            onClick={() => {
                                                setNewComment('');
                                                setShowCommentButtons(false);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="comment-btn"
                                            onClick={handleCommentSubmit}
                                            disabled={!newComment.trim() || submittingComment}
                                        >
                                            {submittingComment ? 'Posting...' : 'Comment'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="comments-list">
                            {comments.map(comment => (
                                <div key={comment._id} className="comment-thread">
                                    <div className="comment">
                                        <div className="comment-avatar">
                                            {comment.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="comment-content">
                                            <div className="comment-header">
                                                <span className="comment-author">
                                                    {comment.author?.username || 'Unknown User'}
                                                </span>
                                                <span className="comment-time">
                                                    {formatTimeAgo(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="comment-text">{comment.content}</p>
                                            <div className="comment-actions">
                                                <button
                                                    className="reply-btn"
                                                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                                >
                                                    Reply
                                                </button>
                                                {comment.replyCount > 0 && (
                                                    <button
                                                        className="view-replies-btn"
                                                        onClick={() => toggleReplies(comment._id)}
                                                    >
                                                        {expandedReplies[comment._id] ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                                                    </button>
                                                )}
                                            </div>

                                            {replyingTo === comment._id && (
                                                <div className="reply-form">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a reply..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        className="reply-input"
                                                    />
                                                    <div className="reply-buttons">
                                                        <button onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleReplySubmit(comment._id)}
                                                            disabled={!replyText.trim() || submittingReply}
                                                            className="submit-reply-btn"
                                                        >
                                                            {submittingReply ? 'Posting...' : 'Reply'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {expandedReplies[comment._id] && replies[comment._id] && (
                                        <div className="replies-list">
                                            {replies[comment._id].map(reply => (
                                                <div key={reply._id} className="comment reply">
                                                    <div className="comment-avatar small">
                                                        {reply.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="comment-content">
                                                        <div className="comment-header">
                                                            <span className="comment-author">
                                                                {reply.author?.username || 'Unknown User'}
                                                            </span>
                                                            <span className="comment-time">
                                                                {formatTimeAgo(reply.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="comment-text">{reply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="video-sidebar">
                    <h3>Recommended</h3>
                    {recommended.length === 0 ? (
                        <p className="no-recommendations">No recommendations available</p>
                    ) : (
                        <div className="recommended-list">
                            {recommended.map(rec => (
                                <Link
                                    key={rec._id}
                                    to={`/video/${rec._id}`}
                                    className="recommended-video"
                                >
                                    <img
                                        src={rec.thumbnailURL?.startsWith('http') ? rec.thumbnailURL : `${API_URL}${rec.thumbnailURL}`}
                                        alt={rec.title}
                                    />
                                    <div className="recommended-info">
                                        <h4>{rec.title}</h4>
                                        <p>{rec.creator?.channelName || 'Unknown'}</p>
                                        <span>{formatViewCount(rec.views || 0)} views • {formatTimeAgo(rec.createdAt)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VideoPage;
