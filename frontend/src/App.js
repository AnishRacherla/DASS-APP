import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import GameHub from './components/GameHub';
import StageHub from './components/StageHub';
import PlanetGamesScreen from './components/PlanetGamesScreen';
import PlanetHome from './components/PlanetHome';
import GameSelection from './components/GameSelection';
import PlanetSelection from './components/PlanetSelection';
import BalloonSelection from './components/BalloonSelection';
import BalloonGame from './components/BalloonGame';
import BubbleShooterSelection from './components/BubbleShooterSelection';
import BubbleShooterGame from './components/BubbleShooterGame';
import WordSortingBasketSelection from './components/WordSortingBasketSelection';
import WordSortingBasketGame from './components/WordSortingBasketGame';
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
import SwaraMemoryGame from './components/swara/SwaraMemoryGame';
import ConsonantQuiz from './components/consonantQuiz/ConsonantQuiz';
import TraceVowelGame from './components/traceVowel/TraceVowelGame';
import ScavengerHub from './components/scavenger/ScavengerHub';
import ScavengerGame from './components/scavenger/ScavengerGame';
import VarnamalGame from './components/VarnamalGame';
import MatraGame from './components/matraGame/MatraGame';
import WordJumbleSelection from './components/WordJumbleSelection';
import WordJumbleGame from './components/WordJumbleGame';
import ShabdHub from './components/shabd/ShabdHub';
import ShabdMatch from './components/shabd/ShabdMatch';
import StoryTimeHub from './components/storyTime/StoryTimeHub';
import StoryTimePlayer from './components/storyTime/StoryTimePlayer';
import StoryTimeQuiz from './components/storyTime/StoryTimeQuiz';
import FillStoryHub from './components/fillStory/FillStoryHub';
import FillStoryGame from './components/fillStory/FillStoryGame';
import CrosswordGame from './components/CrosswordGame';
import MissingMatraFill from './components/missingMatra/MissingMatraFill';
import Profile from './components/Profile';
import './App.css';

// Smart redirect: all old navigate('/game-hub') calls go back to the
// planet the user was on (stored in localStorage by PlanetGamesScreen).
const GameHubRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const lastStage = localStorage.getItem('lastStage');
    navigate(lastStage ? `/stages/${lastStage}` : '/stages', { replace: true });
  }, [navigate]);
  return null;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth */}
          <Route path="/" element={<AuthPage />} />
          {/* Profile User Page */}
          <Route path="/profile" element={<Profile />} />
          {/* Stage Hub — 4 Planet Journey */}
          <Route path="/stages" element={<StageHub />} />
          <Route path="/stages/:stageId" element={<PlanetGamesScreen />} />

          {/* Game Hub (legacy flat view, kept as fallback) */}
          <Route path="/game-hub" element={<GameHubRedirect />} />
          <Route path="/game-hub-flat" element={<GameHub />} />

          {/* Original games */}
          <Route path="/planet-home" element={<PlanetHome />} />
          <Route path="/game-selection" element={<GameSelection />} />
          <Route path="/planet-selection" element={<PlanetSelection />} />
          <Route path="/balloon-selection" element={<BalloonSelection />} />
          <Route path="/balloon-game" element={<BalloonGame />} />
          <Route path="/bubble-shooter" element={<BubbleShooterSelection />} />
          <Route path="/bubble-shooter/:language/:difficulty" element={<BubbleShooterGame />} />
          <Route path="/word-sorting-basket" element={<WordSortingBasketSelection />} />
          <Route path="/word-sorting-basket/:language/:level" element={<WordSortingBasketGame />} />
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
          <Route path="/swara-memory" element={<SwaraMemoryGame />} />

          {/* Trace the Vowel */}
          <Route path="/trace-vowel" element={<TraceVowelGame />} />

          {/* Scavenger Hunt */}
          <Route path="/scavenger" element={<ScavengerHub />} />
          <Route path="/scavenger/play" element={<ScavengerGame />} />

          {/* Varnamala Puzzle */}
          <Route path="/varnamal" element={<VarnamalGame />} />

          {/* Matra Magic Builder */}
          <Route path="/matra-game" element={<MatraGame />} />

          {/* Word Jumble */}
          <Route path="/word-jumble" element={<WordJumbleSelection />} />
          <Route path="/word-jumble/:language/:level" element={<WordJumbleGame />} />

          {/* Shabd Games */}
          <Route path="/shabd" element={<ShabdHub />} />
          <Route path="/shabd/match/:language/:level" element={<ShabdMatch />} />

          {/* Story Time */}
          <Route path="/story-time" element={<StoryTimeHub />} />
          <Route path="/story-time/play/:storyId" element={<StoryTimePlayer />} />
          <Route path="/story-time/quiz/:storyId" element={<StoryTimeQuiz />} />

          {/* Fill the Story */}
          <Route path="/fill-story" element={<FillStoryHub />} />
          <Route path="/fill-story/:language/:level" element={<FillStoryGame />} />

          {/* Crossword Game */}
          <Route path="/crossword" element={<CrosswordGame />} />
          <Route path="/crossword-game" element={<CrosswordGame />} />

          {/* Missing Matra Fill */}
          <Route path="/missing-matra" element={<MissingMatraFill />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes >
      </div >
    </Router >
  );
}

export default App;
