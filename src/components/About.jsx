import React from 'react';
import './Aboutus.css';
import jaruphat from '../images/jaruphat.png'; 
import phettae from '../images/phettae.png'; 
import nuthtawat from '../images/nuthtawat.png'; 
import tintiwut from '../images/Tintiwut.png'; 

const About = () => {
  const teamMembers = [
    { name: 'Mr.Jaruphat Dechsri', role: 'QA', No: '1640900427', image: jaruphat },
    { name: 'Mr.Phettae Kradangnga', role: 'PO', No: '1640900500', image: phettae },
    { name: 'Mr.Nuthtawat Siltusaichol', role: 'QA', No: '1640901177', image: nuthtawat },
    { name: 'Mr.Tintiwut Yenphet', role: 'DEV', No: '1640902373', image: tintiwut },
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
            <p>{member.No}</p>
          </div>
        ))}
      </section>

      <footer className="about-us-footer">
        <p>&copy; มหาวิทยาลัยกรุงเทพ สาขาวิชา วิศวกรรมศาสตร์ คอมพิวเตอร์ และหุ่นยนต์</p>
      </footer>
    </div>
  );
};

export default About;
