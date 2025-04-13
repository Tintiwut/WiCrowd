import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  
import { MapContainer, ImageOverlay, Marker, Popup } from "react-leaflet";
import { CRS, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import mapImage from "../images/BUMAP.jpg";
import "./Home.css";
import L from "leaflet";

// กำหนดขอบเขตของรูปแผนที่ (x, y) ให้สัมพันธ์กับภาพจริง
const imageBounds = [
  [0, 0],      // มุมซ้ายบน
  [1000, 2000] // มุมขวาล่าง (ปรับขนาดให้สัมพันธ์กับภาพจริง)
];

// ตำแหน่งของแต่ละตึกในพิกัดของภาพ
const locations = [
  { id: "Building A3", position: [290, 420], label: "Building A3" },
  { id: "Building A6", position: [450, 600], label: "Building A6" },
  { id: "Building B4", position: [510, 975], label: "Building B4" },
];

export default function MapWithMarkers({ setSelectedLocation }) {
  const [data, setData] = useState({});
  const navigate = useNavigate();  // สร้าง navigate ด้วย useNavigate

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
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        const currentCount = parseInt(result.feeds[0]?.field1 || 0, 10);  // ถ้าเป็น null หรือ undefined ให้ใช้ค่า 0

        setData(prevData => ({
          ...prevData,
          [building]: currentCount
        }));
      } catch (error) {
        console.error(`Error fetching data for ${building}:`, error);

        // ถ้า API ไม่สามารถดึงข้อมูลได้ ให้ลบข้อมูลเดิมที่อยู่ใน state
        setData(prevData => ({
          ...prevData,
          [building]: null  // กำหนดค่าเป็น null เมื่อไม่สามารถดึงข้อมูล
        }));
      }
    };

    Object.keys(apiUrls).forEach(building => fetchData(building));

    const interval = setInterval(() => {
      Object.keys(apiUrls).forEach(building => fetchData(building));
    }, 10000);

    return () => clearInterval(interval);
  }, []); // ทำงานครั้งเดียวตอนเริ่มต้น component

  // ฟังก์ชันกำหนดระดับความหนาแน่น
  const getDensityLevel = (count) => {
    if (count === null || count === undefined) return "gray";  // ถ้าเป็น null หรือ undefined ให้ใช้สี gray
    if (count < 15) return "green";
    if (count < 30) return "yellow";
    return "red";
  };

  return (
    <MapContainer
      center={[0, 0]} // กำหนดตำแหน่งตรงกลางของแผนที่ (ตามขนาดของภาพ)
      zoom={0} // ค่า zoom เริ่มต้น
      minZoom={0}  // ตั้งค่าให้เริ่มซูมที่ 0 (หรือขนาดที่เหมาะสม)
      maxZoom={0}  // ตั้งค่าให้สูงสุดที่ 2 หรือค่าที่เหมาะสมกับขนาดของแผนที่
      style={{ height: "100vh", width: "100vw" }} // ให้แผนที่เต็มหน้าจอ
      crs={L.CRS.Simple} // ใช้พิกัดแบบ Custom Image
      maxBounds={imageBounds} // กำหนดขอบเขตการซูมให้ไม่เกินขนาดภาพ
      maxBoundsViscosity={1.0} // ให้การเคลื่อนที่ของแผนที่ไม่ออกนอกขอบเขต
      zoomControl={false} // ปิดการแสดงปุ่มซูม (บวก/ลบ)
    >
      <ImageOverlay url={mapImage} bounds={imageBounds} />

      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={loc.position}
          icon={L.divIcon({
            className: "custom-marker",
            html: `<div style="
              background-color: ${getDensityLevel(data[loc.id])};
              width: 40px;  /* เพิ่มขนาด */
              height: 40px;
              border-radius: 50%;
              border: 2px solid black;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 20px;
              font-weight: bold;
              ${data[loc.id] !== undefined ? 'animation: blink 2s infinite;' : ''} /* ทำให้กระพริบถ้ามีข้อมูล */
            ">${data[loc.id] !== undefined ? data[loc.id] : "?"}</div>`,
            iconSize: [40, 40],  // ขนาดของ Marker icon คงที่ไม่เปลี่ยนแปลง
            iconAnchor: [20, 20],  // จุดยึดตำแหน่งกลางของ Marker
            popupAnchor: [0, -20],  // ปรับตำแหน่งของ Popup
          })}
          eventHandlers={{
            click: () => {
              setSelectedLocation(loc.id); // เปลี่ยนค่า selectedLocation
              navigate('/location', { state: { location: loc.id } });  // นำทางไปหน้า /location พร้อมข้อมูล
            },
          }}
        >
          <Popup>{loc.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}