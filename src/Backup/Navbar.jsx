import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from "../images/WiCrowd_Logo_PNG.png";
import "./Navbar.css";

const RealTimeClock = () => {
  const [dateTimeString, setDateTimeString] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const currentDateTime = new Date();
      const formattedDateTime = currentDateTime.toLocaleString('th-TH');
      setDateTimeString(formattedDateTime); 
    };

    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <div className="time-display">{dateTimeString}</div>;
};

function Navbar({ setSelectedLocation, selectedLocation }) {
  const navigate = useNavigate();
  const currentLocation = useLocation();

  useEffect(() => {
    if (currentLocation.pathname === "/home" || currentLocation.pathname === "/overall" || currentLocation.pathname === "/about") {
      setSelectedLocation("Location");
    }
  }, [currentLocation.pathname, setSelectedLocation]);

  const handleLocationChange = (event) => {
    const selectedLocation = event.target.value;
    setSelectedLocation(selectedLocation);

    if (selectedLocation === "Location") {
      navigate('/home'); // กลับไปที่หน้า Home เมื่อเลือก Location
    } else {
      navigate('/location', { state: { location: selectedLocation } });
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <img src={logo} alt="WiCrowd Logo" />
        </div>
        <p1><RealTimeClock /></p1>

        <ul className="nav-links">
          <li><Link to="/home" className="no-underline">HOME</Link></li>
          <li><Link to="/overall" className="no-underline">OVERALL</Link></li>
          <li>
            <select 
              onChange={handleLocationChange} 
              value={selectedLocation}
              className="location-select"
            >
              <option value="Location">LOCATION</option>
              <option value="Building A3">Building A3</option>
              <option value="Building A6">Building A6</option>
              <option value="Building B4">Building B4</option>
            </select>
          </li>
          <li><Link to="/about" className="no-underline">ABOUT US</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;