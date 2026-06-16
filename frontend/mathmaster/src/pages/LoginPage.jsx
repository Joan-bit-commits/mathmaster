import {useState} from 'react';

import api from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
        console.log('Login successful:', response.data);
        // Handle successful login (e.g., store token, redirect to dashboard)
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login failure (e.g., display error message)
    }
    };

    const handleChange = (e) => {
    setEmail(e.target.value);
    }

    return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
            <input
                type="email"
                placeholder="Email"
                value={email}   
                onChange={handleChange}
            />
        </div>
        <div>
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;