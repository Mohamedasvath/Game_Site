import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const baseColors = [
  "#f87171", "#60a5fa", "#34d399", "#facc15",
  "#a78bfa", "#f97316", "#06b6d4", "#f43f5e"
];

export default function ColorMatchGame() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem("color-match-high") || 0));
  const [disabled, setDisabled] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [particles, setParticles] = useState([]);
  const [dragging, setDragging] = useState(false);

  const initGame = (lvl = 1) => {
    const totalPairs = Math.min(baseColors.length, lvl + 3); 
    const doubled = [...baseColors.slice(0, totalPairs), ...baseColors.slice(0, totalPairs)];
    const shuffled = doubled
      .map((color) => ({ color, id: Math.random() }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setDisabled(false);
    setGameOver(false);
    setTimeLeft(60 - lvl * 5 > 10 ? 60 - lvl * 5 : 10);
    setParticles([]);
  };

  useEffect(() => {
    initGame(level);
  }, [level]);

  const handleFlip = (index) => {
    if (disabled || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      const [first, second] = newFlipped;
      if (cards[first].color === cards[second].color) {
        const newParticles = [...Array(20).keys()].map(() => ({
          x: first,
          y: second,
          color: cards[first].color,
          angle: Math.random() * Math.PI * 2,
          speed: 2 + Math.random() * 2,
          life: 30
        }));
        setParticles((prev) => [...prev, ...newParticles]);
        setMatched((prev) => [...prev, first, second]);
        setScore((prev) => prev + 10 * level);
        setDisabled(false);
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 800);
      }
    }
  };

  // Drag-to-flip logic
  const handleTouchMove = (e) => {
    if (!dragging) return;
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;
    const index = elem.dataset.index;
    if (index !== undefined) {
      handleFlip(Number(index));
    }
  };

  const handleTouchStart = () => setDragging(true);
  const handleTouchEnd = () => setDragging(false);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const best = Math.max(score, highScore);
      setHighScore(best);
      localStorage.setItem("color-match-high", String(best));
      setGameOver(true);
    }
  }, [matched]);

  useEffect(() => {
    if (!gameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameOver]);

  const nextLevel = () => setLevel((prev) => prev + 1);

  const getGridColumns = () => {
    const count = cards.length;
    if (count <= 8) return "grid-cols-4";
    if (count <= 12) return "grid-cols-4";
    if (count <= 16) return "grid-cols-4";
    if (count <= 24) return "grid-cols-6";
    return "grid-cols-6";
  };

  useEffect(() => {
    if (!particles.length) return;
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map(p => ({ ...p, x: p.x + Math.cos(p.angle) * p.speed, y: p.y + Math.sin(p.angle) * p.speed, life: p.life - 1 }))
          .filter(p => p.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [particles]);

  return (
    <motion.div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative">
      <div className="w-full max-w-[640px] flex items-center justify-between mb-4 flex-wrap gap-2">
        {/* <button
          onClick={() => navigate("/games")}
          className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600"
        >
          ⬅ Back
        </button> */}
        <h1 className="text-xl md:text-2xl font-extrabold text-cyan-400 drop-shadow">
          Color Match - Level {level} (Hard)
        </h1>
        <button
          onClick={() => initGame(level)}
          className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600"
        >
          ↻ Restart
        </button>
      </div>

      <div
        className={`grid gap-4 w-full max-w-[640px] ${getGridColumns()}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <motion.div
              key={card.id}
              data-index={index}
              className="w-full pt-[100%] relative rounded-lg shadow-lg cursor-pointer select-none"
              onClick={() => handleFlip(index)}
              layout
            >
              <div className="absolute inset-0 rounded-lg border-2 border-gray-700 bg-gray-800 flex items-center justify-center">
                {isFlipped && (
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: card.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 w-full max-w-[640px] flex justify-between text-white font-bold text-lg flex-wrap gap-2">
        <div>Score: {score}</div>
        <div>High: {highScore}</div>
        <div>Time: {timeLeft}s</div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: p.color,
              position: "absolute",
              left: `${(p.x / cards.length) * 100}%`,
              top: `${(p.y / cards.length) * 100}%`,
            }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70"
          >
            <div className="bg-gray-900 border border-cyan-400 rounded-2xl p-6 text-center shadow-2xl max-w-[90vw]">
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">
                {matched.length === cards.length ? "Level Complete!" : "Time's Up!"}
              </h2>
              <p className="text-cyan-100 mb-4">
                Score: {score} &nbsp;•&nbsp; High: {highScore}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {matched.length === cards.length && (
                  <button
                    onClick={nextLevel}
                    className="px-5 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600"
                  >
                    Next Level
                  </button>
                )}
                <button
                  onClick={() => initGame(level)}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
                >
                  Replay Level
                </button>
                <button
                  onClick={() => navigate("/games")}
                  className="px-5 py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600"
                >
                  Back to Games
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
