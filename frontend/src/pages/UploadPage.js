import API_URL from '../config';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UploadPage(){
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

    const handleFileSelect = (e) => {
        const file = e.target.files[0];

        if(file && file.type.startsWith('video/')) {
            setVideoFile(file);
        }
        else{
            setError('Please select a video file');
            setVideoFile(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if(!videoFile){
            setError('Please select a video');
            return;
        }

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', title);
        formData.append('description', description);

        setUploading(true);
        setError('');

        try{
            const token = localStorage.getItem('token');

            const response = await axios.post(`${API_URL}/api/videos/upload`, formData, {
                headers: {
                    'auth-token': token
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            alert('Video uploaded successfully!');
            navigate('/');
        }
        catch(error){
            setError(error.response?.data?.error || 'Upload failed');
            setUploading(false);
        }
    };

    return (
        <div className="upload-page">
            <h2>Upload Video</h2>
            
            {error && <p style={{color: 'red'}}>{error}</p>}
            
            <form onSubmit={handleUpload}>
                <div>
                    <label>Video File:</label>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        required
                    />
                    {videoFile && <p>Selected: {videoFile.name}</p>}
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Video Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <textarea
                        placeholder="Video Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                    />
                </div>

                {uploading && (
                    <div>
                        <p>Uploading: {uploadProgress}%</p>
                        <progress value={uploadProgress} max="100" />
                    </div>
                )}

                <button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
            </form>
        </div>
    );
}

export default UploadPage;