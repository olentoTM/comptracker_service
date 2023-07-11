const { Schema, model } = require("mongoose");

const organizerSchema = new Schema({
  name: String,
});

const organizer = model("players", organizerSchema, "players");
module.exports = organizer;
