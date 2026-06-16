import {useState} from 'react';
import api from '../services/api';

function RegistrationPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/register', { username, email, password, role });
      console.log('Registration successful:', response.data);
      // Handle successful registration (e.g., redirect to login page)
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle registration failure (e.g., display error message)
    }
  };

  const handleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <div>
      <h1>Registration Page</h1>    
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
            <div>
                <select value={role} onChange={handleChange}>
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>
            </div>
            <button type="submit">Register</button>
        </form>
    </div>
);
}
export default RegistrationPage;