import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

// 🎮 Import images
import snake from "../assets/snake.jpg";
import tetris from "../assets/tetris.jpg";
import pong from "../assets/pong.png";
import memory from "../assets/memory.jpg";
import flappy from "../assets/flappy.jpg";
import box from "../assets/2048.jpg";
import space from "../assets/Space Invaders.png";
import tictoetoe from "../assets/Tic Tac Toe.jpg";
import hangman from "../assets/Hangman.png";
import sudoku from "../assets/Sudoku.png";
import whackamole from "../assets/Whack-a-Mole.jpg";
import platformer from "../assets/Platformer.jpg";
import jump from "../assets/Jump Game.jpg";
import maze from "../assets/Maze Solver.png";
import dino from "../assets/dino.gif";
import bubble from "../assets/Bubble Shooter.jpg";
import brick from "../assets/Brick Breaker.jpg";
import color from "../assets/Color Match.png";
import fruit from "../assets/Fruit Ninja Clone.jpg";
import car from "../assets/Car Racing.jpg";
import tower from "../assets/Tower Defense.jpg";
import platformpuzzle from "../assets/Platform Puzzle.jpg";
import shooting from "../assets/Shooting Gallery.jpg";
import golf from "../assets/Golf.jpg";

// 🎮 Import game components
import Snake from "../games/Snake";
import Tetris from "../games/Tetris";
import Breakout from "../games/Breakout";
import Pong from "../games/Pong";
import MemoryMatchNeon from "../games/MemoryGame";
import FlappyBird from "../games/Flappybird";
import Game2048 from "../games/Game2048";
import SpaceInvaders from "../games/Invaders";
import TicTacToe from "../games/Tictactoe"
import Hangman from "../games/Hangman";
import Sudoku from "../games/Sudoku";
import WhacAMole from "../games/Whack-a-mole";
import Platformer from "../games/Platformer";
import Jump from "../games/Jump";
import Maze from "../games/Maze";
import Dino from "../games/Dino";
import Bubble from "../games/Bubble";
import Brick from "../games/Brick";
import ColorMatchGame from "../games/Color";
import Fruit from "../games/Fruit";
import CarRaceRealistic from "../games/Racing";
import Tower from "../games/Tower";
import PlatformPuzzleGame from "../games/Puzzle";
import Shooting from "../games/Shooting";
import Golf from "../games/Golf";

