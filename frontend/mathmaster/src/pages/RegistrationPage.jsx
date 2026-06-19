import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function RegistrationPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/api/accounts/register/', {
        username,
        email,
        password,
        role,
      });

      console.log('Registration successful:', response.data);
      navigate('/register-success');
    } catch (error) {
      setError(error.response?.data || error.message);
      console.error('Registration failed:', error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>
        {error && <p style={{ color: 'red' }}>{JSON.stringify(error)}</p>}
    </div>
  );
}

export default RegistrationPage;