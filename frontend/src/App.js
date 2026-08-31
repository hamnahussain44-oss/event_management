import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import EventsPage from './pages/EventsPage';
import AttendeesPage from './pages/AttendeesPage';
import VenuesPage from './pages/VenuesPage';

const Protected = ({ children }) => {
  const authed = localStorage.getItem('auth') === 'true';
  return authed ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<Protected><EventsPage /></Protected>} />
          <Route path="/attendees" element={<Protected><AttendeesPage /></Protected>} />
          <Route path="/venues" element={<Protected><VenuesPage /></Protected>} />
        </Routes>
      </div>
    </Router>
  );
}
