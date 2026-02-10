import React from 'react';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Philosophy from './components/Philosophy';
import Footer from './components/Footer';

function App() {
  return (
    <div className="container">
      <Hero />
      <Skills />
      <Experience />
      <Philosophy />
      <Footer />
    </div>
  );
}

export default App;
