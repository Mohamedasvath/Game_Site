import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BirdImg from "../assets/bird.png"; // <-- Add your bird image here

export default function FlappyBird() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Canvas size
  const canvasWidth = 360;
  const canvasHeight = 500;

  // Bird settings
  const birdSize = 40;
  const gravity = 0.5;    // slightly less gravity
  const jumpPower = -6;   // lower jump power for playable jump

  // Pipe settings
  const pipeWidth = 50;
  const pipeGap = 120;
  const pipeSpeed = 2;

  // Game state
  const [pipes, setPipes] = useState([{ x: canvasWidth, topHeight: 200, passed: false }]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use ref for bird for accurate collision
  const birdRef = useRef({ x: 60, y: canvasHeight / 2, dy: 0 });

  // Jump function
  const jump = () => {
    if (!gameOver) {
      birdRef.current.dy = jumpPower;
    } else {
      // Restart
      birdRef.current = { x: 60, y: canvasHeight / 2, dy: 0 };
      setPipes([{ x: canvasWidth, topHeight: 200, passed: false }]);
      setScore(0);
      setGameOver(false);
    }
  };

  // Keyboard & touch controls
  useEffect(() => {
    const handleKey = (e) => { if (e.code === "Space") jump(); };
    const handleTouch = () => jump();
    window.addEventListener("keydown", handleKey);
    window.addEventListener("touchstart", handleTouch);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("touchstart", handleTouch);
    };
  }, [gameOver]);

  // Main game loop
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const birdImage = new Image();
    birdImage.src = BirdImg;

    // Loader simulation
    setTimeout(() => setLoading(false), 1500);

    const loop = setInterval(() => {
      // Draw loader
      if (loading) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = "#87ceeb";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = "#fff";
        ctx.font = "24px Arial";
        ctx.fillText("Loading...", canvasWidth / 2 - 50, canvasHeight / 2);
        return;
      }

      if (gameOver) return;

      // Update bird
      birdRef.current.dy += gravity;
      birdRef.current.y += birdRef.current.dy;

      if (birdRef.current.y < 0) birdRef.current.y = 0;
      if (birdRef.current.y + birdSize > canvasHeight) {
        birdRef.current.y = canvasHeight - birdSize;
        setGameOver(true);
      }

      // Update pipes
      let newPipes = pipes.map((p) => ({ ...p, x: p.x - pipeSpeed }));

      // Add new pipe
      if (newPipes[newPipes.length - 1].x < canvasWidth - 180) {
        newPipes.push({
          x: canvasWidth,
          topHeight: Math.random() * (canvasHeight - pipeGap - 100) + 50,
          passed: false,
        });
      }

      // Remove off-screen pipes
      newPipes = newPipes.filter((p) => p.x + pipeWidth > 0);

      // Collision & scoring
      newPipes.forEach((p) => {
        if (
          birdRef.current.x + birdSize > p.x &&
          birdRef.current.x < p.x + pipeWidth &&
          (birdRef.current.y < p.topHeight || birdRef.current.y + birdSize > p.topHeight + pipeGap)
        ) {
          setGameOver(true);
        } else if (!p.passed && p.x + pipeWidth < birdRef.current.x) {
          setScore((s) => s + 1);
          p.passed = true;
        }
      });

      setPipes(newPipes);

      // Draw background
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#87ceeb";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw pipes
      newPipes.forEach((p) => {
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
        ctx.fillRect(p.x, p.topHeight + pipeGap, pipeWidth, canvasHeight - p.topHeight - pipeGap);
      });

      // Draw bird with tilt
      const angle = birdRef.current.dy < 0 ? -20 : 20;
      ctx.save();
      ctx.translate(birdRef.current.x + birdSize / 2, birdRef.current.y + birdSize / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(birdImage, -birdSize / 2, -birdSize / 2, birdSize, birdSize);
      ctx.restore();

      // Draw score
      ctx.fillStyle = "#fff";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${score}`, 10, 30);

    }, 20);

    return () => clearInterval(loop);
  }, [pipes, score, gameOver, loading]);

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Back button */}
      <div className="absolute top-3 left-3 z-50">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl shadow-lg hover:bg-pink-600"
        >
          ⬅ Back
        </button>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 drop-shadow-lg mb-2 text-center">
        Flappy Bird 🐦
      </h1>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="bg-gray-900 border-4 border-cyan-400 rounded-xl max-w-full touch-none"
      />

      <AnimatePresence>
        {gameOver && !loading && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white text-2xl p-6 rounded-xl"
          >
            Game Over 💀 <br />
            Score: {score}
            <button
              onClick={jump}
              className="mt-4 px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600"
            >
              Restart
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
