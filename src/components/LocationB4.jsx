import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Building_B4 from "../images/Building_B4.jpg";
import ChartComponent1 from "./ChartComponent1";
import "./Location.css";

const LocationB4 = ({ language }) => {
  const [latestCount, setLatestCount] = useState(null);
  const [maxToday, setMaxToday] = useState(0);
  const [status, setStatus] = useState("ปิด");
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxTime, setMaxTime] = useState("");

  const translations = {
    en: {
      buildingNames: { "Building B4": "Building B4" },
      densityLevelsText: "Density Levels",
      density: "No. Devices",
      maxToday: "Maximum Today",
      status: "Status",
      comingSoon: "Coming soon...",
      densityLevels: { low: "Low", medium: "Medium", high: "High" },
      statusValues: { open: "Open", closed: "Closed" },
      filter: "Filter",
      hours: "Hours",
      minute: "Minutes",
    },
    th: {
      buildingNames: { "Building B4": "อาคาร B4" },
      densityLevelsText: "ระดับความหนาแน่น",
      density: "จำนวนอุปกรณ์",
      maxToday: "จำนวนสูงสุดของวันนี้",
      status: "สถานะ",
      comingSoon: "เร็วๆ นี้..",
      densityLevels: { low: "น้อย", medium: "ปานกลาง", high: "มาก" },
      statusValues: { open: "เปิด", closed: "ปิด" },
      filter: "กรอง",
      hours: "ชั่วโมง",
      minute: "นาที",
    },
  };

  const getDensityLevel = (count) => {
    if (count < 40)
      return <span className="Location-density-low">{translations[language].densityLevels.low}</span>;
    if (count < 118)
      return <span className="Location-density-medium">{translations[language].densityLevels.medium}</span>;
    return <span className="Location-density-high">{translations[language].densityLevels.high}</span>;
  };

  const getCountColor = (count) => {
    if (count < 40) return "Location-count-low";
    if (count < 118) return "Location-count-medium";
    return "Location-count-high";
  };

  const fetchDataFromAPI = async () => {
    try {
      // 🔹 Load recent data (last 100) for chart
      const chartUrl = "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=100";
      const chartResponse = await fetch(chartUrl);
      const chartData = await chartResponse.json();
      const chartFeeds = chartData.feeds || [];
      setFeeds(chartFeeds); // ✅ ใช้ชุดนี้กับกราฟ
  
      // 🔹 Load full day data for maxToday
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const startDate = `${yyyy}-${mm}-${dd}%2000:00:00`;
      const endDate = `${yyyy}-${mm}-${dd}%2023:59:59`;
  
      const fullUrl = `https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&start=${startDate}&end=${endDate}`;
      const fullResponse = await fetch(fullUrl);
      const fullData = await fullResponse.json();
      const fullFeeds = fullData.feeds || [];
  
      // 🔹 Calculate maxToday
      let todayMax = 0;
      let maxTimestamp = "";

      fullFeeds.forEach((entry) => {
        const val = parseInt(entry.field1 || 0, 10);
        if (!isNaN(val) && val > todayMax) {
          todayMax = val;
          maxTimestamp = entry.created_at;
        }
      });

      setMaxToday(todayMax);
      setMaxTime(maxTimestamp);
  
      // 🔹 Get latest count and status from chart data
      if (chartFeeds.length > 0) {
        const latestFeed = chartFeeds[chartFeeds.length - 1];
        const latest = parseInt(latestFeed?.field1 || 0, 10);
        setLatestCount(latest);
  
        const latestTime = new Date(latestFeed.created_at).getTime();
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        const stat = now - latestTime <= tenMinutes ? "เปิด" : "ปิด";
        setStatus(stat);
      } else {
        setLatestCount(null);
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
    Papa.parse("/data/07_04_2025.csv", {
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
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const isComingSoon = feeds.length === 0;

  return (
    <div className="location-container">
      <div className="location-card">
        <div className="location-head">
          <h1>{translations[language].buildingNames["Building B4"]}</h1>
        </div>

        <div className="location-content">
          <div className="location-image">
            <img src={Building_B4} alt="Building B4" />
          </div>

          <div className="location-info">
            {isComingSoon ? (
              <p>{translations[language].comingSoon}</p>
            ) : (
              <>
                <p>
                  <span>{translations[language].densityLevelsText}</span>:{" "}
                  {status === "เปิด" || status === "Open" ? getDensityLevel(latestCount) : <span className="Location-disabled">-</span>}
                  <span className="tooltip-icon" tabIndex="0">?
                    <span className="tooltip-text">
                      {language === "th"
                        ? "ระดับน้อย: ~0-39 คน\nระดับปานกลาง: ~40-117 คน\nระดับมาก: มากกว่า 117 คน"
                        : "Low: ~0-39 people\nMedium: ~40-117 people\nHigh: more than 117 people"}
                    </span>
                  </span>
                </p>
                <p>
                  <span>{translations[language].density}</span>: {status === "เปิด" || status === "Open" ? (
                    <span className={getCountColor(latestCount)}>{latestCount}</span>
                  ) : (
                    <span className="Location-disabled">-</span>
                  )}
                </p>
                <p>
                  <span>{translations[language].maxToday}</span>:{" "}
                  {status === "เปิด" || status === "Open" ? (
                    <>
                      <span>{maxToday}</span>
                      {maxTime && (
                        <span className="tooltip-icon" tabIndex="0">
                          <i className="fas fa-eye"></i>
                          <span className="tooltip-text">
                            {language === "th"
                              ? `เกิดเมื่อเวลา ${new Date(maxTime).toLocaleTimeString("th-TH")}`
                              : `Occurred at ${new Date(maxTime).toLocaleTimeString("en-US")}`}
                          </span>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="Location-disabled">-</span>
                  )}
                </p>
                <p>
                  <span>{translations[language].status}</span>:{" "}
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
            csvFolder="/data/Building_B4_Log"
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

export default LocationB4;