import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function MiniGolfGame() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const canvasWidth = 480;
  const canvasHeight = 640;

  const [levelIndex, setLevelIndex] = useState(0);
  const [strokes, setStrokes] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);

  const ball = useRef({ x: 0, y: 0, radius: 15, vx: 0, vy: 0, moving: false });

  const levels = [
    { // Level 1
      start: { x: 100, y: 500 },
      hole: { x: 400, y: 100, radius: 20 },
      obstacles: [{ x: 200, y: 300, width: 80, height: 20 }, { x: 300, y: 450, width: 20, height: 80 }],
    },
    { // Level 2
      start: { x: 50, y: 550 },
      hole: { x: 430, y: 80, radius: 20 },
      obstacles: [{ x: 150, y: 400, width: 100, height: 20 }, { x: 300, y: 350, width: 20, height: 150 }],
    },
    { // Level 3
      start: { x: 60, y: 500 },
      hole: { x: 420, y: 50, radius: 25 },
      obstacles: [{ x: 200, y: 250, width: 20, height: 300 }, { x: 300, y: 400, width: 100, height: 20 }],
    },
    { // Level 4
      start: { x: 70, y: 520 },
      hole: { x: 410, y: 60, radius: 25 },
      obstacles: [
        { x: 150, y: 200, width: 200, height: 20 },
        { x: 250, y: 400, width: 20, height: 180 },
        { x: 100, y: 350, width: 50, height: 20 },
      ],
    },
    { // Level 5
      start: { x: 80, y: 540 },
      hole: { x: 430, y: 80, radius: 25 },
      obstacles: [
        { x: 120, y: 300, width: 250, height: 20 },
        { x: 250, y: 400, width: 20, height: 200 },
        { x: 50, y: 450, width: 100, height: 20 },
        { x: 350, y: 250, width: 50, height: 20 },
      ],
    },
    { // Level 6
      start: { x: 60, y: 550 },
      hole: { x: 420, y: 50, radius: 30 },
      obstacles: [
        { x: 100, y: 200, width: 300, height: 20 },
        { x: 200, y: 400, width: 20, height: 200 },
        { x: 50, y: 350, width: 50, height: 20 },
        { x: 350, y: 300, width: 80, height: 20 },
        { x: 250, y: 500, width: 100, height: 20 },
      ],
    },
  ];

  const drag = useRef({ startX: 0, startY: 0, endX: 0, endY: 0, aiming: false });

  const resetLevel = (index = levelIndex) => {
    const lvl = levels[index];
    ball.current = { ...lvl.start, radius: 15, vx: 0, vy: 0, moving: false };
    drag.current.aiming = false;
    setStrokes(0);
    setLevelComplete(false);
    loop();
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (levelComplete) return;

    // Ball movement
    if (ball.current.moving) {
      ball.current.x += ball.current.vx;
      ball.current.y += ball.current.vy;
      ball.current.vx *= 0.98;
      ball.current.vy *= 0.98;
      if (Math.abs(ball.current.vx) < 0.1 && Math.abs(ball.current.vy) < 0.1) {
        ball.current.vx = 0;
        ball.current.vy = 0;
        ball.current.moving = false;
      }

      // Obstacles collision
      levels[levelIndex].obstacles.forEach(o => {
        if (
          ball.current.x + ball.current.radius > o.x &&
          ball.current.x - ball.current.radius < o.x + o.width &&
          ball.current.y + ball.current.radius > o.y &&
          ball.current.y - ball.current.radius < o.y + o.height
        ) {
          if (ball.current.x < o.x || ball.current.x > o.x + o.width) ball.current.vx *= -0.7;
          if (ball.current.y < o.y || ball.current.y > o.y + o.height) ball.current.vy *= -0.7;
        }
      });

      // Hole check
      const hole = levels[levelIndex].hole;
      const dx = ball.current.x - hole.x;
      const dy = ball.current.y - hole.y;
      if (Math.sqrt(dx * dx + dy * dy) < ball.current.radius + hole.radius) {
        ball.current.moving = false;
        setLevelComplete(true);
      }
    }

    // Draw
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Ball
    ctx.fillStyle = "#ff0055";
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, Math.PI * 2);
    ctx.fill();

    // Hole
    const hole = levels[levelIndex].hole;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
    ctx.fill();

    // Obstacles
    ctx.fillStyle = "#888";
    levels[levelIndex].obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));

    // Aim line
    if (drag.current.aiming) {
      ctx.strokeStyle = "#00ffea";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ball.current.x, ball.current.y);
      ctx.lineTo(drag.current.endX, drag.current.endY);
      ctx.stroke();
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  const handleStart = e => {
    drag.current.startX = e.nativeEvent.offsetX || e.touches[0].clientX;
    drag.current.startY = e.nativeEvent.offsetY || e.touches[0].clientY;
    drag.current.aiming = true;
  };

  const handleMove = e => {
    if (!drag.current.aiming) return;
    drag.current.endX = e.nativeEvent.offsetX || e.touches[0].clientX;
    drag.current.endY = e.nativeEvent.offsetY || e.touches[0].clientY;
  };

  const handleEnd = e => {
    if (!drag.current.aiming) return;
    const endX = e.nativeEvent.offsetX || e.changedTouches[0].clientX;
    const endY = e.nativeEvent.offsetY || e.changedTouches[0].clientY;
    const dx = drag.current.startX - endX;
    const dy = drag.current.startY - endY;

    ball.current.vx = dx * 0.1;
    ball.current.vy = dy * 0.1;
    ball.current.moving = true;
    drag.current.aiming = false;
    setStrokes(prev => prev + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    resetLevel();
    return () => cancelAnimationFrame(rafRef.current);
  }, [levelIndex]);

  return (
    <motion.div className="min-h-screen bg-green-800 flex flex-col items-center justify-center relative p-3" initial={{opacity:0}} animate={{opacity:1}}>
      <div className="w-full max-w-[480px] flex items-center justify-between mb-3">
        <button onClick={()=>navigate("/games")} className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600">⬅ Back</button>
        <h1 className="text-xl md:text-2xl font-extrabold text-yellow-300 drop-shadow">Mini Golf ⛳</h1>
        <button onClick={()=>resetLevel()} className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600">↻ Restart</button>
      </div>

      <div className="w-full max-w-[480px] h-[640px] border-4 border-yellow-300 rounded-2xl shadow-[0_0_40px_rgba(255,255,0,0.25)] overflow-hidden relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>

      <div className="text-white mt-3">
        <p>Level: {levelIndex + 1} / {levels.length} • Strokes: {strokes}</p>
      </div>

      <AnimatePresence>
        {levelComplete && (
          <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.8,opacity:0}} className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="bg-green-900 border border-yellow-300 rounded-2xl p-6 text-center shadow-2xl max-w-[90vw]">
              <h2 className="text-2xl font-bold text-yellow-300 mb-2">Hole Complete!</h2>
              <p className="text-white mb-4">Strokes: {strokes}</p>
              <div className="flex gap-3 justify-center">
                {levelIndex < levels.length - 1 ? (
                  <button onClick={() => setLevelIndex(prev => prev + 1)} className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600">Next Level</button>
                ) : (
                  <button onClick={() => navigate("/games")} className="px-5 py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600">Back to Games</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
