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
            fetchComments();
        }
        catch(error){
            alert('Please login to commment');
        }
    };

    if(loading) return <div>Loading...</div>
    if(!video) return <div>Video Not Found</div>

    return (
        <div className="video-page">
            <video
                width = "100%"
                controls
                src = {`http://localhost:3099${video.videoURL}`}
            />

            <h1>{video.title}</h1>
            <p>{video.views} views • {new Date(video.uploadDate).toLocaleDateString()}</p>

            <div className="video-actions">
                <button onClick={handleLike} style = {{color: liked? 'blue': 'black'}}>
                    LIKES {video.likes.length}
                </button>

                <button onClick={handleDislike} style = {{color: disliked? 'red' : 'black'}}>
                    DISLIKES {video.dislikes.length}
                </button>
            </div>

            <p>{video.description}</p>

            <div className="comments-section">
                <h3>Comments ({comments.length})</h3>

                <form onSubmit={handleCommentSubmit}>
                    <input  
                        type="text"
                        placeholder="add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit">Comment</button>
                </form>

                <div className="comments-list">
                    {comments.map(comment => (
                        <div key={comment._id} className="comment">
                            <strong>{comment.user.username}</strong>
                            <p>{comment.text}</p>
                            <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default VideoPage;