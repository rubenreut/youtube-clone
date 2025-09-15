import API_URL from '../config';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';

function LoginPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            //redirect to home
            navigate('/');


        }
        catch(error){
            setError(error.response?.data?.error|| 'Login failed');
        }
    };



    return (
        <div className="login-page">
            <h2>Login</h2>

            {error && <p style={{color: 'red'}}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type = "email"
                        placeholder = "Email"
                        value = {email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <input  
                        type = "password"
                        placeholder = "Password"
                        value = {password}
                        onChange = {(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type = "submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;