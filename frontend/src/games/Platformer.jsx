import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Platformer() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // UI state
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);

  // mutable refs for game state (no rerenders)
  const playerRef = useRef(null);
  const platformsRef = useRef([]);
  const enemiesRef = useRef([]);
  const coinsRef = useRef([]);
  const scorePopupsRef = useRef([]); // {x,y,text,life,alpha}
  const keysRef = useRef({ left: false, right: false, up: false });
  const mobileControlRef = useRef({ left: false, right: false, up: false });
  const lastTimeRef = useRef(0);
  const gameLoopRunningRef = useRef(false);
  const gameOverRef = useRef(false);

  // constants
  const BASE_CANVAS_WIDTH = 900;
  const BASE_CANVAS_HEIGHT = 500;
  const gravity = 0.8;
  const moveSpeed = 4.2;
  const jumpPower = -13;

  // level layouts (3 example levels)
  const levelData = [
    {
      platforms: [
        { x: 0, y: 440, width: 1200, height: 40 },
        { x: 180, y: 350, width: 140, height: 16 },
        { x: 380, y: 300, width: 160, height: 16 },
        { x: 620, y: 360, width: 120, height: 16 },
        { x: 820, y: 280, width: 120, height: 16 },
      ],
      enemies: [
        { x: 200, y: 314, width: 34, height: 34, dx: 1.2, alive: true },
        { x: 420, y: 264, width: 34, height: 34, dx: -1.1, alive: true },
        { x: 640, y: 324, width: 34, height: 34, dx: 1.3, alive: true },
      ],
      coins: [
        { x: 230, y: 300, size: 14, collected: false },
        { x: 450, y: 260, size: 14, collected: false },
        { x: 860, y: 240, size: 14, collected: false },
      ],
    },
    {
      platforms: [
        { x: 0, y: 440, width: 1200, height: 40 },
        { x: 150, y: 370, width: 120, height: 16 },
        { x: 350, y: 320, width: 120, height: 16 },
        { x: 550, y: 270, width: 120, height: 16 },
        { x: 750, y: 220, width: 140, height: 16 },
      ],
      enemies: [
        { x: 170, y: 334, width: 34, height: 34, dx: 1.5, alive: true },
        { x: 370, y: 284, width: 34, height: 34, dx: -1.2, alive: true },
        { x: 770, y: 184, width: 34, height: 34, dx: 1.4, alive: true },
      ],
      coins: [
        { x: 380, y: 280, size: 14, collected: false },
        { x: 580, y: 240, size: 14, collected: false },
        { x: 780, y: 180, size: 14, collected: false },
      ],
    },
    {
      platforms: [
        { x: 0, y: 440, width: 1200, height: 40 },
        { x: 220, y: 360, width: 100, height: 16 },
        { x: 420, y: 320, width: 100, height: 16 },
        { x: 620, y: 280, width: 100, height: 16 },
        { x: 820, y: 240, width: 100, height: 16 },
      ],
      enemies: [
        { x: 240, y: 324, width: 34, height: 34, dx: 1.8, alive: true },
        { x: 640, y: 244, width: 34, height: 34, dx: -1.6, alive: true },
      ],
      coins: [
        { x: 250, y: 310, size: 14, collected: false },
        { x: 450, y: 270, size: 14, collected: false },
        { x: 850, y: 200, size: 14, collected: false },
      ],
    },
  ];

  // init level
  const initLevel = (lvl = 1) => {
    const data = levelData[(lvl - 1) % levelData.length];
    playerRef.current = { x: 40, y: 0, width: 36, height: 40, dx: 0, dy: 0, grounded: false };
    platformsRef.current = data.platforms.map((p) => ({ ...p }));
    enemiesRef.current = data.enemies.map((e) => ({ ...e }));
    coinsRef.current = data.coins.map((c) => ({ ...c }));
    scorePopupsRef.current = [];
    setGameOver(false);
    gameOverRef.current = false;
    setLevel(lvl);
  };

  useEffect(() => {
    initLevel(1);
  }, []);

  // score popup helper
  const addScorePopup = (x, y, text) => {
    // push a popup (we store positions in game space; canvas draw will place them)
    scorePopupsRef.current.push({ x, y, text, life: 60, alpha: 1 });
  };

  // resize canvas and set transform for DPR
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const containerWidth = Math.min(window.innerWidth - 32, BASE_CANVAS_WIDTH);
    const desiredWidth = Math.max(360, containerWidth);
    const desiredHeight = Math.round((desiredWidth / BASE_CANVAS_WIDTH) * BASE_CANVAS_HEIGHT);
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.style.width = `${desiredWidth}px`;
    canvas.style.height = `${desiredHeight}px`;
    canvas.width = Math.floor(desiredWidth * dpr);
    canvas.height = Math.floor(desiredHeight * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // keyboard handlers
  useEffect(() => {
    const down = (e) => {
      if (["ArrowLeft", "KeyA"].includes(e.code)) keysRef.current.left = true;
      if (["ArrowRight", "KeyD"].includes(e.code)) keysRef.current.right = true;
      if (["ArrowUp", "KeyW", "Space"].includes(e.code)) keysRef.current.up = true;
    };
    const up = (e) => {
      if (["ArrowLeft", "KeyA"].includes(e.code)) keysRef.current.left = false;
      if (["ArrowRight", "KeyD"].includes(e.code)) keysRef.current.right = false;
      if (["ArrowUp", "KeyW", "Space"].includes(e.code)) keysRef.current.up = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // mobile controls
  const touchStartControl = (name) => { mobileControlRef.current[name] = true; };
  const touchEndControl = (name) => { mobileControlRef.current[name] = false; };

  // single game loop (runs once)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    gameLoopRunningRef.current = true;
    lastTimeRef.current = performance.now();

    const updatePhysics = (dt) => {
      if (gameOverRef.current) return; // pause physics if game over

      const player = playerRef.current;
      const platforms = platformsRef.current;
      const enemies = enemiesRef.current;
      const coins = coinsRef.current;

      const left = keysRef.current.left || mobileControlRef.current.left;
      const right = keysRef.current.right || mobileControlRef.current.right;
      const up = keysRef.current.up || mobileControlRef.current.up;

      // movement
      if (left && !right) player.dx = -moveSpeed;
      else if (right && !left) player.dx = moveSpeed;
      else player.dx = 0;

      // jump
      if (up && player.grounded) {
        player.dy = jumpPower;
        player.grounded = false;
      }

      // physics
      player.dy += gravity;
      player.x += player.dx;
      player.y += player.dy;

      // horizontal bounds
      const worldW = canvas.clientWidth;
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > worldW) player.x = worldW - player.width;

      // platform collision (vertical)
      player.grounded = false;
      for (let p of platforms) {
        if (player.x + player.width > p.x && player.x < p.x + p.width) {
          const prevBottom = player.y + player.height - player.dy;
          const bottom = player.y + player.height;
          if (prevBottom <= p.y && bottom >= p.y && player.dy >= 0) {
            player.y = p.y - player.height;
            player.dy = 0;
            player.grounded = true;
          }
        }
      }

      // enemies
      for (let e of enemies) {
        if (!e.alive) continue;
        e.x += e.dx;

        // keep on platform
        const platform = platforms.find(
          (p) => e.x + e.width > p.x && e.x < p.x + p.width && Math.abs(e.y + e.height - p.y) < 10
        );
        if (!platform) {
          e.dx *= -1;
          e.x += e.dx * 2;
        } else {
          if (e.x <= platform.x) { e.x = platform.x; e.dx = Math.abs(e.dx); }
          if (e.x + e.width >= platform.x + platform.width) { e.x = platform.x + platform.width - e.width; e.dx = -Math.abs(e.dx); }
        }

        // collision with player
        if (
          player.x < e.x + e.width &&
          player.x + player.width > e.x &&
          player.y < e.y + e.height &&
          player.y + player.height > e.y
        ) {
          if (player.dy > 2 && player.y + player.height - e.y < 18) {
            // stomp
            e.alive = false;
            player.dy = jumpPower * 0.55;
            setScore((s) => s + 150);
            addScorePopup(e.x, e.y - 6, "+150");
          } else {
            // side hit -> game over
            gameOverRef.current = true;
            setGameOver(true);
          }
        }
      }

      // coins
      for (let c of coins) {
        if (!c.collected) {
          if (
            player.x < c.x + c.size &&
            player.x + player.width > c.x &&
            player.y < c.y + c.size &&
            player.y + player.height > c.y
          ) {
            c.collected = true;
            setScore((s) => s + 50);
            addScorePopup(c.x, c.y - 6, "+50");
          }
        }
      }

      // update score popups
      for (let sp of scorePopupsRef.current) {
        sp.y -= 24 * (dt || 0.016); // move up
        sp.life -= 1;
        sp.alpha = Math.max(0, sp.life / 60);
      }
      scorePopupsRef.current = scorePopupsRef.current.filter((sp) => sp.life > 0);
    };

    const draw = () => {
      const player = playerRef.current;
      const platforms = platformsRef.current;
      const enemies = enemiesRef.current;
      const coins = coinsRef.current;

      // clear
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      // platforms
      ctx.fillStyle = "#6B4226";
      for (let p of platforms) ctx.fillRect(p.x, p.y, p.width, p.height);

      // coins
      for (let c of coins) {
        if (!c.collected) {
          ctx.fillStyle = "gold";
          ctx.beginPath();
          ctx.arc(c.x + c.size / 2, c.y + c.size / 2, c.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // enemies
      ctx.fillStyle = "crimson";
      for (let e of enemies) if (e.alive) ctx.fillRect(e.x, e.y, e.width, e.height);

      // player
      ctx.fillStyle = "royalblue";
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // UI
      ctx.fillStyle = "#111";
      ctx.font = "16px sans-serif";
      ctx.fillText("Score: " + score, 12, 22);
      ctx.fillText("Level: " + level, 12, 40);

      // draw score popups
      ctx.font = "bold 18px sans-serif";
      for (let sp of scorePopupsRef.current) {
        ctx.fillStyle = `rgba(0,0,0,${sp.alpha})`;
        ctx.fillText(sp.text, sp.x, sp.y);
      }
    };

    // animation frame callback
    const loop = (time) => {
      if (!gameLoopRunningRef.current) return;
      const now = time || performance.now();
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      updatePhysics(dt);
      draw();

      requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    requestAnimationFrame(loop);

    // cleanup
    return () => {
      gameLoopRunningRef.current = false;
    };
  }, []); // run once

  // restart & next level helpers
  const handleRestart = () => {
    setScore(0);
    initLevel(1);
    gameOverRef.current = false;
    setGameOver(false);
    lastTimeRef.current = performance.now();
    // loop already running; physics will resume because gameOverRef is false
  };

  const handleNextLevel = () => {
    const next = level + 1;
    initLevel(next);
    gameOverRef.current = false;
    setGameOver(false);
    lastTimeRef.current = performance.now();
    // optionally boost enemy speed slightly per level
    enemiesRef.current.forEach((e) => (e.dx *= 1 + 0.12 * next));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-700 to-purple-800 p-4">
      <div className="w-full max-w-3xl flex justify-between items-center mb-3">
        {/* <button onClick={() => navigate("/")} className="px-4 py-2 bg-pink-500 text-white rounded-lg">
          ⬅ Back
        </button> */}

        <div className="text-white">
          <div className="text-lg font-semibold">Platformer</div>
          <div className="text-sm">Collect coins, stomp enemies</div>
        </div>

        <div className="text-white text-right">
          <div>Score: <span className="font-bold">{score}</span></div>
          <div>Level: <span className="font-bold">{level}</span></div>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <canvas ref={canvasRef} style={{ maxWidth: "100%", borderRadius: 12, background: "#87CEEB" }} />
      </div>

      {/* mobile controls */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-4 sm:hidden">
        <button className="w-16 h-16 rounded-full bg-gray-800 text-white text-2xl"
                onTouchStart={() => touchStartControl("left")}
                onTouchEnd={() => touchEndControl("left")}>⬅</button>
        <button className="w-16 h-16 rounded-full bg-gray-800 text-white text-2xl"
                onTouchStart={() => touchStartControl("up")}
                onTouchEnd={() => touchEndControl("up")}>⬆</button>
        <button className="w-16 h-16 rounded-full bg-gray-800 text-white text-2xl"
                onTouchStart={() => touchStartControl("right")}
                onTouchEnd={() => touchEndControl("right")}>➡</button>
      </div>

      {/* Game Over popup */}
      <AnimatePresence>
        {gameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <motion.div initial={{ y: -20, scale: 0.95 }} animate={{ y: 0, scale: 1 }}
                        className="bg-white rounded-2xl p-6 text-center max-w-sm w-full">
              <h2 className="text-2xl font-bold mb-2">💀 Game Over</h2>
              <p className="mb-4">Your Score: <span className="font-bold">{score}</span></p>
              <div className="flex justify-center gap-3">
                <button onClick={handleRestart} className="px-4 py-2 bg-green-500 text-white rounded-lg">Restart</button>
                <button onClick={handleNextLevel} className="px-4 py-2 bg-yellow-500 text-black rounded-lg">Next Level</button>
                <button onClick={() => navigate("/games")} className="px-4 py-2 bg-pink-500 text-white rounded-lg">Back</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
