import React, { useState, useEffect  } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Overall from './components/Overall';
import Location from './components/Location';
import About from './components/About';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return sessionStorage.getItem("selectedOption") || '';
  });
  const [language, setLanguage] = useState('en'); // 🟢 เพิ่ม state สำหรับภาษา

  useEffect(() => {
    sessionStorage.setItem("selectedOption", selectedLocation);
  }, [selectedLocation]);

  return (
    <Router>
      <Navbar 
        setSelectedLocation={setSelectedLocation} 
        selectedLocation={selectedLocation} 
        language={language} 
        setLanguage={setLanguage} 
      />
      <Routes>
        <Route path="/" element={<Home setSelectedLocation={setSelectedLocation} />} />
        <Route path="/home" element={<Navigate to="/" />} />
        <Route path="/overall" element={<Overall language={language}/>} />
        <Route path="/location" element={<Location selectedLocation={selectedLocation} language={language}/>} />
        <Route path="/about" element={<About language={language} />} />
      </Routes>
    </Router>
  );
}

export default App;