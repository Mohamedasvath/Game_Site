import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function CarRaceRealistic() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const runningRef = useRef(false);

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [high, setHigh] = useState(() => Number(localStorage.getItem("car-high") || 0));
  const [speed, setSpeed] = useState(5);

  // Mobile touch buttons state
  const keys = useRef({ left: false, right: false });

  const canvasWidth = 400;
  const canvasHeight = 600;

  // Smaller player car
  const player = useRef({ x: canvasWidth / 2 - 25, y: canvasHeight - 110, width: 50, height: 90, color: "#ff0055", tilt: 0 });
  const obstacles = useRef([]);
  const roadOffset = useRef(0);
  const particles = useRef([]);

  const resetGame = () => {
    setScore(0);
    setSpeed(5);
    setGameOver(false);
    player.current.x = canvasWidth / 2 - player.current.width / 2;
    player.current.tilt = 0;
    obstacles.current = [];
    particles.current = [];
    runningRef.current = true;
    loop();
  };

  const drawRoad = (ctx) => {
    ctx.fillStyle = "#444";
    ctx.fillRect(50, 0, canvasWidth - 100, canvasHeight);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, roadOffset.current);
    ctx.lineTo(canvasWidth / 2, canvasHeight + roadOffset.current);
    ctx.stroke();
    ctx.setLineDash([]);

    roadOffset.current += speed;
    if (roadOffset.current > 40) roadOffset.current = 0;
  };

  const drawCar = (ctx, car, isPlayer = false) => {
    ctx.save();
    ctx.translate(car.x + car.width / 2, car.y + car.height / 2);
    if (isPlayer) ctx.rotate(car.tilt);
    ctx.fillStyle = car.color;
    ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);

    // wheels
    ctx.fillStyle = "#111";
    const wheelW = car.width * 0.2;
    const wheelH = car.height * 0.15;
    ctx.fillRect(-car.width / 2 + 5, -car.height / 2 + 5, wheelW, wheelH);
    ctx.fillRect(car.width / 2 - wheelW - 5, -car.height / 2 + 5, wheelW, wheelH);
    ctx.fillRect(-car.width / 2 + 5, car.height / 2 - wheelH - 5, wheelW, wheelH);
    ctx.fillRect(car.width / 2 - wheelW - 5, car.height / 2 - wheelH - 5, wheelW, wheelH);

    ctx.restore();

    if (isPlayer) {
      for (let i = 0; i < 3; i++) {
        particles.current.push({
          x: car.x + car.width / 2 + (Math.random() - 0.5) * 20,
          y: car.y + car.height,
          vx: (Math.random() - 0.5) * 2,
          vy: 4 + Math.random() * 2,
          alpha: 0.5 + Math.random() * 0.5,
          size: 2 + Math.random() * 2,
        });
      }
    }
  };

  const drawParticles = (ctx) => {
    const remaining = [];
    particles.current.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = "#fff";
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      if (p.alpha > 0) remaining.push(p);
    });
    particles.current = remaining;
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Player movement
    if (keys.current.left) {
      player.current.x -= 6;
      player.current.tilt = -0.1;
    } else if (keys.current.right) {
      player.current.x += 6;
      player.current.tilt = 0.1;
    } else {
      player.current.tilt *= 0.9;
    }
    player.current.x = Math.max(50, Math.min(canvasWidth - 100 - player.current.width + 50, player.current.x));

    // Spawn AI cars
    if (Math.random() < 0.03) {
      const types = [
        { w: 50, h: 100 },
        { w: 70, h: 140 },
        { w: 40, h: 80 },
      ];
      const type = types[Math.floor(Math.random() * types.length)];
      obstacles.current.push({
        x: 50 + Math.random() * (canvasWidth - 100 - type.w),
        y: -type.h,
        width: type.w,
        height: type.h,
        color: ["#f87171","#34d399","#60a5fa","#facc15","#a78bfa"][Math.floor(Math.random() * 5)]
      });
    }

    obstacles.current.forEach(o => o.y += speed);

    // Collision
    for (let o of obstacles.current) {
      if (
        player.current.x < o.x + o.width &&
        player.current.x + player.current.width > o.x &&
        player.current.y < o.y + o.height &&
        player.current.y + player.current.height > o.y
      ) {
        runningRef.current = false;
        setGameOver(true);
        const best = Math.max(score, high);
        setHigh(best);
        localStorage.setItem("car-high", best.toString());
      }
    }

    obstacles.current = obstacles.current.filter(o => o.y < canvasHeight);

    setScore(prev => prev + 1);
    if (score % 200 === 0) setSpeed(prev => prev + 0.5);

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawRoad(ctx);
    drawParticles(ctx);
    drawCar(ctx, player.current, true);
    obstacles.current.forEach(o => drawCar(ctx, o));

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High: ${high}`, 10, 60);

    if (runningRef.current) rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    resetGame();

    const keyDown = e => {
      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
    };
    const keyUp = e => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  return (
    <motion.div className="min-h-screen bg-black flex flex-col items-center justify-center relative p-3" initial={{opacity:0}} animate={{opacity:1}}>
      <div className="w-full max-w-[480px] flex items-center justify-between mb-3">
        <button onClick={()=>navigate("/games")} className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600">⬅ Back</button>
        <h1 className="text-xl md:text-2xl font-extrabold text-cyan-400 drop-shadow">Car Race Realistic 🏎️</h1>
        <button onClick={resetGame} className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600">↻ Restart</button>
      </div>
      <div className="w-full max-w-[480px] h-[640px] border-4 border-cyan-400 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.25)] overflow-hidden relative">
        <canvas ref={canvasRef} className="w-full h-full"/>
        {/* Mobile Buttons */}
        <div className="absolute bottom-4 left-0 w-full flex justify-between px-4 sm:hidden">
          <button 
            onTouchStart={()=>keys.current.left = true} 
            onTouchEnd={()=>keys.current.left = false} 
            className="px-5 py-3 bg-cyan-500/30 text-white rounded-xl">Left</button>
          <button 
            onTouchStart={()=>keys.current.right = true} 
            onTouchEnd={()=>keys.current.right = false} 
            className="px-5 py-3 bg-cyan-500/30 text-white">Right</button>
        </div>
      </div>

      <AnimatePresence>
        {gameOver && <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.8,opacity:0}} className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 border border-cyan-400 rounded-2xl p-6 text-center shadow-2xl max-w-[90vw]">
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Game Over</h2>
            <p className="text-cyan-100 mb-4">Score: {score} &nbsp;•&nbsp; High: {high}</p>
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
