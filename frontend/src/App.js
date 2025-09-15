import {BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import './styles/index.css';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import VideoPage from './pages/VideoPage';
import SearchPage from './pages/SearchPage';
import ChannelPage from './pages/ChannelPage';
import EditVideoPage from './pages/EditVideoPage';
import {ThemeProvider} from './context/ThemeContext';


function Layout({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
}

function App(){
  return(

    <ThemeProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/video/:id" element={<VideoPage />} />
              <Route path="/channel/:userId" element={<ChannelPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path ="/edit-video/:videoId" element ={<EditVideoPage/>}/>
      
            </Routes>
          </Layout>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;