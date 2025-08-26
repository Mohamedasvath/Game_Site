import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


export default function Breakout({ onBack }) {
  const canvasRef = useRef(null);
  const [bricks, setBricks] = useState([]);
  const [ball, setBall] = useState({ x: 160, y: 250, dx: 3, dy: -3, radius: 8 });
  const [paddle, setPaddle] = useState({ x: 130, width: 80, height: 12 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();
 

  const canvasWidth = 360; // 📱 mobile-friendly
  const canvasHeight = 500;
  const rows = 5;
  const cols = 6;

  // 🎮 Build Bricks Grid
  useEffect(() => {
    const temp = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        temp.push({
          x: c * 55 + 15,
          y: r * 30 + 30,
          width: 50,
          height: 20,
          destroyed: false,
        });
      }
    }
    setBricks(temp);
  }, []);

  // 🎮 Keyboard control
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") {
        setPaddle((p) => ({ ...p, x: Math.max(p.x - 30, 0) }));
      } else if (e.key === "ArrowRight") {
        setPaddle((p) => ({ ...p, x: Math.min(p.x + 30, canvasWidth - p.width) }));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // 🎮 Touch control for mobile
  const handleTouchMove = (e) => {
    const touchX = e.touches[0].clientX - canvasRef.current.getBoundingClientRect().left;
    setPaddle((p) => ({
      ...p,
      x: Math.min(Math.max(touchX - p.width / 2, 0), canvasWidth - p.width),
    }));
  };

  // 🎮 Game Loop
  useEffect(() => {
    if (gameOver) return;
    const ctx = canvasRef.current.getContext("2d");

    const draw = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // 🟩 Paddle
      ctx.fillStyle = "#0ff";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#0ff";
      ctx.fillRect(paddle.x, canvasHeight - 30, paddle.width, paddle.height);

      // 🟡 Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#f0f";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#f0f";
      ctx.fill();
      ctx.closePath();

      // 🧱 Bricks
      bricks.forEach((brick) => {
        if (!brick.destroyed) {
          ctx.fillStyle = "#ff0";
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#ff0";
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
      });
    };

    const update = () => {
      setBall((prev) => {
        let { x, y, dx, dy, radius } = prev;
        x += dx;
        y += dy;

        // Wall collision
        if (x - radius < 0 || x + radius > canvasWidth) dx = -dx;
        if (y - radius < 0) dy = -dy;

        // Paddle collision
        if (
          y + radius >= canvasHeight - 30 &&
          x > paddle.x &&
          x < paddle.x + paddle.width
        ) {
          dy = -dy;
        }

        // Bottom collision -> Game Over
        if (y + radius > canvasHeight) {
          setGameOver(true);
          return prev;
        }

        // Brick collision
        setBricks((br) =>
          br.map((brick) => {
            if (!brick.destroyed) {
              if (
                x > brick.x &&
                x < brick.x + brick.width &&
                y - radius < brick.y + brick.height &&
                y + radius > brick.y
              ) {
                dy = -dy;
                brick.destroyed = true;
                setScore((s) => s + 10);
              }
            }
            return brick;
          })
        );

        return { x, y, dx, dy, radius };
      });
    };

    const loop = setInterval(() => {
      draw();
      update();
    }, 20);

    return () => clearInterval(loop);
  }, [paddle, bricks, gameOver]);

  return (
    <motion.div
      className="min-h-screen bg-black flex flex-col items-center justify-center relative p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="absolute top-3 left-3">
        <button
    onClick={() => navigate("/")}
    className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600"
  >
    ⬅ Back
  </button>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 drop-shadow-lg mb-2">
        Neon Breakout 🎇
      </h1>
      <h2 className="text-white text-lg mb-3">Score: {score}</h2>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="bg-gray-900 border-4 border-cyan-400 rounded-xl touch-none max-w-full"
        onTouchMove={handleTouchMove}
      />

      {gameOver && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute bg-black bg-opacity-80 text-white text-2xl p-6 rounded-xl"
        >
          Game Over 💀 <br />
          Score: {score}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600"
          >
            Restart
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
