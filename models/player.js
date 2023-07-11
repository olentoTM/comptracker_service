const { Schema, model } = require("mongoose");

const playerSchema = new Schema({
  name: String,
});

const players = model("players", playerSchema, "players");
module.exports = players;
