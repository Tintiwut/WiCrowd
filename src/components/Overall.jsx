import React, { useEffect, useState } from "react";
import Building_A3 from "../images/Building_A3.jpg";
import Building_A6 from "../images/Building_A6.jpg";
import Building_B4 from "../images/Building_B4.jpg";
import "./Overall.css";

const Overall = ({ language }) => {
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [data, setData] = useState([]);
  const [maxToday, setMaxToday] = useState(() => {
    const savedDate = localStorage.getItem("maxTodayDate");
    const savedMax = parseInt(localStorage.getItem("maxToday") || "0", 10);
    const today = getTodayDateString();
    if (savedDate !== today) {
      localStorage.setItem("maxTodayDate", today);
      localStorage.setItem("maxToday", "0");
      return 0;
    }
    return savedMax;
  });

  const translations = {
    en: {
      buildingA3: "Building A3",
      buildingA6: "Building A6",
      buildingB4: "Building B4",
      densityLevelsText: "Density Levels",
      density: "Density",
      maxToday: "Maximum Today",
      status: "Status",
      statusValues: { open: "Open", closed: "Closed" },
      comingSoon: "Coming soon...",
      densityLevels: { low: "Low", medium: "Medium", high: "High" },
    },
    th: {
      buildingA3: "อาคาร A3",
      buildingA6: "อาคาร A6",
      buildingB4: "อาคาร B4",
      densityLevelsText: "ระดับความหนาแน่น",
      density: "ความหนาแน่น",
      maxToday: "จำนวนสูงสุดของวันนี้",
      status: "สถานะ",
      statusValues: { open: "เปิด", closed: "ปิด" },
      comingSoon: "เร็วๆ นี้..",
      densityLevels: { low: "น้อย", medium: "ปานกลาง", high: "มาก" },
    },
  };

  const calculateMaxToday = (feeds) => {
    const todayDateStr = getTodayDateString();
    const todayFeeds = feeds.filter((entry) =>
      entry.created_at.startsWith(todayDateStr)
    );
    const max = Math.max(...todayFeeds.map((entry) => parseInt(entry.field1 || 0, 10)));
    return max;
  };

  const fetchData = async () => {
    try {
      const urls = [
        "", // A3 (API ยังไม่ใส่)
        "", // A6 (API ยังไม่ใส่)
        "https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=100", // B4
      ];

      const responses = await Promise.all(
        urls.map((url) => (url ? fetch(url) : Promise.resolve(null)))
      );

      const jsonData = await Promise.all(
        responses.map((res) => (res ? res.json() : { feeds: [] }))
      );

      const newData = jsonData.map((data) => {
        const feeds = data.feeds || [];
        const latestFeed = feeds[feeds.length - 1];
        const count = parseInt(latestFeed?.field1 || 0, 10);

        const latestTime = new Date(latestFeed?.created_at).getTime();
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        const status = now - latestTime <= tenMinutes ? "เปิด" : "ปิด";

        const max = calculateMaxToday(feeds);

        return {
          feeds,
          count,
          status,
          maxToday: max,
        };
      });

      setData([
        { key: "buildingA3", ...newData[0] },
        { key: "buildingA6", ...newData[1] },
        { key: "buildingB4", ...newData[2] },
      ]);

      const newMax = Math.max(...newData.map((item) => item.maxToday || 0));
      if (newMax > maxToday) {
        setMaxToday(newMax);
        localStorage.setItem("maxToday", newMax);
        localStorage.setItem("maxTodayDate", getTodayDateString());
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

  const locations = [
    { key: "buildingA3", image: Building_A3 },
    { key: "buildingA6", image: Building_A6 },
    { key: "buildingB4", image: Building_B4 },
  ];

  const getDensityLevel = (count) => {
    if (count < 20)
      return (
        <span className="Overall-density-low">
          {translations[language].densityLevels.low}
        </span>
      );
    if (count < 35)
      return (
        <span className="Overall-density-medium">
          {translations[language].densityLevels.medium}
        </span>
      );
    return (
      <span className="Overall-density-high">
        {translations[language].densityLevels.high}
      </span>
    );
  };

  const getCountColor = (count) => {
    if (count < 20) return "Overall-count-low";
    if (count < 35) return "Overall-count-medium";
    return "Overall-count-high";
  };

  return (
    <div className="overall-container">
      {locations.map((location, index) => {
        const locationData = data[index];

        if (!locationData) return null;

        const isComingSoon =
          !locationData.feeds || locationData.feeds.length === 0;

        return (
          <div key={index} className="overall-card">
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
                    {locationData.status === "เปิด"
                      ? getDensityLevel(locationData.count)
                      : "-"}
                  </p>
                  <p>
                    <span>{translations[language].density}</span>:{" "}
                    {locationData.status === "เปิด" ? (
                      <span className={getCountColor(locationData.count)}>
                        {locationData.count}
                      </span>
                    ) : (
                      "-"
                    )}
                  </p>
                  <p>
                    <span>{translations[language].maxToday}</span>:{" "}
                    {locationData.maxToday}
                  </p>
                  <p>
                    <span>{translations[language].status}</span>:{" "}
                    {locationData.status === "เปิด"
                      ? translations[language].statusValues.open
                      : translations[language].statusValues.closed}
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