export default function Games() {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  // Favorites + search
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) setUsername(storedUser);

    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const toggleFavorite = (id, name) => {
    let favs = [...favorites];
    if (favs.includes(id)) {
      favs = favs.filter((f) => f !== id);
      toast.info(`💔 Removed ${name} from Favorites`);
    } else {
      favs.push(id);
      toast.success(`❤️ Added ${name} to Favorites`);
    }
    setFavorites(favs);
    localStorage.setItem("favorites", JSON.stringify(favs));
  };
   const [menuOpen, setMenuOpen] = useState(false);


  // Full games list
  const games = [
    { id: 1, name: "Snake Game", image: snake, component: <Snake /> },
    { id: 2, name: "Tetris", image: tetris, component: <Tetris /> },
    { id: 3, name: "Breakout", image:'https://www.coolmathgames.com/sites/default/files/Breakout_OG-logo.jpg', component: <Breakout /> },
    { id: 4, name: "Pong", image: pong, component: <Pong /> },
    { id: 5, name: "Memory Match", image: memory, component: <MemoryMatchNeon /> },
    { id: 6, name: "Flappy Bird", image: flappy, component: <FlappyBird /> },
    { id: 7, name: "2048", image: box, component: <Game2048 /> },
    { id: 8, name: "Space Invaders", image: space, component: <SpaceInvaders /> },
    { id: 9, name: "Tic Tac Toe", image: tictoetoe, component: <TicTacToe /> },
    { id: 10, name: "Hangman", image: hangman, component: <Hangman /> },
    { id: 11, name: "Sudoku", image: sudoku, component: <Sudoku /> },
    { id: 12, name: "Whack-a-Mole", image: whackamole, component: <WhacAMole /> },
    { id: 13, name: "Platformer", image: platformer, component: <Platformer /> },
    { id: 14, name: "Jump Game", image: jump, component: <Jump /> },
    { id: 15, name: "Maze Solver", image: maze, component: <Maze /> },
    { id: 16, name: "Dino", image: dino, component: <Dino /> },
    { id: 17, name: "Bubble Shooter", image: bubble, component: <Bubble /> },
    { id: 18, name: "Brick Breaker", image: brick, component: <Brick /> },
    { id: 19, name: "Color Match", image: color, component: <ColorMatchGame /> },
    { id: 20, name: "Fruit Ninja Clone", image: fruit, component: <Fruit /> },
    { id: 21, name: "Car Racing", image: car, component: <CarRaceRealistic /> },
    { id: 22, name: "Tower Defense", image: tower, component: <Tower /> },
    { id: 23, name: "Platform Puzzle", image: platformpuzzle, component: <PlatformPuzzleGame /> },
    { id: 24, name: "Shooting Gallery", image: shooting, component: <Shooting /> },
    { id: 25, name: "Golf", image: golf, component: <Golf /> },
  ];

  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const favoriteGames = games.filter((g) => favorites.includes(g.id));

  // Loader
  const loaders = [
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
    />,
    <motion.div
      animate={{ scale: [1, 1.5, 1] }}
      transition={{ repeat: Infinity, duration: 1 }}
      className="w-10 h-10 bg-green-500 rounded-full"
    />,
  ];

  if (loading) {
    const randomLoader = loaders[Math.floor(Math.random() * loaders.length)];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        {randomLoader}
        <p className="mt-4 text-xl">Loading Game...</p>
      </div>
    );
  }

  if (selectedGame) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <button
          onClick={() => setSelectedGame(null)}
          className="bg-red-500 px-4 py-2 rounded-lg mb-4 hover:bg-red-600"
        >
          ⬅ Back to Games
        </button>
        <div className="w-full h-full">{selectedGame.component}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen relative text-white flex flex-col"
    >
      <ToastContainer position="top-center" autoClose={1500} theme="dark" />

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://www.ediiie.com/blog/assets/admin/uploads/Storytelling-in-video-games-development.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-800 to-purple-800 opacity-70" />
      </div>

      {/* Header */}
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="z-50 w-full px-4 sm:px-8  bg-black/60 backdrop-blur-md border-b border-white/20 shadow-md"
    >
      <div className="flex items-center justify-between">
        {/* Logo + Title */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          🎮<div className="flex gap-[2px] justify-center items-center text-xl sm:text-2xl font-extrabold text-yellow-400 leading-none">
  {"Game-Portal".split("").map((char, index) => (
    <span
      key={index}
      className={`inline-block animate-char-${index}`}
    >
      {char}
    </span>
  ))}
</div>

<style>{`
  ${[...Array(11)].map((_, i) => `
    @keyframes char-${i} {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px) scale(1.05); }
    }
    .animate-char-${i} {
      animation: char-${i} 1.2s ease-in-out infinite;
      animation-delay: ${i * 0.08}s;
    }
  `).join("")}
`}</style>
          <span className="text-cyan-300 font-mono">— {username}</span>
        </h1>

        {/* Desktop Logout */}
        <button
          onClick={handleLogout}
          className="hidden sm:inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition duration-300 shadow-md"
        >
          Logout
        </button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden text-white text-2xl focus:outline-none"
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mt-4 flex flex-col gap-2 sm:hidden">
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-md hover:from-red-600 hover:to-pink-600 transition duration-300 shadow"
          >
            Logout
          </button>
          {/* Add more mobile links here if needed */}
        </div>
      )}
    </motion.header>

      {/* Search */}
      <div className="z-10 flex justify-center mt-6 px-4 sm:px-8">
  <div className="relative w-full sm:w-2/3 md:w-1/2">
    <input
      type="text"
      placeholder="🔍 Search games..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full p-3 pl-12 rounded-full border-4 border-purple-200 bg-white/80 text-black placeholder-gray-600 shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 font-semibold tracking-wide"
    />
    {/* Curly Icon */}
    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 text-xl pointer-events-none">
      
    </span>
  </div>
