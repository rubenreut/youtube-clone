import API_URL from '../config';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UploadPage(){
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [uploadsEnabled, setUploadsEnabled] = useState(true);
    const [checkingConfig, setCheckingConfig] = useState(true);
    const navigate = useNavigate();

    // Check if uploads are enabled
    useEffect(() => {
        const checkUploadsEnabled = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/config`);
                setUploadsEnabled(response.data.uploadsEnabled);
            } catch (err) {
                // If we can't reach the config endpoint, assume uploads might be disabled
                setUploadsEnabled(false);
            } finally {
                setCheckingConfig(false);
            }
        };

        checkUploadsEnabled();
    }, []);

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [thumbnailPreview]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];

        if(file && file.type.startsWith('video/')) {
            // Clean up previous thumbnail preview
            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
            setVideoFile(file);
            generateThumbnail(file);
        }
        else{
            setError('Please select a video file');
            setVideoFile(null);
        }
    };

    const generateThumbnail = (videoFile) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const objectUrl = URL.createObjectURL(videoFile);
        video.src = objectUrl;
        video.preload = 'metadata';

        video.onseeked = () => {
            // Always 16:9 canvas
            canvas.width = 320;
            canvas.height = 180;

            // Fill with black background
            context.fillStyle = '#000000';
            context.fillRect(0, 0, 320, 180);

            // Calculate aspect ratio and positioning
            const videoAspect = video.videoWidth / video.videoHeight;
            const canvasAspect = 320 / 180;

            let drawWidth, drawHeight, offsetX, offsetY;

            if (videoAspect > canvasAspect) {
                // Video is wider - fit by width
                drawWidth = 320;
                drawHeight = 320 / videoAspect;
                offsetX = 0;
                offsetY = (180 - drawHeight) / 2;
            } else {
                // Video is taller - fit by height with black bars on sides
                drawHeight = 180;
                drawWidth = 180 * videoAspect;
                offsetX = (320 - drawWidth) / 2;
                offsetY = 0;
            }

            context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

            canvas.toBlob((blob) => {
                setThumbnail(blob);
                const previewUrl = URL.createObjectURL(blob);
                setThumbnailPreview(previewUrl);
            }, 'image/jpeg', 0.7);

            // Clean up the video object URL
            URL.revokeObjectURL(objectUrl);
        };

        video.onloadedmetadata = () => {
            video.currentTime = Math.min(1, video.duration / 2);
        };

        video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
        };
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!uploadsEnabled) {
            setError('Uploads are currently disabled');
            return;
        }

        if(!videoFile){
            setError('Please select a video');
            return;
        }

        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', title);
        formData.append('description', description);
        if(thumbnail) {
            formData.append('thumbnail', thumbnail, 'thumbnail.jpg');
        }

        setUploading(true);
        setError('');

        try{
            const token = localStorage.getItem('token');

            await axios.post(`${API_URL}/api/videos/upload`, formData, {
                headers: {
                    'auth-token': token
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            navigate('/');
        }
        catch(err){
            if (err.response?.data?.uploadsEnabled === false) {
                setError('Video uploads are currently disabled');
                setUploadsEnabled(false);
            } else {
                setError(err.response?.data?.error || 'Upload failed');
            }
            setUploading(false);
        }
    };

    if (checkingConfig) {
        return <div className="upload-page"><p>Loading...</p></div>;
    }

    if (!uploadsEnabled) {
        return (
            <div className="upload-page">
                <div className="uploads-disabled">
                    <h2>Uploads Temporarily Disabled</h2>
                    <p>Video uploads are currently disabled by the administrator.</p>
                    <p>Please check back later or contact support for more information.</p>
                    <button onClick={() => navigate('/')}>Go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="upload-page">
            <h2>Upload Video</h2>

            {error && <p className="upload-error">{error}</p>}

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

                {thumbnailPreview && (
                    <div>
                        <label>Thumbnail Preview:</label>
                        <img src={thumbnailPreview} alt="Thumbnail" style={{width: '200px', display: 'block', marginTop: '10px'}} />
                    </div>
                )}

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
