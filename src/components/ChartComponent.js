import React, { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const ChartComponent = ({ feeds, devicesCount}) => {
  const chartRef = useRef(null);
  const [allFeeds, setAllFeeds] = useState([]);

  // โหลดข้อมูลจาก localStorage เมื่อ Component เริ่มทำงาน
  useEffect(() => {
    const storedFeeds = localStorage.getItem("chartFeeds");
    if (storedFeeds) {
      setAllFeeds(JSON.parse(storedFeeds));
    }
  }, []);

  // อัปเดตข้อมูลเมื่อ feeds เปลี่ยน
  useEffect(() => {
    if (feeds.length > 0) {
      setAllFeeds((prevFeeds) => {
        const updatedFeeds = [...prevFeeds, ...feeds].slice(-10); // เก็บแค่ 10 ข้อมูลล่าสุด
        localStorage.setItem("chartFeeds", JSON.stringify(updatedFeeds)); // บันทึกข้อมูลลง localStorage
        return updatedFeeds;
      });
    }
  }, [feeds]);

  useEffect(() => {
    if (allFeeds.length > 0) {
      const labels = allFeeds.map(feed => new Date(feed.created_at).toLocaleTimeString());
      const values = allFeeds.map(feed => parseFloat(feed.field1));
  
      const ctx = chartRef.current.getContext("2d");
  
      // ทำลายกราฟเก่าถ้ามีอยู่
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
              label: devicesCount,
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
                // กำหนดให้ค่าบนแกน Y เป็นจำนวนเต็ม
                callback: function(value) {
                  return value % 1 === 0 ? value : ''; // แสดงเฉพาะจำนวนเต็ม
                },
                stepSize: 1, // กำหนดระยะห่างของแต่ละขั้น
              },
            },
          },
        },
      });
    }
  }, [allFeeds]);
  

  return <canvas ref={chartRef}></canvas>;
};

export default ChartComponent;
