import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Building_A3 from "../images/Building_A3.jpg";
import ChartComponent1 from "./ChartComponent1";
import "./Location.css";

const LocationA3 = ({ language }) => {
  const [latestCount, setLatestCount] = useState(null);
  const [maxToday, setMaxToday] = useState(null);
  const [status, setStatus] = useState("ปิด");
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      buildingNames: { "Building A3": "Building A3" },
      densityLevelsText: "Density Levels",
      density: "Density",
      maxToday: "Maximum Today",
      status: "Status",
      densityLevels: { low: "Low", medium: "Medium", high: "High" },
    },
    th: {
      buildingNames: { "Building A3": "อาคาร A3" },
      densityLevelsText: "ระดับความหนาแน่น",
      density: "ความหนาแน่น",
      maxToday: "จำนวนสูงสุดของวันนี้",
      status: "สถานะ",
      densityLevels: { low: "น้อย", medium: "ปานกลาง", high: "มาก" },
    },
  };

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

  const fetchDataFromAPI = async () => {
    try {
      const apiUrl = "";
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      const newFeeds = data.feeds || [];
      setFeeds(newFeeds);
  
      if (newFeeds.length > 0) {
        const latestFeed = newFeeds[newFeeds.length - 1];
        const latest = parseInt(latestFeed?.field1 || 0, 10);
        setLatestCount(latest);
  
        const today = new Date();
        const todayDateStr = today.toISOString().slice(0, 10);
        const todayFeeds = newFeeds.filter((entry) =>
          entry.created_at && entry.created_at.startsWith(todayDateStr)
        );
        const max = Math.max(...todayFeeds.map((entry) => parseInt(entry.field1 || 0, 10)));
        setMaxToday(max);
  
        const latestTime = new Date(latestFeed.created_at).getTime();
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        if (now - latestTime <= tenMinutes) {
          setStatus("เปิด");
        } else {
          setStatus("ปิด");
        }
      } else {
        setLatestCount(null);
        setMaxToday(null);
        setStatus("ปิด");
      }
  
      setLoading(false);
    } catch (err) {
      console.error(err);
      setStatus("ปิด");
      setLoading(false);
    }
  };

  const fetchDataFromCSV = () => {
    Papa.parse("/data/15_04_2025_BuildingX.csv", {
      download: true,
      header: true,
      complete: (result) => {
        const raw = result.data;
        const grouped = {};
        raw.forEach((row) => {
          if (!row.Date || !row.Time || !row.Device) return;
          const deviceValue = parseInt(row.Device, 10);
          if (isNaN(deviceValue)) return;

          const [h, m] = row.Time.split(":");
          const key = `${row.Date} ${h}:${m}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(deviceValue);
        });

        const summarized = Object.entries(grouped)
          .map(([key, values]) => ({
            timestamp: key,
            count: Math.max(...values),
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const latest = summarized[summarized.length - 1];
        setLatestCount(latest?.count || 0);

        const max = summarized.reduce((max, item) => {
          return item.count > max ? item.count : max;
        }, 0);
        setMaxToday(max);
        setStatus("ปิด");
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    fetchDataFromAPI();
    fetchDataFromCSV();

    const interval = setInterval(() => {
      fetchDataFromAPI();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const isComingSoon = feeds.length === 0;

  return (
    <div className="location-container">
      <div className="location-card">
        <div className="location-head">
          <h1>{translations[language].buildingNames["Building A3"]}</h1>
        </div>

        <div className="location-content">
          <div className="location-image">
            <img src={Building_A3} alt="Building A3" />
          </div>

          <div className="location-info">
            {isComingSoon ? (
              <p>Coming soon...</p>
            ) : (
              <>
                <p>
                  <span>{translations[language].densityLevelsText}</span>:{" "}
                  {status === "เปิด" ? getDensityLevel(latestCount) : "-"}
                </p>
                <p>
                  <span>{translations[language].density}</span>:{" "}
                  {status === "เปิด" ? <span className={getCountColor(latestCount)}>{latestCount}</span> : "-"}
                </p>
                <p>
                  <span>{translations[language].maxToday}</span>:{" "}
                  <span>{maxToday !== null ? maxToday : "-"}</span>
                </p>
                <p>
                  <span>{translations[language].status}</span>: {status}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="location-chart">
          <ChartComponent1
            graphType="realtime"
            feeds={feeds}
            csvFolder="/data/Building_A3_Log"
            density={translations[language].density}
            filter={translations[language].filter}
            hours={translations[language].hours}
            minute={translations[language].minute}
            language={language}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationA3;
