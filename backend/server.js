import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ Mongo Error:", err));

// ✅ Routes
// Example: http://localhost:5000/api/auth/register
// Example: http://localhost:5000/api/auth/login
app.use("/api/auth", authRoutes);

// ✅ Test API
app.get("/", (req, res) => {
  res.send("🚀 API is running... Go to /api/auth for auth routes");
});

// ✅ Start Server
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
