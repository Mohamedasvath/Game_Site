import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function WhacAMole() {
  const navigate = useNavigate();
  const [holes, setHoles] = useState(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [hammerPos, setHammerPos] = useState({ x: 0, y: 0 });
  const [isWhacking, setIsWhacking] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [scorePopups, setScorePopups] = useState([]);

  // Mole speed based on difficulty
  const getSpeed = () => {
    if (difficulty === "low") return 1200;
    if (difficulty === "medium") return 800;
    if (difficulty === "high") return 500;
    return 1000;
  };

  // Mole popping
  useEffect(() => {
    if (gameOver || !difficulty) return;
    const moleInterval = setInterval(() => {
      const newHoles = Array(9).fill(false);
      const randomIndex = Math.floor(Math.random() * 9);
      newHoles[randomIndex] = true;
      setHoles(newHoles);
    }, getSpeed());
    return () => clearInterval(moleInterval);
  }, [gameOver, difficulty]);

  // Timer
  useEffect(() => {
    if (!difficulty) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, difficulty]);

  const whackMole = (index, e) => {
    if (holes[index]) {
      setScore(score + 1);

      // Score popup effect
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      const id = Date.now();
      setScorePopups((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setScorePopups((prev) => prev.filter((popup) => popup.id !== id));
      }, 800);

      const newHoles = [...holes];
      newHoles[index] = false;
      setHoles(newHoles);
    }
  };

  const restartGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setHoles(Array(9).fill(false));
    setDifficulty(null);
  };

  // Cursor tracking
  useEffect(() => {
    const handleMove = (e) => {
      setHammerPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", (e) => {
      if (e.touches[0]) {
        setHammerPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    });
    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  const hammerWhack = () => {
    setIsWhacking(true);
    setTimeout(() => setIsWhacking(false), 150);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-700 to-purple-800 text-white p-4 relative overflow-hidden ${
        difficulty ? "cursor-none" : "cursor-auto"
      }`}
      onClick={hammerWhack}
      onTouchStart={hammerWhack}
      style={{ WebkitTapHighlightColor: "transparent" }} // remove tap highlight on mobile
    >
      {/* Difficulty Selection */}
      {!difficulty && !gameOver && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <h1 className="text-3xl font-bold">🎮 Whac-A-Mole</h1>
          <p className="text-lg">Choose difficulty:</p>
          <div className="flex gap-4">
            <button
              onClick={() => setDifficulty("low")}
              className="px-4 py-2 bg-green-500 rounded-lg shadow hover:bg-green-600"
            >
              Low
            </button>
            <button
              onClick={() => setDifficulty("medium")}
              className="px-4 py-2 bg-yellow-500 rounded-lg shadow hover:bg-yellow-600"
            >
              Medium
            </button>
            <button
              onClick={() => setDifficulty("high")}
              className="px-4 py-2 bg-red-500 rounded-lg shadow hover:bg-red-600"
            >
              High
            </button>
          </div>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-4 py-2 bg-pink-500 rounded-lg shadow hover:bg-pink-600"
          >
            ⬅ Back
          </button>
        </motion.div>
      )}

      {/* Top bar */}
      {difficulty && (
        <div className="w-full max-w-md flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-pink-500 rounded-lg shadow hover:bg-pink-600"
          >
            ⬅ Back
          </button>
          <div className="font-bold">⏱ {timeLeft}s</div>
          <div className="font-bold">🎯 {score}</div>
        </div>
      )}

      {/* Game Grid */}
      {difficulty && !gameOver && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="grid grid-cols-3 gap-4"
        >
          {holes.map((isMole, index) => (
            <motion.div
              key={index}
              onClick={(e) => whackMole(index, e)}
              onTouchStart={(e) => whackMole(index, e)}
              className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer shadow-lg"
              whileTap={{ scale: 0.8 }}
            >
              {isMole && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="text-4xl"
                >
                  🐹
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Game Over */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <h2 className="text-2xl font-bold">🎉 Game Over!</h2>
          <p className="text-lg">Your score: {score}</p>
          <button
            onClick={restartGame}
            className="mt-4 px-6 py-2 bg-green-500 rounded-lg shadow hover:bg-green-600"
          >
            Restart
          </button>
        </motion.div>
      )}

      {/* Score Popups */}
      <AnimatePresence>
        {scorePopups.map((popup) => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute text-yellow-300 font-bold text-xl pointer-events-none"
            style={{ top: popup.y - 20, left: popup.x }}
          >
            +1
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hammer Cursor */}
      {difficulty && (
        <motion.div
          className="absolute text-5xl select-none pointer-events-none"
          style={{
            top: hammerPos.y - 20,
            left: hammerPos.x - 20,
          }}
          animate={{ rotate: isWhacking ? -45 : 0 }}
          transition={{ duration: 0.15 }}
        >
          🔨
        </motion.div>
      )}
    </div>
  );
}
