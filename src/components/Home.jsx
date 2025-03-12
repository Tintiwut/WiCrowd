import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import mapImage from './BUMAP4.jpg';
import "./Home&navbar.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [maxToday, setMaxToday] = useState(0);

  useEffect(() => {
    // ดึงข้อมูลจาก API
    const fetchData = async () => {
      try {
        const response = await fetch("https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=2"); // เปลี่ยนเป็น URL ของ API ที่คุณต้องการ
        const result = await response.json();
        
        setData(result);

        if (result.count > maxToday) {
          setMaxToday(result.count);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, [maxToday]); // เพิ่ม maxToday ใน dependency array เพื่อให้ useEffect ทำงานใหม่เมื่อ maxToday เปลี่ยน

  // ฟังก์ชันในการกำหนดระดับความหนาแน่น
  const getDensityLevel = (count) => {
    if (count < 20) return "น้อย";
    if (count < 35) return "ปานกลาง";
    return "มาก";
  };

  return (
    <div>
        <div className="mapImage">
          <img src={mapImage} alt="Custom Map"/>
          <li><Link to="/location/Building B4" className="map-marker" style={{ top: "30%", left: "20%", backgroundColor: "red" }}></Link></li>
          <li><Link to="Building_A4" className="map-marker" style={{ top: "50%", left: "40%", backgroundColor: "blue" }}></Link></li>
          <li><Link to="Building_B4" className="map-marker" style={{ top: "70%", left: "60%", backgroundColor: "green" }}></Link></li>
        </div>
    </div>
  );
}
