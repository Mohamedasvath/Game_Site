import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GRID_SIZE = 4;

export default function Game2048() {
  const navigate = useNavigate();
  const [grid, setGrid] = useState(generateEmptyGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Initialize grid
  useEffect(() => {
    const newGrid = generateEmptyGrid();
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    setGrid(newGrid);
  }, []);

  // Keyboard control
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        move(e.key);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [grid, gameOver]);

  // Mobile swipe
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
    };

    const handleTouchEnd = (e) => {
      if (gameOver) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? move("ArrowRight") : move("ArrowLeft");
      } else {
        dy > 0 ? move("ArrowDown") : move("ArrowUp");
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [grid, gameOver]);

  function generateEmptyGrid() {
    return Array(GRID_SIZE)
      .fill(0)
      .map(() => Array(GRID_SIZE).fill(0));
  }

  function addRandomTile(g) {
    const empty = [];
    g.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell === 0) empty.push([i, j]);
      })
    );
    if (empty.length === 0) return;
    const [i, j] = empty[Math.floor(Math.random() * empty.length)];
    g[i][j] = Math.random() < 0.9 ? 2 : 4;
  }

  function canMove(g) {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (g[i][j] === 0) return true;
        if (i < GRID_SIZE - 1 && g[i][j] === g[i + 1][j]) return true;
        if (j < GRID_SIZE - 1 && g[i][j] === g[i][j + 1]) return true;
      }
    }
    return false;
  }

  // Slide and merge helper
  function slideAndMerge(row) {
    let arr = row.filter((x) => x !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        setScore((s) => s + arr[i]);
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter((x) => x !== 0);
    while (arr.length < GRID_SIZE) arr.push(0);
    return arr;
  }

  function move(direction) {
    let newGrid = grid.map((row) => [...row]);
    let moved = false;

    const rotate = (matrix) => matrix[0].map((_, i) => matrix.map((row) => row[i]));
    const reverse = (matrix) => matrix.map((row) => row.reverse());

    if (direction === "ArrowUp") {
      newGrid = rotate(newGrid);
      newGrid = newGrid.map((row) => {
        const newRow = slideAndMerge(row);
        if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true;
        return newRow;
      });
      newGrid = rotate(newGrid);
      newGrid = rotate(newGrid);
      newGrid = rotate(newGrid);
    } else if (direction === "ArrowDown") {
      newGrid = rotate(newGrid);
      newGrid = reverse(newGrid);
      newGrid = newGrid.map((row) => {
        const newRow = slideAndMerge(row);
        if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true;
        return newRow;
      });
      newGrid = reverse(newGrid);
      newGrid = rotate(newGrid);
      newGrid = rotate(newGrid);
      newGrid = rotate(newGrid);
    } else if (direction === "ArrowLeft") {
      newGrid = newGrid.map((row) => {
        const newRow = slideAndMerge(row);
        if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true;
        return newRow;
      });
    } else if (direction === "ArrowRight") {
      newGrid = newGrid.map((row) => {
        const reversedRow = row.reverse();
        const newRow = slideAndMerge(reversedRow).reverse();
        if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true;
        return newRow;
      });
    }

    if (moved) {
      addRandomTile(newGrid);
      setGrid(newGrid);
      if (!canMove(newGrid)) setGameOver(true);
    }
  }

  // Tile colors
  const tileColors = {
    0: "bg-gray-300",
    2: "bg-yellow-200",
    4: "bg-yellow-300",
    8: "bg-orange-300 text-white",
    16: "bg-orange-400 text-white",
    32: "bg-red-400 text-white",
    64: "bg-red-500 text-white",
    128: "bg-purple-500 text-white",
    256: "bg-purple-600 text-white",
    512: "bg-indigo-600 text-white",
    1024: "bg-indigo-700 text-white",
    2048: "bg-green-500 text-white",
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 p-4">
      {/* Back Button */}
      <div className="absolute top-3 left-3 z-50">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow hover:bg-pink-600"
        >
          ⬅ Back
        </button>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">2048 Game</h1>
      <div className="mb-4 text-white text-xl">Score: {score}</div>

      <div className="grid grid-cols-4 gap-3 bg-gray-800 p-3 rounded-xl">
        {grid.flat().map((cell, idx) => (
          <div
            key={idx}
            className={`w-20 h-20 flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-200
              ${tileColors[cell] || "bg-gray-100 text-white"}`}
          >
            {cell !== 0 ? cell : ""}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white text-2xl p-6 rounded-xl">
          Game Over 💀
          <button
            onClick={() => {
              const newGrid = generateEmptyGrid();
              addRandomTile(newGrid);
              addRandomTile(newGrid);
              setGrid(newGrid);
              setScore(0);
              setGameOver(false);
            }}
            className="mt-4 px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
