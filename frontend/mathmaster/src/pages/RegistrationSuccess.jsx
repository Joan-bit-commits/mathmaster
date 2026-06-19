import React from 'react';
import { Link } from 'react-router-dom';

function RegistrationSuccess() {
  return (
    <div>
      <h2>Registration Successful</h2>
      <p>Your account was created successfully. You can now log in.</p>
      <p>
        <Link to="/login">Go to Login</Link>
      </p>
    </div>
  );
}

export default RegistrationSuccess;
