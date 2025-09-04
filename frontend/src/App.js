import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import VideoPage from './pages/VideoPage';
function App(){
  return(
    <Router>
      <div className = "App">
        <h1>Youtube Clone</h1>
        <Routes>
          <Route path = "/" element={<HomePage />} />
          <Route path = "/login" element={<LoginPage />} />
          <Route path = "/register" element={<RegisterPage />} />
          <Route path = "/upload" element={<UploadPage />} />
          <Route path = "/video/:id" element={<VideoPage />} />
          <Route path = "/channel/:id" element={<div>Channel Page</div>} />
          <Route path = "/search" element={<div>Search Page</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
