import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

function WatchLaterPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        fetchWatchLater();
    }, [navigate]);

    const fetchWatchLater = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/users/me/watch-later`, {
                headers: { 'auth-token': token }
            });
            setVideos(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load Watch Later list');
            setLoading(false);
        }
    };

    const removeFromWatchLater = async (videoId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/users/me/watch-later/${videoId}`, {
                headers: { 'auth-token': token }
            });
            setVideos(prev => prev.filter(v => v._id !== videoId));
        } catch (err) {
            setError('Failed to remove video');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="watch-later-page">
            <h1>Watch Later</h1>

            {error && <p className="error">{error}</p>}

            {videos.length === 0 ? (
                <div className="empty-state">
                    <p>Your Watch Later list is empty</p>
                    <p>Save videos to watch them later</p>
                </div>
            ) : (
                <div className="watch-later-list">
                    {videos.map((video, index) => (
                        <div key={video._id} className="watch-later-item">
                            <span className="item-number">{index + 1}</span>
                            <Link to={`/video/${video._id}`} className="thumbnail-link">
                                <img
                                    src={video.thumbnailURL?.startsWith('http') ? video.thumbnailURL : `${API_URL}${video.thumbnailURL}`}
                                    alt={video.title}
                                />
                            </Link>
                            <div className="watch-later-info">
                                <Link to={`/video/${video._id}`}>
                                    <h3>{video.title}</h3>
                                </Link>
                                <Link to={`/channel/${video.creator?._id}`} className="channel-name">
                                    {video.creator?.channelName || 'Unknown Channel'}
                                </Link>
                                <p className="video-stats">{video.views || 0} views</p>
                            </div>
                            <button
                                className="remove-btn"
                                onClick={() => removeFromWatchLater(video._id)}
                                title="Remove from Watch Later"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default WatchLaterPage;
