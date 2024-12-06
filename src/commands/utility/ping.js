const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Tempo de resposta do Rick Sanchez"),

  async execute(interaction) {
    interaction.reply(
      `Pong! Tempo de resposta: ${interaction.client.ws.ping}ms`
    );
  },
};
