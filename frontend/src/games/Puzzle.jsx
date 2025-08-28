import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function PlatformPuzzleGame() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const canvasWidth = 480;
  const canvasHeight = 640;

  const player = useRef({
    x: 50,
    y: 500,
    width: 40,
    height: 60,
    vx: 0,
    vy: 0,
    onGround: false,
    color: "#ff0055",
  });

  const keys = useRef({ left: false, right: false, jump: false });
  const touch = useRef({ left: false, right: false, jump: false });

  const platforms = [
    { x: 0, y: 580, width: 480, height: 60 }, // ground
    { x: 100, y: 450, width: 120, height: 20 },
    { x: 300, y: 350, width: 120, height: 20 },
    { x: 50, y: 250, width: 100, height: 20 },
  ];

  const collectibles = [
    { x: 120, y: 410, width: 20, height: 20, collected: false },
    { x: 320, y: 310, width: 20, height: 20, collected: false },
    { x: 70, y: 210, width: 20, height: 20, collected: false },
  ];

  const gravity = 0.6;
  const moveSpeed = 4;
  const jumpPower = -12;

  const resetGame = () => {
    player.current.x = 50;
    player.current.y = 500;
    player.current.vx = 0;
    player.current.vy = 0;
    collectibles.forEach(c => (c.collected = false));
    setScore(0);
    setGameOver(false);
    loop();
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle input
    if (keys.current.left || touch.current.left) player.current.vx = -moveSpeed;
    else if (keys.current.right || touch.current.right) player.current.vx = moveSpeed;
    else player.current.vx = 0;

    if ((keys.current.jump || touch.current.jump) && player.current.onGround) {
      player.current.vy = jumpPower;
      player.current.onGround = false;
    }

    // Apply physics
    player.current.vy += gravity;
    player.current.x += player.current.vx;
    player.current.y += player.current.vy;

    // Collision with platforms
    player.current.onGround = false;
    platforms.forEach(p => {
      if (
        player.current.x + player.current.width > p.x &&
        player.current.x < p.x + p.width &&
        player.current.y + player.current.height > p.y &&
        player.current.y + player.current.height < p.y + p.height + player.current.vy
      ) {
        player.current.y = p.y - player.current.height;
        player.current.vy = 0;
        player.current.onGround = true;
      }
    });

    // Collectibles
    collectibles.forEach(c => {
      if (!c.collected) {
        if (
          player.current.x + player.current.width > c.x &&
          player.current.x < c.x + c.width &&
          player.current.y + player.current.height > c.y &&
          player.current.y < c.y + c.height
        ) {
          c.collected = true;
          setScore(prev => prev + 1);
        }
      }
    });

    // Out of bounds
    if (player.current.y > canvasHeight) {
      setGameOver(true);
    }

    // Draw
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Platforms
    platforms.forEach(p => {
      ctx.fillStyle = "#888";
      ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // Collectibles
    collectibles.forEach(c => {
      if (!c.collected) {
        ctx.fillStyle = "gold";
        ctx.fillRect(c.x, c.y, c.width, c.height);
      }
    });

    // Player
    ctx.fillStyle = player.current.color;
    ctx.fillRect(player.current.x, player.current.y, player.current.width, player.current.height);

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);

    if (!gameOver) rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    resetGame();

    const keyDown = e => {
      if (e.key === "ArrowLeft") keys.current.left = true;
      if (e.key === "ArrowRight") keys.current.right = true;
      if (e.key === " ") keys.current.jump = true;
    };
    const keyUp = e => {
      if (e.key === "ArrowLeft") keys.current.left = false;
      if (e.key === "ArrowRight") keys.current.right = false;
      if (e.key === " ") keys.current.jump = false;
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <motion.div className="min-h-screen bg-black flex flex-col items-center justify-center relative p-3" initial={{opacity:0}} animate={{opacity:1}}>
      <div className="w-full max-w-[480px] flex items-center justify-between mb-3">
        {/* <button onClick={()=>navigate("/games")} className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600">⬅ Back</button> */}
        <h1 className="text-xl md:text-2xl font-extrabold text-cyan-400 drop-shadow">Platform Puzzle 🧩</h1>
        <button onClick={resetGame} className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600">↻ Restart</button>
      </div>
      <div className="w-full max-w-[480px] h-[640px] border-4 border-cyan-400 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.25)] overflow-hidden relative">
        <canvas ref={canvasRef} className="w-full h-full"/>
        {/* Mobile Buttons */}
        <div className="absolute bottom-4 left-0 w-full flex justify-between px-4 sm:hidden">
          <button onTouchStart={()=>touch.current.left=true} onTouchEnd={()=>touch.current.left=false} className="px-5 py-3 bg-cyan-500/30 text-white rounded-xl">Left</button>
          <button onTouchStart={()=>touch.current.jump=true} onTouchEnd={()=>touch.current.jump=false} className="px-5 py-3 bg-cyan-500/30 text-white">Jump</button>
          <button onTouchStart={()=>touch.current.right=true} onTouchEnd={()=>touch.current.right=false} className="px-5 py-3 bg-cyan-500/30 text-white rounded-xl">Right</button>
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
