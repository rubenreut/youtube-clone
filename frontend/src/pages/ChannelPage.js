import API_URL from '../config';
import {useState , useEffect} from 'react';
import {useParams, Link, useNavigate} from 'react-router-dom';
import axios from 'axios';

function ChannelPage() {
    const {userId} = useParams();
    const navigate = useNavigate();
    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOwnChannel, setIsOwnChannel] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [editedChannelName, setEditedChannelName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');

    useEffect(()=>{
        fetchChannelData();
        checkIfOwnChannel();
        
    }, [userId]);

    const fetchChannelData = async () => {
        try{
            const response = await axios.get(`${API_URL}/api/users/channels/${userId}`);
            setChannel(response.data.user);
            setVideos(response.data.videos);
            setLoading(false);
            setSubscriberCount(response.data.user.subscribers || 0);
            setEditedChannelName(response.data.user.channelName || '');
            setEditedDescription(response.data.user.channelDescription || '');
        }
        catch(error){
            console.error('Error fetching channels:', error);
            setLoading(false);
        }
    };

    const checkIfOwnChannel = () => {
        //get logged in user's id from token or localstorage
        const token = localStorage.getItem('token');
        if(token){
            // Simple decode - JWT structure is header.payload.signature
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIsOwnChannel(payload._id === userId);
            } catch(error) {
                console.error('Error decoding token:', error);
            }
        }
    };

    const handleSubscribe = async () =>{
        const token = localStorage.getItem('token');
        if(token){
            try{
                const response = await axios.post(
                    `${API_URL}/api/users/${userId}/subscribe`,
                    {},
                    {headers: {'auth-token': token}}
                );

                setIsSubscribed(response.data.subscribed);
                setSubscriberCount(response.data.subscriberCount);
            }
            catch(error){
            console.error('Error subscribing: ', error);
        }
        }
        
    }

    const handleSaveChannel = async () => {
        const token = localStorage.getItem('token');
        try{
            const response = await axios.put(
                `${API_URL}/api/users/${userId}/update`,
                {
                    channelName: editedChannelName,
                    channelDescription: editedDescription
                },
                {headers: {'auth-token': token}}
            );
            
            setChannel({...channel, channelName: editedChannelName, channelDescription: editedDescription});
            setEditMode(false);
        }
        catch(error){
            alert('Error updating channel');
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if(!window.confirm('are you sure you want to delete this video?')){
            return;
        }

        try{
            const token= localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/videos/${videoId}`, {headers: {'auth-token': token}});

            //remove video from state
            setVideos(videos.filter(v => v._id !== videoId));
        }
        catch(error){
            alert('Error deleting video');
        }
    };


    if(loading) return <div>Loading channel...</div>;
    if(!channel) return <div>Channel not found...</div>;

    return(
        <div className="channel-page">
            <div className ="channel-header">
                {editMode ? (
                    <>
                        <input 
                            type="text" 
                            value={editedChannelName}
                            onChange={(e) => setEditedChannelName(e.target.value)}
                            style={{fontSize: '24px', marginBottom: '10px', padding: '5px'}}
                        />
                        <textarea 
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            placeholder="Channel description"
                            style={{width: '100%', minHeight: '80px', padding: '5px', marginBottom: '10px'}}
                        />
                        <div>
                            <button onClick={handleSaveChannel} style={{marginRight: '10px'}}>Save</button>
                            <button onClick={() => setEditMode(false)}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h1>{channel.channelName}</h1>
                        <p>@{channel.username}</p>
                        <p>{subscriberCount} subscribers</p>
                        {!isOwnChannel && (
                            <button 
                                onClick={handleSubscribe}
                                style={{
                                    backgroundColor: isSubscribed? '#e5e5e5' : '#cc0000',
                                    color: isSubscribed ? '#606060' : 'white',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    marginTop: '10px'
                                }}
                            >
                                {isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </button>
                        )}
                        {isOwnChannel && (<button onClick={() => setEditMode(true)}>Edit Channel</button>)}
                    </>
                )}
            </div>

            <div className="channel-video">
                <h2>Videos ({videos.length})</h2>
                <div className="video-grid">
                    {videos.map(video => (
                        <div key = {video._id} className="channel-video-card">
                            <Link to={`/video/${video._id}`}>
                                <img src={`${API_URL}${video.thumbnailURL}`} alt = {video.title} />
                                <h3>{video.title}</h3>
                                <p>{video.views} views</p>
                            </Link>
                            {isOwnChannel && (
                                <div className="video-actions">
                                    <button onClick={()=> handleDeleteVideo(video._id)}>Delete</button>
                                    <button onClick={() => navigate(`/edit-video/${video._id}`)}>Edit</button>
                                </div>
                            )}
                        </div>  
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ChannelPage;