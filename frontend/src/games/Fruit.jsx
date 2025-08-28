import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function FruitNinja() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [scorePopups, setScorePopups] = useState([]);

  const fruits = ["🍎", "🍌", "🍊", "🍉", "🍓"];
  const fruitObjects = useRef([]);
  const bombs = useRef([]);
  const particles = useRef([]);
  const swordTrail = useRef([]);
  const cursor = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const comboTimeout = useRef(null);

  const difficulty = useRef({ spawnRate: 700, fruitPerWave: 3, bombRate: 5000, fruitSpeed: 12 });

  // LEVEL UP logic
  useEffect(() => {
    const newLevel = Math.floor(score / 20) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      difficulty.current.spawnRate = Math.max(200, 700 - newLevel * 50);
      difficulty.current.fruitPerWave = Math.min(8, 3 + newLevel);
      difficulty.current.bombRate = Math.max(1500, 5000 - newLevel * 400);
      difficulty.current.fruitSpeed = 12 + newLevel * 2;
    }
  }, [score]);

  const spawnFruit = () => {
    const canvas = canvasRef.current;
    for (let i = 0; i < difficulty.current.fruitPerWave; i++) {
      const x = Math.random() * canvas.width;
      const y = canvas.height + 50;
      const vx = (Math.random() - 0.5) * 4;
      const vy = -(Math.random() * difficulty.current.fruitSpeed + 8);
      const curve = (Math.random() - 0.5) * 0.2;
      fruitObjects.current.push({ x, y, vx, vy, curve, emoji: fruits[Math.floor(Math.random() * fruits.length)], cut: false });
    }
  };

  const spawnBomb = () => {
    const canvas = canvasRef.current;
    const x = Math.random() * canvas.width;
    const y = canvas.height + 50;
    const vx = (Math.random() - 0.5) * 4;
    const vy = -(Math.random() * 10 + 8);
    const curve = (Math.random() - 0.5) * 0.2;
    bombs.current.push({ x, y, vx, vy, curve, cut: false });
  };

  const update = () => {
    fruitObjects.current.forEach(f => {
      if (!f.cut) {
        f.x += f.vx + Math.sin(f.y * f.curve);
        f.y += f.vy;
        f.vy += 0.3;
        if (f.y > canvasRef.current.height + 50) f.cut = true;
      }
    });

    bombs.current.forEach(b => {
      if (!b.cut) {
        b.x += b.vx + Math.sin(b.y * b.curve);
        b.y += b.vy;
        b.vy += 0.3;
        if (b.y > canvasRef.current.height + 50) b.cut = true;
      }
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fruits
    fruitObjects.current.forEach(f => {
      if (!f.cut) {
        ctx.font = "40px serif";
        ctx.fillText(f.emoji, f.x, f.y);
      }
    });

    // Bombs
    bombs.current.forEach(b => {
      if (!b.cut) {
        ctx.font = "40px serif";
        ctx.fillText("💣", b.x, b.y);
      }
    });

    // Particles
    const remainingParticles = [];
    particles.current.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.05;
      if (p.alpha > 0) remainingParticles.push(p);
    });
    particles.current = remainingParticles;

    // Sword trail
    swordTrail.current.forEach((t, i) => {
      ctx.strokeStyle = `rgba(0,255,255,${t.alpha})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(t.x1, t.y1);
      ctx.lineTo(t.x2, t.y2);
      ctx.stroke();
      t.alpha -= 0.03;
    });
    swordTrail.current = swordTrail.current.filter(t => t.alpha > 0);
  };

  const loop = () => {
    if (!gameOver) {
      update();
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }
    cursor.current.prevX = cursor.current.x;
    cursor.current.prevY = cursor.current.y;
  };

  const cutObjects = (x1, y1, x2, y2) => {
    let cutCount = 0;

    const checkLineCollision = (fx, fy) => {
      const dist = Math.abs((y2 - y1) * fx - (x2 - x1) * fy + x2 * y1 - y2 * x1) / Math.hypot(y2 - y1, x2 - x1);
      return dist < 30;
    };

    fruitObjects.current.forEach(f => {
      if (!f.cut && checkLineCollision(f.x, f.y)) {
        f.cut = true;
        cutCount++;
        setScore(prev => prev + 1);
        setScorePopups(prev => [...prev, { x: f.x, y: f.y, text: "+1", alpha: 1, id: Date.now() + Math.random() }]);
        for (let i = 0; i < 8; i++) {
          particles.current.push({
            x: f.x,
            y: f.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            r: 3,
            alpha: 1,
            color: "yellow"
          });
        }
      }
    });

    bombs.current.forEach(b => {
      if (!b.cut && checkLineCollision(b.x, b.y)) {
        b.cut = true;
        setGameOver(true);
      }
    });

    if (cutCount > 0) {
      setCombo(prev => prev + cutCount);
      if (comboTimeout.current) clearTimeout(comboTimeout.current);
      comboTimeout.current = setTimeout(() => setCombo(0), 1500);
    }
  };

  const handleMouseMove = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;
    swordTrail.current.push({ x1: cursor.current.x, y1: cursor.current.y, x2: newX, y2: newY, alpha: 1 });

    for (let i = 0; i < 3; i++) {
      particles.current.push({
        x: cursor.current.x + (Math.random() - 0.5) * 10,
        y: cursor.current.y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: 2,
        alpha: 1,
        color: "cyan"
      });
    }
    cutObjects(cursor.current.x, cursor.current.y, newX, newY);
    cursor.current.x = newX;
    cursor.current.y = newY;
  };

  const handleTouchMove = e => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    for (let t of e.touches) {
      const newX = t.clientX - rect.left;
      const newY = t.clientY - rect.top;
      swordTrail.current.push({ x1: cursor.current.x, y1: cursor.current.y, x2: newX, y2: newY, alpha: 1 });
      cutObjects(cursor.current.x, cursor.current.y, newX, newY);
      cursor.current.x = newX;
      cursor.current.y = newY;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 480;
    canvas.height = 640;

    const preventScroll = e => e.preventDefault();
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    loop();
    const fruitInterval = setInterval(spawnFruit, difficulty.current.spawnRate);
    const bombInterval = setInterval(spawnBomb, difficulty.current.bombRate);

    return () => {
      clearInterval(fruitInterval);
      clearInterval(bombInterval);
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative p-3">
      <div className="w-full max-w-[480px] flex items-center justify-between mb-3">
        
        <h1 className="text-xl font-bold text-cyan-400">Fruit Ninja 🍉</h1>
        <span className="text-white">Level: {level}</span>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[640px] bg-[#0a0f1a] rounded-2xl border-4 border-cyan-400 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      />

      {/* Score popups */}
      <AnimatePresence>
        {scorePopups.map(p => (
          <motion.div
            key={p.id}
            initial={{ y: 0, scale: 1 }}
            animate={{ y: -30, scale: 1.3, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute text-yellow-400 font-bold pointer-events-none"
            style={{ left: p.x, top: p.y }}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70"
          >
            <div className="bg-gray-900 border border-cyan-400 rounded-2xl p-6 text-center shadow-2xl max-w-[90vw]">
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">Game Over 💥</h2>
              <p className="text-cyan-100 mb-4">Score: {score}</p>
              <button onClick={() => window.location.reload()} className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600">Play Again</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
