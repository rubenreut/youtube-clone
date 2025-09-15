import {useState, useEffect} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function HomePage(){
    const[videos, setVideos ] = useState([]);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState('');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try{
            const response = await axios.get('http://localhost:3099/api/videos');
            setVideos(response.data);
            setLoading(false);

        }
        catch(error){
            setError('Failed to load videos');
            setLoading(false);
        }
    };

    if(loading) return <div>Loading Videos...</div>;
    if(error) return <div>{error}</div>;

    return (
        <div className="HomePage">
            <div className="sidebar">
                <Link to="/" className="sidebar-item active">
                    <span>🏠</span>
                    <span>Home</span>
                </Link>
                <Link to="/trending" className="sidebar-item">
                    <span>🔥</span>
                    <span>Trending</span>
                </Link>
                <Link to="/subscriptions" className="sidebar-item">
                    <span>📺</span>
                    <span>Subscriptions</span>
                </Link>
                <hr />
                <Link to="/library" className="sidebar-item">
                    <span>📚</span>
                    <span>Library</span>
                </Link>
                <Link to="/history" className="sidebar-item">
                    <span>📜</span>
                    <span>History</span>
                </Link>
            </div>
            
            <div className="main-content">
                <div className="video-grid">
                {videos.length === 0 ? (<p>No Videos Yet. Be the first to upload </p>):(
                videos.map(video=> (
                    <div key={video._id} className="video-card">
                        <Link to={`/video/${video._id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                            <img
                                src={video.thumbnailURL ? `http://localhost:3099${video.thumbnailURL}` : 'https://via.placeholder.com/300x200'}
                                alt={video.title}
                            />
                            <h3>{video.title}</h3>
                        </Link>
                        <Link to={`/channel/${video.creator._id || video.creator}`} style={{textDecoration: 'none', color: '#606060'}}>
                            <p>{video.creator?.channelName || 'Unknown'}</p>
                        </Link>
                        <p>{video.views || 0} views</p>
                    </div>
                ))   
                )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;