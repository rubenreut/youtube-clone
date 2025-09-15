import API_URL from '../config';
import {useState} from 'react';
import axios from 'axios';
import {useNavigate } from 'react-router-dom';

function RegisterPage(){

    //create for constant for each input field, use useState so that when refreshed data doesn't disappear
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [channelName, setChannelName] = useState('');

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // prevents page from refreshing on submit 

        //api call to attempt registration
        try{
            //send post request to backend route
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                username,
                email,
                password,
                channelName
            });

            //Registration successful - redirect to login
            alert('Registration successful! Please Login'); //pop up message 
            navigate('/login');
        }
        catch(error){
            setError(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="register-page">
            <h2>Register</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Channel Name"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Register</button>
            </form>

            <p>
                Already have an account? 
                <button onClick={() => navigate('/login')}>Login</button>
            </p>
        </div>
    );
}

export default RegisterPage;