</div>

      <main className="z-10 flex-1 p-8">
        {/* Favorites Section */}
        {favoriteGames.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">⭐ Favorites</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
              {favoriteGames.map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white text-black rounded-xl shadow-lg overflow-hidden relative"
                >
                  <motion.button
                    onClick={() => toggleFavorite(game.id, game.name)}
                    className="absolute top-2 right-2 text-2xl"
                    animate={
                      favorites.includes(game.id)
                        ? { scale: [1, 1.3, 1], textShadow: "0px 0px 8px red" }
                        : {}
                    }
                  >
                    {favorites.includes(game.id) ? "❤️" : "🤍"}
                  </motion.button>

                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4 flex flex-col items-center">
                    <h3 className="font-bold text-lg">{game.name}</h3>
                    <button
                      onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                          setSelectedGame(game);
                          setLoading(false);
                        }, 1000);
                      }}
                      className="mt-3 bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700"
                    >
                      Play
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* All Games */}
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
  {filteredGames.map((game, index) => (
    <motion.div
      key={game.id}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ scale: 1.05, rotate: 0.3 }}
      className="relative rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-purple-500/20 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white group transform transition-all duration-300"
    >
      {/* Glowing Border */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-pink-500 transition-all duration-300 pointer-events-none"></div>

      {/* Favorite Toggle */}
      <motion.button
        onClick={() => toggleFavorite(game.id, game.name)}
        className="absolute top-3 right-3 text-2xl z-20"
        animate={
          favorites.includes(game.id)
            ? { scale: [1, 1.3, 1], textShadow: "0px 0px 8px red" }
            : {}
        }
      >
        {favorites.includes(game.id) ? "❤️" : "🤍"}
      </motion.button>

      {/* Game Image */}
      <img
        src={game.image}
        alt={game.name}
        className="w-full h-44 object-cover rounded-t-3xl group-hover:blur-[0.50px] transition duration-300"
      />

      {/* Info Section */}
      <div className="p-5 flex flex-col items-center bg-black/40 backdrop-blur-md rounded-b-3xl">
        <h3 className="text-lg font-bold text-center mb-2 text-white drop-shadow">
          {game.name}
        </h3>

        {/* Genre Tag */}
        <span className="text-xs bg-pink-600/30 text-pink-200 px-3 py-1 rounded-full mb-3 font-mono tracking-wide shadow-sm">
          {game.genre || "Arcade"}
        </span>

        {/* Play Button */}
        <button
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setSelectedGame(game);
              setLoading(false);
            }, 1000);
          }}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold tracking-wide shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-300 relative overflow-hidden group"
        >
          <span className="absolute top-0 left-[-100%] w-20 h-full bg-white/10 transform -skew-x-12 rotate-12 transition-all duration-500 group-hover:left-[120%]"></span>
          <span className="relative z-10">
            {loading ? "Launching..." : "🚀 Play"}
          </span>
        </button>
      </div>
    </motion.div>
  ))}
</div>
        {/* Footer */}
       {!selectedGame && (
  <footer className="z-10 mt-12 px-6 py-5 bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] text-white rounded-xl border border-white/20 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between animate-fade-in">
    {/* Left side: Branding */}
    <p className="text-xs sm:text-sm font-mono tracking-wide text-gray-300 mb-4 sm:mb-0">
      🚀 <span className="text-pink-400 font-bold">Game-Portel</span> &copy; {new Date().getFullYear()} — created By mohamed Asvath
    </p>

    {/* Right side: Links */}
    <div className="flex gap-6 text-sm font-semibold">
      <a
        href="https://github.com/Mohamedasvath"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-300 hover:text-cyan-400 hover:scale-105 transition duration-200"
      >
        🚀 GitHub
      </a>
      <Link
        to="/contact"
        className="text-gray-300 hover:text-yellow-400 hover:scale-105 transition duration-200"
      >
        📬 Contact
      </Link>
      <Link
        to="/privacy"
        className="text-gray-300 hover:text-red-400 hover:scale-105 transition duration-200"
      >
        🔒 Privacy
      </Link>
      
    </div>

    {/* Extra styles */}
    <style>{`
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.8s ease-out forwards;
      }
    `}</style>
  </footer>
)}
      </main>
    </motion.div>
  );
}
