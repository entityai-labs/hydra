const { ActivityType, Client } = require("discord.js");

const statusList = [
  {
    name: "/help",
    type: ActivityType.Playing,
  },
];

/**
 *
 * @param {Client} client
 */
const handleStatus = (client) => {
  setInterval(() => {
    let randomChoice = Math.floor(Math.random() * statusList.length);
    client.user.setActivity(statusList[randomChoice]);
  }, 10000);
};

module.exports = handleStatus;
