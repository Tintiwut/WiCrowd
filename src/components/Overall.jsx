import React, { useEffect, useState } from "react";
import Building_A3 from "../images/Building_A3.jpg";
import Building_A6 from "../images/Building_A6.jpg";
import Building_B4 from "../images/Building_B4.jpg";
import "./Overall.css";

const Overall = ({ language }) => {
  const [data, setData] = useState([]);
  const [maxToday, setMaxToday] = useState(() => {
    return parseInt(localStorage.getItem("maxToday") || "0", 10);
  });

  const translations = {
    en: {
      buildingA3: "Building A3",
      buildingA6: "Building A6",
      buildingB4: "Building B4",
      peopleCount: "Number of People",
      density: "Density",
      maxToday: "Maximum Today",
      status: "Status",
      densityLevels: { low: "Low", medium: "Medium", high: "High" },
    },
    th: {
      buildingA3: "อาคาร A3",
      buildingA6: "อาคาร A6",
      buildingB4: "อาคาร B4",
      peopleCount: "จำนวนคน",
      density: "ความหนาแน่น",
      maxToday: "จำนวนสูงสุดของวันนี้",
      status: "การทำงานของเครื่อง",
      densityLevels: { low: "น้อย", medium: "ปานกลาง", high: "มาก" },
    },
  };

  const fetchData = async () => {
    try {
      const response1 = await fetch("https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1");
      const response2 = await fetch("https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1");
      const response3 = await fetch("https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=1");

      const data1 = await response1.json();
      const data2 = await response2.json();
      const data3 = await response3.json();

      const count1 = parseInt(data1.feeds[0]?.field1 || 0, 10);
      const count2 = parseInt(data2.feeds[0]?.field1 || 0, 10);
      const count3 = parseInt(data3.feeds[0]?.field1 || 0, 10);

      setData([
        { key: "buildingA3", count: count1 },
        { key: "buildingA6", count: count2 },
        { key: "buildingB4", count: count3 },
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
    if (count < 20) return translations[language].densityLevels.low;
    if (count < 35) return translations[language].densityLevels.medium;
    return translations[language].densityLevels.high;
  };

  const locations = [
    { key: "buildingA3", image: Building_A3 },
    { key: "buildingA6", image: Building_A6 },
    { key: "buildingB4", image: Building_B4 },
  ];

  return (
    <div className="overall-container">
      {locations.map((location, index) => (
        <div key={index} className="overall-card">
          <img src={location.image} alt={translations[language][location.key]} />
          <div className="overall-info">
          <h2>{translations[language][location.key]}</h2>
            <p>{translations[language].peopleCount}: {data[index]?.count || 0}</p>
            <p>{translations[language].density}: {getDensityLevel(data[index]?.count || 0)}</p>
            <p>{translations[language].maxToday}: {maxToday}</p>
            <p>{translations[language].status}: </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Overall;
