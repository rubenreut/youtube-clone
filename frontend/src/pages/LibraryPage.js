import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import '../styles/librarypage.css';

function LibraryPage() {
    const [uploads, setUploads] = useState([]);
    const [likedVideos, setLikedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchLibrary();
    }, [navigate]);

    const fetchLibrary = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/users/me/library`, {
                headers: { 'auth-token': token }
            });
            setUploads(response.data.uploads);
            setLikedVideos(response.data.likedVideos);
            setLoading(false);
        } catch (error) {
            setError('Failed to load library');
            setLoading(false);
        }
    };

    const VideoCard = ({ video }) => (
        <div className="video-card">
            <Link to={`/video/${video._id}`}>
                <img
                    src={video.thumbnailURL || 'https://via.placeholder.com/320x180'}
                    alt={video.title}
                />
            </Link>
            <div className="video-info">
                <Link to={`/video/${video._id}`}>
                    <h3>{video.title}</h3>
                </Link>
                <p className="video-stats">{video.views || 0} views</p>
            </div>
        </div>
    );

    if (loading) return <div className="library-page"><p>Loading...</p></div>;

    return (
        <div className="library-page">
            <h1>Library</h1>

            {error && <p className="error">{error}</p>}

            <section className="library-section">
                <h2>Your Uploads</h2>
                {uploads.length === 0 ? (
                    <p className="empty-message">You haven't uploaded any videos yet.</p>
                ) : (
                    <div className="video-row">
                        {uploads.map(video => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </section>

            <section className="library-section">
                <h2>Liked Videos</h2>
                {likedVideos.length === 0 ? (
                    <p className="empty-message">You haven't liked any videos yet.</p>
                ) : (
                    <div className="video-row">
                        {likedVideos.map(video => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default LibraryPage;
