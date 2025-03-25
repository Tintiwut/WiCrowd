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

function Navbar({ setSelectedLocation, selectedLocation, language, setLanguage }) {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [menuActive, setMenuActive] = useState(false); // state สำหรับเปิดปิดเมนู

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "th" : "en");
  };

  // คำแปล
  const translations = {
    en: {
      home: "HOME",
      overall: "OVERALL",
      location: "LOCATION",
      about: "ABOUT US",
      buildingA3: "BUILDING A3",
      buildingA6: "BUILDING A6",
      buildingB4: "BUILDING B4",
      toggleLang: "TH",
    },
    th: {
      home: "หน้าแรก",
      overall: "ภาพรวม",
      location: "สถานที่",
      about: "เกี่ยวกับเรา",
      buildingA3: "อาคาร A3",
      buildingA6: "อาคาร A6",
      buildingB4: "อาคาร B4",
      toggleLang: "EN",
    },
  };

  useEffect(() => {
    if (currentLocation.pathname === "/home" || currentLocation.pathname === "/overall" || currentLocation.pathname === "/about") {
      setSelectedLocation("Location");
    }
  }, [currentLocation.pathname, setSelectedLocation]);

  const handleLocationChange = (event) => {
    const selectedLocation = event.target.value;
    setSelectedLocation(selectedLocation);

    // ปิดเมนูหลังจากเลือก
    setMenuActive(false);

    if (selectedLocation === "Location") {
      navigate('/home'); // กลับไปที่หน้า Home เมื่อเลือก Location
    } else {
      navigate('/location', { state: { location: selectedLocation } });
    }
  };

  const handleLinkClick = () => {
    // ปิดเมนูเมื่อคลิกที่เมนู
    setMenuActive(false);
  };

  // ฟังก์ชันสำหรับเปิด/ปิดเมนู
  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <img src={logo} alt="WiCrowd Logo" />
        </div>
        <p1><RealTimeClock /></p1>

        {/* ปุ่มเมนูสำหรับมือถือ */}
        <div className="menu-icon" onClick={toggleMenu}>
          ☰ {/* ไอคอนเมนู */}
        </div>

        {/* ปุ่มสลับภาษา */}
        <button className="toggle-lang-btn" onClick={toggleLanguage}>
          {translations[language].toggleLang}
        </button>

        {/* เมนู Dropdown */}
        <ul className={`nav-links ${menuActive ? 'active' : ''}`}>
          <li><Link to="/home" className="no-underline" onClick={handleLinkClick}>{translations[language].home}</Link></li>
          <li><Link to="/overall" className="no-underline" onClick={handleLinkClick}>{translations[language].overall}</Link></li>
          <li>
            <select 
              onChange={handleLocationChange} 
              value={selectedLocation}
              className="location-select"
            >
              <option value="Location">{translations[language].location}</option>
              <option value="Building A3">{translations[language].buildingA3}</option>
              <option value="Building A6">{translations[language].buildingA6}</option>
              <option value="Building B4">{translations[language].buildingB4}</option>
            </select>
          </li>
          <li><Link to="/about" className="no-underline" onClick={handleLinkClick}>{translations[language].about}</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
