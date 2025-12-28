import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import '../styles/subscriptionspage.css';

function SubscriptionsPage() {
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
        fetchSubscriptionVideos();
    }, [navigate]);

    const fetchSubscriptionVideos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/users/me/subscriptions`, {
                headers: { 'auth-token': token }
            });
            setVideos(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load subscription videos');
            setLoading(false);
        }
    };

    if (loading) return <div className="subscriptions-page"><p>Loading...</p></div>;

    return (
        <div className="subscriptions-page">
            <h1>Subscriptions</h1>

            {error && <p className="error">{error}</p>}

            {videos.length === 0 ? (
                <div className="empty-state">
                    <p>No videos from your subscriptions yet.</p>
                    <p>Subscribe to channels to see their videos here!</p>
                </div>
            ) : (
                <div className="video-grid">
                    {videos.map(video => (
                        <div key={video._id} className="video-card">
                            <Link to={`/video/${video._id}`}>
                                <img
                                    src={video.thumbnailURL || 'https://via.placeholder.com/320x180'}
                                    alt={video.title}
                                />
                            </Link>
                            <div className="video-info-container">
                                <div className="channel-avatar">
                                    <Link to={`/channel/${video.creator?._id}`}>
                                        <div className="avatar-circle">
                                            {video.creator?.channelName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    </Link>
                                </div>
                                <div className="video-details">
                                    <Link to={`/video/${video._id}`}>
                                        <h3>{video.title}</h3>
                                    </Link>
                                    <Link to={`/channel/${video.creator?._id}`}>
                                        <p className="channel-name">{video.creator?.channelName || 'Unknown'}</p>
                                    </Link>
                                    <p className="video-stats">{video.views || 0} views</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SubscriptionsPage;
