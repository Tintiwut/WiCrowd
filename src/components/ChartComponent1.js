import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
} from "recharts";

const ChartComponent1 = ({ csvFolder, density, filter, hours, minute, feeds, language }) => {
  const [dataFromCSV, setDataFromCSV] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [interval, setInterval] = useState("1min");
  const [graphType, setGraphType] = useState("realtime");
  const [fontSize, setFontSize] = useState(12);
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");

  const translations = {
    th: {
      graphType: "ประเภทกราฟ",
      csv: "CSV",
      realtime: "เรียลไทม์",
      date: "วันที่",
      intervalLabel: "ในช่วงเวลา :",
      intervalOptions: {
        "1min": "1 นาที",
        "5min": "5 นาที",
        "30min": "30 นาที",
        "1hr": "1 ชั่วโมง",
      },
    },
    en: {
      graphType: "Graph Type",
      csv: "CSV",
      realtime: "Realtime",
      date: "Date",
      intervalLabel: "Interval:",
      intervalOptions: {
        "1min": "1 minute",
        "5min": "5 minutes",
        "30min": "30 minutes",
        "1hr": "1 hour",
      },
    },
  };

  const intervalOptions = {
    "1min": 60 * 1000,
    "5min": 5 * 60 * 1000,
    "30min": 30 * 60 * 1000,
    "1hr": 60 * 60 * 1000,
  };

  useEffect(() => {
    const handleResize = () => {
      setFontSize(window.innerWidth < 768 ? 10 : 12);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (graphType !== "csv" || !csvFolder) return;

    // Load fileList.json เพื่อดูว่าโฟลเดอร์มีไฟล์ CSV อะไรบ้าง
    fetch(`${csvFolder}/index.json`)
      .then((res) => res.json())
      .then((list) => {
        setFileList(list);
        setSelectedFile(list[0]);
      })
      .catch((err) => console.error("Failed to load fileList.json", err));
  }, [graphType, csvFolder]);

  useEffect(() => {
    if (!selectedFile || graphType !== "csv") return;

    fetch(`${csvFolder}/${selectedFile}`)
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        const processedData = parsed.data
          .map((row) => {
            if (!row.Date || !row.Time) return null;
            const [day, month, year] = row.Date.split("/");
            const [h, m, s] = row.Time.split(":");
            const timestamp = new Date(
              `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${h}:${m}:${s}`
            );
            return {
              time: timestamp,
              value: parseInt(row.Device),
            };
          })
          .filter((d) => d && !isNaN(d.value));

        setDataFromCSV(processedData);
      });
  }, [selectedFile, graphType]);

  useEffect(() => {
    if (dataFromCSV.length === 0 || graphType !== "csv") return;

    const grouped = {};
    const intervalMs = intervalOptions[interval];

    dataFromCSV.forEach(({ time, value }) => {
      const timestamp = new Date(time).getTime();
      const rounded = Math.floor(timestamp / intervalMs) * intervalMs;
      const roundedTime = new Date(rounded);

      if (!grouped[rounded]) {
        grouped[rounded] = { time: roundedTime, value };
      } else {
        grouped[rounded].value = Math.max(grouped[rounded].value, value);
      }
    });

    const summarized = Object.values(grouped).sort((a, b) => a.time - b.time);
    const finalData = summarized.map(({ time, value }) => ({
      time,
      value,
      displayTime: time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }));

    setFilteredData(finalData);
  }, [dataFromCSV, interval, graphType]);

  const processedRealtimeData = feeds?.map((entry) => {
    const date = new Date(entry.created_at);
    return {
      time: date,
      value: entry.field1 ? parseInt(entry.field1) : 0,
      displayTime: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  }) || [];

  const displayedTimes = new Set();
  const xTickFormatter = (timeStr) => {
    const [hour, min] = timeStr.split(":");
    if (parseInt(min) % 5 === 0 && !displayedTimes.has(timeStr)) {
      displayedTimes.add(timeStr);
      return `${hour}:${min}`;
    }
    return "";
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
          marginRight: "50px",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <label>{translations[language].graphType}:</label>
        <select value={graphType} onChange={(e) => setGraphType(e.target.value)}>
          <option value="realtime">{translations[language].realtime}</option>
          <option value="csv">{translations[language].csv}</option>
        </select>

        {graphType === "csv" && (
          <>
            <label>{translations[language].date}:</label>
            <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
              {fileList.map((file) => (
                <option key={file} value={file}>
                  {file.replace(".csv", "")}
                </option>
              ))}
            </select>

            <label>{translations[language].intervalLabel}</label>
            <select value={interval} onChange={(e) => setInterval(e.target.value)}>
              {Object.keys(translations[language].intervalOptions).map((key) => (
                <option key={key} value={key}>
                  {translations[language].intervalOptions[key]}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={graphType === "csv" ? filteredData : processedRealtimeData}>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis
            dataKey="displayTime"
            tick={{ fontSize }}
            tickFormatter={xTickFormatter}
            interval={0}
          />
          <YAxis allowDecimals={false} tick={{ fontSize }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="green" dot={false} />
          {graphType === "csv" && interval === "1min" && (
            <Brush dataKey="displayTime" height={30} stroke="#8884d8" travellerWidth={10} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent1;
