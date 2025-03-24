import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Building_A3 from "../images/Building_A3.jpg";
import Building_A6 from "../images/Building_A6.jpg";
import Building_B4 from "../images/Building_B4.jpg";
import ChartComponent from "./ChartComponent";
import "./Location.css";

const Location = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [count, setCount] = useState(null);
  const [maxToday, setMaxToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const selectedLocation = state?.location;

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
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        setLoading(false);
      }
    };

    fetchData(); 
    const interval = setInterval(fetchData, 10000); 

    return () => clearInterval(interval);
  }, [selectedLocation, navigate]);

  const getDensityLevel = (count) => {
    if (count < 20) return "น้อย";
    if (count < 35) return "ปานกลาง";
    return "มาก";
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
    <div>
      {loading && <p>กำลังโหลดข้อมูล...</p>}
      {error && <p>{error}</p>}
      {count !== null && !loading && (
        <div className="location-card">
          <div className="location-head">
            <h1>{selectedLocation}</h1>
          </div>
          
          {/* กล่องหลักที่แบ่งรูปและกราฟ */}
          <div className="location-content">
            {/* รูปภาพ */}
            <div className="location-image">
              <img src={getImage()} alt={selectedLocation} />
            </div>
  
            {/* กล่องข้อมูลและกราฟ */}
            <div className="location-info-chart">
              <div className="location-info">
                <p>จำนวนคน: {count}</p>
                <p>ความหนาแน่น: {getDensityLevel(count)}</p>
                <p>จำนวนสูงสุดของวันนี้: {maxToday}</p>
              </div>
  
              {/* กราฟ */}
              <div className="location-chart">
                <ChartComponent feeds={feeds} />
              </div>
            </div>
          </div>
        </div>
      )}
  
      {count === null && !loading && <p>กรุณาเลือกสถานที่จาก Dropdown ใน Navbar</p>}
    </div>
  );
  
};

export default Location;
