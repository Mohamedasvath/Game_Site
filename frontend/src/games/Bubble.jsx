import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function BubbleShooter() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(() => Number(localStorage.getItem("bubble-high") || 0));
  const [timeLeft, setTimeLeft] = useState(60);
  const [isDragging, setIsDragging] = useState(false);

  const colors = ["#f87171", "#60a5fa", "#34d399", "#facc15", "#a78bfa"];
  const rows = 12;
  const cols = 8;
  const bubbleRadius = 20;
  const gridRef = useRef([]);
  const popAnimationsRef = useRef([]);
  const particlesRef = useRef([]);
  const shooterRef = useRef({ x: 0, y: 0, angle: -Math.PI / 2 });
  const currentBubbleRef = useRef({ x: 0, y: 0, color: colors[0], r: bubbleRadius, moving: false, vx: 0, vy: 0 });

  const initGrid = () => {
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        if (r < 5) row.push({ color: colors[Math.floor(Math.random() * colors.length)] });
        else row.push(null);
      }
      grid.push(row);
    }
    gridRef.current = grid;
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setTimeLeft(60);
    initGrid();
    const canvas = canvasRef.current;
    shooterRef.current = { x: canvas.width / 2, y: canvas.height - 40, angle: -Math.PI / 2 };
    currentBubbleRef.current = { x: canvas.width / 2, y: canvas.height - 40, color: colors[Math.floor(Math.random() * colors.length)], r: bubbleRadius, moving: false, vx: 0, vy: 0 };
    popAnimationsRef.current = [];
    particlesRef.current = [];
    runningRef.current = true;
    loop();
  };

  const drawGrid = (ctx) => {
    gridRef.current.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          const x = c * bubbleRadius * 2 + (r % 2) * bubbleRadius + bubbleRadius;
          const y = r * bubbleRadius * 2 * 0.87 + bubbleRadius;
          ctx.fillStyle = cell.color;
          ctx.beginPath();
          ctx.arc(x, y, bubbleRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#00000033";
          ctx.stroke();
        }
      });
    });
  };

  const drawShooter = (ctx) => {
    const s = shooterRef.current;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + 60 * Math.cos(s.angle), s.y + 60 * Math.sin(s.angle));
    ctx.stroke();

    ctx.fillStyle = currentBubbleRef.current.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, bubbleRadius, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawTrajectory = (ctx) => {
    const s = shooterRef.current;
    const b = currentBubbleRef.current;
    if (b.moving) return;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    const len = 200;
    ctx.lineTo(s.x + len * Math.cos(s.angle), s.y + len * Math.sin(s.angle));
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawCurrentBubble = (ctx) => {
    const b = currentBubbleRef.current;
    if (b.moving) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#00000033";
      ctx.stroke();
    }
  };

  const drawPopAnimations = (ctx) => {
    const remaining = [];
    popAnimationsRef.current.forEach(anim => {
      ctx.globalAlpha = anim.alpha;
      ctx.fillStyle = anim.color;
      ctx.beginPath();
      ctx.arc(anim.x, anim.y, anim.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      anim.radius -= 0.5;
      anim.alpha -= 0.05;
      if (anim.alpha > 0) remaining.push(anim);
    });
    popAnimationsRef.current = remaining;

    const remainingParticles = [];
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;
      if (p.alpha > 0) remainingParticles.push(p);
    });
    particlesRef.current = remainingParticles;
  };

  const shootBubble = () => {
    const b = currentBubbleRef.current;
    if (!b.moving) {
      const s = shooterRef.current;
      b.vx = Math.cos(s.angle) * 12;
      b.vy = Math.sin(s.angle) * 12;
      b.moving = true;
    }
  };

  const checkCollision = (b) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = gridRef.current[r][c];
        if (cell) {
          const x = c * bubbleRadius * 2 + (r % 2) * bubbleRadius + bubbleRadius;
          const y = r * bubbleRadius * 2 * 0.87 + bubbleRadius;
          if (Math.hypot(b.x - x, b.y - y) < bubbleRadius * 2 - 2) return { r, c };
        }
      }
    }
    if (b.y - b.r <= 0) return { r: 0, c: Math.floor(b.x / (bubbleRadius * 2)) };
    return null;
  };

  const addBubbleToGrid = (r, c) => {
    const b = currentBubbleRef.current;
    gridRef.current[r][c] = { color: b.color };
    matchBubbles(r, c, b.color);
    currentBubbleRef.current = {
      x: shooterRef.current.x,
      y: shooterRef.current.y,
      color: colors[Math.floor(Math.random() * colors.length)],
      r: bubbleRadius,
      moving: false,
      vx: 0,
      vy: 0
    };
  };

  const matchBubbles = (r, c, color) => {
    const visited = new Set();
    const toCheck = [[r, c]];
    while (toCheck.length) {
      const [cr, cc] = toCheck.pop();
      const key = cr + ',' + cc;
      if (visited.has(key)) continue;
      visited.add(key);
      const neighbors = getNeighbors(cr, cc);
      neighbors.forEach(([nr, nc]) => {
        const cell = gridRef.current[nr]?.[nc];
        if (cell && cell.color === color && !visited.has(nr + ',' + nc)) toCheck.push([nr, nc]);
      });
    }
    if (visited.size >= 3) {
      visited.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        const cell = gridRef.current[r][c];
        if (cell) {
          popAnimationsRef.current.push({
            x: c * bubbleRadius * 2 + (r % 2) * bubbleRadius + bubbleRadius,
            y: r * bubbleRadius * 2 * 0.87 + bubbleRadius,
            radius: bubbleRadius,
            color: cell.color,
            alpha: 1
          });
          for (let i = 0; i < 8; i++) {
            particlesRef.current.push({
              x: c * bubbleRadius * 2 + (r % 2) * bubbleRadius + bubbleRadius,
              y: r * bubbleRadius * 2 * 0.87 + bubbleRadius,
              r: 2,
              color: cell.color,
              alpha: 1,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6
            });
          }
        }
        gridRef.current[r][c] = null;
        setScore(prev => prev + 10);
      });
    }
  };

  const getNeighbors = (r, c) => {
    const even = r % 2 === 0;
    const deltas = even ? [[-1, 0], [-1, -1], [0, -1], [0, 1], [1, 0], [1, -1]] : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
    return deltas.map(([dr, dc]) => [r + dr, c + dc]).filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
  };

  const loop = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const canvas = canvasRef.current;

    const b = currentBubbleRef.current;
    if (b.moving) {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x - b.r <= 0 || b.x + b.r >= canvas.width) b.vx *= -1;
      const collision = checkCollision(b);
      if (collision) addBubbleToGrid(collision.r, collision.c);
    }

    if (timeLeft <= 0) {
      runningRef.current = false;
      setGameOver(true);
      const best = Math.max(score, Number(localStorage.getItem("bubble-high") || 0));
      setHigh(best);
      localStorage.setItem("bubble-high", String(best));
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0a0f1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);
    drawShooter(ctx);
    drawCurrentBubble(ctx);
    drawTrajectory(ctx);
    drawPopAnimations(ctx);

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`High: ${high}`, 10, 50);
    ctx.fillText(`Time: ${timeLeft}s`, canvas.width - 120, 25);

    if (runningRef.current) rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    resetGame();

    let timerId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Mobile touch aiming
    let aiming = false;
    const touchStart = e => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      aiming = true;
      setIsDragging(true);
    };
    const touchMove = e => {
      if (!aiming) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const dx = touch.clientX - rect.left - shooterRef.current.x;
      const dy = touch.clientY - rect.top - shooterRef.current.y;
      shooterRef.current.angle = Math.atan2(dy, dx);
    };
    const touchEnd = e => {
      aiming = false;
      setIsDragging(false);
    };

    canvas.addEventListener("touchstart", touchStart);
    canvas.addEventListener("touchmove", touchMove);
    canvas.addEventListener("touchend", touchEnd);

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      clearInterval(timerId);
      canvas.removeEventListener("touchstart", touchStart);
      canvas.removeEventListener("touchmove", touchMove);
      canvas.removeEventListener("touchend", touchEnd);
    };
  }, []);

  return (
    <motion.div className="min-h-screen bg-black flex flex-col items-center justify-center relative p-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="w-full max-w-[480px] flex items-center justify-between mb-3">
        {/* <button onClick={() => navigate("/games")} className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600">⬅ Back</button> */}
        <h1 className="text-xl md:text-2xl font-extrabold text-cyan-400 drop-shadow">Bubble Shooter 🟢</h1>
        <button onClick={resetGame} className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600">↻ Restart</button>
      </div>
      <div className="w-full max-w-[480px] h-[640px] relative">
        <canvas ref={canvasRef} className="w-full h-full bg-[#0a0f1a] border-4 border-cyan-400 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.25)] select-none touch-none" style={{ imageRendering: "pixelated" }} />
      </div>
      {/* Mobile FIRE button */}
      <div className="mt-4 flex justify-center sm:hidden">
        <button
          onClick={shootBubble}
          className="px-8 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-100 font-semibold backdrop-blur hover:bg-cyan-500/30 active:scale-95"
        >
          FIRE
        </button>
      </div>
      <AnimatePresence>
        {gameOver && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-cyan-400 rounded-2xl p-6 text-center shadow-2xl max-w-[90vw]">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Game Over</h2>
            <p className="text-cyan-100 mb-4">Score: {score} &nbsp;•&nbsp; High: {high}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={resetGame} className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600">Play Again</button>
              <button onClick={() => navigate("/")} className="px-5 py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600">Back to Games</button>
            </div>
          </div>
        </motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}
