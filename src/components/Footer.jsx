import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      marginTop: 'var(--space-xl)',
      paddingTop: 'var(--space-md)',
      borderTop: '1px solid var(--border)',
      color: 'var(--text-tertiary)',
      fontSize: '0.9rem',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <div>
        <a href="#" style={{ border: 'none', marginRight: 'var(--space-md)' }}>GitHub</a>
        <a href="#" style={{ border: 'none' }}>Email</a>
      </div>
      <div className="text-mono">
        © {new Date().getFullYear()} Software Engineer
      </div>
    </footer>
  );
};

export default Footer;
