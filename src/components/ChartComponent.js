import React, { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, registerables } from "chart.js";

// ลงทะเบียนส่วนประกอบที่จำเป็น
ChartJS.register(...registerables);

const ChartComponent = ({ feeds }) => {
  const chartRef = useRef(null); // ใช้ useRef สำหรับเก็บ chart instance
  const [allFeeds, setAllFeeds] = useState([]); // เก็บข้อมูลทั้งหมดจาก ThingSpeak

  useEffect(() => {
    // หากมีข้อมูลใหม่เข้ามา ให้เก็บข้อมูลเก่าไว้
    if (feeds.length > 0) {
      // ต่อข้อมูลเก่าเข้ากับข้อมูลใหม่
      setAllFeeds((prevFeeds) => [...prevFeeds, ...feeds]);
    }
  }, [feeds]); // ทำการอัปเดตเมื่อ feeds เปลี่ยน

  useEffect(() => {
    if (allFeeds.length > 0) {
      const labels = allFeeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
      const values = allFeeds.map(feed => parseFloat(feed.field1));

      const ctx = chartRef.current.getContext("2d");

      // หากกราฟเก่ามีอยู่แล้ว ให้ทำลายมันก่อน
      if (chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }

      // สร้างกราฟใหม่
      chartRef.current.chartInstance = new ChartJS(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "จำนวนอุปกรณ์",
              data: values,
              borderColor: "blue",
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
            },
          },
        },
      });
    }
  }, [allFeeds]); // ใช้ allFeeds ที่เก็บข้อมูลทั้งหมด

  return <canvas ref={chartRef} id="myChart"></canvas>; // ใช้ ref แทนการใช้ id
};

export default ChartComponent;
