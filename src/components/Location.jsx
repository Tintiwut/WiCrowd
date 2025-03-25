import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Building_A3 from "../images/Building_A3.jpg";
import Building_A6 from "../images/Building_A6.jpg";
import Building_B4 from "../images/Building_B4.jpg";
import ChartComponent from "./ChartComponent";
import "./Location.css";

const Location = ({ language }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [count, setCount] = useState(null);
  const [maxToday, setMaxToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const selectedLocation = state?.location;

  const translations = {
    en: {
      loading: "Loading data...",
      error: "There was an error loading the data.",
      peopleCount: "Number of People",
      density: "Density",
      devicesCount: "Number of Devices", 
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
      density: "ความหนาแน่น",
      devicesCount: "จำนวนอุปกรณ์",
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

    const apiUrls = {
      "Building A3": "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1",
      "Building A6": "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1",
      "Building B4": "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1",
    };

    const fetchData = async () => {
      try {
        console.log("Fetching data...");
        const response = await fetch(apiUrls[selectedLocation] + `&t=${new Date().getTime()}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const currentCount = parseInt(data.feeds[0]?.field1 || 0, 10);

        setCount(currentCount);
        setMaxToday((prevMax) => Math.max(prevMax, currentCount));
        setLoading(false);
        setFeeds(data.feeds);
      } catch (error) {
        setError(translations[language].error);
        setLoading(false);
      }
    };

    fetchData(); 
    const interval = setInterval(fetchData, 10000); 

    return () => clearInterval(interval);
  }, [selectedLocation, navigate, language]);

  const getDensityLevel = (count) => {
    if (count < 20) return <span className="density-low">{translations[language].densityLevels.low}</span>;
    if (count < 35) return <span className="density-medium">{translations[language].densityLevels.medium}</span>;
    return <span className="density-high">{translations[language].densityLevels.high}</span>;
  };

  const getCountColor = (count) => {
    if (count < 20) return 'count-low'; 
    if (count < 35) return 'count-medium'; 
    return 'count-high'; 
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

  return (
    <div className="location-container">
      {loading && <p>{translations[language].loading}</p>}
      {error && <p>{error}</p>}
      {count !== null && !loading && (
        <div className="location-card">
          <div className="location-head">
            <h1>{translations[language].buildingNames[selectedLocation]}</h1>
          </div>
          
          {/* กล่องหลักที่แบ่งรูปและกราฟ */}
          <div className="location-content">
            {/* รูปภาพ */}
            <div className="location-image">
              <img src={getImage()} alt={selectedLocation} />
            </div>
  
            {/* กล่องข้อมูลและกราฟ */}
              <div className="location-info">
                <p>{translations[language].devicesCount} : <span className={getCountColor(count)}>{count}</span></p>
                <p>{translations[language].density} : {getDensityLevel(count)}</p>
                <p>{translations[language].maxToday} : {maxToday}</p>
                <p>{translations[language].status} : </p>
              </div>
          </div>
  
              {/* กราฟ */}
              <div className="location-chart">
              <ChartComponent feeds={feeds} language={language} devicesCount={translations[language].devicesCount} />
              </div>
        </div>
      )}
  
      {count === null && !loading && <p>{translations[language].selectLocation}</p>}
    </div>
  );
};

export default Location;
