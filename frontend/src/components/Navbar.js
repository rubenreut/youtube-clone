import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useTheme} from '../context/ThemeContext';

function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const {isDarkMode, toggleDarkMode} = useTheme();
    
    // Decode token to get user ID when component mounts
    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserId(payload._id);
            } catch(error) {
                console.error('Error decoding token:', error);
            }
        }
    }, [token]);

    const handleSearch = (e) => {
        e.preventDefault();
        if(searchQuery.trim()) {
            navigate(`/search?q=${searchQuery}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                <h2>YT</h2>
            </Link>

            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            <div className="nav-links">
                <Link to="/">Home</Link>
                
                {token ? (
                    <>
                        <Link to="/upload">Upload</Link>
                        {userId && <Link to={`/channel/${userId}`}>My Channel</Link>}
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}

                <button 
                    onClick={toggleDarkMode}
                    style={{
                        background: 'transparent',
                        border: ' 1px solid  #ccc',
                        borderRadius: '20px',
                        cursor: 'pointer'
                    }}
                >
                    {/*conditional rendering: show sun if dark mode, show moon if light mode}*/}
                     {isDarkMode ? '☀️' : '🌙'}
                </button>
                
            </div>
        </nav>
    );
}

export default Navbar;