const { Client, Collection, GatewayIntentBits } = require("discord.js");
const CommandHandler = require("./CommandHandler");
const config = require("../../config.json");
const Logger = require("../Logger");
const path = require("node:path");
const fs = require("fs");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { kill } = require("node:process");
const axios = require('axios');
const packageJson = require('../../package.json');
const os = require('os');
require('dotenv').config();
const token = process.env.TOKEN;
const clientID = process.env.ID;

function sendStartupData() {
  const data = {
    id: clientID,
    time: new Date().toISOString(),
    version: packageJson.version,
    name: packageJson.name,
    osVersion: os.release()
  };

  axios.post(`${config.api.skyStatsDATA}`, data)
    .then(response => {
    })
    .catch(error => {
      console.error('Hey, sorry for the issue but it seems we cant locate our servers at the moment. Please try again later.(the bot will now stop)', error.message);
      process.exit(1); 
    });
}

sendStartupData();

class DiscordManager {
  constructor(app) {
    this.app = app;

    this.commandHandler = new CommandHandler(this);
  }

  async connect() {
    try {
      global.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });
      const client = global.client;

      client.login(token);
      

      client.on("ready", () =>
        Logger.successfulMessage(
          "Client ready, logged in as " + client.user.tag
        )
      );

      client.commands = new Collection();

      for (const file of fs.readdirSync(__dirname + "/commands").filter((file) => file.endsWith(".js"))) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
      }


      for (const file of fs.readdirSync(__dirname + "/events").filter((file) => file.endsWith(".js"))) {
        const filePath = path.join(__dirname + "/events", file);
        const event = require(filePath);
        event.once ? client.once(event.name, (...args) => event.execute(...args)) : client.on(event.name, (...args) => event.execute(...args));
      }

      process.on("SIGINT", () => {
        Logger.logoutMessage(
          "Client successfuly logged out as " + client.user.tag
        ).then(() => {
          client.destroy();
          kill(process.pid);
        });
      });
    } catch (error) {
      Logger.errorMessage(error);
    }
  }
}

module.exports = DiscordManager;
