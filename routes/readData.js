const eventInfoModel = require("../models/eventInfo");
const handlers = require("./handlers");
const session_info = require("../models/sessionInfo");

// exports.getAllOrganizers = (res, req) => {};

// exports.findOrganizer = (req, res) => {};

exports.getAllEvents = async (req, res) => {
  eventInfoModel
    .find({})
    .then((response) => res.status(200).json(response))
    .catch((err) => handlers.internalServerError(err));
};

// exports.getOrganizerEvents = (req, res) => {};

// exports.findEvents = (req, res) => {};

exports.getSessionInfo = (req, res) => {
  eventInfoModel
    .aggregate([
      {
        $lookup: {
          from: session_info.collection.name,
          localField: "sessions",
          foreignField: "_id",
          as: "sessions",
        },
      },
    ])
    .then((result) => res.json(result))
    .catch((err) => handlers.internalServerError(err));
};
