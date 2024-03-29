// * Rawr (uwu)
const { MongoClient } = require('mongodb');
const config = require('../../config.json');
const chalk = require("chalk");
const Logger = require("../../src/Logger")

const uri = config.database.uri;
const dbName = 'discordLinkedDB';

let client;
let db;

async function connect() {
  if (!client) {
    client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    Logger.databaseMessage(
        "Database Ready And Loaded!"
      )
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database connection not established.');
  }
  return db;
}

async function disconnect() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connect,
  getDb,
  disconnect
};