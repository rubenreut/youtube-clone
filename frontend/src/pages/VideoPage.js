import { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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

    useEffect(() => {
        fetchVideo();
        fetchComments();
    }, [id]);

    const fetchVideo = async() => {
        try{
            const response = await axios.get(`http://localhost:3099/api/videos/${id}`);
            setVideo(response.data);
            setLoading(false);

        }
        catch(error){
            setError('Failed to load video');
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try{
            const response = await axios.get(`http://localhost:3099/api/comments/video/${id}`);
            setComments(response.data);
            setLoading(false);
        }
        catch(error){
            setError('failed to load comments')
        }
    };

    const handleLike = async () => {
        try{
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:3099/api/videos/${id}/like`, {}, {
                headers: {'auth-token': token}
            });

            setVideo( prev => ({
                ...prev,
                likes: response.data.userLiked ? [...(prev.likes || []), 'currentUser'] : (prev.likes || []).filter(u => u !== 'currentUser')
            }));
            setLiked(!liked);
            if(disliked) setDisliked(false);
        }

        catch(error){
            alert('Login to like videos');
        }
    };

    const handleDislike = async() => {
        try{
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3099/api/videos/${id}/dislike`, {}, {
                headers: { 'auth-token': token}
            });
            setDisliked(!disliked);
            if(liked) setLiked(false);
            fetchVideo();
        }
        catch(error){
            alert('Please login to dislike videos');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try{
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:3099/api/comments`, {
                video: id,
                text: newComment
            }, {
                headers: {'auth-token': token}
            });
            setNewComment('');
            setShowCommentButtons(false);
            fetchComments();
        }
        catch(error){
            alert('Please login to comment');
        }
    };

    if(loading) return <div>Loading...</div>
    if(!video) return <div>Video Not Found</div>

    return (
        <div className="video-page">
            <div className="video-container">
                <div className="video-main">
                    <video
                        width="100%"
                        controls
                        src={`http://localhost:3099${video.videoURL}`}
                    />

                    <div className="video-info">
                        <h1>{video.title}</h1>
                        <div className="video-stats">
                            <span>{video.views || 0} views • {new Date(video.uploadDate).toLocaleDateString()}</span>
                            <div className="video-actions">
                                <button 
                                    onClick={handleLike} 
                                    className={liked ? 'liked' : ''}
                                >
                                    👍 {video.likes?.length || 0}
                                </button>
                                <button 
                                    onClick={handleDislike}
                                    className={disliked ? 'disliked' : ''}
                                >
                                    👎 {video.dislikes?.length || 0}
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
                                            disabled={!newComment.trim()}
                                        >
                                            Comment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="comments-list">
                            {comments.map(comment => (
                                <div key={comment._id} className="comment">
                                    <div className="comment-avatar">
                                        {comment.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="comment-content">
                                        <div className="comment-header">
                                            <span className="comment-author">
                                                {comment.user?.username || 'Unknown User'}
                                            </span>
                                            <span className="comment-time">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="comment-text">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="video-sidebar">
                    {/* Future: Recommended videos will go here */}
                </div>
            </div>
        </div>
    );
}

export default VideoPage;