import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ShootingGalleryEmoji() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30s timer

  const canvasWidth = 480;
  const canvasHeight = 640;

  const player = useRef({
    x: canvasWidth / 2 - 25,
    y: canvasHeight - 80,
    width: 50,
    height: 50,
    color: "#ff0055",
    vx: 0,
    shooting: false,
  });

  const bullets = useRef([]);
  const targets = useRef([]);
  const hitEffects = useRef([]);

  const keys = useRef({ left: false, right: false, shoot: false });
  const touch = useRef({ left: false, right: false, shoot: false });

  const moveSpeed = 5;

  const resetGame = () => {
    player.current.x = canvasWidth / 2 - player.current.width / 2;
    bullets.current = [];
    targets.current = [];
    hitEffects.current = [];
    setScore(0);
    setLevel(1);
    setTimeLeft(30);
    setGameOver(false);
    loop();
  };

  const spawnTarget = () => {
    const speed = 1 + 0.5 * level;
    const emojis = ["🍎", "🍌", "🍇", "🍒", "🍉", "🍍", "🥝", "🍓"];
    targets.current.push({
      x: Math.random() * (canvasWidth - 40),
      y: -40,
      width: 40,
      height: 40,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      vy: speed,
    });
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (gameOver) return;

    // Player movement
    if (keys.current.left || touch.current.left) player.current.vx = -moveSpeed;
    else if (keys.current.right || touch.current.right) player.current.vx = moveSpeed;
    else player.current.vx = 0;

    player.current.x += player.current.vx;
    player.current.x = Math.max(0, Math.min(canvasWidth - player.current.width, player.current.x));

    // Shoot bullets
    if ((keys.current.shoot || touch.current.shoot) && bullets.current.length < 5) {
      bullets.current.push({
        x: player.current.x + player.current.width / 2 - 5,
        y: player.current.y,
        width: 10,
        height: 20,
      });
      player.current.shooting = true;
      setTimeout(() => (player.current.shooting = false), 100);
      keys.current.shoot = false;
      touch.current.shoot = false;
    }

    // Move bullets
    bullets.current.forEach(b => b.y -= 8);
    bullets.current = bullets.current.filter(b => b.y > -b.height);

    // Spawn targets
    if (Math.random() < 0.02 + 0.01 * level) spawnTarget();

    // Move targets
    targets.current.forEach(t => t.y += t.vy);
    targets.current = targets.current.filter(t => t.y < canvasHeight);

    // Collision detection
    bullets.current.forEach((b, bi) => {
      targets.current.forEach((t, ti) => {
        if (
          b.x < t.x + t.width &&
          b.x + b.width > t.x &&
          b.y < t.y + t.height &&
          b.y + b.height > t.y
        ) {
          hitEffects.current.push({ x: t.x + t.width / 2, y: t.y + t.height / 2, emoji: t.emoji, id: Math.random() });
          targets.current.splice(ti, 1);
          bullets.current.splice(bi, 1);
          setScore(prev => prev + 1);
        }
      });
    });

    // Level up every 10 points
    if (score >= level * 10) setLevel(prev => prev + 1);

    // Draw
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Player
    ctx.fillStyle = player.current.color;
    ctx.fillRect(player.current.x, player.current.y, player.current.width, player.current.height);
    if (player.current.shooting) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(player.current.x + player.current.width / 2 - 5, player.current.y - 10, 10, 10);
    }

    // Bullets
    ctx.fillStyle = "#fff";
    bullets.current.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // Targets (emojis)
    targets.current.forEach(t => {
      ctx.font = "30px Arial";
      ctx.fillText(t.emoji, t.x, t.y + t.height - 5);
    });

    // Hit effects
    hitEffects.current.forEach((h, i) => {
      ctx.font = "28px Arial";
      ctx.fillText(h.emoji, h.x - 14, h.y);
      setTimeout(() => hitEffects.current.splice(i, 1), 150);
    });

    // Score, level, timer
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 10, 60);
    ctx.fillText(`Time: ${timeLeft}s`, canvasWidth - 120, 30);

    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    resetGame();

    const keyDown = e => {
      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
      if (e.key === " ") keys.current.shoot = true;
    };
    const keyUp = e => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      clearInterval(timer);
    };
  }, []);

  return (
    <motion.div className="min-h-screen bg-black flex flex-col items-center justify-center relative p-3" initial={{opacity:0}} animate={{opacity:1}}>
      <div className="w-full max-w-[480px] flex items-center justify-between mb-3">
        <button onClick={()=>navigate("/games")} className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600">⬅ Back</button>
        <h1 className="text-xl md:text-2xl font-extrabold text-cyan-400 drop-shadow">Shooting Gallery 🎯</h1>
        <button onClick={resetGame} className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600">↻ Restart</button>
      </div>

      <div className="w-full max-w-[480px] h-[640px] border-4 border-cyan-400 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.25)] overflow-hidden relative">
        <canvas ref={canvasRef} className="w-full h-full"/>
        {/* Mobile buttons */}
        <div className="absolute bottom-4 left-0 w-full flex justify-between px-4 sm:hidden">
          <button onTouchStart={()=>touch.current.left=true} onTouchEnd={()=>touch.current.left=false} className="px-5 py-3 bg-cyan-500/30 text-white rounded-xl">Left</button>
          <button onTouchStart={()=>touch.current.shoot=true} onTouchEnd={()=>touch.current.shoot=false} className="px-5 py-3 bg-cyan-500/30 text-white">Shoot</button>
          <button onTouchStart={()=>touch.current.right=true} onTouchEnd={()=>touch.current.right=false} className="px-5 py-3 bg-cyan-500/30 text-white rounded-xl">Right</button>
        </div>
      </div>

      <AnimatePresence>
        {gameOver && <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.8,opacity:0}} className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-cyan-400 rounded-2xl p-6 text-center shadow-2xl max-w-[90vw]">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Time's Up!</h2>
            <p className="text-cyan-100 mb-4">Score: {score}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={resetGame} className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600">Play Again</button>
              <button onClick={()=>navigate("/games")} className="px-5 py-2 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-600">Back to Games</button>
            </div>
          </div>
        </motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}
