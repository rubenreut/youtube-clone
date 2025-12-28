import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import '../styles/historypage.css';

function HistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchHistory();
    }, [navigate]);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/users/me/history`, {
                headers: { 'auth-token': token }
            });
            setHistory(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load watch history');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    if (loading) return <div className="history-page"><p>Loading...</p></div>;

    return (
        <div className="history-page">
            <h1>Watch History</h1>

            {error && <p className="error">{error}</p>}

            {history.length === 0 ? (
                <div className="empty-state">
                    <p>Your watch history is empty.</p>
                    <p>Videos you watch will appear here.</p>
                </div>
            ) : (
                <div className="history-list">
                    {history.map((item, index) => (
                        <div key={index} className="history-item">
                            <Link to={`/video/${item.video._id}`} className="thumbnail-link">
                                <img
                                    src={item.video.thumbnailURL || 'https://via.placeholder.com/168x94'}
                                    alt={item.video.title}
                                />
                            </Link>
                            <div className="history-info">
                                <Link to={`/video/${item.video._id}`}>
                                    <h3>{item.video.title}</h3>
                                </Link>
                                <Link to={`/channel/${item.video.creator?._id}`}>
                                    <p className="channel-name">{item.video.creator?.channelName || 'Unknown'}</p>
                                </Link>
                                <p className="watched-at">Watched {formatDate(item.watchedAt)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HistoryPage;
