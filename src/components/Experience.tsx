import React from 'react';

interface ExperienceItemProps {
  phase: string;
  duration: string;
  title: string;
  responsibilities: string[];
}

const ExperienceItem = ({ phase, duration, title, responsibilities }: ExperienceItemProps) => (
  <div className="experience-item" style={{ marginBottom: 'var(--space-md)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-xs)' }}>
      <h3>{phase}</h3>
      <span className="text-mono text-subtle" style={{ fontSize: '0.9rem' }}>{duration}</span>
    </div>
    <p className="text-mono" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>{title}</p>
    <ul>
      {responsibilities.map((item, index) => (
        <li key={index} style={{ color: 'var(--text-secondary)', paddingLeft: '1rem', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0, color: 'var(--border)' }}>•</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const Experience = () => {
  return (
    <section id="experience">
      <h2>Experience Narrative</h2>

      <ExperienceItem
        phase="Phase 2 – Modern Backend & Platform Engineering"
        duration="Recent (≈2+ years)"
        title="Senior Backend Focus"
        responsibilities={[
          "Designing APIs using FastAPI and async patterns for high-throughput services.",
          "Building real-time systems utilizing WebSockets and event-driven architectures.",
          "Taking strong ownership of backend architecture decisions and trade-offs.",
          "Integrating multiple heterogeneous data sources into unified data layers.",
          "Conducting deep performance tuning and backend optimization."
        ]}
      />

      <ExperienceItem
        phase="Phase 1 – Enterprise Backend Engineering"
        duration="Previous (≈2 years)"
        title="Software Engineer"
        responsibilities={[
          "Building and maintaining large-scale REST APIs for enterprise clients.",
          "Working within structured systems ensuring high availability and reliability.",
          "Writing maintainable, well-documented backend code in Java/Spring environments.",
          "Collaborating closely with cross-functional teams to deliver production features.",
          "Handling production-grade systems and on-call rotations."
        ]}
      />
    </section>
  );
};

export default Experience;
