const { ObjectId } = require("mongodb");
const { Schema, model } = require("mongoose");
const playerInfoModel = require("../models/player");
const sessionInfo = require("./sessionInfo");

const eventSchema = new Schema(
  {
    event_name: String,
    sessions: [
      {
        type: Schema.Types.ObjectId,
        ref: sessionInfo.collection.name,
      },
    ],
    start_date: Date,
    end_date: Date,
    participants: [
      {
        player: {
          type: Schema.Types.ObjectId,
          ref: playerInfoModel.collection.name,
        },
        position: Number,
        points: Number,
      },
    ],
    max_participants: Number,
  },
  { collection: "comptracker_db" }
);

module.exports = model("event_info", eventSchema, "event_info");
