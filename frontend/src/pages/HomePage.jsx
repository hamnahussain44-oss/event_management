import React from 'react';
import { Link } from 'react-router-dom';
export default function HomePage(){
  return (
    <div className="card">
      <h1>Event Management Dashboard</h1>
      <p>Use the links below to manage Events, Attendees, and Venues.</p>
      <div className="actions">
        <Link to="/events"><button className="primary">Manage Events</button></Link>
        <Link to="/attendees"><button className="primary">Manage Attendees</button></Link>
        <Link to="/venues"><button className="primary">Manage Venues</button></Link>
      </div>
    </div>
  );
}
