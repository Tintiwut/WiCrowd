import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import mapImage from '../images/BUMAP4.jpg';
import "./Home.css";

export default function Dashboard() {
  const [data, setData] = useState({
    "Building A3": null,
    "Building A6": null,
    "Building B4": null
  });
  const navigate = useNavigate();

  // ฟังก์ชันดึงข้อมูลจาก API
  useEffect(() => {
    const apiUrls = {
      "Building A3": "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1",
      "Building A6": "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1",
      "Building B4": "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1"
    };

    const fetchData = async (building) => {
      try {
        const response = await fetch(apiUrls[building]);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        const currentCount = parseInt(result.feeds[0]?.field1 || 0, 10);

        setData(prevData => ({
          ...prevData,
          [building]: currentCount
        }));
      } catch (error) {
        console.error(`Error fetching data for ${building}:`, error);
      }
    };

    // ดึงข้อมูลทุกตึก
    Object.keys(apiUrls).forEach(building => {
      if (apiUrls[building]) fetchData(building);
    });

    // อัปเดตข้อมูลทุก 10 วินาที
    const interval = setInterval(() => {
      Object.keys(apiUrls).forEach(building => {
        if (apiUrls[building]) fetchData(building);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ฟังก์ชันกำหนดระดับความหนาแน่น
  const getDensityLevel = (count) => {
    if (count === null) return "rgb(183, 184, 180)";  // กรณีที่ยังไม่มีข้อมูล
    if (count < 15) return "rgb(4, 160, 6)";
    if (count < 30) return "rgb(255, 255, 0)";
    return "rgb(255, 0, 0)";
  };

  // ฟังก์ชันนำทางไปยังหน้า Location
  const handleNavigate = (location) => {
    navigate('/location', { state: { location } });
  };

  return (
    <div>
      <div className="mapImage">
        <img src={mapImage} alt="Custom Map" />
        <div className="marker-container-line" style={{ top: "50%", left: "22%" }}>
          <div className="map-dot"></div>
            <button 
              className="map-marker" 
              style={{backgroundColor: getDensityLevel(data["Building A3"])}}
              onClick={() => handleNavigate("Building A3")}
            ></button>
          <div className="map-line"></div>
        </div>

        <div className="marker-container-line" style={{ top: "30%", left: "29%" }}>
          <div className="map-dot"></div>
            <button 
              className="map-marker" 
              style={{backgroundColor: getDensityLevel(data["Building A6"])}}
              onClick={() => handleNavigate("Building A6")}
            ></button>
          <div className="map-line"></div>
        </div>
    
        <div className="marker-container-line" style={{ top: "25%", left: "48%" }}>
          <div className="map-dot"></div>
            <button 
              className="map-marker" 
              style={{backgroundColor: getDensityLevel(data["Building B4"])}}
              onClick={() => handleNavigate("Building B4")}
            ></button>
          <div className="map-line"></div>
        </div>
      </div>
    </div>
  );
}