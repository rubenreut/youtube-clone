import {useState, useEffect} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {AiFillHome} from 'react-icons/ai';
import {MdOutlineSubscriptions, MdOutlineVideoLibrary, MdHistory, MdWatchLater} from 'react-icons/md';
import API_URL from '../config';
import { formatTimeAgo, formatViewCount, formatDuration } from '../utils/formatters';

// Skeleton component for loading state
function VideoCardSkeleton() {
    return (
        <div className="video-card-skeleton">
            <div className="skeleton skeleton-thumbnail"></div>
            <div className="skeleton-content">
                <div className="skeleton skeleton-avatar"></div>
                <div className="skeleton-text-group">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-channel"></div>
                    <div className="skeleton skeleton-stats"></div>
                </div>
            </div>
        </div>
    );
}

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

    // Show skeleton loading
    if(loading) {
        return (
            <div className="HomePage">
                <Sidebar />
                <div className="main-content">
                    <div className="video-grid">
                        {[...Array(12)].map((_, i) => (
                            <VideoCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if(error) {
        return (
            <div className="HomePage">
                <Sidebar />
                <div className="main-content">
                    <div className="error">
                        <span>{error}</span>
                        <button onClick={() => fetchVideos(1)} className="load-more-btn">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="HomePage">
            <Sidebar />
            <div className="main-content">
                <div className="video-grid">
                {videos.length === 0 ? (
                    <div className="empty-state">
                        <h2>No Videos Yet</h2>
                        <p>Be the first to upload!</p>
                    </div>
                ) : (
                    videos.map(video => (
                        <VideoCard key={video._id} video={video} />
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
                            {loadingMore ? (
                                <>
                                    <span className="loading-spinner" style={{width: 16, height: 16, marginRight: 8}}></span>
                                    Loading...
                                </>
                            ) : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sidebar component
function Sidebar() {
    return (
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
    );
}

// Video card component
function VideoCard({ video }) {
    const thumbnailUrl = video.thumbnailURL?.startsWith('http')
        ? video.thumbnailURL
        : (video.thumbnailURL ? `${API_URL}${video.thumbnailURL}` : 'https://via.placeholder.com/300x200');

    const channelInitial = video.creator?.channelName?.charAt(0).toUpperCase() || 'U';
    const channelName = video.creator?.channelName || 'Unknown';
    const creatorId = video.creator?._id || video.creator;

    return (
        <div className="video-card">
            <Link to={`/video/${video._id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="thumbnail-container">
                    <img src={thumbnailUrl} alt={video.title} />
                    {video.duration && (
                        <span className="duration-badge">
                            {formatDuration(video.duration)}
                        </span>
                    )}
                </div>
            </Link>

            <div className="video-info-container">
                <Link to={`/channel/${creatorId}`} className="channel-avatar">
                    <div className="avatar-circle">
                        {channelInitial}
                    </div>
                </Link>
                <div className="video-details">
                    <Link to={`/video/${video._id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                        <h3>{video.title}</h3>
                    </Link>
                    <Link to={`/channel/${creatorId}`} className="channel-name">
                        {channelName}
                    </Link>
                    <div className="video-meta">
                        <span>{formatViewCount(video.views || 0)} views</span>
                        <span className="dot"></span>
                        <span>{formatTimeAgo(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
