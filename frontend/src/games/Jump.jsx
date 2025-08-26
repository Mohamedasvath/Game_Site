import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function JumpGame() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [player, setPlayer] = useState({ x: 150, y: 300, width: 40, height: 40, dy: 0, jumping: false });
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const canvasWidth = 360;
  const canvasHeight = 500;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === " " || e.key === "ArrowUp") {
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player]);

  // Mobile touch control
  const handleTouch = () => {
    jump();
  };

  const jump = () => {
    if (!player.jumping) {
      setPlayer((p) => ({ ...p, dy: -10, jumping: true }));
    }
  };

  // Game loop
  useEffect(() => {
    if (gameOver) return;
    const ctx = canvasRef.current.getContext("2d");

    const draw = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Background
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Player (neon square)
      ctx.fillStyle = "#0ff";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#0ff";
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Obstacles
      ctx.fillStyle = "#f0f";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#f0f";
      obstacles.forEach((obs) => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      });

      // Score
      ctx.fillStyle = "#fff";
      ctx.shadowBlur = 0;
      ctx.font = "18px Arial";
      ctx.fillText(`Score: ${score}`, 10, 20);
    };

    const update = () => {
      // Gravity
      let newY = player.y + player.dy;
      let newDy = player.dy + 0.5;

      if (newY + player.height >= canvasHeight - 20) {
        newY = canvasHeight - 20 - player.height;
        newDy = 0;
        if (player.jumping) setPlayer((p) => ({ ...p, jumping: false }));
      }

      // Update obstacles
      let newObstacles = obstacles.map((obs) => ({ ...obs, x: obs.x - 4 }));
      if (newObstacles.length === 0 || newObstacles[newObstacles.length - 1].x < canvasWidth - 200) {
        newObstacles.push({ x: canvasWidth, y: canvasHeight - 40, width: 40, height: 20 });
      }
      newObstacles = newObstacles.filter((obs) => obs.x + obs.width > 0);

      // Collision detection
      newObstacles.forEach((obs) => {
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obs.y + obs.height &&
          player.y + player.height > obs.y
        ) {
          setGameOver(true);
        }
      });

      setPlayer((p) => ({ ...p, y: newY, dy: newDy }));
      setObstacles(newObstacles);
      setScore((s) => s + 1);
    };

    const loop = setInterval(() => {
      draw();
      update();
    }, 30);

    return () => clearInterval(loop);
  }, [player, obstacles, gameOver]);

  return (
    <motion.div
      className="min-h-screen bg-black flex flex-col items-center justify-center relative p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Back Button */}
      <div className="absolute top-3 left-3">
       
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 drop-shadow-lg mb-2">
        Neon Jump ✨
      </h1>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleTouch}
        className="bg-gray-900 border-4 border-cyan-400 rounded-xl max-w-full touch-none"
      />

      {gameOver && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute bg-black bg-opacity-80 text-white text-2xl p-6 rounded-xl"
        >
          Game Over 💀
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
