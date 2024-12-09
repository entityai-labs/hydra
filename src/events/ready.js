const { Events, Client, ActivityType } = require("discord.js");
const connectDB = require("../config/database");

const statusList = [
  {
    name: "/help",
    type: ActivityType.Playing,
  },
];

module.exports = {
  name: Events.ClientReady,
  once: true,

  /**
   *
   * @param {Client} client
   */
  async execute(client) {
    await connectDB();

    setInterval(() => {
      let randomChoice = Math.floor(Math.random() * statusList.length);
      client.user.setActivity(statusList[randomChoice]);
    }, 10000);
    
    console.log(`Bot connected as ${client.user.tag}!`);
  },
};
