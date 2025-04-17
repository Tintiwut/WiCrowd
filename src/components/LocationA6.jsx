import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Building_A6 from "../images/Building_A6.jpg";
import ChartComponent1 from "./ChartComponent1";
import "./Location.css";

const LocationA6 = ({ language }) => {
  const [latestCount, setLatestCount] = useState(null);
  const [maxToday, setMaxToday] = useState(null);

  const translations = {
    en: {
      buildingNames: { "Building A6": "Building A6" },
      densityLevelsText: "Density Levels",
      density: "Density",
      maxToday: "Maximum Today",
      status: "Status",
      filter: "Filter",
      minute: "Minute",
      hours: "Hours",
      densityLevels: { low: "Low", medium: "Medium", high: "High" },
    },
    th: {
      buildingNames: { "Building A6": "อาคาร A6" },
      densityLevelsText: "ระดับความหนาแน่น",
      density: "ความหนาแน่น",
      maxToday: "จำนวนสูงสุดของวันนี้",
      status: "สถานะ",
      filter: "ฟิลเตอร์",
      minute: "นาที",
      hours: "ชั่วโมง",
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

  useEffect(() => {
    Papa.parse("/data/14_04_2025_BuildingX.csv", {
      download: true,
      header: true,
      complete: (result) => {
        const raw = result.data;
  
        const grouped = {};
        raw.forEach((row) => {
          if (!row.Date || !row.Time || !row.Device) return;
  
          const deviceValue = parseInt(row.Device, 10);
          if (isNaN(deviceValue)) return;
  
          // ✅ ตัดวินาทีออกจาก Time
          const [h, m] = row.Time.split(":");
          const key = `${row.Date} ${h}:${m}`; // ใช้แค่ ชั่วโมง:นาที
  
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(deviceValue);
        });
  
        // ✅ หาค่ามากสุดในแต่ละช่วงเวลา
        const summarized = Object.entries(grouped)
          .map(([key, values]) => ({
            timestamp: key,
            count: Math.max(...values),
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // เรียงตามเวลา
  
        // ✅ ค่าล่าสุด
        const latest = summarized[summarized.length - 1];
        setLatestCount(latest?.count || 0);
  
        // ✅ ค่าสูงสุด
        const max = summarized.reduce((max, item) => {
          return item.count > max ? item.count : max;
        }, 0);
        setMaxToday(max);
      },
    });
  }, []);

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
            <p>
                <span>{translations[language].densityLevelsText}</span> :{" "}
                {/* {latestCount !== null ? getDensityLevel(latestCount) : "-"} */}
            </p>
            <p>
                <span>{translations[language].density}</span> :{" "}
                {/* <span
                className={
                    latestCount !== null
                    ? getCountColor(latestCount)
                    : "-"
                }
                >
                {latestCount !== null ? latestCount : "-"}
                </span> */}
            </p>
            <p>
                <span>{translations[language].maxToday}</span> :{" "}
                <span style={{ marginLeft: "8px" }}>
                {maxToday !== null ? maxToday : "-"}
                </span>
            </p>
            <p>
                <span>{translations[language].status}</span> : -
            </p>
            </div>

        </div>

        <div className="location-chart">
          <ChartComponent1
            csvUrl="/data/14_04_2025_BuildingX.csv"
            density={translations[language].density}
            filter={translations[language].filter}
            hours={translations[language].hours}
            minute={translations[language].minute}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationA6;