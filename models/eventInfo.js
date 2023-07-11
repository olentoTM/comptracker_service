const { ObjectId } = require("mongodb");
const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    event_name: String,
    sessions: [ObjectId],
    start_date: Date,
    end_date: Date,
    participants: Number,
    max_participants: Number,
  },
  { collection: "comptracker_db" }
);

const eventInfo = model("event_info", eventSchema, "event_info");
module.exports = eventInfo;
