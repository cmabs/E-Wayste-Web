import { React } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/landingPage';
import Register from './pages/registerPage';
import Login from './pages/loginPage';
import Home from './pages/homePage';

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Landing />} />
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path='/home' element={<Home />} />
    </Routes>
  );
}