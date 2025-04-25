// เรียกใช้งาน React และไฟล์ CSS รวมถึงรูปภาพที่ต้องการใช้
import React from 'react'; // นำเข้า React library ที่ใช้สำหรับการสร้าง UI
import './Aboutus.css'; // นำเข้าไฟล์ CSS สำหรับสไตล์ของคอมโพเนนต์
import jaruphat from '../images/jaruphat.png'; // นำเข้ารูปภาพของทีมสมาชิก Mr.Jaruphat
import phettae from '../images/phettae.png'; // นำเข้ารูปภาพของทีมสมาชิก Mr.Phettae
import nuthtawat from '../images/nuthtawat.png'; // นำเข้ารูปภาพของทีมสมาชิก Mr.Nuthtawat
import tintiwut from '../images/Tintiwut.png'; // นำเข้ารูปภาพของทีมสมาชิก Mr.Tintiwut

// สร้างคอมโพเนนต์ 'About' ที่รับค่า prop ชื่อ 'language'
const About = ({ language }) => {

  // ข้อมูลของสมาชิกทีมที่ต้องการแสดง
  const teamMembers = [
    { 
      name: { en: 'Mr.Jaruphat Dechsri', th: 'นายจารุภัทร เดชศรี' }, // ชื่อสมาชิกทีมทั้งในภาษาอังกฤษและภาษาไทย
      role: 'QA | DEV Team', // ตำแหน่งของสมาชิก
      No: '1640900427', // รหัสนักศึกษา
      image: jaruphat // รูปภาพของสมาชิก
    },
    { 
      name: { en: 'Mr.Phettae Kradangnga', th: 'นายเพชรแท้ กระดังงา' }, // ชื่อสมาชิกทีมทั้งในภาษาอังกฤษและภาษาไทย
      role: 'PO | Hardware', // ตำแหน่งของสมาชิก
      No: '1640900500', // รหัสนักศึกษา
      image: phettae // รูปภาพของสมาชิก
    },
    { 
      name: { en: 'Mr.Nuthtawat Siltusaichol', th: 'นายณัฐฏวัฒน์ สินธุสายชล' }, // ชื่อสมาชิกทีมทั้งในภาษาอังกฤษและภาษาไทย
      role: 'QA', // ตำแหน่งของสมาชิก
      No: '1640901177', // รหัสนักศึกษา
      image: nuthtawat // รูปภาพของสมาชิก
    },
    { 
      name: { en: 'Mr.Tintiwut Yenphet', th: 'นายติณณ์ติวุฒิ เย็นเพชร' }, // ชื่อสมาชิกทีมทั้งในภาษาอังกฤษและภาษาไทย
      role: 'DEV Lead', // ตำแหน่งของสมาชิก
      No: '1640902373', // รหัสนักศึกษา
      image: tintiwut // รูปภาพของสมาชิก
    }
  ];

  // ข้อความแปลภาษาอังกฤษและภาษาไทยสำหรับส่วนหัวและฟุตเตอร์
  const translations = {
    en: {
      title: "About Us", // หัวข้อภาษาอังกฤษ
      footer: "© Bangkok University, Department of Computer Engineering and Robotics", // ฟุตเตอร์ภาษาอังกฤษ
    },
    th: {
      title: "เกี่ยวกับเรา", // หัวข้อภาษาอังกฤษ
      footer: "© มหาวิทยาลัยกรุงเทพ สาขาวิชาวิศวกรรมคอมพิวเตอร์และหุ่นยนต์", // ฟุตเตอร์ภาษาอังกฤษ
    },
  };

  return (
    // โครงสร้างหลักของคอมโพเนนต์ About ที่มี container หลัก
    <div className="about-us-container">
      {/* ส่วนหัวของ About Us */}
      <header className="about-us-header">
        {/* แสดงหัวข้อ "About Us" หรือ "เกี่ยวกับเรา" ตามภาษาที่เลือก */}
        <h1>{translations[language].title}</h1>
      </header>

      {/* ส่วนแสดงข้อมูลสมาชิกทีม */}
      <section className="about-us-team">
        {/* ทำการวนลูปแสดงข้อมูลสมาชิกทีม */}
        {teamMembers.map((member, index) => (
          // สร้างกล่องสำหรับสมาชิกแต่ละคน
          <div key={index} className="team-member">
            {/* แสดงภาพของสมาชิก */}
            <img src={member.image} alt={member.name} className="team-member-img" />
            {/* แสดงชื่อสมาชิก โดยเลือกภาษาตามค่า language */}
            <h2>{member.name[language]}</h2>
            {/* แสดงตำแหน่งของสมาชิก */}
            <p>{member.role}</p>
            {/* แสดงหมายเลขของสมาชิก */}
            <p>{member.No}</p>
          </div>
        ))}
      </section>

      {/* ฟุตเตอร์ของหน้า About Us */}
      <footer className="about-us-footer">
        {/* แสดงฟุตเตอร์ที่แปลตามภาษาที่เลือก */}
        <p>{translations[language].footer}</p>
      </footer>
    </div>
  );
};

// ส่งออกคอมโพเนนต์ About ให้สามารถใช้งานในที่อื่นๆ ได้
export default About;
