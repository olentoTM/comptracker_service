const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
let memDB = null;

exports.initTestDB = async () => {
  memDB = await MongoMemoryServer.create();
  let uri = memDB.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return mongoose.connection;
};

exports.dropCollection = async () => {
  if (memDB) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.remove();
    }
  }
};

exports.dropTestDB = async () => {
  if (memDB) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await memDB.close;
  } else {
    console.error("Nothing to drop. Test database has not been initialized.");
  }
};
