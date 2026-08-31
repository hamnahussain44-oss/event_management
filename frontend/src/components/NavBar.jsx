import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const authed = localStorage.getItem('auth') === 'true';
  const logout = () => { localStorage.removeItem('auth'); localStorage.removeItem('username'); navigate('/login'); };
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/events">Events</Link>
      <Link to="/attendees">Attendees</Link>
      <Link to="/venues">Venues</Link>
      <span style={{marginLeft:'auto'}} />
      {authed ? (
        <>
          <span className="note">Hi, {localStorage.getItem('username') || 'user'}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : <Link to="/login">Login</Link>}
    </nav>
  );
}
