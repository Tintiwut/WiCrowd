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

const ChartComponent1 = ({ csvUrl, density, filter, hours, minute }) => {
  const [dataFromCSV, setDataFromCSV] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [interval, setInterval] = useState("1min");

  const intervalOptions = {
    "1min": 60 * 1000,
    "5min": 5 * 60 * 1000,
    "30min": 30 * 60 * 1000,
    "1hr": 60 * 60 * 1000,
  };

  useEffect(() => {
    if (!csvUrl) return;

    fetch(csvUrl)
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        const processedData = parsed.data
          .map((row) => {
            const [day, month, year] = row.Date.split("/");
            const [h, m, s] = row.Time.split(":");
            const timestamp = new Date(
              `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`
            );
            return {
              time: timestamp,
              value: parseInt(row.Device),
            };
          })
          .filter((d) => !isNaN(d.value));

        setDataFromCSV(processedData);
      });
  }, [csvUrl]);

  const [fontSize, setFontSize] = useState(12);

useEffect(() => {
  const handleResize = () => {
    setFontSize(window.innerWidth < 768 ? 10 : 12);
  };

  handleResize(); // initial
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

  useEffect(() => {
    if (dataFromCSV.length === 0) return;

    const intervalMs = intervalOptions[interval];
    const sortedData = [...dataFromCSV].sort((a, b) => a.time - b.time);
    const result = [];

    const startTime = new Date(sortedData[0].time);
    startTime.setSeconds(0, 0); // ปัดให้เริ่มต้นจาก xx:xx:00

    const endTime = new Date(sortedData[sortedData.length - 1].time);

    for (let t = new Date(startTime); t <= endTime; t = new Date(t.getTime() + intervalMs)) {
      // หาค่าที่ใกล้ที่สุดในช่วงเวลาใกล้ๆ
      const closest = sortedData.reduce((prev, curr) => {
        return Math.abs(curr.time - t) < Math.abs(prev.time - t) ? curr : prev;
      });

      result.push({
        time: new Date(t),
        value: closest.value,
        displayTime: t.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      });
    }

    setFilteredData(result);
  }, [dataFromCSV, interval]);

  // แสดง label บนแกน X เฉพาะเวลาที่เป็นนาที 00
  const xTickFormatter = (timeStr) => {
    const [hour, min] = timeStr.split(":");
    return min === "00" ? timeStr : "";
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
        }}
      >
        <label htmlFor="intervalSelect">{filter}:</label>
        <select
          id="intervalSelect"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <option value="1min">1 {minute}</option>
          <option value="5min">5 {minute}</option>
          <option value="30min">30 {minute}</option>
          <option value="1hr">1 {hours}</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
  <LineChart data={filteredData}>
    <CartesianGrid strokeDasharray="1 1" />
    <XAxis
      dataKey="displayTime"
      tick={{ fontSize }}
      tickFormatter={xTickFormatter}
      interval={0}
    />
    <YAxis 
      allowDecimals={false} 
      tick={{ fontSize }}
    />
    <Tooltip />
    <Line type="monotone" dataKey="value" stroke="green" dot={false} contentStyle={{ fontSize: `${fontSize}px` }} />

    {/* 🔍 เพิ่ม Zoom Control */}
    {interval === "1min" && (
      <Brush
        dataKey="displayTime"
        height={30}
        stroke="#8884d8"
        travellerWidth={10}
      />
    )}
  </LineChart>
</ResponsiveContainer>

    </div>
  );
};

export default ChartComponent1;