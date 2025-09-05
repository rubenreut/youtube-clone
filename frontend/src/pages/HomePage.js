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
            <h2>All videos</h2>

            <div className="video-grid">
                {videos.length === 0 ? (
                    <p>No Videos Yet. Be the first to upload </p>
                ):(

                videos.map(video=> (
                    <Link key={video._id} to={`/video/${video._id}`} className="video-card">
                        <div>
                            <img
                                src={video.thumbnailURL ? `http://localhost:3099${video.thumbnailURL}` : 'https://via.placeholder.com/300x200'}
                                alt={video.title}
                                style={{width: '300px', height: '200px', objectFit: 'cover'}}
                            />
                            <h3>{video.title}</h3>
                            <p>{video.creator?.channelName || 'Unknown'}</p>
                            <p>{video.views} views</p>
                        </div>
                    </Link>
                ))   
                )}
            </div>
        </div>
    );
}

export default HomePage;