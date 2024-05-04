const { Schema, model } = require("mongoose");

const playerSchema = new Schema(
  {
    name: String,
  },
  { collection: "comptracker_db" }
);

const players = model("players", playerSchema, "players");
module.exports = players;
