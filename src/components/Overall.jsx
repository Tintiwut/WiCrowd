import React, { useEffect, useState } from "react";
import Building_A3 from "../images/Building_A3.jpg";
import Building_A6 from "../images/Building_A6.jpg";
import Building_B4 from "../images/Building_B4.jpg";
import "./Overall.css";

const Overall = () => {
  const [data, setData] = useState([]);
  const [maxToday, setMaxToday] = useState(() => {
    return parseInt(localStorage.getItem("maxToday") || "0", 10);
  });

  const fetchData = async () => {
    try {
      const response1 = await fetch(
        "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1"
      );
      const response2 = await fetch(
        "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1"
      );
      const response3 = await fetch(
        "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1"
      );

      const data1 = await response1.json();
      const data2 = await response2.json();
      const data3 = await response3.json();

      const count1 = parseInt(data1.feeds[0]?.field1 || 0, 10);
      const count2 = parseInt(data2.feeds[0]?.field1 || 0, 10);
      const count3 = parseInt(data3.feeds[0]?.field1 || 0, 10);

      setData([
        { name: "Building A3", count: count1 },
        { name: "Building A6", count: count2 },
        { name: "Building B4", count: count3 },
      ]);

      // ตรวจสอบว่ามีค่าที่สูงกว่าค่าเดิมหรือไม่
      const newMax = Math.max(maxToday, count1, count2, count3);
      if (newMax > maxToday) {
        setMaxToday(newMax);
        localStorage.setItem("maxToday", newMax); // บันทึกค่า maxToday ลง localStorage
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // ดึงข้อมูลครั้งแรก
    const interval = setInterval(fetchData, 10000); // อัปเดตข้อมูลทุก 10 วินาที

    return () => clearInterval(interval); // ล้าง interval เมื่อ component ถูก unmount
  }, []);

  const getDensityLevel = (count) => {
    if (count < 20) return "น้อย";
    if (count < 35) return "ปานกลาง";
    return "มาก";
  };

  return (
    <div>
      {data.map((location, index) => (
        <div key={index} className="overall-card">
          <img src={[Building_A3, Building_A6, Building_B4][index]} alt={`Location ${index + 1}`} />
          <div className="overall-info">
            <h2>{location.name}</h2>
            <p>จำนวนคน: {location.count}</p>
            <p>ความหนาแน่น: {getDensityLevel(location.count)}</p>
            <p>จำนวนสูงสุดของวันนี้: {maxToday}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Overall;
