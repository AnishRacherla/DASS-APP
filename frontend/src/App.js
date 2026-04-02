import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import GameHub from './components/GameHub';
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
import AksharaGame from './components/AksharaGame';
import SwaraGame from './components/swara/SwaraGame';
import ConsonantQuiz from './components/consonantQuiz/ConsonantQuiz';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth */}
          <Route path="/" element={<AuthPage />} />

          {/* Game Hub - All 5 Games */}
          <Route path="/game-hub" element={<GameHub />} />

          {/* Original games */}
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
          <Route path="/whack-select" element={<WhackSelection />} />
          <Route path="/consonant-quiz" element={<ConsonantQuiz />} />

          {/* Akshara Game (Tilak's unique game) */}
          <Route path="/akshara" element={<AksharaGame />} />

          {/* Swara Memory Game */}
          <Route path="/swara-game" element={<SwaraGame />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
