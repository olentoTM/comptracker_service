const mongoose = require("mongoose");
const eventInfoModel = require("../models/eventInfo");
const handlers = require("./handlers");
const sessionInfoModel = require("../models/sessionInfo");
const playerInfoModel = require("../models/player");

// exports.getAllOrganizers = (res, req) => {};

// exports.findOrganizer = (req, res) => {};

exports.getAllEvents = async (req, res) => {
  await eventInfoModel
    .find({})
    .then((response) => res.status(200).json(response))
    .catch((err) => res.status(500).json("Failed to fetch events: ", err));
};

// exports.getOrganizerEvents = (req, res) => {};

exports.findSession = async (req, res) => {
  console.log(req.params.id);
  await sessionInfoModel
    .findById({ _id: req.params.id })
    .populate({ path: "results.player" })
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(500).json("Failed to fetch session data: ", err)
    );
};

exports.getEventWithSessionInfo = async (req, res) => {
  console.log(req.params.id);
  await eventInfoModel
    // .aggregate([
    //   { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
    //   {
    //     $lookup: {
    //       from: sessionInfoModel.collection.name,
    //       localField: "sessions",
    //       foreignField: "_id",
    //       as: "sessions",
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: playerInfoModel.collection.name,
    //       localField: "participants.player",
    //       foreignField: "_id",
    //       as: "participants.playername",
    //     },
    //   },
    // ])
    .findById({ _id: req.params.id })
    .populate({ path: "participants.player" })
    .populate({ path: "sessions" })
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(500).json("Failed to fetch session data: ", err)
    );
};
