const { ObjectId } = require("mongodb");
const { Schema, model } = require("mongoose");

const sessionSchema = new Schema({
  map: String,
  date: Date,
  completed: Boolean,
  results: [
    {
      player: ObjectId,
      finished: Boolean,
      position: Number,
    },
  ],
});

const sessionInfo = model("session_info", sessionSchema, "session_info");
module.exports = sessionInfo;
