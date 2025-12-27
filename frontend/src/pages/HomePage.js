import {useState, useEffect} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {AiFillHome} from 'react-icons/ai';
import {MdOutlineSubscriptions, MdOutlineVideoLibrary, MdHistory} from 'react-icons/md';
import API_URL from '../config';

function HomePage(){
    const[videos, setVideos ] = useState([]);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState('');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try{
            const response = await axios.get(`${API_URL}/api/videos`);
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
                    <AiFillHome size={20} />
                    <span>Home</span>
                </Link>
                <div className="sidebar-item disabled">
                    <MdOutlineSubscriptions size={20} />
                    <span>Subscriptions</span>
                </div>
                <hr />
                <div className="sidebar-item disabled">
                    <MdOutlineVideoLibrary size={20} />
                    <span>Library</span>
                </div>
                <div className="sidebar-item disabled">
                    <MdHistory size={20} />
                    <span>History</span>
                </div>
            </div>
            
            <div className="main-content">
                <div className="video-grid">
                {videos.length === 0 ? (<p>No Videos Yet. Be the first to upload </p>):(
                videos.map(video=> (
                    <div key={video._id} className="video-card">
                        <Link to={`/video/${video._id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                            <img
                                src={video.thumbnailURL?.startsWith('http') ? video.thumbnailURL : (video.thumbnailURL ? `${API_URL}${video.thumbnailURL}` : 'https://via.placeholder.com/300x200')}
                                alt={video.title}
                            />
                        </Link>
                        
                        <div className="video-info-container">
                            <div className="channel-avatar">
                                <div className="avatar-circle">
                                    {video.creator?.channelName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </div>
                            <div className="video-details">
                                <Link to={`/video/${video._id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                                    <h3>{video.title}</h3>
                                </Link>
                                <Link to={`/channel/${video.creator._id || video.creator}`} style={{textDecoration: 'none', color: '#606060'}}>
                                    <p>{video.creator?.channelName || 'Unknown'}</p>
                                </Link>
                                <p>{video.views || 0} views</p>
                            </div>
                        </div>
                    </div>
                ))   
                )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;