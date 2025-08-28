// src/games/Tetris.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/** ---------- CONFIG ---------- */
const COLS = 10;
const ROWS = 20;
const CELL = 24;

const TETROMINOES = {
  I: { color: "#22d3ee", shapes: [[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],[[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]] },
  J: { color: "#60a5fa", shapes: [[[1,0,0],[1,1,1],[0,0,0]],[[0,1,1],[0,1,0],[0,1,0]],[[0,0,0],[1,1,1],[0,0,1]],[[0,1,0],[0,1,0],[1,1,0]]] },
  L: { color: "#f59e0b", shapes: [[[0,0,1],[1,1,1],[0,0,0]],[[0,1,0],[0,1,0],[0,1,1]],[[0,0,0],[1,1,1],[1,0,0]],[[1,1,0],[0,1,0],[0,1,0]]] },
  O: { color: "#fbbf24", shapes: [[[1,1],[1,1]]] },
  S: { color: "#34d399", shapes: [[[0,1,1],[1,1,0],[0,0,0]],[[0,1,0],[0,1,1],[0,0,1]]] },
  T: { color: "#a78bfa", shapes: [[[0,1,0],[1,1,1],[0,0,0]],[[0,1,0],[0,1,1],[0,1,0]],[[0,0,0],[1,1,1],[0,1,0]],[[0,1,0],[1,1,0],[0,1,0]]] },
  Z: { color: "#ef4444", shapes: [[[1,1,0],[0,1,1],[0,0,0]],[[0,0,1],[0,1,1],[0,1,0]]] },
};
const KEYS = Object.keys(TETROMINOES);
const randomKey = () => KEYS[(Math.random() * KEYS.length) | 0];
const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

/** ---------- HELPERS ---------- */
function spawnPiece(key = randomKey()) {
  const def = TETROMINOES[key];
  const rotation = 0;
  const shape = def.shapes[rotation];
  return { key, rotation, x: Math.floor((COLS - shape[0].length) / 2), y: -getTopOffset(shape) };
}
function getTopOffset(shape) {
  let offset = 0;
  for (let r = 0; r < shape.length; r++) {
    if (shape[r].every((c) => c === 0)) offset++;
    else break;
  }
  return offset;
}
function getShape(piece) { return TETROMINOES[piece.key].shapes[piece.rotation]; }
function collide(board, piece) {
  const shape = getShape(piece);
  for (let y = 0; y < shape.length; y++)
    for (let x = 0; x < shape[y].length; x++)
      if (shape[y][x]) {
        const boardX = piece.x + x;
        const boardY = piece.y + y;
        if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true;
        if (boardY >= 0 && board[boardY][boardX]) return true;
      }
  return false;
}
function merge(board, piece) {
  const b = board.map((r) => r.slice());
  const shape = getShape(piece);
  const color = TETROMINOES[piece.key].color;
  for (let y = 0; y < shape.length; y++)
    for (let x = 0; x < shape[y].length; x++)
      if (shape[y][x] && piece.y + y >= 0) b[piece.y + y][piece.x + x] = color;
  return b;
}
function rotate(piece, dir = 1) {
  const def = TETROMINOES[piece.key];
  return { ...piece, rotation: (piece.rotation + dir + def.shapes.length) % def.shapes.length };
}
function clearLines(board) {
  const kept = board.filter((row) => row.some((c) => !c) || row.every((c) => !c));
  const cleared = ROWS - kept.length;
  const newRows = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { board: [...newRows, ...kept], cleared };
}

/** ---------- COMPONENT ---------- */
export default function Tetris() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(emptyBoard);
  const [current, setCurrent] = useState(spawnPiece());
  const [nextKey, setNextKey] = useState(randomKey());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const fallDelay = useMemo(() => Math.max(100, 800 - (level - 1) * 70), [level]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const prevent = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", prevent, { passive: false });
    return () => window.removeEventListener("keydown", prevent);
  }, []);

  useEffect(() => {
    if (paused || gameOver) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => step(), fallDelay);
    return () => clearInterval(intervalRef.current);
  }, [current, paused, gameOver, fallDelay]);

  const step = (soft = false) => {
    setCurrent((prev) => {
      const moved = { ...prev, y: prev.y + 1 };
      if (!collide(board, moved)) return moved;

      const merged = merge(board, prev);
      const { board: clearedBoard, cleared } = clearLines(merged);
      if (cleared) {
        setLines((l) => l + cleared);
        const table = { 1: 40, 2: 100, 3: 300, 4: 1200 };
        setScore((s) => s + (table[cleared] || 0) * level);
        setLevel((lv) => 1 + Math.floor((lines + cleared) / 10));
      }
      setBoard(clearedBoard);

      const spawn = spawnPiece(nextKey);
      setNextKey(randomKey());
      if (collide(clearedBoard, spawn)) setGameOver(true);
      return spawn;
    });

    if (soft) setScore((s) => s + 1);
  };

  const hardDrop = () => {
    if (gameOver || paused) return;
    let ghost = { ...current };
    let drops = 0;
    while (!collide(board, { ...ghost, y: ghost.y + 1 })) {
      ghost.y++;
      drops++;
    }
    setCurrent(ghost);
    setScore((s) => s + drops * 2);
    step();
  };

  const tryMove = (dx) => {
    if (paused || gameOver) return;
    setCurrent((p) => {
      const moved = { ...p, x: p.x + dx };
      return collide(board, moved) ? p : moved;
    });
  };

  const tryRotate = () => {
    if (paused || gameOver) return;
    setCurrent((p) => {
      const r = rotate(p, 1);
      const left = { ...r, x: r.x - 1 };
      const right = { ...r, x: r.x + 1 };
      if (!collide(board, r)) return r;
      if (!collide(board, left)) return left;
      if (!collide(board, right)) return right;
      return p;
    });
  };

  const reset = () => {
    setBoard(emptyBoard());
    setCurrent(spawnPiece());
    setNextKey(randomKey());
    setScore(0);
    setLines(0);
    setLevel(1);
    setPaused(false);
    setGameOver(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (gameOver) return;
      if (e.key === "p" || e.key === "P") {
        setPaused((p) => !p);
        return;
      }
      if (paused) return;

      switch (e.key) {
        case "ArrowLeft": tryMove(-1); break;
        case "ArrowRight": tryMove(1); break;
        case "ArrowDown": step(true); break;
        case "ArrowUp": case "x": case "X": tryRotate(); break;
        case " ": hardDrop(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [board, current, paused, gameOver, level, lines]);

  const ghost = useMemo(() => {
    let g = { ...current };
    while (!collide(board, { ...g, y: g.y + 1 })) g.y++;
    return g;
  }, [current, board]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-gray-900 to-black text-white p-3">
      {/* Header */}
      <div className="w-full max-w-[480px] flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* <button
            onClick={() => navigate("/")}
            className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 shadow text-sm"
          >
            ← Back
          </button> */}
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wider">✨ Neon Tetris</h1>
        </div>
        <div className="text-right">
          <div className="text-sm md:text-base">Score: <span className="font-bold">{score}</span></div>
          <div className="text-xs md:text-sm">Lines: {lines}</div>
          <div className="text-xs md:text-sm">Level: {level}</div>
        </div>
      </div>

      {/* Game + Sidebar */}
      <div className="w-full max-w-[480px] flex gap-3 items-start justify-center">
        {/* Board */}
        <motion.div
          className="relative border-4 rounded-xl bg-black/60"
          style={{ width: COLS * CELL, height: ROWS * CELL, boxShadow: "0 0 30px rgba(168,85,247,0.35), inset 0 0 30px rgba(59,130,246,0.2)", borderColor: "#8b5cf6" }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {board.map((row, y) =>
            row.map((color, x) =>
              color ? <div key={`b-${x}-${y}`} className="absolute rounded-[4px] shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                style={{ left: x * CELL, top: y * CELL, width: CELL - 1, height: CELL - 1, background: `linear-gradient(135deg, ${color}, #111827)`, boxShadow: `0 0 12px ${color}66` }} /> : null
            )
          )}

          {/* Ghost */}
          {ghost && getShape(ghost).map((r, dy) =>
            r.map((v, dx) => v ? <div key={`g-${dx}-${dy}`} className="absolute rounded-[4px] border border-white/10"
              style={{ left: (ghost.x + dx) * CELL, top: (ghost.y + dy) * CELL, width: CELL - 1, height: CELL - 1, background: TETROMINOES[ghost.key].color + "55" }} /> : null)
          )}

          {/* Current piece */}
          {current && getShape(current).map((r, dy) =>
            r.map((v, dx) => v ? <motion.div key={`c-${dx}-${dy}`} className="absolute rounded-[4px]"
              style={{ left: (current.x + dx) * CELL, top: (current.y + dy) * CELL, width: CELL - 1, height: CELL - 1, background: `radial-gradient(circle at 30% 30%, #fff8, ${TETROMINOES[current.key].color})`, boxShadow: `0 0 14px ${TETROMINOES[current.key].color}AA` }}
              initial={{ scale: 0.8, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.08 }} /> : null)
          )}
        </motion.div>

        {/* Sidebar Next & Buttons */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="text-sm mb-2 opacity-80">Next</div>
          <div className="relative border rounded-lg p-2" style={{ width: 5 * CELL, height: 5 * CELL, borderColor: "#334155" }}>
            {TETROMINOES[nextKey].shapes[0].map((r, y) =>
              r.map((v, x) => v ? <div key={`n-${x}-${y}`} className="absolute rounded-[4px]" style={{
                left: (x + Math.floor((5 - r.length) / 2)) * CELL,
                top: (y + Math.floor((5 - r.length) / 2)) * CELL,
                width: CELL - 1, height: CELL - 1,
                background: `linear-gradient(135deg, ${TETROMINOES[nextKey].color}, #0b1020)`,
                boxShadow: `0 0 10px ${TETROMINOES[nextKey].color}77`
              }} /> : null)
            )}
          </div>
          <button onClick={() => setPaused(p => !p)} className="mt-3 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 shadow active:scale-95 transition">{paused ? "Resume" : "Pause"}</button>
          <button onClick={reset} className="mt-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 shadow active:scale-95 transition">Restart</button>
        </div>
      </div>

      {/* Footer: Mobile Controls */}
      <div className="w-full max-w-[480px] mt-4 sm:mt-2 grid grid-cols-3 gap-3 sm:hidden">
        <div />
        <button onClick={tryRotate} className="h-14 rounded-xl bg-purple-600 shadow-lg active:scale-95">⟳</button>
        <div />
        <button onClick={() => tryMove(-1)} className="h-14 rounded-xl bg-purple-600 shadow-lg active:scale-95">⟵</button>
        <button onClick={() => step(true)} className="h-14 rounded-xl bg-emerald-600 shadow-lg active:scale-95">⟱</button>
        <button onClick={() => tryMove(1)} className="h-14 rounded-xl bg-purple-600 shadow-lg active:scale-95">⟶</button>
        <div />
        <button onClick={hardDrop} className="h-14 rounded-xl bg-sky-600 shadow-lg active:scale-95">⤓</button>
        <div />
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 text-center bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,.35)]">
            <h2 className="text-2xl font-extrabold text-purple-300">Game Over</h2>
            <p className="mt-2">Score: <span className="font-bold">{score}</span></p>
            <p className="opacity-80 text-sm">Lines: {lines} • Level: {level}</p>
            <button onClick={reset} className="mt-4 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 shadow active:scale-95 transition">Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
