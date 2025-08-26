const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  link: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Game", gameSchema);
