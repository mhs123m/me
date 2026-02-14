import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaGithub, FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [blogOpen, setBlogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={closeMobile}>
          MI
        </NavLink>

        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={closeMobile}>About Me</NavLink>

          <div
            className="navbar-dropdown"
            onMouseEnter={() => setBlogOpen(true)}
            onMouseLeave={() => setBlogOpen(false)}
          >
            <NavLink to="/blog" onClick={closeMobile}>Blog</NavLink>
            {blogOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-menu-inner">
                  <NavLink to="/blog" end onClick={() => { setBlogOpen(false); closeMobile(); }}>All</NavLink>
                  <NavLink to="/blog?category=technical" onClick={() => { setBlogOpen(false); closeMobile(); }}>Technical</NavLink>
                  <NavLink to="/blog?category=lifestyle" onClick={() => { setBlogOpen(false); closeMobile(); }}>Lifestyle</NavLink>
                </div>
              </div>
            )}
          </div>

          <NavLink to="/resume" onClick={closeMobile}>Resume</NavLink>
          <NavLink to="/contact" onClick={closeMobile}>Contact</NavLink>

          <a href="https://github.com/mhs123m" target="_blank" rel="noopener noreferrer" className="navbar-icon" aria-label="GitHub">
            <FaGithub />
          </a>

          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
