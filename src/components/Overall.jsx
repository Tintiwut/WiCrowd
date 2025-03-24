import React, { useEffect, useState } from "react";
import Building_A3 from "../images/Building_A3.jpg";
import Building_A6 from "../images/Building_A6.jpg";
import Building_B4 from "../images/Building_B4.jpg";
// import Building_B5 from "../images/Building_B5.jpg"; // เพิ่มตึกที่ 4
import "./Overall.css";

const Overall = () => {
  const [data, setData] = useState([]);
  const [maxToday, setMaxToday] = useState(() => {
    return parseInt(localStorage.getItem("maxToday") || "0", 10);
  });

  const fetchData = async () => {
    try {
      const response1 = await fetch("https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1");
      const response2 = await fetch("https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1");
      const response3 = await fetch("https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1");
      // const response4 = await fetch("https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1"); // เพิ่มตึกที่ 4

      const data1 = await response1.json();
      const data2 = await response2.json();
      const data3 = await response3.json();
      // const data4 = await response4.json(); // ตึกที่ 4

      const count1 = parseInt(data1.feeds[0]?.field1 || 0, 10);
      const count2 = parseInt(data2.feeds[0]?.field1 || 0, 10);
      const count3 = parseInt(data3.feeds[0]?.field1 || 0, 10);
      // const count4 = parseInt(data4.feeds[0]?.field1 || 0, 10); // ตึกที่ 4

      setData([
        { name: "Building A3", count: count1 },
        { name: "Building A6", count: count2 },
        { name: "Building B4", count: count3 },
        // { name: "Building B5", count: count4 }, // ตึกที่ 4
      ]);

      const newMax = Math.max(maxToday, count1, count2, count3);
      if (newMax > maxToday) {
        setMaxToday(newMax);
        localStorage.setItem("maxToday", newMax);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getDensityLevel = (count) => {
    if (count < 20) return "น้อย";
    if (count < 35) return "ปานกลาง";
    return "มาก";
  };

  return (
    <div className="overall-container">
      {data.map((location, index) => (
        <div key={index} className="overall-card">
          <img src={[Building_A3, Building_A6, Building_B4][index]} alt={location.name} />
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
