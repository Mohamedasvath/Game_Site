import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function TowerDefense() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);

  // Game state
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(10);
  const [coins, setCoins] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [selectedTower, setSelectedTower] = useState(null);

  const canvasWidth = 480;
  const canvasHeight = 640;

  const path = [
    { x: 50, y: 0 },
    { x: 50, y: 200 },
    { x: 200, y: 200 },
    { x: 200, y: 400 },
    { x: 400, y: 400 },
    { x: 400, y: 640 },
  ];

  const towers = useRef([]);
  const enemies = useRef([]);
  const projectiles = useRef([]);
  const wave = useRef(1);

  const resetGame = () => {
    towers.current = [];
    enemies.current = [];
    projectiles.current = [];
    setScore(0);
    setLives(10);
    setCoins(100);
    wave.current = 1;
    runningRef.current = true;
    spawnWave();
    loop();
  };

  const spawnWave = () => {
    for (let i = 0; i < wave.current * 5; i++) {
      enemies.current.push({
        x: path[0].x,
        y: path[0].y - i * 60,
        width: 30,
        height: 30,
        speed: 1 + wave.current * 0.1,
        hp: 3 + wave.current,
        pathIndex: 0,
        color: "#f87171",
      });
    }
  };

  const drawPath = (ctx) => {
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let p of path) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const drawTowers = (ctx) => {
    towers.current.forEach(t => {
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawEnemies = (ctx) => {
    enemies.current.forEach(e => {
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height);
    });
  };

  const drawProjectiles = (ctx) => {
    projectiles.current.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const updateEnemies = () => {
    enemies.current.forEach(e => {
      const target = path[e.pathIndex + 1];
      if (!target) {
        // Enemy reached end
        setLives(prev => prev - 1);
        e.hp = 0;
        return;
      }
      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < e.speed) {
        e.x = target.x;
        e.y = target.y;
        e.pathIndex++;
      } else {
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;
      }
    });
    enemies.current = enemies.current.filter(e => e.hp > 0);
  };

  const updateProjectiles = () => {
    projectiles.current.forEach(p => {
      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < p.speed) {
        p.target.hp -= p.damage;
        setScore(prev => prev + 1);
        p.hit = true;
      } else {
        p.x += (dx / dist) * p.speed;
        p.y += (dy / dist) * p.speed;
      }
    });
    projectiles.current = projectiles.current.filter(p => !p.hit);
  };

  const towerAttack = () => {
    towers.current.forEach(t => {
      const target = enemies.current.find(e => {
        const dx = e.x - t.x;
        const dy = e.y - t.y;
        return Math.sqrt(dx * dx + dy * dy) <= t.range;
      });
      if (target && !t.cooldown) {
        projectiles.current.push({
          x: t.x,
          y: t.y,
          target,
          speed: 5,
          damage: t.damage,
          color: "#34d399",
          hit: false,
        });
        t.cooldown = 20;
      }
      if (t.cooldown) t.cooldown--;
    });
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    drawPath(ctx);
    drawTowers(ctx);
    drawEnemies(ctx);
    drawProjectiles(ctx);

    updateEnemies();
    updateProjectiles();
    towerAttack();

    if (enemies.current.length === 0) {
      wave.current++;
      spawnWave();
      setCoins(prev => prev + 50);
    }

    if (lives <= 0) {
      runningRef.current = false;
      setGameOver(true);
    }

    if (runningRef.current) rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    resetGame();

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const placeTower = (e) => {
    if (coins < 50) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    towers.current.push({
      x,
      y,
      radius: 20,
      range: 100,
      damage: 1,
      color: "#60a5fa",
      cooldown: 0,
    });
    setCoins(prev => prev - 50);
  };

  return (
    <motion.div className="min-h-screen bg-black flex flex-col items-center justify-center p-3 relative" initial={{opacity:0}} animate={{opacity:1}}>
      <div className="w-full max-w-[480px] flex items-center justify-between mb-3">
        <button onClick={()=>navigate("/games")} className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600">⬅ Back</button>
        <h1 className="text-xl md:text-2xl font-extrabold text-cyan-400 drop-shadow">Tower Defense</h1>
        <button onClick={resetGame} className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600">↻ Restart</button>
      </div>

      <div className="w-full max-w-[480px] h-[640px] border-4 border-cyan-400 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.25)] overflow-hidden relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          onClick={placeTower}
          onTouchStart={placeTower}
        />
        <div className="absolute top-2 left-2 text-white">
          <p>Score: {score}</p>
          <p>Lives: {lives}</p>
          <p>Coins: {coins}</p>
          <p>Wave: {wave.current}</p>
        </div>
      </div>

      <AnimatePresence>
        {gameOver && <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.8,opacity:0}} className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-cyan-400 rounded-2xl p-6 text-center shadow-2xl max-w-[90vw]">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Game Over</h2>
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
