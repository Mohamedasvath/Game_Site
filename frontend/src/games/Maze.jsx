import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function MazeGame() {
  const navigate = useNavigate();

  // Bigger levels
  const levels = [
    [
      [0, 1, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 1, 0],
      [1, 1, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 2],
    ],
    [
      [0, 1, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 2],
    ],
    [
      [0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    ],
  ];

  const [level, setLevel] = useState(0);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState(30); // Move limit per level
  const [win, setWin] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const maze = levels[level];

  // ✅ Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (win || gameOver || gameComplete) return;
      if (e.key === "ArrowUp") move(0, -1);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1, 0);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player, win, gameOver, gameComplete]);

  // ✅ Touch controls
  let touchStartX = 0;
  let touchStartY = 0;
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) move(1, 0);
      else move(-1, 0);
    } else {
      if (dy > 0) move(0, 1);
      else move(0, -1);
    }
  };

  // Move player
  const move = (dx, dy) => {
    if (moves <= 0) {
      setGameOver(true);
      return;
    }

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (
      newX >= 0 &&
      newY >= 0 &&
      newY < maze.length &&
      newX < maze[0].length &&
      maze[newY][newX] !== 1
    ) {
      setPlayer({ x: newX, y: newY });
      setMoves((prev) => prev - 1);

      if (maze[newY][newX] === 2) {
        setWin(true);
        if (level === levels.length - 1) {
          setGameComplete(true);
        }
      }
    }
  };

  // Next level
  const nextLevel = () => {
    setWin(false);
    setPlayer({ x: 0, y: 0 });
    setMoves(30 + level * 10); // More moves in higher levels
    setLevel((prev) => prev + 1);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Back button */}
      <div className="absolute top-3 left-3">
       
      </div>

      <h1 className="text-2xl md:text-4xl font-bold text-cyan-400 mb-4">
        Maze Puzzle 🌀 (Level {level + 1})
      </h1>
      <p className="mb-4 text-lg">Moves Left: {moves}</p>

      {/* Maze grid */}
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${maze[0].length}, minmax(35px, 55px))`,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {maze.map((row, y) =>
          row.map((cell, x) => {
            const isPlayer = player.x === x && player.y === y;
            return (
              <div
                key={`${x}-${y}`}
                className={`w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-md ${
                  cell === 1
                    ? "bg-gray-700"
                    : cell === 2
                    ? "bg-green-500"
                    : "bg-gray-900 border border-gray-600"
                }`}
              >
                {isPlayer && (
                  <motion.div
                    className="text-2xl md:text-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    😼
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Popups */}
      <AnimatePresence>
        {win && !gameComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute bg-black bg-opacity-80 text-green-400 text-2xl p-6 rounded-xl shadow-lg"
          >
            🎉 Level {level + 1} Completed!
            <button
              onClick={nextLevel}
              className="mt-4 px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600"
            >
              Next Level →
            </button>
          </motion.div>
        )}

        {gameOver && !win && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute bg-black bg-opacity-80 text-red-400 text-2xl p-6 rounded-xl shadow-lg"
          >
            ❌ Out of Moves! Game Over
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600"
            >
              Restart
            </button>
          </motion.div>
        )}

        {gameComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute bg-black bg-opacity-80 text-yellow-400 text-2xl p-6 rounded-xl shadow-lg"
          >
            🏆 You Beat All Levels!
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-600"
            >
              Restart Game
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
