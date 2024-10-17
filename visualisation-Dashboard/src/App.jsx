import React from 'react';
import Graphs from './components/index';
import './App.css'; // Assuming your styles are here

function App() {
  const appStyle = {
    display: 'flex',
    justifyContent: 'center', // Center horizontally
    alignItems: 'center', // Center vertically
    // height: '100vh', // Full viewport height
    backgroundColor: '#f4f4f4', // Light background for contrast
  };

  return (
    <div style={appStyle}> {/* Parent div to center child */}
      <Graphs /> {/* Graphs component */}
    </div>
  );
}

export default App;
