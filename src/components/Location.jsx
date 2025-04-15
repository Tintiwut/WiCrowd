import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Building_A3 from "../images/Building_A3.jpg";
import Building_A6 from "../images/Building_A6.jpg";
import Building_B4 from "../images/Building_B4.jpg";
import ChartComponent1 from "./ChartComponent1";
import "./Location.css";

const Location = ({ language }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const selectedLocation = state?.location;

  const getTodayDateString = () => new Date().toISOString().split("T")[0];

  const [count, setCount] = useState(null);
  const [maxToday, setMaxToday] = useState(() => {
    const savedDate = localStorage.getItem("maxTodayDate");
    const today = getTodayDateString();
    if (savedDate !== today) {
      localStorage.setItem("maxToday", "0");
      localStorage.setItem("maxTodayDate", today);
      return 0;
    }
    return parseInt(localStorage.getItem("maxToday") || "0", 10);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeds, setFeeds] = useState([]);

  const translations = {
    en: {
      loading: "Loading data...",
      error: "There was an error loading the data.",
      peopleCount: "Number of People",
      densityLevelsText: "Density Levels",
      density: "Density", 
      filter: "Filter",
      minute: "Minute",
      hours: "Hours",
      maxToday: "Maximum Today",
      status: "Status",
      densityLevels: { low: "Low", medium: "Medium", high: "High" },
      selectLocation: "Please select a location from the dropdown in the Navbar",
      buildingNames: {
        "Building A3": "Building A3",
        "Building A6": "Building A6",
        "Building B4": "Building B4",
      },
    },
    th: {
      loading: "กำลังโหลดข้อมูล...",
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
      peopleCount: "จำนวนคน",
      densityLevelsText: " ระดับความหนาแน่น",
      density: "ความหนาแน่น",
      filter: "ฟิลเตอร์",
      minute: "นาที",
      hours: "ชั่วโมง",
      maxToday: "จำนวนสูงสุดของวันนี้",
      status: "สถานะ",
      densityLevels: { low: "น้อย", medium: "ปานกลาง", high: "มาก" },
      selectLocation: "กรุณาเลือกสถานที่จาก Dropdown ใน Navbar",
      buildingNames: {
        "Building A3": "อาคาร A3",
        "Building A6": "อาคาร A6",
        "Building B4": "อาคาร B4",
      },
    },
  };

  useEffect(() => {
    if (!selectedLocation) {
      navigate("/");
      return;
    }
  
    if (selectedLocation === "Building B4") {
      const apiUrl = "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1";
  
      const fetchData = async () => {
        try {
          const response = await fetch(apiUrl + `&t=${Date.now()}`);
          if (!response.ok) throw new Error("Network response was not ok");
  
          const data = await response.json();
          const currentCount = parseInt(data.feeds[0]?.field1 || "0", 10);
          setCount(currentCount);
          setFeeds(data.feeds);
  
          const today = getTodayDateString();
          const savedDate = localStorage.getItem("maxTodayDate");
          const savedMax = parseInt(localStorage.getItem("maxToday") || "0", 10);
  
          let newMax = savedMax;
  
          if (savedDate !== today) {
            newMax = currentCount;
            localStorage.setItem("maxTodayDate", today);
          } else {
            newMax = Math.max(savedMax, currentCount);
          }
  
          setMaxToday(newMax);
          localStorage.setItem("maxToday", newMax);
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError(translations[language].error);
          setLoading(false);
        }
      };
  
      fetchData();
      const interval = setInterval(fetchData, 10000);
  
      return () => clearInterval(interval);
    } else {
      // สำหรับ A3 และ A6 ไม่ต้อง fetch ข้อมูล realtime
      setLoading(false);
    }
  }, [selectedLocation, navigate, language]);
  

  const getDensityLevel = (count) => {
    if (count < 20) return <span className="Location-density-low">{translations[language].densityLevels.low}</span>;
    if (count < 35) return <span className="Location-density-medium">{translations[language].densityLevels.medium}</span>;
    return <span className="Location-density-high">{translations[language].densityLevels.high}</span>;
  };

  const getCountColor = (count) => {
    if (count < 20) return 'Location-count-low'; 
    if (count < 35) return 'Location-count-medium'; 
    return 'Location-count-high'; 
  };

  const getImage = () => {
    switch (selectedLocation) {
      case "Building A3":
        return Building_A3;
      case "Building A6":
        return Building_A6;
      case "Building B4":
        return Building_B4;
      default:
        return null;
    }
  };

  const getCSVUrl = () => {
    switch (selectedLocation) {
      case "Building A3":
        return "/data/15_04_2025_BuildingX.csv";
      case "Building A6":
        return "/data/14_04_2025_BuildingX.csv";
      default:
        return null;
    }
  };

  return (
    <div className="location-container">
      {!loading && (
  <div className="location-card">
    <div className="location-head">
      <h1>{translations[language].buildingNames[selectedLocation]}</h1>
    </div>

    <div className="location-content">
      <div className="location-image">
        <img src={getImage()} alt={selectedLocation} />
      </div>

      <div className="location-info">
        
          <>
            <p><span>{translations[language].densityLevelsText}</span> : {getDensityLevel(count)}</p>
            <p><span>{translations[language].density}</span> : <span className={getCountColor(count)}>{count}</span></p>
            <p><span>{translations[language].maxToday}</span> : <span style={{ marginLeft: "8px" }}>{maxToday}</span></p>
            <p><span>{translations[language].status}</span> : </p>
          </>
        
      </div>
    </div>

    <div className="location-chart">
      <ChartComponent1
        csvUrl={getCSVUrl()}
        density={translations[language].density}
        filter={translations[language].filter}
        hours={translations[language].hours}
        minute={translations[language].minute}
      />
    </div>
  </div>
)}

  
      {count === null && !loading && <p>{translations[language].selectLocation}</p>}
    </div>
  );
};

export default Location;
