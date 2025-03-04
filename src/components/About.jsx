import React from 'react';
import './Aboutus.css';
import jaruphat from '../images/jaruphat.png'; 
import phettae from '../images/phettae.png'; 
import nuthtawat from '../images/nuthtawat.png'; 
import tintiwut from '../images/Tintiwut.png'; 

const About = () => {
  const teamMembers = [
    { name: 'Mr.Jaruphat Dechsri', role: 'Buuffolo', image: jaruphat },
    { name: 'Mr.Phettae Kradangnga', role: 'คนหลายใจ', image: phettae },
    { name: 'Mr.Nuthtawat Siltusaichol', role: 'คนไม่เที่ยวกับเพื่อน', image: nuthtawat },
    { name: 'Mr.Tintiwut Yenphet', role: 'คนหล่อ', image: tintiwut },
  ];

  return (
    <div className="about-us-container">
      <header className="about-us-header">
        <h1>About Us</h1>
      </header>

      <section className="about-us-team">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-member">
            <img src={member.image} alt={member.name} className="team-member-img" />
            <h2>{member.name}</h2>
            <p>{member.role}</p>
          </div>
        ))}
      </section>

      <footer className="about-us-footer">
        <p>&copy; 2025 บริษัทของเรา</p>
      </footer>
    </div>
  );
};

export default About;
