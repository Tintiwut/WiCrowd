import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Overall from './components/Overall';
import Location from './components/Location';
import About from './components/About';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [selectedLocation, setSelectedLocation] = useState('');

  return (
    <Router>
      <Navbar setSelectedLocation={setSelectedLocation} />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/overall" element={<Overall />} />
        <Route path="/location" element={<Location selectedLocation={selectedLocation} />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
