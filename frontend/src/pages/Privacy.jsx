import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#141e30] via-[#243b55] to-[#0f2027] text-white relative overflow-hidden">
      {/* Background Glow Animation */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.2),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,0,255,0.2),transparent_40%)] animate-pulse" />

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold text-center mb-8 bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg"
        >
          🔒 Privacy Policy
        </motion.h1>

        {/* Privacy Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.25)] p-6 md:p-10 space-y-6"
        >
          <p className="text-gray-300 leading-relaxed">
            Welcome to our <span className="text-pink-400 font-semibold">Game Portal</span>.  
            Your privacy is very important to us. This Privacy Policy explains how we collect, use, and protect your personal information while you enjoy our games 🎮.
          </p>

          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>
              We <span className="text-cyan-400 font-bold">do not sell</span> your data to third parties.
            </li>
            <li>
              Information like <span className="text-yellow-400">username & email</span> is stored securely.
            </li>
            <li>
              We may use cookies 🍪 to improve your gaming experience.
            </li>
            <li>
              You can request data deletion anytime via{" "}
              <Link to="/contact" className="text-pink-400 hover:underline">
                Contact Page
              </Link>
              .
            </li>
          </ul>

          <p className="text-gray-400 italic">
            By using our Game Portal, you agree to this Privacy Policy ✅.
          </p>
        </motion.div>

        {/* Back Button */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/games"
            className="relative overflow-hidden px-6 py-3 rounded-full 
            bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 
            text-white font-bold tracking-wide shadow-lg 
            hover:from-pink-500 hover:to-yellow-500 transition-all duration-300 group"
          >
            <span className="absolute top-0 left-[-120%] w-20 h-full bg-white/20 
            transform -skew-x-12 rotate-12 transition-all duration-700 group-hover:left-[120%]"></span>
            ⬅ Back to Games
          </Link>
        </div>
      </div>
    </div>
  );
}
