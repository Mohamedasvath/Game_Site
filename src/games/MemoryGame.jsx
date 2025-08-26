import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function MemoryMatchNeon() {
  const navigate = useNavigate();
  const symbols = ["💖", "🔥", "⚡", "🌟", "🎵", "🍀"];
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const moveLimit = 15; // 🔥 Maximum allowed moves
  const [gameOver, setGameOver] = useState(false);

  // Initialize cards
  useEffect(() => {
    const shuffled = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol }));
    setCards(shuffled);
  }, []);

  const handleFlip = (index) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index) ||
      gameOver
    )
      return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        setMatched((m) => [...m, first, second]);
        setTimeout(() => setFlipped([]), 600);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  // Check move limit
  useEffect(() => {
    if (moves >= moveLimit && matched.length !== cards.length) {
      setGameOver(true);
    }
  }, [moves, matched, cards.length]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      {/* Fixed Back Button */}
      <div className="fixed top-3 left-3 z-50">
       
      </div>

      <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-xl mt-5 animate-pulse text-center ">
        Neon Memory Match 🎇
      </h1>
      <h2 className="text-white mb-4 text-lg text-center">
        Moves: {moves}/{moveLimit}
      </h2>

      {/* Cards Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full max-w-md">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <motion.div
              key={card.id}
              className={`aspect-square w-full rounded-lg shadow-lg flex items-center justify-center cursor-pointer select-none
                          ${isFlipped ? "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" : "bg-gray-900"}`}
              onClick={() => handleFlip(index)}
              animate={{ rotateY: isFlipped ? 0 : 180 }}
              transition={{ duration: 0.5 }}
            >
              <span className={`text-3xl md:text-4xl ${isFlipped ? "text-white" : "text-gray-900"}`}>
                {isFlipped ? card.symbol : ""}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Win Screen */}
      {matched.length === cards.length && !gameOver && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 text-white text-2xl p-6 rounded-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          🎉 You Win! <br /> Moves: {moves}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600"
          >
            Restart
          </button>
        </motion.div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 text-white text-2xl p-6 rounded-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          ❌ Game Over – You Lost <br /> Moves: {moves}/{moveLimit}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600"
          >
            Restart
          </button>
        </motion.div>
      )}
    </div>
  );
}
