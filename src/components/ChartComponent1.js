import React, { useEffect, useState } from "react"; // นำเข้า React พร้อมกับ hooks ที่ใช้ (useEffect และ useState)
import Papa from "papaparse"; // นำเข้าไลบรารี PapaParse สำหรับการแปลงข้อมูลจาก CSV
import {
  LineChart, // นำเข้า component ที่ใช้ในการแสดงกราฟเส้น
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Label,
} from "recharts"; // นำเข้าไลบรารี Recharts สำหรับการแสดงกราฟ

// กำหนดฟังก์ชัน ChartComponent1 ที่รับ props หลายตัว
const ChartComponent1 = ({ csvFolder, density, filter, hours, minute, feeds, language }) => {
  // ประกาศตัวแปรสถานะ (state) ด้วย useState hook ของ React
  const [dataFromCSV, setDataFromCSV] = useState([]); // ใช้เก็บข้อมูลที่โหลดมาจาก CSV
  const [filteredData, setFilteredData] = useState([]); // ใช้เก็บข้อมูลที่ผ่านการกรอง/ประมวลผลแล้ว
  const [interval, setInterval] = useState("5min"); // กำหนดระยะเวลาตัวเลือกที่ใช้ในกราฟ (เริ่มต้นเป็น 5 นาที)
  const [graphType, setGraphType] = useState("realtime"); // กำหนดประเภทกราฟ (เริ่มต้นเป็น realtime)
  const [fontSize, setFontSize] = useState(12); // กำหนดขนาดฟอนต์เริ่มต้น
  const [fileList, setFileList] = useState([]); // ใช้เก็บรายการไฟล์ CSV ในโฟลเดอร์
  const [selectedFile, setSelectedFile] = useState(""); // ใช้เก็บไฟล์ที่เลือกจากรายการ
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // ตรวจสอบว่าเป็นหน้าจอมือถือหรือไม่

  // ข้อความแปล (translations) สำหรับภาษาไทยและอังกฤษ
  const translations = {
    th: {
      graphType: "ประเภทกราฟ",
      csv: "CSV",
      realtime: "เรียลไทม์",
      date: "วันที่",
      intervalLabel: "ในช่วงเวลา :",
      intervalOptions: {
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
        "5min": "5 minutes",
        "30min": "30 minutes",
        "1hr": "1 hour",
      },
    },
  };

  // กำหนดค่าเวลาในรูปมิลลิวินาทีสำหรับแต่ละช่วงเวลา (5 นาที, 30 นาที, 1 ชั่วโมง)
  const intervalOptions = {
    "5min": 5 * 60 * 1000,
    "30min": 30 * 60 * 1000,
    "1hr": 60 * 60 * 1000,
  };

  // ใช้ useEffect hook เพื่อตรวจสอบขนาดหน้าจอและปรับขนาดฟอนต์เมื่อขนาดหน้าจอเปลี่ยน
  useEffect(() => {
    const handleResize = () => {
      setFontSize(window.innerWidth < 768 ? 10 : 12); // ถ้าหน้าจอเป็นมือถือให้ใช้ฟอนต์ขนาด 10
    };
    handleResize(); // เรียกใช้เมื่อเริ่มต้น
    window.addEventListener("resize", handleResize); // ฟังการเปลี่ยนแปลงขนาดหน้าจอ
    return () => window.removeEventListener("resize", handleResize); // ลบ event listener เมื่อคอมโพเนนต์ถูกลบ
  }, []); // useEffect นี้ทำงานเพียงครั้งเดียวในตอนเริ่มต้น

  // ใช้ useEffect เพื่อโหลดรายชื่อไฟล์ CSV เมื่อเปลี่ยนประเภทกราฟและโฟลเดอร์ CSV
  useEffect(() => {
    if (graphType !== "csv" || !csvFolder) return; // ถ้าประเภทกราฟไม่ใช่ CSV หรือไม่มีโฟลเดอร์ให้หยุดทำงาน

    // โหลดไฟล์ index.json เพื่อดูว่ามีไฟล์ CSV อะไรบ้าง
    fetch(`${csvFolder}/index.json`)
      .then((res) => res.json()) // แปลงข้อมูลจาก JSON
      .then((list) => {
        setFileList(list); // เก็บรายการไฟล์ CSV ใน state
        setSelectedFile(list[0]); // เลือกไฟล์แรกในรายการเป็นไฟล์ที่เลือก
      })
      .catch((err) => console.error("Failed to load fileList.json", err)); // ถ้ามีข้อผิดพลาดให้แสดงข้อความในคอนโซล
  }, [graphType, csvFolder]); // useEffect นี้จะทำงานเมื่อ graphType หรือ csvFolder เปลี่ยนแปลง

  // ใช้ useEffect เพื่อโหลดและแปลงข้อมูลจากไฟล์ CSV ที่เลือก
  useEffect(() => {
    if (!selectedFile || graphType !== "csv") return; // ถ้าไม่มีไฟล์ที่เลือกหรือประเภทกราฟไม่ใช่ CSV ให้หยุดทำงาน

    fetch(`${csvFolder}/${selectedFile}`) // โหลดไฟล์ CSV
      .then((response) => response.text()) // แปลงข้อมูลเป็นข้อความ
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { // ใช้ PapaParse แปลงข้อมูล CSV
          header: true,
          skipEmptyLines: true,
        });

        // แปลงข้อมูล CSV ให้เป็นรูปแบบที่ต้องการ
        const processedData = parsed.data
          .map((row) => {
            if (!row.Date || !row.Time) return null; // ถ้าไม่มีวันที่หรือเวลาให้ข้าม
            const [day, month, year] = row.Date.split("/"); // แยกวันที่
            const [h, m, s] = row.Time.split(":"); // แยกเวลา
            const timestamp = new Date(
              `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${h}:${m}:${s}`
            ); // สร้าง timestamp จากวันที่และเวลา
            return {
              time: timestamp,
              value: parseInt(row.Device), // เปลี่ยนค่าจากอักษรเป็นตัวเลข
            };
          })
          .filter((d) => d && !isNaN(d.value)); // กรองข้อมูลที่เป็น null หรือไม่ใช่ตัวเลข

        setDataFromCSV(processedData); // เก็บข้อมูลที่ประมวลผลแล้วใน state
      });
  }, [selectedFile, graphType]); // useEffect นี้จะทำงานเมื่อ selectedFile หรือ graphType เปลี่ยนแปลง

  // ใช้ useEffect เพื่อกรองข้อมูลให้เหมาะสมกับระยะเวลาและประเภทกราฟ
  useEffect(() => {
    if (dataFromCSV.length === 0 || graphType !== "csv") return; // ถ้าไม่มีข้อมูลหรือประเภทกราฟไม่ใช่ CSV ให้หยุดทำงาน

    const grouped = {}; // สร้าง object เพื่อเก็บข้อมูลที่จัดกลุ่มแล้ว
    const intervalMs = intervalOptions[interval]; // ใช้ค่า interval ที่เลือก

    dataFromCSV.forEach(({ time, value }) => {
      const timestamp = new Date(time).getTime(); // แปลงเวลาเป็น timestamp
      const rounded = Math.floor(timestamp / intervalMs) * intervalMs; // ปัดเวลาลงให้เป็นช่วงเวลา
      const roundedTime = new Date(rounded);

      if (!grouped[rounded]) {
        grouped[rounded] = { time: roundedTime, value }; // ถ้ายังไม่มีข้อมูลในกลุ่มให้เพิ่ม
      } else {
        grouped[rounded].value = Math.max(grouped[rounded].value, value); // ถ้ามีข้อมูลแล้วให้เลือกค่าสูงสุด
      }
    });

    const summarized = Object.values(grouped).sort((a, b) => a.time - b.time); // เรียงข้อมูลตามเวลา
    const finalData = summarized.map(({ time, value }) => ({
      time,
      value,
      displayTime: time.toLocaleTimeString([], { // แปลงเวลาให้เป็นรูปแบบที่ต้องการ
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }));

    setFilteredData(finalData); // เก็บข้อมูลที่ประมวลผลแล้วใน state
  }, [dataFromCSV, interval, graphType]); // useEffect นี้จะทำงานเมื่อ dataFromCSV, interval หรือ graphType เปลี่ยนแปลง

  // แปลงข้อมูล Realtime
  const processedRealtimeData = feeds?.map((entry) => {
    const date = new Date(entry.created_at); // แปลงวันที่จาก Feeds
    return {
      time: date,
      value: entry.field1 ? parseInt(entry.field1) : 0, // ถ้ามีข้อมูลให้แปลงเป็นตัวเลข
      displayTime: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  }) || []; // ถ้าไม่มีข้อมูลให้ใช้เป็นอาร์เรย์ว่าง

  const displayedTimes = new Set(); // ใช้เก็บเวลาที่แสดงแล้วเพื่อป้องกันการซ้ำ
  const xTickFormatter = (timeStr) => {
    if (graphType === "csv") {
      // ถ้าเป็นกราฟประเภท CSV จะแสดงเวลาตามช่วงเวลา
      const [hour, min] = timeStr.split(":").map(Number);
      const interval = isMobile ? 3 : 1; // ในโทรศัพท์ทุกๆ 3 ชั่วโมง ในคอมพิวเตอร์ทุกๆ 1 ชั่วโมง
      if (min === 0 && hour % interval === 0) {
        return `${String(hour).padStart(1, "0")}:00`; // แสดงเวลาเป็น ชั่วโมง:00 เช่น 00:00, 01:00
      }
      return "";
    } else {
      // ถ้าเป็นกราฟประเภท Realtime จะแสดงทุก 10 นาที
      const [hour, min] = timeStr.split(":");
      if (parseInt(min) % 10 === 0 && !displayedTimes.has(timeStr)) {
        displayedTimes.add(timeStr);
        return `${hour}:${min}`; // แสดงเวลาที่มีการเปลี่ยนทุก 10 นาที
      }
      return "";
    }
  };

  return (
    <div>
      {/* ตัวเลือกการตั้งค่ากราฟ */}
      <div 
        style={{
          display: "flex",
          justifyContent: isMobile ? "flex-end" : "flex-end",
          marginBottom: "10px",
          marginLeft: isMobile ? "37px" : "0px",
          marginRight: isMobile ? "0px" : "5px",
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

      {/* แสดงกราฟ */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={graphType === "csv" ? filteredData : processedRealtimeData}
          margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis
            dataKey="displayTime"
            tick={{ fontSize }}
            tickFormatter={xTickFormatter}
            interval={0}
          >
            <Label
              value={language === "th" ? "เวลา" : "Time"}
              offset={-5}
              position="insideBottom"
              style={{ textAnchor: "middle", fontSize }}
            />
          </XAxis>

          <YAxis
            allowDecimals={false}
            tick={{ fontSize }}
          >
            <Label
              value={language === "th" ? "จำนวนอุปกรณ์" : "Number of Devices"}
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle", fontSize }}
            >
            </Label>
          </YAxis>
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="green" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent1; // ส่งออก ChartComponent1 ให้ใช้งานได้
