import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Building_A3 from '../images/Building_A3.jpg';
import Building_A6 from '../images/Building_A6.jpg'; 
import Building_B4 from '../images/Building_B4.jpg'; 
import "./Location.css";

const Location = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [count, setCount] = useState(null);
  const [maxToday, setMaxToday] = useState(0);
  const [loading, setLoading] = useState(true); // สำหรับการโหลด
  const [error, setError] = useState(null); // สำหรับ error
  const selectedLocation = state?.location;

  useEffect(() => {
    if (!selectedLocation) {
      // หากไม่ได้เลือกสถานที่ ให้เปลี่ยนเส้นทางไปหน้า Home
      navigate('/');
    } else {
      const apiUrls = {
        "Building A3" : 'https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=2',
        "Building A6" : 'https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=2',
        "Building B4" : 'https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=2',
      };

      const fetchData = async () => {
        try {
          const response = await fetch(apiUrls[selectedLocation]);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const currentCount = data.feeds[0].field1; 
          setCount(currentCount);

          // อัปเดต maxToday โดยใช้ฟังก์ชัน
          setMaxToday((prevMax) => Math.max(prevMax, currentCount));

          // หยุดการโหลดเมื่อข้อมูลเสร็จ
          setLoading(false);
        } catch (error) {
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
          setLoading(false);
        }
      };

      fetchData();
    }
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
          <div className="location-head"><h1>{selectedLocation}</h1></div>
          <img src={getImage()} alt={selectedLocation} />
          <div className="location-info">
            <p>จำนวนคน: {count}</p>
            <p>ความหนาแน่น: {getDensityLevel(count)}</p>
            <p>จำนวนสูงสุดของวันนี้: {maxToday}</p>
          </div>
        </div>
      )}

      {count === null && !loading && <p>กรุณาเลือกสถานที่จาก Dropdown ใน Navbar</p>}
    </div>
  );
};

export default Location;
