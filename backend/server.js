console.log('Script is starting...');

require('dotenv').config();

// Log environment variables status (without exposing sensitive data)
console.log('Environment check:');
console.log('- MongoDB URI exists:', !!process.env.MONGODB_URI);
console.log('- JWT Secret exists:', !!process.env.JWT_SECRET);
console.log('- AWS Access Key exists:', !!process.env.AWS_ACCESS_KEY_ID);
console.log('- AWS Secret exists:', !!process.env.AWS_SECRET_ACCESS_KEY);
console.log('- AWS Bucket:', process.env.AWS_BUCKET_NAME);
console.log('- AWS Region:', process.env.AWS_REGION);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');

console.log('Creating Express app...');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads'));

// Routes
app.get("/", (req, res) => {
    res.json({ message: 'Youtube Clone Api is running!' });
});

// Start server
const PORT = process.env.PORT || 3099;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Connect to MongoDB after server starts
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube-clone', {
    serverSelectionTimeoutMS: 5000
}).then(() => {
    console.log('✅ MongoDB connected!');
}).catch((error) => {
    console.error('❌ MongoDB Error:', error.message);
    console.log('Server continues without database');
});