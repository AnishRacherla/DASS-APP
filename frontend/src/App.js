import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import PlanetSelection from './components/PlanetSelection';
import Quiz from './components/Quiz';
import Results from './components/Results';
import Dashboard from './components/Dashboard';
import WhackSelection from './components/WhackSelection';
import WhackGame from './components/WhackGame';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/planets/:language" element={<PlanetSelection />} />
          <Route path="/quiz/:language/:level" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="/dashboard/:userId" element={<Dashboard />} />
          <Route path="/whack/:language" element={<WhackSelection />} />
          <Route path="/whack/:language/:level" element={<WhackGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
