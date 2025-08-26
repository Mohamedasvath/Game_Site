import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Generate some particles for floating effect
    const p = Array.from({ length: 20 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          let newY = p.y - p.speed;
          if (newY < 0) newY = window.innerHeight;
          return { ...p, y: newY };
        })
      );
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username,
        password,
      });
      toast.success("✅ Registered successfully, please login", {
        position: "top-center",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error("❌ Registration failed", { position: "top-center" });
    }
  };

  return (
    <div
      className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-red-400"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-photo/gamification-3d-rendering-concept_23-2149484774.jpg?semt=ais_hybrid&w=740&q=80')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Floating gradient glow behind form */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 opacity-50 filter blur-3xl animate-pulse-slow"></div>

      {/* Floating particles */}
      {particles.map((p, index) => (
        <div
          key={index}
          className="absolute bg-white rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            opacity: p.opacity,
          }}
        ></div>
      ))}

      {/* Glass form */}
      <form
        onSubmit={handleSubmit}
        className="relative backdrop-blur-lg bg-white/20 border border-white/30 p-8 rounded-xl shadow-2xl w-96 overflow-hidden transform transition-transform duration-500 hover:scale-105 hover:rotate-1 z-10"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6 drop-shadow">
          Register
        </h2>

        {/* Inputs */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 rounded-md bg-white/50 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:scale-105 transition transform"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-md bg-white/50 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:scale-105 transition transform"
          required
        />

        {/* Button with shine effect */}
        <button
          type="submit"
          className="w-full relative overflow-hidden bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-md hover:from-green-600 hover:to-teal-600 transition duration-300 group"
        >
          <span className="absolute top-0 left-[-75%] w-20 h-full bg-white/30 transform -skew-x-12 rotate-12 transition-all duration-500 group-hover:left-[125%]"></span>
          <span className="relative z-10">Register</span>
        </button>

        <p className="text-sm text-center mt-4 text-black">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-900 hover:underline">
            Login
          </Link>
        </p>
      </form>

      {/* Toast notifications */}
      <ToastContainer />

      {/* Extra animations */}
      <style>{`
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
