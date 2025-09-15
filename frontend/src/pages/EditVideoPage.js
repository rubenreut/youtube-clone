import API_URL from '../config';
import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';

function EditVideoPage(){
    const {videoId} = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(()=> {
        fetchVideoData();
    }, [videoId]);

    const fetchVideoData = async () => {
        try{
            const response = await axios.get(`${API_URL}/api/videos/${videoId}`);
            setTitle(response.data.title);
            setDescription(response.data.description || '');
            setCategory(response.data.category || '');
            setLoading(false);
        }
        catch(error){
            setError('Failed to load video');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try{
            await axios.put(`${API_URL}/api/videos/${videoId}`,
                {
                    title,
                    description,
                    category
                },
                {headers: {'auth-token': token}}
            );

            alert('Video updated succesfully!');
            navigate(`/video/${videoId}`);
        }
        catch(error){
            alert('Error updating video');
        }
    };

    if(loading) return <div>Loading...</div>
    if(error) return <div>{error}</div>

    return(
        <div className = "edit-video-page">
            <h2>Edit Video</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style = {{width: '100%', padding: '8px', marginBottom: '10px'}}
                    />
                </div>

                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="5"
                        style={{width: '100%', padding: '8px', marginBottom: '10px'}}
                    />
                </div>

                <div>
                    <label>Category:</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{width: '100%', padding: '8px', marginBottom: '10px'}}
                    >
                        <option value="">Select Category</option>
                        <option value="Music">Music</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Education">Education</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Sports">Sports</option>
                        <option value="News">News</option>
                    </select>
                </div>

                <button type = "submit" style = {{marginRight: '10px'}}>Save Changes</button>
                <button type = "button" onClick={() => navigate(-1)}>cancel</button>
            </form>
        </div>
    );  
}

export default EditVideoPage;