const { Client } = require("discord.js");

require("dotenv").config();

/**
 *
 * @param {Client} client
 * @param {string} message
 */
module.exports = (client, message) => {
  const channel = client.channels.cache.get(process.env.DEBUG_CHANNEL);
  channel.send(```${message}```);
};
