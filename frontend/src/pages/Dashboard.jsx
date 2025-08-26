import { useEffect, useState } from "react";
import { fetchGames } from "../api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames()
      .then((res) => setGames(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎮 Game Portal</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {games.map((game) => (
          <motion.div
            key={game._id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-white rounded-2xl shadow-md"
          >
            <img src={game.image} alt={game.name} className="rounded-lg" />
            <h2 className="text-lg font-bold mt-2">{game.name}</h2>
            <a
              href={game.link}
              target="_blank"
              rel="noreferrer"
              className="block mt-2 text-blue-500 underline"
            >
              Play Now
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
