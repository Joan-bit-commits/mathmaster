import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  const username = localStorage.getItem('username') || 'User';

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <p>You are logged in.</p>
      <p>
        <Link to="/">Go to dashboard</Link>
      </p>
    </div>
  );
}

export default HomePage;
