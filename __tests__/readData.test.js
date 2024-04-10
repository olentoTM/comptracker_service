const readData = require("../routes/readData");
const testEventData = require("../__testdata___/mockEventData.json");
const testSessionData = require("../__testdata___/mockSessionData.json");
const { initTestDB, dropTestDB } = require("../__testutil__/testDB");
const eventModel = require("../models/eventInfo");
const sessionModel = require("../models/sessionInfo");
const mongoose = require("mongoose");

let dbConnection = null;

beforeAll(async () => {
  dbConnection = await initTestDB();
});

afterAll(() => {
  dropTestDB;
});

test("Test database connection", async () => {
  expect(dbConnection.readyState).toBe(1);
});

const writeTestData = async () => {
  await eventModel.collection.insertOne(testEventData);
  await sessionModel.collection.insertMany(testSessionData);
};

test("Should return test data in JSON format.", async () => {
  await writeTestData();
  let req = {};
  let res = {};
  readData.getAllEvents(req, res);
  expect(res.status).toBe(200);
  expect(res.json).toBe(testEventData);
});

// test("Gets event data with session info", () => {});
