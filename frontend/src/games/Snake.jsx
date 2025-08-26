import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const GRID_SIZE = 20;
const CELL_SIZE = 22;

export default function SnakeGame() {
  const navigate = useNavigate();

  const [snake, setSnake] = useState([
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ]);
  const [food, setFood] = useState({ x: 12, y: 10 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case "ArrowUp":
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE ||
          newSnake.some((cell) => cell.x === head.x && cell.y === head.y)
        ) {
          setGameOver(true);
          return prevSnake;
        }

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 1);
          setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [direction, food, gameOver]);

  const resetGame = () => {
    setSnake([
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 },
    ]);
    setFood({ x: 12, y: 10 });
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
  };

  const move = (dir) => {
    if (dir === "up" && direction.y !== 1) setDirection({ x: 0, y: -1 });
    if (dir === "down" && direction.y !== -1) setDirection({ x: 0, y: 1 });
    if (dir === "left" && direction.x !== 1) setDirection({ x: -1, y: 0 });
    if (dir === "right" && direction.x !== -1) setDirection({ x: 1, y: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-black text-white p-3">
      {/* Back Button */}
      <div className="w-full max-w-[480px] flex justify-between items-center mb-3">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600"
        >
          ⬅ Back
        </button>
        <h1 className="text-3xl font-bold text-white">🐍 Neon Snake</h1>
        <div className="w-20"></div>
      </div>

      <p className="mb-2 text-lg">Score: {score}</p>

      <motion.div
        className="relative border-4 border-purple-500 shadow-[0_0_20px_#a855f7]"
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {snake.map((cell, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-md"
            style={{
              left: cell.x * CELL_SIZE,
              top: cell.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              background:
                idx === 0
                  ? "radial-gradient(circle, #34d399, #059669)"
                  : "linear-gradient(45deg, #22d3ee, #3b82f6)",
            }}
            animate={{ scale: idx === 0 ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 0.6 }}
          />
        ))}

        <motion.div
          className="absolute rounded-full shadow-[0_0_10px_#f43f5e]"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            background: "radial-gradient(circle, #f43f5e, #b91c1c)",
          }}
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </motion.div>

      {gameOver && (
        <div className="mt-4 text-center">
          <p className="text-xl font-bold text-red-400">Game Over 😢</p>
          <button
            onClick={resetGame}
            className="mt-2 bg-purple-600 px-5 py-2 rounded-lg hover:bg-purple-700 transition-all"
          >
            Restart
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
        <div></div>
        <button
          onClick={() => move("up")}
          className="bg-purple-600 w-16 h-16 rounded-xl text-xl font-bold shadow-lg active:scale-90"
        >
          ⬆
        </button>
        <div></div>

        <button
          onClick={() => move("left")}
          className="bg-purple-600 w-16 h-16 rounded-xl text-xl font-bold shadow-lg active:scale-90"
        >
          ⬅
        </button>
        <div></div>
        <button
          onClick={() => move("right")}
          className="bg-purple-600 w-16 h-16 rounded-xl text-xl font-bold shadow-lg active:scale-90"
        >
          ➡
        </button>

        <div></div>
        <button
          onClick={() => move("down")}
          className="bg-purple-600 w-16 h-16 rounded-xl text-xl font-bold shadow-lg active:scale-90"
        >
          ⬇
        </button>
        <div></div>
      </div>
    </div>
  );
}
