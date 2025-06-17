// StudyHome.jsx
import React, { useState } from 'react';

const StudyHome = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(prev => prev + 1);
  };

  return (
    <div style={{ padding: '1rem', textAlign: 'center', border: '1px solid #ccc' }}>
      <h2>Componente de Prueba</h2>
      <p>Has hecho clic {count} veces</p>
      <button onClick={handleClick}>Haz clic aquí</button>
    </div>
  );
};

export default StudyHome;
