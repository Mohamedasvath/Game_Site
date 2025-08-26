import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function TicTacToe() {
  const navigate = useNavigate();

  // game state
  const emptyBoard = Array(9).fill(null);
  const [board, setBoard] = useState(emptyBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ player: 0, computer: 0, draw: 0 });
  const [round, setRound] = useState(1);
  const [finalPopup, setFinalPopup] = useState(false);

  // responsive
  const [boardSize, setBoardSize] = useState(360);

  useEffect(() => {
    const measure = () => {
      const max = 360;
      const vw90 = Math.floor(window.innerWidth * 0.9);
      const size = Math.min(max, vw90, window.innerHeight - 200);
      setBoardSize(size > 120 ? size : 120);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // winner detection
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  const checkWinner = (brd) => {
    for (let [a, b, c] of lines) {
      if (brd[a] && brd[a] === brd[b] && brd[a] === brd[c]) return brd[a];
    }
    return brd.includes(null) ? null : "Draw";
  };

  // minimax
  const minimax = (newBoard, isMaximizing) => {
    const result = checkWinner(newBoard);
    if (result === "X") return -1;
    if (result === "O") return 1;
    if (result === "Draw") return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      newBoard.forEach((cell, idx) => {
        if (!cell) {
          newBoard[idx] = "O";
          const score = minimax(newBoard, false);
          newBoard[idx] = null;
          bestScore = Math.max(score, bestScore);
        }
      });
      return bestScore;
    } else {
      let bestScore = Infinity;
      newBoard.forEach((cell, idx) => {
        if (!cell) {
          newBoard[idx] = "X";
          const score = minimax(newBoard, true);
          newBoard[idx] = null;
          bestScore = Math.min(score, bestScore);
        }
      });
      return bestScore;
    }
  };

  const bestMove = (brd) => {
    let move;
    let bestScore = -Infinity;
    brd.forEach((cell, idx) => {
      if (!cell) {
        brd[idx] = "O";
        const score = minimax(brd, false);
        brd[idx] = null;
        if (score > bestScore) {
          bestScore = score;
          move = idx;
        }
      }
    });
    return move;
  };

  const handleClick = (i) => {
    if (!isPlayerTurn || board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  // computer move
  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const t = setTimeout(() => {
        const move = bestMove([...board]);
        if (move !== undefined) {
          const newBoard = [...board];
          newBoard[move] = "O";
          setBoard(newBoard);
        }
        setIsPlayerTurn(true);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isPlayerTurn, board, winner]);

  // monitor winner
  useEffect(() => {
    const result = checkWinner(board);
    if (result && !winner) {
      setWinner(result);
      setScores((s) => {
        if (result === "X") return { ...s, player: s.player + 1 };
        if (result === "O") return { ...s, computer: s.computer + 1 };
        return { ...s, draw: s.draw + 1 };
      });
    }
  }, [board]);

  // next round
  const nextRound = () => {
    if (round < 5) {
      setRound((r) => r + 1);
      setBoard(emptyBoard);
      setIsPlayerTurn(true);
      setWinner(null);
    } else {
      setFinalPopup(true);
    }
  };

  const resetGame = () => {
    setScores({ player: 0, computer: 0, draw: 0 });
    setRound(1);
    setFinalPopup(false);
    setBoard(emptyBoard);
    setIsPlayerTurn(true);
    setWinner(null);
  };

  const cellSize = boardSize / 3;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg"
        >
          ⬅ Back
        </button>
        <div className="text-white text-sm">
          Round {round}/5
        </div>
        <div className="text-white text-sm">
          🟢 {scores.player} | 🔴 {scores.computer} | 🤝 {scores.draw}
        </div>
      </div>

      {/* Board */}
      <div
        style={{
          width: boardSize,
          height: boardSize,
        }}
        className="grid grid-cols-3 grid-rows-3 gap-2"
      >
        {board.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className="bg-gray-800 rounded-lg flex items-center justify-center select-none"
            style={{ width: "100%", height: "100%" }}
          >
            <AnimatePresence>
              {cell && (
                <motion.div
                  key={cell + idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{
                    width: Math.round(cellSize * 0.45),
                    height: Math.round(cellSize * 0.45),
                    borderRadius: "50%",
                    background: cell === "X" ? "#16a34a" : "#ef4444",
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Turn */}
      {!winner && (
        <div className="mt-4 text-white text-lg">
          Turn: {isPlayerTurn ? "🟢 Player" : "🔴 Computer"}
        </div>
      )}

      {/* Winner popup per round */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60"
          >
            <motion.div
              initial={{ y: -40 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 text-center"
            >
              <h3 className="text-xl font-semibold mb-3">
                {winner === "Draw"
                  ? "🤝 It's a Draw!"
                  : winner === "X"
                  ? "🟢 Player Wins!"
                  : "🔴 Computer Wins!"}
              </h3>
              <button
                onClick={nextRound}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                {round < 5 ? "Next Round" : "Finish"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final popup after 5 rounds */}
      <AnimatePresence>
        {finalPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70"
          >
            <motion.div
              initial={{ y: -40 }}
              animate={{ y: 0 }}
              className="bg-red-400 rounded-2xl shadow-xl p-6 text-center"
            >
              <h2 className="text-xl font-bold mb-4">🏁 Final Result</h2>
              <p>🟢 Player: {scores.player}</p>
              <p>🔴 Computer: {scores.computer}</p>
              <p>🤝 Draws: {scores.draw}</p>

              <h3 className="mt-3 font-semibold">
                {scores.player > scores.computer
                  ? "🎉 Player is the Champion!"
                  : scores.computer > scores.player
                  ? "🤖 Computer Wins the Match!"
                  : "🤝 It's a Tie Overall!"}
              </h3>

              <div className="flex gap-3 mt-4 justify-center">
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg"
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
