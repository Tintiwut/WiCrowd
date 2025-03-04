import React, { useEffect, useState } from 'react';
import Building_A3 from '../images/Building_A3.jpg';
import Building_A6 from '../images/Building_A6.jpg';
import Building_B4 from '../images/Building_B4.jpg';
import "./Overall.css";

const Overall = () => {
    const [data, setData] = useState([]);
    const [maxToday, setMaxToday] = useState(0); // สร้าง state สำหรับ maxToday

    useEffect(() => {
        const fetchData = async () => {
            // ดึงข้อมูลจาก API ของแต่ละสถานที่
            const response1 = await fetch('https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=2');
            const response2 = await fetch('https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=2');
            const response3 = await fetch('https://api.thingspeak.com/channels/2809694/feeds.json?api_key=7Q1U13DVE9ZXUX27&results=2');

            const data1 = await response1.json();
            const data2 = await response2.json();
            const data3 = await response3.json();

            // อัปเดต maxToday หาก count ที่ได้รับใหม่มากกว่าค่าที่มีอยู่
            const maxCount = Math.max(data1.feeds[0].field1, data2.feeds[0].field1, data3.feeds[0].field1);
            setMaxToday(maxCount);

            setData([
                { name: 'Building A3', count: data1.feeds[0].field1 },
                { name: 'Building A6', count: data2.feeds[0].field1 },
                { name: 'Building B4', count: data3.feeds[0].field1 },
            ]);
        };

        fetchData();
    }, []);

    const getDensityLevel = (count) => {
        if (count < 20) return "น้อย";
        if (count < 35) return "ปานกลาง";
        return "มาก";
    };

    return (
        <div>
            {data.map((location, index) => (
                <div key={index} className="overall-card">
                    <img src={[Building_A3, Building_A6, Building_B4][index]} alt={`Location ${index + 1}`} />
                        <div className="overall-info">
                        <h2>{location.name}</h2>
                        <p>จำนวนคน: {location.count}</p>
                        <p>ความหนาแน่น: {getDensityLevel(location.count)}</p>
                        <p>จำนวนสูงสุดของวันนี้: {maxToday}</p>
                        </div>
                </div>
            ))}
        </div>
    );
};

export default Overall;
