import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  
import { MapContainer, ImageOverlay, Marker, Popup } from "react-leaflet";
import { CRS } from "leaflet";
import "leaflet/dist/leaflet.css";
import mapImage from "../images/BUMAP.jpg";
import "./Home.css";
import L from "leaflet";

// ขอบเขตภาพแผนที่ (ปรับขนาดตามขนาดของภาพจริง)
const imageBounds = [
  [0, 0],      // มุมซ้ายบน
  [1000, 2000] // มุมขวาล่าง
];

// ตำแหน่งของอาคารต่างๆ ที่จะแสดงบนแผนที่
const locations = [
  { id: "Building A3", position: [290, 420], label: "Building A3" },
  { id: "Building A6", position: [450, 600], label: "Building A6" },
  { id: "Building B4", position: [510, 975], label: "Building B4" },
];

export default function MapWithMarkers({ setSelectedLocation }) {
  const [data, setData] = useState({}); // ใช้ state เพื่อเก็บข้อมูลที่ดึงมาจาก API
  const navigate = useNavigate(); // ใช้ navigate สำหรับการนำทางระหว่างหน้า

  // ดึงข้อมูลจาก API ทุกๆ 10 วินาที
  useEffect(() => {
    const apiUrls = {
      "Building A3": "", // ไม่มี API สำหรับอาคารนี้
      "Building A6": "", // ไม่มี API สำหรับอาคารนี้
      "Building B4": "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1"
    };

    // ฟังก์ชันดึงข้อมูลจาก API
    const fetchData = async (building) => {
      const url = apiUrls[building];

      // ถ้าไม่ใส่ URL หรือเป็นค่าว่าง
      if (!url) {
        setData(prev => ({ ...prev, [building]: null }));
        return;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        const feed = result.feeds[0];

        if (feed) {
          const count = parseInt(feed.field1 || 0, 10); // แปลงข้อมูลที่ได้รับจาก API เป็นจำนวน
          const updatedTime = new Date(feed.created_at).getTime(); // แปลงเวลาให้เป็น millisecond
          const now = Date.now();
          const isRecent = now - updatedTime <= 10 * 60 * 1000; // ตรวจสอบข้อมูลที่ได้รับมีอายุไม่เกิน 10 นาที
          
          // ตั้งค่า data state ตามข้อมูลที่ได้
          setData(prev => ({
            ...prev,
            [building]: isRecent ? count : null, // ถ้าอัปเดตไม่นานก็แสดงค่า count
          }));
        } else {
          setData(prev => ({ ...prev, [building]: null }));
        }
      } catch (error) {
        console.error(`Error fetching data for ${building}:`, error);
        setData(prev => ({ ...prev, [building]: null }));
      }
    };

    // ดึงข้อมูลครั้งแรก
    Object.keys(apiUrls).forEach(building => fetchData(building));

    // ตั้งเวลาอัปเดตทุก 10 วิ
    const interval = setInterval(() => {
      Object.keys(apiUrls).forEach(building => fetchData(building));
    }, 10000);

    return () => clearInterval(interval); // ทำการยกเลิก interval เมื่อคอมโพเนนต์ถูก unmount
  }, []); // useEffect จะทำงานแค่ครั้งเดียวเมื่อคอมโพเนนต์โหลด

  // ฟังก์ชันสำหรับตรวจสอบระดับความหนาแน่นของแต่ละอาคาร
  const getDensityLevel = (count) => {
    if (count === null || count === undefined) return "gray"; // ถ้าไม่มีข้อมูลให้แสดงสีเทา
    if (count < 15) return "green"; // ถ้าจำนวนน้อยกว่า 15 ให้แสดงสีเขียว
    if (count < 30) return "yellow"; // ถ้าจำนวนระหว่าง 15 ถึง 30 ให้แสดงสีเหลือง
    return "red"; // ถ้าจำนวนมากกว่า 30 ให้แสดงสีแดง
  };

  return (
    <MapContainer
      center={[0, 0]}
      zoom={0}
      minZoom={0}
      maxZoom={0}
      style={{ height: "100vh", width: "100vw" }}
      crs={L.CRS.Simple}
      maxBounds={imageBounds}
      maxBoundsViscosity={1.0}
      zoomControl={false}
    >
      {/* แสดงแผนที่ที่ใช้ภาพพื้นหลัง */}
      <ImageOverlay url={mapImage} bounds={imageBounds} />

      {/* วนลูปแสดงตำแหน่ง Marker สำหรับแต่ละอาคาร */}
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={loc.position} // กำหนดตำแหน่งของ Marker
          icon={L.divIcon({
            className: "custom-marker", // ใช้ custom icon
            html: `<div style="
              background-color: ${getDensityLevel(data[loc.id])}; 
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 2px solid black;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 20px;
              font-weight: bold;
              ${data[loc.id] !== undefined ? 'animation: blink 2s infinite;' : ''}
            ">${data[loc.id] !== undefined && data[loc.id] !== null ? data[loc.id] : "?"}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
          })}
          eventHandlers={{
            click: () => {
              setSelectedLocation(loc.id); // เมื่อคลิกที่ Marker ให้เก็บตำแหน่งที่เลือก
              navigate('/location', { state: { location: loc.id } }); // นำทางไปที่หน้า location พร้อมข้อมูลตำแหน่ง
            },
          }}
        >
          <Popup>{loc.label}</Popup> {/* แสดงชื่ออาคารเมื่อคลิกที่ Marker */}
        </Marker>
      ))}
    </MapContainer>
  );
}
