import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Building_B4 from "../images/Building_B4.jpg";
import ChartComponent1 from "./ChartComponent1";
import "./Location.css";

const LocationB4 = ({ language }) => {
  const [latestCount, setLatestCount] = useState(null);
  const [maxToday, setMaxToday] = useState(null);
  const [status, setStatus] = useState("ปิด");
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      buildingNames: { "Building B4": "Building B4" },
      densityLevelsText: "Density Levels",
      density: "Density",
      maxToday: "Maximum Today",
      status: "Status",
      comingSoon: "Coming soon...",
      statusValues: { open: "Open", closed: "Closed" },
      densityLevels: { low: "Low", medium: "Medium", high: "High" },
      filter: "Filter",
      minute: "Minute",
      hours: "Hours",
    },
    th: {
      buildingNames: { "Building B4": "อาคาร B4" },
      densityLevelsText: "ระดับความหนาแน่น",
      density: "ความหนาแน่น",
      maxToday: "จำนวนสูงสุดของวันนี้",
      status: "สถานะ",
      comingSoon: "เร็วๆ นี้..",
      statusValues: { open: "เปิด", closed: "ปิด" },
      densityLevels: { low: "น้อย", medium: "ปานกลาง", high: "มาก" },
      filter: "ฟิลเตอร์",
      minute: "นาที",
      hours: "ชั่วโมง",
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
      const apiUrl = "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=100";
      const response = await fetch(apiUrl);
      const data = await response.json();

      const newFeeds = data.feeds || [];
      setFeeds(newFeeds);

      if (newFeeds.length > 0) {
        const latestFeed = newFeeds[newFeeds.length - 1];
        const latest = parseInt(latestFeed?.field1 || 0, 10);
        setLatestCount(latest);

        const today = new Date().toISOString().slice(0, 10);
        const todayFeeds = newFeeds.filter((entry) =>
          entry.created_at && entry.created_at.startsWith(today)
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
    Papa.parse("", {
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

  // เพิ่มฟังก์ชัน Coming Soon
  const isComingSoon = feeds.length === 0 || latestCount === null;

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
              {isComingSoon ? (
                <p>{translations[language].comingSoon}</p>
              ) : (
                <>
                  <p>
                    <span>{translations[language].densityLevelsText}</span>:{" "}
                    {status === "เปิด" || status === "Open"
                      ? getDensityLevel(latestCount)
                      : <span className="Location-disabled">-</span>}
                  </p>
                  <p>
                    <span>{translations[language].density}</span>:{" "}
                    {status === "เปิด" || status === "Open" ? (
                      <span className={getCountColor(latestCount)}>{latestCount}</span>
                    ) : (
                      <span className="Location-disabled">-</span>
                    )}
                  </p>
                  <p>
                    <span>{translations[language].maxToday}</span>:{" "}
                    <span style={{ marginLeft: "8px" }}>
                      {maxToday !== null ? maxToday : "-"}
                    </span>
                  </p>
                  <p>
                    <span>{translations[language].status}</span>:{" "}
                    <span
                      className={
                        status === "เปิด" || status === "Open"
                          ? "Location-status-open"
                          : "Location-status-closed"
                      }
                    >
                      {status === "เปิด"
                        ? translations[language].statusValues.open
                        : translations[language].statusValues.closed}
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
      )}
    </div>
  );
};

export default LocationB4;
