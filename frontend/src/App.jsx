import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Games from "./pages/Games";
import Snake from "./games/Snake";
import Tetris from "./games/Tetris";
import ProtectedRoute from "./components/PrivateRoute"; // 🔑 Ensure file name is PrivateRoute.jsx
import Breakout from "./games/Breakout";
import Pong from "./games/Pong";
import MemoryGame from "./games/MemoryGame";
import Flappybird from "./games/Flappybird";
import Game2048 from "./games/Game2048";
import SpaceInvaders from "./games/Invaders";
import Tictactoe from "./games/Tictactoe";
import Hangman from "./games/Hangman";
import Sodoku from "./games/Sudoku";
import WhacAMole from "./games/Whack-a-mole";
import Platformer from "./games/Platformer";
import JumpGame from "./games/Jump";
import Maze from "./games/Maze";
import Dino from "./games/Dino";
import BubbleShooter from "./games/Bubble";
import Brick from "./games/Brick";
import ColorMatch from "./games/Color";
import FruitNinja from "./games/Fruit";
import CarRace from "./games/Racing";
import TowerDefense from "./games/Tower";
import PlatformPuzzleGame from "./games/Puzzle";
import ShootingGallery from "./games/Shooting";
import MiniGolfGame from "./games/Golf";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔑 Default route → go to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Games list page */}
        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <Games />
            </ProtectedRoute>
          }
        />

        {/* ✅ All game routes */}
        <Route path="/games/snake" element={<ProtectedRoute><Snake /></ProtectedRoute>} />
        <Route path="/games/tetris" element={<ProtectedRoute><Tetris /></ProtectedRoute>} />
        <Route path="/games/breakout" element={<ProtectedRoute><Breakout /></ProtectedRoute>} />
        <Route path="/games/pong" element={<ProtectedRoute><Pong /></ProtectedRoute>} />
        <Route path="/games/memory" element={<ProtectedRoute><MemoryGame /></ProtectedRoute>} />
        <Route path="/games/flappy" element={<ProtectedRoute><Flappybird /></ProtectedRoute>} />
        <Route path="/games/2048" element={<ProtectedRoute><Game2048 /></ProtectedRoute>} />
        <Route path="/games/invaders" element={<ProtectedRoute><SpaceInvaders /></ProtectedRoute>} />
        <Route path="/games/tictactoe" element={<ProtectedRoute><Tictactoe /></ProtectedRoute>} />
        <Route path="/games/hangman" element={<ProtectedRoute><Hangman /></ProtectedRoute>} />
        <Route path="/games/sudoku" element={<ProtectedRoute><Sodoku /></ProtectedRoute>} />
        <Route path="/games/mole" element={<ProtectedRoute><WhacAMole /></ProtectedRoute>} />
        <Route path="/games/platformer" element={<ProtectedRoute><Platformer /></ProtectedRoute>} />
        <Route path="/games/jump" element={<ProtectedRoute><JumpGame /></ProtectedRoute>} />
        <Route path="/games/maze" element={<ProtectedRoute><Maze /></ProtectedRoute>} />
        <Route path="/games/bubble" element={<ProtectedRoute><BubbleShooter /></ProtectedRoute>} />
        <Route path="/games/brick" element={<ProtectedRoute><Brick /></ProtectedRoute>} />
        <Route path="/games/dino" element={<ProtectedRoute><Dino /></ProtectedRoute>} />
        <Route path="/games/color" element={<ProtectedRoute><ColorMatch /></ProtectedRoute>} />
        <Route path="/games/fruit" element={<ProtectedRoute><FruitNinja /></ProtectedRoute>} />
        <Route path="/games/racing" element={<ProtectedRoute><CarRace /></ProtectedRoute>} />
        <Route path="/games/tower" element={<ProtectedRoute><TowerDefense /></ProtectedRoute>} />
        <Route path="/games/puzzle" element={<ProtectedRoute><PlatformPuzzleGame /></ProtectedRoute>} />
        <Route path="/games/shooting" element={<ProtectedRoute><ShootingGallery /></ProtectedRoute>} />
        <Route path="/games/golf" element={<ProtectedRoute><MiniGolfGame /></ProtectedRoute>} />
        <Route path="/contact" element={<Contact />} />
         <Route path="/privacy" element={<Privacy />} />

        {/* 🔚 Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
