import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SpaceInvaders() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const maxCanvasWidth = 600;
  const canvasHeight = 500;

  const playerWidth = 40;
  const playerHeight = 40;
  const bulletSpeed = 6;
  const invaderWidth = 30;
  const invaderHeight = 30;
  const invaderRows = 4;
  const invaderCols = 6;
  const invaderSpacing = 15;

  const playerEmoji = "❤️‍🩹";
  const bulletEmoji = "💥";
  const invaderEmojis = ["👾", "🛸", "👽", "🤖", "🧟"];
  const starEmojis = ["✦", "✧", "✩", "✨"];

  // --- Refs ---
  const playerRef = useRef({ x: 0, y: canvasHeight - 60 });
  const bulletsRef = useRef([]);
  const invadersRef = useRef([]);
  const starsRef = useRef([]);
  const invaderDirRef = useRef(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(Math.min(window.innerWidth - 40, maxCanvasWidth));

  // --- Setup Invaders ---
  const setupInvaders = () => {
    const arr = [];
    for (let r = 0; r < invaderRows; r++) {
      for (let c = 0; c < invaderCols; c++) {
        arr.push({
          x: c * (invaderWidth + invaderSpacing) + 30,
          y: r * (invaderHeight + invaderSpacing) + 30,
          emoji: invaderEmojis[Math.floor(Math.random() * invaderEmojis.length)],
        });
      }
    }
    invadersRef.current = arr;
  };

  // --- Setup Stars ---
  const setupStars = () => {
    const arr = [];
    for (let i = 0; i < 50; i++) {
      arr.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
      });
    }
    starsRef.current = arr;
  };

  // --- Reset Game ---
  const resetGame = () => {
    playerRef.current = { x: canvasWidth / 2 - playerWidth / 2, y: canvasHeight - 60 };
    bulletsRef.current = [];
    setScore(0);
    setGameOver(false);
    setupInvaders();
    setupStars();
  };

  // --- Responsive Canvas ---
  useEffect(() => {
    const handleResize = () => {
      const newWidth = Math.min(window.innerWidth - 40, maxCanvasWidth);
      setCanvasWidth(newWidth);
      playerRef.current.x = newWidth / 2 - playerWidth / 2;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Initialize ---
  useEffect(() => {
    setupInvaders();
    setupStars();
    playerRef.current.x = canvasWidth / 2 - playerWidth / 2;
  }, [canvasWidth]);

  // --- Keyboard Controls ---
  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === "ArrowLeft") movePlayer(-10);
      if (e.key === "ArrowRight") movePlayer(10);
      if (e.key === " " || e.key === "ArrowUp") shoot();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver, canvasWidth]);

  // --- Touch Drag Controls ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleTouchMove = (e) => {
      if (gameOver) return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      const newX = touch.clientX - rect.left - playerWidth / 2;
      playerRef.current.x = Math.max(0, Math.min(canvasWidth - playerWidth, newX));
    };
    canvas.addEventListener("touchmove", handleTouchMove);
    return () => canvas.removeEventListener("touchmove", handleTouchMove);
  }, [gameOver, canvasWidth]);

  // --- Game Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const invaderSpeed = Math.max(1, canvasWidth / 400);

    const loop = setInterval(() => {
      if (gameOver) return;

      // --- Move bullets ---
      bulletsRef.current = bulletsRef.current.map(b => ({ ...b, y: b.y - bulletSpeed }));

      // --- Move invaders ---
      let formationLeft = Math.min(...invadersRef.current.map(inv => inv.x));
      let formationRight = Math.max(...invadersRef.current.map(inv => inv.x + invaderWidth));
      // Only drop when full formation hits edge
      if (formationLeft <= 0) invaderDirRef.current = 1;
      if (formationRight >= canvasWidth) invaderDirRef.current = -1;

      invadersRef.current = invadersRef.current.map(inv => ({
        ...inv,
        x: inv.x + invaderSpeed * invaderDirRef.current,
        y: inv.y + ((invaderDirRef.current === 1 && formationLeft <= 0) || (invaderDirRef.current === -1 && formationRight >= canvasWidth) ? 10 : 0)
      }));

      // --- Collision Detection ---
      const remainingBullets = [];
      bulletsRef.current.forEach(b => {
        let hit = false;
        invadersRef.current.forEach((inv, idx) => {
          if (
            b.x < inv.x + invaderWidth &&
            b.x + 6 > inv.x &&
            b.y < inv.y + invaderHeight &&
            b.y + 10 > inv.y
          ) {
            hit = true;
            setScore(s => s + 10);
            invadersRef.current.splice(idx, 1);
          }
        });
        if (!hit && b.y > 0) remainingBullets.push(b);
      });
      bulletsRef.current = remainingBullets;

      // --- Move Stars ---
      starsRef.current = starsRef.current.map(s => ({
        ...s,
        y: s.y + s.speed > canvasHeight ? 0 : s.y + s.speed
      }));

      // --- Game Over Check ---
      if (invadersRef.current.some(inv => inv.y + invaderHeight >= playerRef.current.y)) setGameOver(true);
      if (invadersRef.current.length === 0) setGameOver(true);

      // --- Draw ---
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Stars
      starsRef.current.forEach(s => {
        ctx.font = `${s.size * 5}px serif`;
        ctx.fillStyle = "#fff";
        ctx.fillText(starEmojis[Math.floor(Math.random() * starEmojis.length)], s.x, s.y);
      });

      // Bullets
      bulletsRef.current.forEach(b => {
        ctx.font = "20px serif";
        ctx.fillStyle = "#ff0";
        ctx.fillText(bulletEmoji, b.x, b.y);
      });

      // Invaders
      invadersRef.current.forEach(inv => {
        ctx.font = `${invaderHeight}px serif`;
        const textWidth = ctx.measureText(inv.emoji).width;
        ctx.fillText(inv.emoji, inv.x + (invaderWidth - textWidth) / 2, inv.y + invaderHeight);
      });

      // Player
      ctx.font = `${playerHeight}px serif`;
      const playerTextWidth = ctx.measureText(playerEmoji).width;
      ctx.fillText(playerEmoji, playerRef.current.x + (playerWidth - playerTextWidth) / 2, playerRef.current.y + playerHeight);

      // Score
      ctx.fillStyle = "#fff";
      ctx.font = "18px Arial";
      ctx.fillText(`Score: ${score}`, 10, 20);

    }, 20);

    return () => clearInterval(loop);
  }, [gameOver, score, canvasWidth]);

  // --- Controls ---
  const movePlayer = dx => {
    playerRef.current.x = Math.max(0, Math.min(canvasWidth - playerWidth, playerRef.current.x + dx));
  };
  const shoot = () => {
    bulletsRef.current.push({ x: playerRef.current.x + playerWidth / 2 - 2, y: playerRef.current.y - 10 });
  };

  return (
    <div className="flex flex-col items-center justify-center bg-black p-4 min-h-screen relative">
      <div className="flex justify-between w-full max-w-[600px] mb-3 px-2">
        {/* <button onClick={() => navigate("/")} className="px-4 py-2 bg-pink-500 text-white rounded-lg">
          ⬅ Back
        </button> */}
        <div className="flex space-x-2">
          <button onClick={() => movePlayer(-20)} className="px-4 py-2 bg-blue-500 text-white rounded-lg">⬅</button>
          <button onClick={shoot} className="px-4 py-2 bg-green-500 text-white rounded-lg">Fire 🔥</button>
          <button onClick={() => movePlayer(20)} className="px-4 py-2 bg-blue-500 text-white rounded-lg">➡</button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border-2 border-white rounded-lg touch-none max-w-full"
      />

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white text-2xl p-6 rounded-xl">
          Game Over 💀
          <button onClick={resetGame} className="mt-4 px-6 py-2 bg-green-500 rounded-lg">
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
