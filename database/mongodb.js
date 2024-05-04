require("dotenv").config();
const mongoose = require("mongoose");
// const DBconnection = mongoose.connection;

const mongoUser = process.env.MONGODB_USER || "reader";
const mongoPW = process.env.MONGODB_PW || "reader";
const database = process.env.MONGODB_DB || "comptracker_db"; //Ns. "tuotanto" versiota varten ehkä eri tietokanta?

if (mongoUser == "reader" || mongoPW == "reader") {
  console.warn("Missing MongoDB credentials. Using read-only access.");
}

const url = `mongodb+srv://${mongoUser}:${mongoPW}@comptracker.1mlxuai.mongodb.net/${database}?retryWrites=true&w=majority`;
mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(console.log(`Successfully connected to MongoDB database ${database}.`))
  .catch((err) => console.error(err));
