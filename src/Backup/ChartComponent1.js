import React, { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import Papa from "papaparse";

ChartJS.register(...registerables);

const ChartComponent1 = ({ csvUrl, density, filter, hours, minute }) => {
  const chartRef = useRef(null);
  const [dataFromCSV, setDataFromCSV] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [interval, setInterval] = useState("1min");

  const intervalOptions = {
    "1min": 60 * 1000,
    "5min": 5 * 60 * 1000,
    "30min": 30 * 60 * 1000,
    "1hr": 60 * 60 * 1000
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

        const processedData = parsed.data.map((row) => {
          const timestamp = new Date(`${row.Date} ${row.Time}`);
          return {
            time: timestamp,
            value: parseInt(row.Device),
          };
        });

        setDataFromCSV(processedData);
      });
  }, [csvUrl]);

  // ฟิลเตอร์ตามช่วงเวลา
  useEffect(() => {
    if (dataFromCSV.length === 0) return;

    const intervalMs = intervalOptions[interval];
    const result = [];
    let lastTime = null;

    dataFromCSV.forEach((point) => {
      if (!lastTime || point.time - lastTime >= intervalMs) {
        result.push(point);
        lastTime = point.time;
      }
    });

    setFilteredData(result);
  }, [dataFromCSV, interval]);

  // วาดกราฟ
  useEffect(() => {
    if (filteredData.length === 0) return;

    const labels = filteredData.map((d) => d.time.toLocaleTimeString());
    const values = filteredData.map((d) => d.value);

    const ctx = chartRef.current.getContext("2d");

    if (chartRef.current.chartInstance) {
      chartRef.current.chartInstance.destroy();
    }

    chartRef.current.chartInstance = new ChartJS(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: density,
            data: values,
            borderColor: "green",
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => (value % 1 === 0 ? value : ""),
              stepSize: 1,
            },
          },
        },
      },
    });
  }, [filteredData, density]);

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px", marginRight: "50px" }}>
        <label htmlFor="intervalSelect" style={{ marginRight: "8px" }}>{filter}:</label>
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
      </div>

      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ChartComponent1;
