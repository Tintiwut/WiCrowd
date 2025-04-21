import React from 'react';
import './Aboutus.css';
import jaruphat from '../images/jaruphat.png'; 
import phettae from '../images/phettae.png'; 
import nuthtawat from '../images/nuthtawat.png'; 
import tintiwut from '../images/Tintiwut.png'; 

const About = ({ language }) => {
  const teamMembers = [
    { 
      name: { en: 'Mr.Jaruphat Dechsri', th: 'นายจารุภัทร เดชศรี' }, 
      role: 'QA | DEV Team', 
      No: '1640900427', 
      image: jaruphat 
    },
    { 
      name: { en: 'Mr.Phettae Kradangnga', th: 'นายเพชรแท้ กระดังงา' }, 
      role: 'PO | Hardware', 
      No: '1640900500', 
      image: phettae 
    },
    { 
      name: { en: 'Mr.Nuthtawat Siltusaichol', th: 'นายณัฐฏวัฒน์ สินธุสายชล' }, 
      role: 'QA', 
      No: '1640901177', 
      image: nuthtawat 
    },
    { 
      name: { en: 'Mr.Tintiwut Yenphet', th: 'นายติณณ์ติวุฒิ เย็นเพชร' }, 
      role: 'DEV Lead', 
      No: '1640902373', 
      image: tintiwut 
    }
  ];

  const translations = {
    en: {
      title: "About Us",
      footer: "© Bangkok University, Department of Computer Engineering and Robotics",
    },
    th: {
      title: "เกี่ยวกับเรา",
      footer: "© มหาวิทยาลัยกรุงเทพ สาขาวิชาวิศวกรรมคอมพิวเตอร์และหุ่นยนต์",
    },
  };

  return (
    <div className="about-us-container">
      <header className="about-us-header">
        <h1>{translations[language].title}</h1>
      </header>

      <section className="about-us-team">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member">
            <img src={member.image} alt={member.name} className="team-member-img" />
            <h2>{member.name[language]}</h2>
            <p>{member.role}</p>
            <p>{member.No}</p>
          </div>
        ))}
      </section>

      <footer className="about-us-footer">
        <p>&copy; {translations[language].footer}</p>
      </footer>
    </div>
  );
};

export default About;
