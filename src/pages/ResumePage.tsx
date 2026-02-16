import React from 'react';
import { FaDownload } from 'react-icons/fa';
import './ResumePage.css';

const ResumePage = () => {
  return (
    <div className="resume-page">
      <button className="resume-download" onClick={() => window.print()}>
        <FaDownload /> Download PDF
      </button>
      <header className="resume-header">
        <h1>Mohammed Alismail</h1>
        <p className="subtitle">Software Engineer</p>
        <div className="contact-info">
          <span>Riyadh, Saudi Arabia</span> |{' '}
          <span><a href="tel:+966549436004">+966 549 436 004</a></span> |{' '}
          <span><a href="mailto:alismailmh@gmail.com">alismailmh@gmail.com</a></span>
        </div>
        <div className="links">
          <a href="https://linkedin.com/in/alismailmh/" target="_blank" rel="noopener noreferrer">LinkedIn</a> |{' '}
          <a href="https://github.com/mhs123m" target="_blank" rel="noopener noreferrer">GitHub</a> |{' '}
          <a href="https://moismail.dev">moismail.dev</a>
        </div>
      </header>

      <section className="cv-section">
        <div className="left-col">Summary</div>
        <div className="right-col">
          <p>Backend engineer with 5 years of experience building scalable APIs and distributed systems. Comfortable owning backend architecture end-to-end, from data modeling to deployment. Focused on correctness, simplicity, and long-term maintainability.</p>
        </div>
      </section>

      <section className="cv-section">
        <div className="left-col">Experience</div>
        <div className="right-col">
          <div className="entry">
            <div className="entry-header">
              <strong>Tuwaiq Academy</strong>
              <span className="date">2024 – Present</span>
            </div>
            <p className="role">Software Engineer (Backend)</p>
            <ul>
              <li>Designed and maintained scalable APIs using <strong>FastAPI, Laravel, and .NET</strong>.</li>
              <li>Acted as <strong>Solution Architect</strong>, pre-planning system architecture, database structures, and workflows.</li>
              <li>Applied <strong>TDD</strong> for reliable code and authored detailed technical documentation.</li>
            </ul>
          </div>

          <div className="entry">
            <div className="entry-header">
              <strong>stc</strong>
              <span className="date">2022 – 2024</span>
            </div>
            <p className="role">Software Engineer (Backend)</p>
            <ul>
              <li>Developed and optimized backend APIs using <strong>Java Spring Boot</strong> and PostgreSQL.</li>
              <li>Built frontend features with <strong>Angular</strong> to integrate and display real-time API data.</li>
              <li>Contributed to full-cycle development within high-velocity <strong>Agile</strong> teams.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cv-section">
        <div className="left-col">Technical Skills</div>
        <div className="right-col">
          <div className="skill-group">
            <strong>Python:</strong> FastAPI, Pydantic, SQLAlchemy, async backends, scripting.
          </div>
          <div className="skill-group">
            <strong>Java:</strong> Spring Boot, JPA, microservices architecture.
          </div>
          <div className="skill-group">
            <strong>C# / .NET:</strong> CQRS, MediatR, Entity Framework.
          </div>
          <div className="skill-group">
            <strong>DevOps:</strong> Docker, Kubernetes, GitHub Actions, CI/CD.
          </div>
          <div className="skill-group">
            <strong>Database:</strong> PostgreSQL, MySQL, MongoDB, Redis.
          </div>
          <div className="skill-group">
            <strong>Backend:</strong> Kafka, RabbitMQ, REST APIs, websockets, gRPC, SonarQube.
          </div>
          <div className="skill-group">
            <strong>Auth:</strong> JWT, OAuth, OpenID, SSO, LDAP.
          </div>
          <div className="skill-group">
            <strong>AI:</strong> OpenAI, MCP, LLM.
          </div>
          <div className="skill-group">
            <strong>Frontend:</strong> HTML, CSS, JS, React.
          </div>
        </div>
      </section>

      <section className="cv-section">
        <div className="left-col">Education</div>
        <div className="right-col">
          <div className="entry">
            <div className="entry-header">
              <strong>Tuwaiq Academy</strong>
              <span className="date">2021 – 2022</span>
            </div>
            <p>Intensive Backend Bootcamp (Java Spring Boot)</p>
            <p>Intensive Android Bootcamp (Kotlin)</p>
          </div>
          <div className="entry">
            <div className="entry-header">
              <strong>Colorado State University</strong>
              <span className="date">2016 – 2020</span>
            </div>
            <p>Bachelor of Science in Biological Science</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResumePage;
