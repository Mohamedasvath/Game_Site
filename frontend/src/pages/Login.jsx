import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      toast.success("✅ Login successful!", {
        position: "top-center",
        autoClose: 2000,
        onClose: () => navigate("/games"),
      });
    } catch (err) {
      toast.error("❌ Invalid credentials", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-400"
      style={{
        backgroundImage:
          "url('https://static.vecteezy.com/system/resources/previews/003/303/295/non_2x/mountains-background-game-vector.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Floating gradient glow */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-50 filter blur-3xl animate-pulse-slow"></div>

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
        className="relative backdrop-blur-lg bg-white/20 border border-white/30 p-8 rounded-xl shadow-2xl w-96 overflow-hidden transform transition-transform duration-500 hover:scale-105 hover:-rotate-1 z-10"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6 drop-shadow">
          Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 rounded-md bg-white/50 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:scale-105 transition transform"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-md bg-white/50 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:scale-105 transition transform"
          required
        />

        {/* Button with spinner and shine */}
        <button
          type="submit"
          disabled={loading}
          className="w-full relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-md hover:from-purple-600 hover:to-indigo-600 transition duration-300 group disabled:opacity-50 flex items-center justify-center"
        >
          {loading && (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          )}
          <span className="absolute top-0 left-[-75%] w-20 h-full bg-white/30 transform -skew-x-12 rotate-12 transition-all duration-500 group-hover:left-[125%]"></span>
          <span className="relative z-10">
            {loading ? "Logging in..." : "Login"}
          </span>
        </button>

        <p className="text-sm text-center mt-4 text-white">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-900 hover:underline">
            Register
          </Link>
        </p>
      </form>

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