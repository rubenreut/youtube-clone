import {useState, useEffect} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {AiFillHome} from 'react-icons/ai';
import {MdOutlineSubscriptions, MdOutlineVideoLibrary, MdHistory, MdWatchLater} from 'react-icons/md';
import API_URL from '../config';

function HomePage(){
    const[videos, setVideos ] = useState([]);
    const[loading, setLoading] = useState(true);
    const[error, setError] = useState('');
    const[hasMore, setHasMore] = useState(false);
    const[page, setPage] = useState(1);
    const[loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async (pageNum = 1) => {
        try{
            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await axios.get(`${API_URL}/api/videos?page=${pageNum}&limit=20`);

            // Handle both old format (array) and new format (object with pagination)
            const videoData = response.data.videos || response.data;
            const pagination = response.data.pagination;

            if (pageNum === 1) {
                setVideos(videoData);
            } else {
                setVideos(prev => [...prev, ...videoData]);
            }

            setHasMore(pagination?.hasMore || false);
            setPage(pageNum);
            setLoading(false);
            setLoadingMore(false);
        }
        catch(err){
            setError('Failed to load videos');
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchVideos(page + 1);
        }
    };

    if(loading) return <div className="loading">Loading Videos...</div>;
    if(error) return <div className="error">{error}</div>;

    return (
        <div className="HomePage">
            <div className="sidebar">
                <Link to="/" className="sidebar-item active">
                    <AiFillHome size={20} />
                    <span>Home</span>
                </Link>
                <Link to="/subscriptions" className="sidebar-item">
                    <MdOutlineSubscriptions size={20} />
                    <span>Subscriptions</span>
                </Link>
                <hr />
                <Link to="/library" className="sidebar-item">
                    <MdOutlineVideoLibrary size={20} />
                    <span>Library</span>
                </Link>
                <Link to="/history" className="sidebar-item">
                    <MdHistory size={20} />
                    <span>History</span>
                </Link>
                <Link to="/watch-later" className="sidebar-item">
                    <MdWatchLater size={20} />
                    <span>Watch Later</span>
                </Link>
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

                {hasMore && (
                    <div className="load-more-container">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="load-more-btn"
                        >
                            {loadingMore ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomePage;
