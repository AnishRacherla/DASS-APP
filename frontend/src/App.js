import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import PlanetHome from './components/PlanetHome';
import GameSelection from './components/GameSelection';
import PlanetSelection from './components/PlanetSelection';
import BalloonSelection from './components/BalloonSelection';
import BalloonGame from './components/BalloonGame';
import Lessons from './components/Lessons';
import MarsGameSelection from './components/MarsGameSelection';
import MarsGame from './components/MarsGame';
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
          <Route path="/planet-home" element={<PlanetHome />} />
          <Route path="/game-selection" element={<GameSelection />} />
          <Route path="/planet-selection" element={<PlanetSelection />} />
          <Route path="/balloon-selection" element={<BalloonSelection />} />
          <Route path="/balloon-game" element={<BalloonGame />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/mars-games" element={<MarsGameSelection />} />
          <Route path="/mars-game" element={<MarsGame />} />
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
