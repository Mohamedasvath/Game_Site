import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Hangman.jsx
 * - Responsive layout: board + SVG hangman scale to the container (max width limited)
 * - Keyboard buttons for mobile, physical keyboard support for desktop
 * - Back button to /games
 * - Framer Motion popups for Win/Lose
 */

const WORDS = [
  "react", "javascript", "hangman", "developer", "mobile", "responsive",
  "computer", "keyboard", "program", "interface", "component", "router",
  "animation", "canvas", "function", "variable", "debug", "design"
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Hangman() {
  const navigate = useNavigate();

  const [targetWord, setTargetWord] = useState("");
  const [guessed, setGuessed] = useState([]); // letters guessed (uppercase)
  const [wrongCount, setWrongCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [maxWrong] = useState(6);
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  const boardRef = useRef(null);

  // pick random word and reset
  const startNew = (word = null) => {
    const w = (word || WORDS[Math.floor(Math.random() * WORDS.length)]).toUpperCase();
    setTargetWord(w);
    setGuessed([]);
    setWrongCount(0);
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => {
    startNew();
    // physical keyboard listener
    const handler = (e) => {
      if (gameOver) return;
      const key = e.key.toUpperCase();
      if (ALPHABET.includes(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when guessed changes, check win/lose
  useEffect(() => {
    if (!targetWord) return;
    const letters = targetWord.split("");
    const allRevealed = letters.every((l) => l === " " || guessed.includes(l));
    if (allRevealed) {
      setWon(true);
      setGameOver(true);
      setRoundsPlayed((r) => r + 1);
    } else if (wrongCount >= maxWrong) {
      setWon(false);
      setGameOver(true);
      setRoundsPlayed((r) => r + 1);
    }
  }, [guessed, wrongCount, targetWord, maxWrong]);

  const handleGuess = (letter) => {
    if (gameOver) return;
    letter = letter.toUpperCase();
    if (guessed.includes(letter)) return; // already guessed
    const newGuessed = [...guessed, letter];
    setGuessed(newGuessed);
    if (!targetWord.includes(letter)) {
      setWrongCount((w) => w + 1);
    }
  };

  const handleReset = () => {
    startNew();
    setRoundsPlayed(0);
  };

  const handleNext = () => {
    startNew();
  };

  // helper to render word with underscores and spaces
  const renderWord = () => {
    return targetWord.split("").map((ch, idx) => {
      if (ch === " ") {
        return (
          <div key={idx} className="w-6 md:w-8 h-6 md:h-8" />
        );
      }
      const revealed = guessed.includes(ch);
      return (
        <div
          key={idx}
          className={`flex items-end justify-center w-8 md:w-12 h-10 md:h-14 mx-1 md:mx-2`}
        >
          <div className="text-2xl md:text-3xl text-white select-none">
            {revealed ? ch : ""}
          </div>
          <div className="absolute mt-8 md:mt-10 w-8 md:w-12 border-b-2 border-gray-400" />
        </div>
      );
    });
  };

  // SVG Hangman parts drawing based on wrongCount (0..maxWrong)
  const HangmanSVG = ({ size = 220 }) => {
    // scale factor
    const stroke = Math.max(2, Math.round(size * 0.02));
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 220 220"
        className="mx-auto"
        aria-hidden
      >
        {/* base */}
        <line x1="20" y1="200" x2="120" y2="200" stroke="#9CA3AF" strokeWidth={stroke} strokeLinecap="round" />
        {/* pole */}
        <line x1="70" y1="200" x2="70" y2="20" stroke="#9CA3AF" strokeWidth={stroke} strokeLinecap="round" />
        {/* top beam */}
        <line x1="70" y1="20" x2="150" y2="20" stroke="#9CA3AF" strokeWidth={stroke} strokeLinecap="round" />
        {/* rope */}
        <line x1="150" y1="20" x2="150" y2="44" stroke="#9CA3AF" strokeWidth={stroke} strokeLinecap="round" />

        {/* head */}
        {wrongCount > 0 && <circle cx="150" cy="64" r="18" stroke="#F87171" strokeWidth={stroke} fill="transparent" />}
        {/* body */}
        {wrongCount > 1 && <line x1="150" y1="82" x2="150" y2="130" stroke="#F87171" strokeWidth={stroke} strokeLinecap="round" />}
        {/* left arm */}
        {wrongCount > 2 && <line x1="150" y1="94" x2="130" y2="110" stroke="#F87171" strokeWidth={stroke} strokeLinecap="round" />}
        {/* right arm */}
        {wrongCount > 3 && <line x1="150" y1="94" x2="170" y2="110" stroke="#F87171" strokeWidth={stroke} strokeLinecap="round" />}
        {/* left leg */}
        {wrongCount > 4 && <line x1="150" y1="130" x2="132" y2="160" stroke="#F87171" strokeWidth={stroke} strokeLinecap="round" />}
        {/* right leg */}
        {wrongCount > 5 && <line x1="150" y1="130" x2="168" y2="160" stroke="#F87171" strokeWidth={stroke} strokeLinecap="round" />}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Top controls */}
        <div className="flex items-center justify-between mb-4">
          {/* <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600"
          >
            ⬅ Back
          </button> */}

          <div className="text-white text-sm md:text-base">
            Attempts: <span className="font-semibold">{wrongCount}/{maxWrong}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleNext}
              className="px-3 py-2 bg-yellow-500 text-black rounded-lg"
            >
              New Word
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-green-600 text-white rounded-lg"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Main area: left = SVG, right = word + keyboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* SVG hangman (responsive) */}
          <div className="md:col-span-1 flex justify-center items-center">
            <div style={{ width: "100%", maxWidth: 260 }}>
              <HangmanSVG size={Math.min(260, Math.max(160, Math.round(boardRef.current?.clientWidth || 220)))} />
            </div>
          </div>

          {/* word + info (spans two columns on md) */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div
              ref={boardRef}
              className="bg-gray-800 rounded-lg p-4 flex flex-wrap justify-center items-center min-h-[72px]"
            >
              {/* render blanks */}
              <div className="flex flex-wrap justify-center items-end">
                {targetWord.split("").map((ch, i) => {
                  const display = ch === " " ? " " : (guessed.includes(ch) ? ch : "");
                  return (
                    <div key={i} className="m-1 flex flex-col items-center">
                      <div className="text-2xl md:text-3xl text-white tracking-widest select-none">
                        {display}
                      </div>
                      <div className="w-8 md:w-10 border-b-2 border-gray-600 mt-2" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* small info & wrong letters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="text-gray-300 text-sm">
                Wrong letters:
                <span className="ml-2 text-red-400 font-semibold">
                  {guessed.filter(l => !targetWord.includes(l)).join(" ")}
                </span>
              </div>
              <div className="text-gray-300 text-sm">
                Rounds played: <span className="text-white font-semibold">{roundsPlayed}</span>
              </div>
            </div>

            {/* on-screen keyboard */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="grid grid-cols-9 gap-2">
                {ALPHABET.map((letter) => {
                  const disabled = guessed.includes(letter) || gameOver;
                  return (
                    <button
                      key={letter}
                      onClick={() => handleGuess(letter)}
                      disabled={disabled}
                      className={`py-2 rounded-md text-sm md:text-base font-medium
                        ${disabled ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600 text-white"}
                        focus:outline-none select-none`}
                      aria-label={`Letter ${letter}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* bottom area */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="text-gray-300">
            Tip: Tap letters (mobile) or use your keyboard (desktop).
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => startNew()}
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg"
            >
              New Word
            </button>
            <button
              onClick={() => { setGuessed([]); setWrongCount(0); setGameOver(false); setWon(false); }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg"
            >
              Clear Guesses
            </button>
          </div>
        </div>
      </div>

      {/* round/word result popup (win/lose) */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-40"
          >
            <motion.div
              initial={{ y: -40, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-2">
                {won ? "🎉 You Win!" : "😞 You Lost"}
              </h2>
              {!won && (
                <p className="text-sm text-gray-600 mb-4">
                  The word was: <span className="font-mono text-gray-800">{targetWord}</span>
                </p>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    nextRound();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Next Word
                </button>
                <button
                  onClick={() => {
                    handleReset();
                  }}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg"
                >
                  Reset All
                </button>
                <button
                  onClick={() => navigate("/games")}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                >
                  Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
