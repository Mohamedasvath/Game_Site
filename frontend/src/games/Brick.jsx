import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function BrickBreaker() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);

  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(() => Number(localStorage.getItem("brick-high") || 0));
  const [gameOver, setGameOver] = useState(false);

  const paddleRef = useRef({ x: 0, y: 0, width: 100, height: 15 });
  const ballRef = useRef({ x: 0, y: 0, vx: 4, vy: -4, r: 10 });
  const bricksRef = useRef([]);
  const particlesRef = useRef([]);

  const rows = 5;
  const cols = 8;
  const brickWidth = 50;
  const brickHeight = 20;
  const brickColors = ["#f87171", "#60a5fa", "#34d399", "#facc15", "#a78bfa"];

  const initBricks = () => {
    const bricks = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push({ x: c * brickWidth, y: r * brickHeight + 50, color: brickColors[r % brickColors.length], destroyed: false });
      }
      bricks.push(row);
    }
    bricksRef.current = bricks;
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    const canvas = canvasRef.current;
    paddleRef.current = { x: canvas.width / 2 - 50, y: canvas.height - 40, width: 100, height: 15 };
    ballRef.current = { x: canvas.width / 2, y: canvas.height - 60, vx: 4, vy: -4, r: 10 };
    initBricks();
    particlesRef.current = [];
    runningRef.current = true;
    loop();
  };

  const drawBricks = (ctx) => {
    bricksRef.current.forEach(row => {
      row.forEach(b => {
        if (!b.destroyed) {
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, b.y, brickWidth - 2, brickHeight - 2);
        }
      });
    });
  };

  const drawPaddle = (ctx) => {
    const p = paddleRef.current;
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(p.x, p.y, p.width, p.height);
  };

  const drawBall = (ctx) => {
    const b = ballRef.current;
    ctx.fillStyle = "#f87171";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawParticles = (ctx) => {
    const remaining = [];
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.05;
      if (p.alpha > 0) remaining.push(p);
    });
    particlesRef.current = remaining;
  };

  const loop = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const canvas = canvasRef.current;
    const ball = ballRef.current;
    const paddle = paddleRef.current;

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce walls
    if (ball.x - ball.r <= 0 || ball.x + ball.r >= canvas.width) ball.vx *= -1;
    if (ball.y - ball.r <= 0) ball.vy *= -1;

    // Paddle collision
    if (
      ball.y + ball.r >= paddle.y &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width
    ) {
      ball.vy *= -1;
      const deltaX = ball.x - (paddle.x + paddle.width / 2);
      ball.vx = deltaX * 0.1;
    }

    // Brick collision
    bricksRef.current.forEach(row => {
      row.forEach(b => {
        if (!b.destroyed) {
          if (
            ball.x + ball.r > b.x &&
            ball.x - ball.r < b.x + brickWidth &&
            ball.y + ball.r > b.y &&
            ball.y - ball.r < b.y + brickHeight
          ) {
            b.destroyed = true;
            ball.vy *= -1;
            setScore(prev => prev + 10);
            for (let i = 0; i < 8; i++) {
              particlesRef.current.push({
                x: ball.x,
                y: ball.y,
                r: 2,
                color: b.color,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                alpha: 1
              });
            }
          }
        }
      });
    });

    // Check game over
    if (ball.y - ball.r > canvas.height) {
      runningRef.current = false;
      setGameOver(true);
      const best = Math.max(score, Number(localStorage.getItem("brick-high") || 0));
      setHigh(best);
      localStorage.setItem("brick-high", String(best));
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0a0f1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw
    drawBricks(ctx);
    drawPaddle(ctx);
    drawBall(ctx);
    drawParticles(ctx);

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`High: ${high}`, 10, 50);

    if (runningRef.current) rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    resetGame();

    let startDrag = null;
    const touchStart = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      startDrag = { x: touch.clientX - rect.left };
    };
    const touchMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const dx = touch.clientX - rect.left - startDrag.x;
      paddleRef.current.x += dx;
      if (paddleRef.current.x < 0) paddleRef.current.x = 0;
      if (paddleRef.current.x + paddleRef.current.width > canvas.width)
        paddleRef.current.x = canvas.width - paddleRef.current.width;
      startDrag = { x: touch.clientX - rect.left };
    };
    const touchEnd = () => { startDrag = null; };

    const mouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      paddleRef.current.x = e.clientX - rect.left - paddleRef.current.width / 2;
      if (paddleRef.current.x < 0) paddleRef.current.x = 0;
      if (paddleRef.current.x + paddleRef.current.width > canvas.width)
        paddleRef.current.x = canvas.width - paddleRef.current.width;
    };

    canvas.addEventListener("touchstart", touchStart);
    canvas.addEventListener("touchmove", touchMove);
    canvas.addEventListener("touchend", touchEnd);
    canvas.addEventListener("mousemove", mouseMove);

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("touchstart", touchStart);
      canvas.removeEventListener("touchmove", touchMove);
      canvas.removeEventListener("touchend", touchEnd);
      canvas.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  return (
    <motion.div className="min-h-screen bg-black flex flex-col items-center justify-center relative p-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="w-full max-w-[480px] flex items-center justify-between mb-3">
        {/* <button onClick={() => navigate("/games")} className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600">⬅ Back</button> */}
        <h1 className="text-xl md:text-2xl font-extrabold text-cyan-400 drop-shadow">Brick Breaker 🔵</h1>
        <button onClick={resetGame} className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600">↻ Restart</button>
      </div>
      <div className="w-full max-w-[480px] h-[640px] relative">
        <canvas ref={canvasRef} className="w-full h-full bg-[#0a0f1a] border-4 border-cyan-400 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.25)] select-none touch-none" style={{ imageRendering: "pixelated" }} />
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
