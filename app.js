require("dotenv").config();
require("./database/mongodb");
const handlers = require("./routes/handlers");
const { getAllEvents, getSessionInfo } = require("./routes/readData");
const port = process.env.PORT || 8080;
// var bodyParser = require("body-parser");
const express = require("express");

const app = express();

// app.use(handlers.notFound);
app.use(handlers.internalServerError);

app.get("/events/getall", getAllEvents);
app.get("/events/event_sessions/:id", getSessionInfo);

app.listen(port, () =>
  console.log(
    `The server is now running on http://localhost:${port}. ` +
      `Press Ctrl + C to terminate.`
  )
);
