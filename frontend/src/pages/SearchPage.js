import API_URL from '../config';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(query) {
            searchVideos();
        }
    }, [query]);

    const searchVideos = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/videos/search?q=${query}`);
            setVideos(response.data);
            setLoading(false);
        } catch(error) {
            console.error('Search failed:', error);
            setLoading(false);
        }
    };

    if(loading) return <div>Searching...</div>;

    return (
        <div className="search-page">
            <h2>Search Results for "{query}"</h2>
            <p>{videos.length} results found</p>

            <div className="search-results">
                {videos.length === 0 ? (
                    <p>No videos found. Try different keywords.</p>
                ) : (
                    videos.map(video => (
                        <Link key={video._id} to={`/video/${video._id}`} className="search-result">
                            <img 
                                src={video.thumbnailURL ? `${API_URL}${video.thumbnailURL}` : 'https://via.placeholder.com/200x120'}
                                alt={video.title}
                                style={{width: '200px', height: '120px', objectFit: 'cover'}}
                            />
                            <div>
                                <h3>{video.title}</h3>
                                <p>{video.description}</p>
                                <small>{video.creator?.channelName} • {video.views} views</small>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export default SearchPage;