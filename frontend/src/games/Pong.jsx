import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NeonPong() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [ball, setBall] = useState({ x: 180, y: 250, dx: 4, dy: 4, radius: 8 });
  const [paddle1, setPaddle1] = useState({ x: 140, width: 100, height: 12 });
  const [paddle2, setPaddle2] = useState({ x: 140, width: 100, height: 12 });
  const [score, setScore] = useState({ player: 0, ai: 0 });

  const canvasWidth = 360;
  const canvasHeight = 500;

  // Keyboard control
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") setPaddle1((p) => ({ ...p, x: Math.max(p.x - 25, 0) }));
      if (e.key === "ArrowRight") setPaddle1((p) => ({ ...p, x: Math.min(p.x + 25, canvasWidth - p.width) }));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Touch control
  const handleTouchMove = (e) => {
    const touchX = e.touches[0].clientX - canvasRef.current.getBoundingClientRect().left;
    setPaddle1((p) => ({ ...p, x: Math.min(Math.max(touchX - p.width / 2, 0), canvasWidth - p.width) }));
  };

  // Game loop
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const draw = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Background glow
      ctx.fillStyle = "#0c0c0c";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Player paddle neon
      ctx.fillStyle = "#0ff";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#0ff";
      ctx.fillRect(paddle1.x, canvasHeight - 30, paddle1.width, paddle1.height);

      // AI paddle neon
      ctx.fillStyle = "#f0f";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#f0f";
      ctx.fillRect(paddle2.x, 20, paddle2.width, paddle2.height);

      // Ball with neon trail
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
      gradient.addColorStop(0, "#fff");
      gradient.addColorStop(0.5, "#ff0");
      gradient.addColorStop(1, "#f0f");
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#fff";
      ctx.fill();
      ctx.closePath();

      // Score
      ctx.fillStyle = "#0ff";
      ctx.font = "20px monospace";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#0ff";
      ctx.fillText(`Player: ${score.player}`, 10, canvasHeight - 10);
      ctx.fillText(`AI: ${score.ai}`, 10, 30);
    };

    const update = () => {
      let { x, y, dx, dy, radius } = ball;
      x += dx;
      y += dy;

      // Wall collision
      if (x - radius < 0 || x + radius > canvasWidth) dx = -dx;

      // Paddle collisions
      if (y + radius >= canvasHeight - 30 && x > paddle1.x && x < paddle1.x + paddle1.width) dy = -dy;
      if (y - radius <= 20 + paddle2.height && x > paddle2.x && x < paddle2.x + paddle2.width) dy = -dy;

      // Score update
      if (y + radius > canvasHeight) { setScore((s) => ({ ...s, ai: s.ai + 1 })); x = canvasWidth / 2; y = canvasHeight / 2; dy = 4; }
      if (y - radius < 0) { setScore((s) => ({ ...s, player: s.player + 1 })); x = canvasWidth / 2; y = canvasHeight / 2; dy = -4; }

      // AI movement
      setPaddle2((p) => ({ ...p, x: Math.min(Math.max(ball.x - p.width / 2, 0), canvasWidth - p.width) }));

      setBall({ x, y, dx, dy, radius });
    };

    const loop = setInterval(() => { draw(); update(); }, 20);
    return () => clearInterval(loop);
  }, [ball, paddle1, paddle2, score]);

  return (
    <motion.div
      className="min-h-screen bg-black flex flex-col items-center justify-center relative p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute top-3 left-3">
        <button
          onClick={() => navigate("/games")}
          className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600"
        >
          ⬅ Back
        </button>
      </div>

      <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-xl mb-2">
        Neon Pong 🎇
      </h1>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="bg-gray-900 border-4 border-cyan-400 rounded-xl touch-none max-w-full"
        onTouchMove={handleTouchMove}
      />
    </motion.div>
  );
}
