import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Building_A6 from "../images/Building_A6.jpg";
import ChartComponent1 from "./ChartComponent1";
import "./Location.css";

const LocationA6 = ({ language }) => {
  const [latestCount, setLatestCount] = useState(null);
  const [maxToday, setMaxToday] = useState(0);
  const [status, setStatus] = useState("ปิด");
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      buildingNames: { "Building A6": "Building A6" },
      densityLevelsText: "Density Levels",
      density: "Density",
      maxToday: "Maximum Today",
      status: "Status",
      comingSoon: "Coming soon...",
      densityLevels: { low: "Low", medium: "Medium", high: "High" },
      statusValues: { open: "Open", closed: "Closed" },
    },
    th: {
      buildingNames: { "Building A6": "อาคาร A6" },
      densityLevelsText: "ระดับความหนาแน่น",
      density: "ความหนาแน่น",
      maxToday: "จำนวนสูงสุดของวันนี้",
      status: "สถานะ",
      comingSoon: "เร็วๆ นี้..",
      densityLevels: { low: "น้อย", medium: "ปานกลาง", high: "มาก" },
      statusValues: { open: "เปิด", closed: "ปิด" },
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

        const today = new Date().toISOString().split("T")[0];
        const todayFeeds = newFeeds.filter((entry) => entry.created_at?.startsWith(today));
        const max = Math.max(...todayFeeds.map((entry) => parseInt(entry.field1 || 0, 10)));
        setMaxToday(max);

        const latestTime = new Date(latestFeed.created_at).getTime();
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        const stat = now - latestTime <= tenMinutes ? "เปิด" : "ปิด";
        setStatus(stat);
      } else {
        setLatestCount(null);
        setMaxToday(0);
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
    Papa.parse("/data/12_04_2025.csv", {
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
        const latestCount = latest?.count || 0;
        setLatestCount((prev) => prev === null ? latestCount : prev);

        const max = summarized.reduce((max, item) => Math.max(max, item.count), 0);
        setMaxToday((prev) => prev === 0 ? max : prev);

        setLoading(false);
      },
    });
  };

  useEffect(() => {
    fetchDataFromAPI();
    fetchDataFromCSV();

    const interval = setInterval(() => {
      fetchDataFromAPI();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const isComingSoon = feeds.length === 0;

  return (
    <div className="location-container">
      <div className="location-card">
        <div className="location-head">
          <h1>{translations[language].buildingNames["Building A6"]}</h1>
        </div>

        <div className="location-content">
          <div className="location-image">
            <img src={Building_A6} alt="Building A6" />
          </div>

          <div className="location-info">
            {isComingSoon ? (
              <p>{translations[language].comingSoon}</p>
            ) : (
              <>
                <p>
                  <span>{translations[language].densityLevelsText}</span>: {status === "เปิด" || status === "Open" ? getDensityLevel(latestCount) : <span className="Location-disabled">-</span>}
                </p>
                <p>
                  <span>{translations[language].density}</span>: {status === "เปิด" || status === "Open" ? (
                    <span className={getCountColor(latestCount)}>{latestCount}</span>
                  ) : (
                    <span className="Location-disabled">-</span>
                  )}
                </p>
                <p>
                  <span>{translations[language].maxToday}</span>: <span>{maxToday !== null ? maxToday : "-"}</span>
                </p>
                <p>
                  <span>{translations[language].status}</span>: {" "}
                  <span className={status === "เปิด" ? "Location-status-open" : "Location-status-closed"}>
                    {status === "เปิด" ? translations[language].statusValues.open : translations[language].statusValues.closed}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>

        <div className="location-chart">
          <ChartComponent1
            graphType="realtime"
            feeds={feeds}
            csvFolder="/data/Building_A6_Log"
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

export default LocationA6;