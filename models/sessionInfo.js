const { Schema, model } = require("mongoose");
const playerInfoModel = require("../models/player");

const sessionSchema = new Schema(
  {
    map: String,
    date: Date,
    completed: Boolean,
    results: [
      {
        player: {
          type: Schema.Types.ObjectId,
          ref: playerInfoModel.collection.name,
        },
        finished: Boolean,
        position: Number,
        score: Number,
      },
    ],
  },
  { collection: "comptracker_db" }
);

const sessionInfo = model("session_info", sessionSchema, "session_info");
module.exports = sessionInfo;
