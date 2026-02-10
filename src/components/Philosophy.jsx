import React from 'react';

const Philosophy = () => {
  return (
    <section id="philosophy">
      <h2>Engineering Style</h2>
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        padding: 'var(--space-md)', 
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)'
      }}>
        <p>
          I prioritize <strong>clarity over cleverness</strong>. In backend systems, the "clever" solution is often the hardest to debug three months later.
        </p>
        <p>
          My focus is on <strong>correctness, simplicity, and long-term maintainability</strong>. I believe in getting the data models right first, as they form the foundation of the entire system.
        </p>
        <p style={{ marginBottom: 0 }}>
          I value <strong>strong backend fundamentals</strong>—concurrency, database isolation, networking—over chasing the latest abstraction layers.
        </p>
      </div>
    </section>
  );
};

export default Philosophy;
