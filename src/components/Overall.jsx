import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Building_A3 from "../images/Building_A3.jpg";
import Building_A6 from "../images/Building_A6.jpg";
import Building_B4 from "../images/Building_B4.jpg";
import "./Overall.css";

const Overall = ({ language }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [maxToday, setMaxToday] = useState(0);

  const translations = {
    en: {
      buildingA3: "Building A3",
      buildingA6: "Building A6",
      buildingB4: "Building B4",
      densityLevelsText: "Density Levels",
      density: "No. Devices",
      maxToday: "Maximum Today",
      status: "Status",
      statusValues: { open: "Open", closed: "Closed" },
      comingSoon: "Coming soon...",
      densityLevels: { low: "Low", medium: "Medium", high: "High", dangerous: "Dangerous" },
    },
    th: {
      buildingA3: "อาคาร A3",
      buildingA6: "อาคาร A6",
      buildingB4: "อาคาร B4",
      densityLevelsText: "ระดับความหนาแน่น",
      density: "จำนวนอุปกรณ์",
      maxToday: "จำนวนสูงสุดของวันนี้",
      status: "สถานะ",
      statusValues: { open: "เปิด", closed: "ปิด" },
      comingSoon: "เร็วๆ นี้..",
      densityLevels: { low: "ต่ำ", medium: "ปานกลาง", high: "สูง", dangerous: "อันตราย" },
    },
  };

  const baseUrls = {
    A3: "", // ยังไม่มี API
    A6: "", // ยังไม่มี API
    B4: "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27",
  };

  const getMaxTodayFromAPI = async (url) => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const startDate = `${yyyy}-${mm}-${dd}%2000:00:00`;
    const endDate = `${yyyy}-${mm}-${dd}%2023:59:59`;

    const fullUrl = `${url}&start=${startDate}&end=${endDate}`;

    const res = await fetch(fullUrl);
    const data = await res.json();
    const feeds = data.feeds || [];

    let todayMax = 0;
    feeds.forEach((entry) => {
      const val = parseInt(entry.field1 || 0, 10);
      if (!isNaN(val) && val > todayMax) {
        todayMax = val;
      }
    });

    return todayMax;
  };

  const fetchData = async () => {
    try {
      const [a3Max, a6Max, b4Max] = await Promise.all([
        baseUrls.A3 ? getMaxTodayFromAPI(baseUrls.A3) : Promise.resolve(0),
        baseUrls.A6 ? getMaxTodayFromAPI(baseUrls.A6) : Promise.resolve(0),
        baseUrls.B4 ? getMaxTodayFromAPI(baseUrls.B4) : Promise.resolve(0),
      ]);

      const urls = [
        baseUrls.A3 ? `${baseUrls.A3}&results=1` : "",
        baseUrls.A6 ? `${baseUrls.A6}&results=1` : "",
        baseUrls.B4 ? `${baseUrls.B4}&results=1` : "",
      ];

      const responses = await Promise.all(
        urls.map((url) => (url ? fetch(url) : Promise.resolve(null)))
      );

      const jsonData = await Promise.all(
        responses.map((res) => (res ? res.json() : { feeds: [] }))
      );

      const newData = jsonData.map((data, index) => {
        const feeds = data.feeds || [];
        const latestFeed = feeds[feeds.length - 1];
        const count = parseInt(latestFeed?.field1 || 0, 10);

        const latestTime = new Date(latestFeed?.created_at).getTime();
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        const status = now - latestTime <= tenMinutes ? "เปิด" : "ปิด";

        const maxToday = [a3Max, a6Max, b4Max][index];

        return {
          feeds,
          count,
          status,
          maxToday,
        };
      });

      const newMax = Math.max(...[a3Max, a6Max, b4Max]);
      setMaxToday(newMax);

      setData([
        { key: "buildingA3", ...newData[0] },
        { key: "buildingA6", ...newData[1] },
        { key: "buildingB4", ...newData[2] },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const locations = [
    { key: "buildingA3", image: Building_A3, Navi: "Building A3"},
    { key: "buildingA6", image: Building_A6, Navi: "Building A6" },
    { key: "buildingB4", image: Building_B4, Navi: "Building B4" },
  ];

  const densityThresholds = {
    buildingA3: { low: 153, medium: 306, high: 612 },
    buildingA6: { low: 38, medium: 77, high: 152 },
    buildingB4: { low: 78, medium: 156, high: 312 },
  };

  const getDensityLevel = (locationKey, count) => {
    const { low, medium, high } = densityThresholds[locationKey];

    if (count < low)
      return (
        <span className="Overall-density-low">
          {translations[language].densityLevels.low}
        </span>
      );
    if (count < medium)
      return (
        <span className="Overall-density-medium">
          {translations[language].densityLevels.medium}
        </span>
      );
    if (count < high)
      return (
        <span className="Overall-density-high">
          {translations[language].densityLevels.high}
        </span>
      );
    return (
      <span className="Overall-density-dangerous">
        {translations[language].densityLevels.dangerous}
      </span>
    );
  };

  const getCountColor = (locationKey, count) => {
    const { low, medium, high } = densityThresholds[locationKey];
    if (count < low) return "Overall-count-low";
    if (count < medium) return "Overall-count-medium";
    if (count < high) return "Overall-count-high";
    return "Overall-count-dangerous";
  };

  return (
    <div className="overall-container">
      {locations.map((location, index) => {
        const locationData = data[index];

        if (!locationData) return null;

        const isComingSoon =
          !locationData.feeds || locationData.feeds.length === 0;

        return (
          <div
            key={index}
            className="overall-card"
            onClick={() => {
              navigate("/location", { state: { location: location.Navi } });
            }}
            style={{ cursor: "pointer" }}
          >
            <img
              src={location.image}
              alt={translations[language][location.key]}
            />
            <div className="overall-info">
              <h2>{translations[language][location.key]}</h2>

              {isComingSoon ? (
                <p>{translations[language].comingSoon}</p>
              ) : (
                <>
                  <p>
                    <span>{translations[language].densityLevelsText}</span>:{" "}
                    {locationData.status === "เปิด" || locationData.status === "Open"
                      ? getDensityLevel(location.key, locationData.count)
                      : <span className="Location-disabled">-</span>}
                  </p>
                  <p>
                    <span>{translations[language].density}</span>:{" "}
                    {locationData.status === "เปิด" || locationData.status === "Open" ? (
                      <span className={getCountColor(location.key, locationData.count)}>{locationData.count}</span>
                    ) : (
                      <span className="Location-disabled">-</span>
                    )}
                  </p>
                  <p>
                    <span>{translations[language].maxToday}</span>:{" "}
                    {locationData.status === "เปิด" || locationData.status === "Open" ? (
                      <span>{locationData.maxToday}</span>
                    ) : (
                      <span className="Location-disabled">-</span>
                    )}
                  </p>
                  <p>
                    <span>{translations[language].status}</span>:{" "}
                    <span
                      className={
                        locationData.status === "เปิด" || locationData.status === "Open"
                          ? "Location-status-open"
                          : "Location-status-closed"
                      }
                    >
                      {locationData.status === "เปิด"
                        ? translations[language].statusValues.open
                        : translations[language].statusValues.closed}
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Overall;
