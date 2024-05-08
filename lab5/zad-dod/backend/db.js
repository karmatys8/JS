const { MongoClient } = require('mongodb');

let mongoDB;

const mongoConnect = async (callback) => {
  try {
    const client = await MongoClient.connect("mongodb://127.0.0.1:27017/library");
    mongoDB = client.db();
    callback();
  } catch (error) {
    console.error(error);
  }
};

const getDb = () => {
  if (mongoDB) {
    return mongoDB;
  }
  throw new Error("Not connected to mongo");
};

module.exports = {
  mongoConnect,
  getDb
};