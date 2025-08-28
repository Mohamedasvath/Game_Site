import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Google Dino (React + Canvas)
 * - Logical canvas size (600x200) scaled responsively with CSS
 * - Keyboard: Space / ArrowUp (prevents page scroll)
 * - Mobile: tap canvas or use on-screen Jump button
 * - Cacti obstacles, clouds, ground, score & high score
 * - Back button -> navigate("/games")
 */

export default function Dino() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);

  // game state
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(() => Number(localStorage.getItem("dino-high") || 0));

  // logical canvas size (do not change; use CSS for responsiveness)
  const W = 600;
  const H = 200;

  // world constants
  const groundY = 160;
  const gravity = 0.8;
  const jumpVel = -12;
  const baseSpeed = 6;

  // entities (refs so we can mutate without re-render)
  const dinoRef = useRef({ x: 50, y: groundY, w: 40, h: 44, vy: 0, jumping: false });
  const obstaclesRef = useRef([]);
  const cloudsRef = useRef([]);
  const speedRef = useRef(baseSpeed);
  const spawnTimerRef = useRef(0);
  const cloudTimerRef = useRef(0);
  const distanceRef = useRef(0); // for score

  // helpers
  const resetGame = () => {
    setGameOver(false);
    setScore(0);
    speedRef.current = baseSpeed;
    dinoRef.current = { x: 50, y: groundY, w: 40, h: 44, vy: 0, jumping: false };
    obstaclesRef.current = [];
    cloudsRef.current = [];
    spawnTimerRef.current = 0;
    cloudTimerRef.current = 0;
    distanceRef.current = 0;
    runningRef.current = true;
    loop();
  };

  // draw functions
  const drawGround = (ctx, offset) => {
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 22);
    ctx.lineTo(W, groundY + 22);
    ctx.stroke();

    // tiny ticks for motion feel
    ctx.fillStyle = "#777";
    for (let x = -offset % 20; x < W; x += 20) {
      ctx.fillRect(x, groundY + 24, 12, 2);
    }
  };

  const drawDino = (ctx, d) => {
    // body
    ctx.fillStyle = "#2dd4bf"; // teal-ish (neon)
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#2dd4bf";
    ctx.fillRect(d.x, d.y - d.h, d.w, d.h);

    // “eye”
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#111";
    ctx.fillRect(d.x + d.w - 10, d.y - d.h + 8, 5, 5);
  };

  const drawCactus = (ctx, c) => {
    ctx.fillStyle = "#a3e635"; // lime
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#a3e635";
    // main stem
    ctx.fillRect(c.x, c.y - c.h, c.w, c.h);
    // arms
    ctx.fillRect(c.x - 6, c.y - Math.min(24, c.h - 10), 6, 10);
    ctx.fillRect(c.x + c.w, c.y - Math.min(30, c.h - 8), 6, 12);
    ctx.shadowBlur = 0;
  };

  const drawCloud = (ctx, cl) => {
    ctx.fillStyle = "#e5e7eb";
    ctx.beginPath();
    ctx.arc(cl.x, cl.y, 12, 0, Math.PI * 2);
    ctx.arc(cl.x + 14, cl.y + 2, 10, 0, Math.PI * 2);
    ctx.arc(cl.x + 28, cl.y, 12, 0, Math.PI * 2);
    ctx.fill();
  };

  const collide = (a, b) =>
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y > b.y - b.h &&
    a.y - a.h < b.y;

  // game loop
  const loop = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // update
    const d = dinoRef.current;
    const dt = 1; // frame step
    // gravity
    d.vy += gravity;
    d.y += d.vy;

    if (d.y >= groundY) {
      d.y = groundY;
      d.vy = 0;
      d.jumping = false;
    }

    // speed up over time
    speedRef.current += 0.0008;

    // spawn cacti
    spawnTimerRef.current -= dt;
    if (spawnTimerRef.current <= 0) {
      const gap = 60 + Math.random() * 80;
      const w = 18 + Math.floor(Math.random() * 10);
      const h = 30 + Math.floor(Math.random() * 30);
      obstaclesRef.current.push({ x: W + 10, y: groundY + 22, w, h });
      spawnTimerRef.current = (90 + Math.random() * 70) / (speedRef.current / baseSpeed);
    }

    // spawn clouds
    cloudTimerRef.current -= dt;
    if (cloudTimerRef.current <= 0) {
      cloudsRef.current.push({
        x: W + 40,
        y: 30 + Math.random() * 60,
        v: 1 + Math.random() * 0.8,
      });
      cloudTimerRef.current = 140 + Math.random() * 100;
    }

    // move cacti & clouds
    obstaclesRef.current.forEach((c) => (c.x -= speedRef.current));
    cloudsRef.current.forEach((cl) => (cl.x -= cl.v));

    // cleanup off-screen
    obstaclesRef.current = obstaclesRef.current.filter((c) => c.x + c.w > -10);
    cloudsRef.current = cloudsRef.current.filter((cl) => cl.x > -50);

    // score
    distanceRef.current += speedRef.current;
    const newScore = Math.floor(distanceRef.current / 5);
    if (newScore !== score) setScore(newScore);

    // collision
    for (const c of obstaclesRef.current) {
      if (collide({ ...d }, c)) {
        runningRef.current = false;
        setGameOver(true);
        const best = Math.max(newScore, Number(localStorage.getItem("dino-high") || 0));
        setHigh(best);
        localStorage.setItem("dino-high", String(best));
        break;
      }
    }

    // draw
    ctx.clearRect(0, 0, W, H);

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#0b1220");
    sky.addColorStop(1, "#0f172a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // clouds
    cloudsRef.current.forEach((cl) => drawCloud(ctx, cl));

    // ground (scroll offset for ticks)
    drawGround(ctx, distanceRef.current);

    // dino
    drawDino(ctx, d);

    // obstacles
    obstaclesRef.current.forEach((c) => drawCactus(ctx, c));

    // score text
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "bold 16px Inter, system-ui, Arial";
    ctx.fillText(`Score: ${newScore}`, W - 140, 22);
    ctx.fillText(`High: ${high}`, W - 140, 42);

    if (runningRef.current) {
      rafRef.current = requestAnimationFrame(loop);
    }
  };

  // jump
  const jump = () => {
    const d = dinoRef.current;
    if (!runningRef.current || d.jumping) return;
    d.vy = jumpVel;
    d.jumping = true;
  };

  // input handlers
  useEffect(() => {
    // start game on mount
    runningRef.current = true;
    loop();

    const keyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === " " || k === "arrowup") {
        e.preventDefault(); // stop page scroll
        if (gameOver) return;
        jump();
      }
      if (k === "enter" && gameOver) {
        resetGame();
      }
    };

    const touchStart = () => {
      if (gameOver) return;
      jump();
    };

    window.addEventListener("keydown", keyDown, { passive: false });
    const canvas = canvasRef.current;
    canvas?.addEventListener("touchstart", touchStart, { passive: true });

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", keyDown);
      canvas?.removeEventListener("touchstart", touchStart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]); // rebind keys when gameOver changes

  return (
    <motion.div
      className="min-h-screen bg-black flex flex-col items-center justify-center relative p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="w-full max-w-[820px] flex items-center justify-between mb-3">
        {/* <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600"
        >
          ⬅ Back
        </button> */}

        <h1 className="text-xl md:text-2xl font-extrabold text-cyan-400 drop-shadow">
          Dino Runner 🦖
        </h1>

        <button
          onClick={() => (gameOver ? resetGame() : (runningRef.current = true, loop()))}
          className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600"
        >
          {gameOver ? "↻ Restart" : "▶ Resume"}
        </button>
      </div>

      {/* Canvas wrapper (responsive) */}
      <div className="w-full max-w-[820px]">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-auto bg-[#0a0f1a] border-4 border-cyan-400 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.25)] select-none touch-none"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* On-screen jump for mobile */}
      <div className="mt-4 sm:hidden">
        <button
          onClick={jump}
          className="px-8 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-100 font-semibold backdrop-blur hover:bg-cyan-500/30 active:scale-95"
        >
          TAP / JUMP
        </button>
      </div>

      {/* Game Over popup */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70"
          >
            <div className="bg-gray-900 border border-cyan-400 rounded-2xl p-6 text-center shadow-2xl max-w-[90vw]">
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">Game Over</h2>
              <p className="text-cyan-100 mb-4">Score: {score} &nbsp;•&nbsp; High: {high}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetGame}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate("/games")}
                  className="px-5 py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600"
                >
                  Back to Games
                </button>
              </div>
              <p className="text-xs text-cyan-200/80 mt-3">Tip: Press Enter to restart</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
