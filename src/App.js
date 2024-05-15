import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/landingPage';
import Register from './pages/registerPage';
import Login from './pages/loginPage';
import Home from './pages/homePage';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const inactivityTimeout = 10 * 60 * 1000;
  let inactivityTimer;

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {
      handleLogout();
    }, inactivityTimeout);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login');
  };

  useEffect(() => {
    
    const userIsLoggedIn = true; 
    setIsLoggedIn(userIsLoggedIn);

    if (userIsLoggedIn) {
      resetInactivityTimer();
      const handleActivity = () => resetInactivityTimer();
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      return () => {
        clearTimeout(inactivityTimer);
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
      };
    }
  }, [location.pathname]); 

  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}
