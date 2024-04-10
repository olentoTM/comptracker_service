require("dotenv").config();
require("./database/mongodb");
const handlers = require("./routes/handlers");
const {
  getAllEvents,
  findSession,
  getEventWithSessionInfo,
} = require("./routes/readData");
const {
  createNewEvent,
  deleteEvent,
  createNewSession,
  addSessionToEvent,
  addNewParticipant,
  updateResults,
} = require("./routes/writeData");
const port = process.env.PORT || 8080;
const express = require("express");
var cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  next();
});

// app.use(handlers.notFound);
app.use(handlers.internalServerError);

app.get("/events/getall", getAllEvents);
app.get("/sessions/:id", findSession);
app.get("/events/event_sessions/:id", getEventWithSessionInfo);

app.post("/events/create_new", createNewEvent);
app.post("/sessions/create_new", createNewSession);
app.post("/participants/create_new", addNewParticipant);
app.post("/sessions/update_results", updateResults);

app.delete("/events/delete/:id", deleteEvent);

app.listen(port, () =>
  process.env.ENV == "LOCAL"
    ? console.log(
        `The server is now running on http://localhost:${port}. ` +
          `Press Ctrl + C to terminate.`
      )
    : console.log(`The server is now running in ${process.env.ENV} environment`)
);
