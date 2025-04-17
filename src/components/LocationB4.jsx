// components/LocationB4.js
import React, { useState, useEffect } from "react";
import Building_B4 from "../images/Building_B4.jpg";
import ChartComponent1 from "./ChartComponent1";
import "./Location.css";

const LocationB4 = ({ language }) => {
  const getTodayDateString = () => new Date().toISOString().split("T")[0];

  const [count, setCount] = useState(null);
  const [maxToday, setMaxToday] = useState(() => {
    const savedDate = localStorage.getItem("maxTodayDate");
    const today = getTodayDateString();
    if (savedDate !== today) {
      localStorage.setItem("maxToday", "0");
      localStorage.setItem("maxTodayDate", today);
      return 0;
    }
    return parseInt(localStorage.getItem("maxToday") || "0", 10);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeds, setFeeds] = useState([]);

  const translations = {
    en: {
      buildingNames: { "Building B4": "Building B4" },
      loading: "Loading data...",
      error: "There was an error loading the data.",
      peopleCount: "Number of People",
      densityLevelsText: "Density Levels",
      density: "Density",
      filter: "Filter",
      minute: "Minute",
      hours: "Hours",
      maxToday: "Maximum Today",
      status: "Status",
      densityLevels: { low: "Low", medium: "Medium", high: "High" },
    },
    th: {
      buildingNames: { "Building B4": "อาคาร B4" },
      loading: "กำลังโหลดข้อมูล...",
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
      peopleCount: "จำนวนคน",
      densityLevelsText: "ระดับความหนาแน่น",
      density: "ความหนาแน่น",
      filter: "ฟิลเตอร์",
      minute: "นาที",
      hours: "ชั่วโมง",
      maxToday: "จำนวนสูงสุดของวันนี้",
      status: "สถานะ",
      densityLevels: { low: "น้อย", medium: "ปานกลาง", high: "มาก" },
    },
  };

  useEffect(() => {
    const apiUrl =
      "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=100"; // Fetch more data (100 records or more)

    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl + `&t=${Date.now()}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setFeeds(data.feeds); // Set multiple feeds for 3 hours

        const today = getTodayDateString();
        const savedDate = localStorage.getItem("maxTodayDate");
        const savedMax = parseInt(localStorage.getItem("maxToday") || "0", 10);

        let newMax = savedMax;

        if (savedDate !== today) {
          newMax = data.feeds[0]?.field1 || 0;
          localStorage.setItem("maxTodayDate", today);
        } else {
          newMax = Math.max(savedMax, data.feeds[0]?.field1 || 0);
        }

        setMaxToday(newMax);
        localStorage.setItem("maxToday", newMax);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(translations[language].error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Interval is still 10 seconds to get the latest data
    return () => clearInterval(interval);
  }, [language]);

  const getDensityLevel = (count) => {
    if (count < 20)
      return <span className="Location-density-low">{translations[language].densityLevels.low}</span>;
    if (count < 35)
      return <span className="Location-density-medium">{translations[language].densityLevels.medium}</span>;
    return <span className="Location-density-high">{translations[language].densityLevels.high}</span>;
  };

  const getCountColor = (count) => {
    if (count < 20) return "Location-count-low";
    if (count < 35) return "Location-count-medium";
    return "Location-count-high";
  };

  return (
    <div className="location-container">
      {!loading && (
        <div className="location-card">
          <div className="location-head">
            <h1>{translations[language].buildingNames["Building B4"]}</h1>
          </div>

          <div className="location-content">
            <div className="location-image">
              <img src={Building_B4} alt="Building B4" />
            </div>

            <div className="location-info">
              <p>
                <span>{translations[language].densityLevelsText}</span> : {getDensityLevel(count)}
              </p>
              <p>
                <span>{translations[language].density}</span> :{" "}
                <span className={getCountColor(count)}>{count}</span>
              </p>
              <p>
                <span>{translations[language].maxToday}</span> :{" "}
                <span style={{ marginLeft: "8px" }}>{maxToday}</span>
              </p>
              <p>
                <span>{translations[language].status}</span> : - {/* You can add status data here */}
              </p>
            </div>
          </div>

          <div className="location-chart">
            <ChartComponent1
              feeds={feeds}
              density={translations[language].density}
              filter={translations[language].filter}
              hours={translations[language].hours}
              minute={translations[language].minute}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationB4;
