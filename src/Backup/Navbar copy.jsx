import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../images/WiCrowd_Logo_PNG.png";
import "./Navbar.css";

const RealTimeClock = () => {
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const currentDateTime = new Date();
      setTimeString(
        currentDateTime.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      );
      setDateString(currentDateTime.toLocaleDateString("th-TH"));
    };

    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return <div className="time-display">
  <div>{timeString}</div> {/* บรรทัดบน: แสดงเวลา */}
  <div>{dateString}</div> {/* บรรทัดล่าง: แสดงวันที่ */}
</div>
};

function Navbar({ setSelectedLocation, selectedLocation, language, setLanguage }) {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [menuActive, setMenuActive] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, [setLanguage]);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "th" : "en";
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const translations = {
    en: {
      home: "HOME",
      overall: "OVERALL",
      location: "LOCATION",
      about: "ABOUT US",
      buildingA3: "BUILDING A3",
      buildingA6: "BUILDING A6",
      buildingB4: "BUILDING B4",
      toggleLang: "EN",
    },
    th: {
      home: "หน้าแรก",
      overall: "ภาพรวม",
      location: "สถานที่",
      about: "เกี่ยวกับเรา",
      buildingA3: "อาคาร A3",
      buildingA6: "อาคาร A6",
      buildingB4: "อาคาร B4",
      toggleLang: "TH",
    },
  };

  useEffect(() => {
    if (
      currentLocation.pathname === "/home" ||
      currentLocation.pathname === "/overall" ||
      currentLocation.pathname === "/about"
    ) {
      setSelectedLocation("Location");
    }
  }, [currentLocation.pathname, setSelectedLocation]);

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setDropdownOpen(false); // ปิด dropdown หลังจากเลือก
    setMenuActive(false); // ปิดเมนูด้วย
    navigate("/location", { state: { location } });
  };

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* โลโก้ที่คลิกแล้วไปหน้า Home */}
        <div className="logo" onClick={() => navigate("/home")}>
          <img src={logo} alt="WiCrowd Logo" />
        </div>

        {/* นาฬิกา */}
        <p1>
          <RealTimeClock />
        </p1>

        {/* ปุ่มเมนูสำหรับมือถือ */}
        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>

        {/* ปุ่มสลับภาษา */}
        <button className="toggle-lang-btn" onClick={toggleLanguage}>
          {translations[language].toggleLang}
        </button>

        {/* เมนูหลัก */}
        <ul className={`nav-links ${menuActive ? "active" : ""}`}>
          <li>
            <Link to="/home" className="no-underline" onClick={() => setMenuActive(false)}>
              {translations[language].home}
            </Link>
          </li>
          <li>
            <Link to="/overall" className="no-underline" onClick={() => setMenuActive(false)}>
              {translations[language].overall}
            </Link>
          </li>

          {/* Dropdown สำหรับเลือกอาคาร */}
          <li
            className="dropdown"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="dropdown-btn">
              {translations[language].location}
            </button>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={() => handleLocationChange("Building A3")}>
                    {translations[language].buildingA3}
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => handleLocationChange("Building A6")}>
                    {translations[language].buildingA6}
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => handleLocationChange("Building B4")}>
                    {translations[language].buildingB4}
                  </button>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link to="/about" className="no-underline" onClick={() => setMenuActive(false)}>
              {translations[language].about}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
