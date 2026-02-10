import React from 'react';

const SkillGroup = ({ title, skills }) => (
  <div className="skill-group">
    <h3>{title}</h3>
    <div className="tags">
      {skills.map((skill) => (
        <span key={skill} className="tag">{skill}</span>
      ))}
    </div>
  </div>
);

const Skills = () => {
  const skillData = [
    {
      title: "Languages & Frameworks",
      skills: ["Python (FastAPI)", "Java (Spring Boot)", "C# (.NET)", "Async Systems"]
    },
    {
      title: "Databases & Data",
      skills: ["PostgreSQL", "SQLAlchemy", "Query Optimization", "Relational Modeling", "Neo4j"]
    },
    {
      title: "System Design",
      skills: ["REST API Design", "Auth & Authorization", "Task Queues", "WebSockets", "Scalability"]
    },
    {
      title: "Dev & Tooling",
      skills: ["Docker", "Git Strategies", "Linux", "CI/CD", "K8s Concepts"]
    }
  ];

  return (
    <section id="skills">
      <h2>Technical Expertise</h2>
      <div className="flex-grid">
        {skillData.map((group) => (
          <SkillGroup key={group.title} {...group} />
        ))}
      </div>
    </section>
  );
};

export default Skills;
