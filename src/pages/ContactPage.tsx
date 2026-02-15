import React from 'react';
import { FaEnvelope, FaLinkedin, FaGithub } from 'react-icons/fa';
import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <h1>Contact</h1>
      <p className="contact-subtitle">Feel free to reach out — I'm always open to connecting.</p>

      <div className="contact-links">
        <a href="mailto:alismailmh@gmail.com" className="contact-card">
          <FaEnvelope className="contact-icon" />
          <div>
            <h3>Email</h3>
            <span>alismailmh@gmail.com</span>
          </div>
        </a>

        <a href="https://linkedin.com/in/alismailmh/" target="_blank" rel="noopener noreferrer" className="contact-card">
          <FaLinkedin className="contact-icon" />
          <div>
            <h3>LinkedIn</h3>
            <span>linkedin.com/in/alismailmh</span>
          </div>
        </a>

        <a href="https://github.com/mhs123m" target="_blank" rel="noopener noreferrer" className="contact-card">
          <FaGithub className="contact-icon" />
          <div>
            <h3>GitHub</h3>
            <span>github.com/mhs123m</span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default ContactPage;
