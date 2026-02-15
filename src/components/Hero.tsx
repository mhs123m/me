import React from 'react';

const Hero = () => {
  return (
    <section className="hero">
      <h1>Mohammed Alismail</h1>
      <p className="role text-mono" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
        Backend Engineer
      </p>
      <div className="summary" style={{ maxWidth: '600px' }}>
        <p>
          5 years of backend experience with a strong focus on scalable systems, APIs, and data modeling.
          Comfortable owning backend systems end-to-end, from architecture to deployment.
        </p>
      </div>
    </section>
  );
};

export default Hero;
