import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { User, Mail, MessageSquare, ArrowLeft } from "lucide-react";

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔊 play party popper sound
    const audio = new Audio("/pop.mp3"); // keep pop.mp3 inside public/
    audio.play();

    // 🎉 confetti blast
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900 relative overflow-hidden">
      {/* Animated background circles */}
      <motion.div
        className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, 200, -200, 0], y: [0, -100, 100, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{ x: [0, -200, 200, 0], y: [0, 100, -100, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
      />

      {/* Confetti Blast */}
      {showConfetti && (
        <Confetti numberOfPieces={1500} gravity={0.4} recycle={false} />
      )}

      {/* Contact Card */}
      <div className="relative z-10 bg-black/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md text-white">
        {/* Back Button */}
        <button
          onClick={() => navigate("/games")}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 p-2 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-3xl font-bold text-center mb-6">Contact Us 🎮</h1>

        {submitted ? (
          <motion.p
            className="text-green-400 text-center text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✅ Your message has been sent!
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="flex items-center bg-white/10 p-3 rounded-lg">
              <User className="mr-2 text-pink-400" />
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-transparent outline-none flex-1 text-white"
                required
              />
            </div>

            {/* Email */}
            <div className="flex items-center bg-white/10 p-3 rounded-lg">
              <Mail className="mr-2 text-blue-400" />
              <input
                type="email"
                placeholder="Your Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-transparent outline-none flex-1 text-white"
                required
              />
            </div>

            {/* Message */}
            <div className="flex items-start bg-white/10 p-3 rounded-lg">
              <MessageSquare className="mr-2 text-green-400 mt-1" />
              <textarea
                placeholder="Your Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="bg-transparent outline-none flex-1 text-white resize-none"
                rows="4"
                required
              />
            </div>

            {/* Send Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg font-bold text-white shadow-lg hover:opacity-90 transition"
            >
              Send Message 🚀
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
}
