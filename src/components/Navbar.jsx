import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from "./WiCrowd_Logo_PNG.png";
import "./Home&navbar.css";

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

function Navbar() {
  const [location, setLocation] = useState("Building_A3"); 
  const navigate = useNavigate();
  const currentLocation = useLocation();

  useEffect(() => {
    if (currentLocation.pathname === "/home" || currentLocation.pathname === "/overall" || currentLocation.pathname === "/about") {
      setLocation("Location");
    }
  }, [currentLocation.pathname]);

  const handleLocationChange = (event) => {
    const selectedLocation = event.target.value;
    setLocation(selectedLocation);
    navigate('/location', { state: { location: selectedLocation } });
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
              value={location}
              className="location-select"
            >
              <option value="/home">LOCATION</option>
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
